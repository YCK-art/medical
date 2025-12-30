"""
Audio transcription and speaker diarization service
Using openai-whisper + pyannote.audio (whisperx removed for compatibility)
"""

import os
import tempfile
import logging
from typing import List, Dict, Any
import torch
import torch.serialization
import whisper
from pyannote.audio import Pipeline
import numpy as np

# Fix PyTorch 2.6 weights_only issue - monkey patch torch.load
import functools
_original_torch_load = torch.load

@functools.wraps(_original_torch_load)
def _patched_torch_load(*args, **kwargs):
    # Force weights_only=False for compatibility with older models
    kwargs['weights_only'] = False
    return _original_torch_load(*args, **kwargs)

torch.load = _patched_torch_load

logger = logging.getLogger(__name__)

class TranscriptionService:
    def __init__(self):
        """Initialize Whisper and pyannote models"""
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        logger.info(f"Using device: {self.device}")

        # Load Whisper model (small model for better accuracy with medical terms)
        logger.info("Loading Whisper model...")
        self.whisper_model = whisper.load_model("small", device=self.device)

        # Load pyannote diarization pipeline
        # Note: Requires HuggingFace token for pyannote models
        # Set HF_TOKEN environment variable
        hf_token = os.getenv("HF_TOKEN")
        if hf_token:
            logger.info("Loading pyannote.audio diarization pipeline...")
            self.diarization_pipeline = Pipeline.from_pretrained(
                "pyannote/speaker-diarization-3.1",
                use_auth_token=hf_token
            )
            if self.device == "cuda":
                self.diarization_pipeline.to(torch.device("cuda"))
        else:
            logger.warning("HF_TOKEN not set. Speaker diarization will be unavailable.")
            self.diarization_pipeline = None

    def transcribe_audio(
        self,
        audio_path: str,
        language: str = "ko",
        num_speakers: int = 2
    ) -> Dict[str, Any]:
        """
        Transcribe audio file with speaker diarization (non-streaming version)

        Args:
            audio_path: Path to audio file
            language: Language code (ko, en, etc.)
            num_speakers: Expected number of speakers (2 for vet + caregiver)

        Returns:
            Dictionary with transcript segments and metadata
        """
        # Collect all events from streaming version and return final result
        final_result = None
        for event in self.transcribe_audio_streaming(audio_path, language, num_speakers):
            if event["status"] == "complete":
                final_result = event
        return final_result

    def transcribe_audio_streaming(
        self,
        audio_path: str,
        language: str = "ko",
        num_speakers: int = 2
    ):
        """
        Transcribe audio file with speaker diarization (streaming version with progress updates)

        Args:
            audio_path: Path to audio file
            language: Language code (ko, en, etc.)
            num_speakers: Expected number of speakers (2 for vet + caregiver)

        Yields:
            Progress events and final result
        """
        wav_path = None
        try:
            logger.info(f"Starting transcription for: {audio_path}")

            # Convert webm to wav for pyannote compatibility
            if audio_path.endswith('.webm'):
                import subprocess
                wav_path = audio_path.replace('.webm', '.wav')
                logger.info(f"Converting webm to wav: {wav_path}")
                subprocess.run([
                    'ffmpeg', '-i', audio_path,
                    '-ar', '16000',  # 16kHz sample rate
                    '-ac', '1',      # mono
                    '-y',            # overwrite
                    wav_path
                ], check=True, capture_output=True)
                processing_path = wav_path
            else:
                processing_path = audio_path

            # Step 1: Transcribe with Whisper
            logger.info("Step 1: Transcribing with Whisper...")
            yield {
                "status": "step",
                "step": "transcribing",
                "message": "Transcribing audio with Whisper..."
            }

            transcribe_options = {
                "fp16": (self.device == "cuda")
            }
            # Only specify language if provided (None = auto-detect)
            if language:
                transcribe_options["language"] = language
                logger.info(f"Using specified language: {language}")
            else:
                logger.info("Auto-detecting language...")

            result = self.whisper_model.transcribe(
                processing_path,
                **transcribe_options
            )

            # Detect language if not specified
            detected_language = result.get("language", language or "en")
            logger.info(f"Detected/Using language: {detected_language}")

            # Step 2: Use Whisper's word-level timestamps (no WhisperX needed)
            logger.info("Step 2: Using Whisper word-level timestamps...")
            yield {
                "status": "step",
                "step": "aligning",
                "message": "Processing timestamps..."
            }

            # Whisper provides word-level timestamps directly when word_timestamps=True
            # Re-run with word timestamps enabled for better alignment
            transcribe_options["word_timestamps"] = True
            result_with_words = self.whisper_model.transcribe(
                processing_path,
                **transcribe_options
            )

            # Use segments from result_with_words which have word-level timing
            aligned_result = {"segments": result_with_words["segments"]}

            # Step 3: Speaker diarization
            logger.info("Step 3: Performing speaker diarization...")
            yield {
                "status": "step",
                "step": "diarizing",
                "message": "Identifying speakers..."
            }

            if self.diarization_pipeline:
                diarization = self.diarization_pipeline(
                    processing_path,
                    num_speakers=num_speakers
                )

                # Assign speakers to segments
                segments_with_speakers = self._assign_speakers_to_segments(
                    aligned_result["segments"],
                    diarization
                )
            else:
                # Fallback: alternate speakers if diarization unavailable
                logger.warning("Diarization unavailable, using alternating speaker assignment")
                segments_with_speakers = self._alternate_speakers(
                    aligned_result["segments"],
                    num_speakers
                )

            # Step 4: Map speakers to roles (vet/caregiver)
            logger.info("Step 4: Mapping speakers to roles...")
            yield {
                "status": "step",
                "step": "finalizing",
                "message": "Mapping speakers to roles..."
            }

            final_segments = self._map_speakers_to_roles(segments_with_speakers)

            # Merge short segments to reduce fragmentation
            logger.info("Merging short segments to reduce fragmentation...")
            final_segments = self._merge_short_segments(
                final_segments,
                min_duration=3.0,       # User selected: 3 seconds
                max_pause=1.0,          # Merge if pause < 1 second
                same_speaker_only=True  # Only merge same speaker
            )

            logger.info(f"Transcription complete. {len(final_segments)} segments generated.")

            # Send final result
            yield {
                "status": "complete",
                "segments": final_segments,
                "language": detected_language,
                "duration": result.get("duration", 0),
                "full_text": result.get("text", "")
            }

        except Exception as e:
            logger.error(f"Transcription failed: {str(e)}", exc_info=True)
            raise
        finally:
            # Clean up temporary wav file
            if wav_path and os.path.exists(wav_path):
                try:
                    os.unlink(wav_path)
                except:
                    pass

    def _assign_speakers_to_segments(
        self,
        segments: List[Dict],
        diarization: Any
    ) -> List[Dict]:
        """Assign speaker labels to transcript segments based on diarization"""
        segments_with_speakers = []

        for segment in segments:
            start = segment["start"]
            end = segment["end"]

            # Find the speaker with the most overlap in this time range
            speaker_times = {}
            for turn, _, speaker in diarization.itertracks(yield_label=True):
                overlap_start = max(start, turn.start)
                overlap_end = min(end, turn.end)
                overlap_duration = max(0, overlap_end - overlap_start)

                if overlap_duration > 0:
                    if speaker not in speaker_times:
                        speaker_times[speaker] = 0
                    speaker_times[speaker] += overlap_duration

            # Assign the speaker with most overlap
            if speaker_times:
                assigned_speaker = max(speaker_times, key=speaker_times.get)
            else:
                assigned_speaker = "SPEAKER_00"  # Default

            segment["speaker"] = assigned_speaker
            segments_with_speakers.append(segment)

        return segments_with_speakers

    def _alternate_speakers(
        self,
        segments: List[Dict],
        num_speakers: int = 2
    ) -> List[Dict]:
        """Fallback: alternate speakers between segments"""
        for i, segment in enumerate(segments):
            speaker_id = i % num_speakers
            segment["speaker"] = f"SPEAKER_{speaker_id:02d}"
        return segments

    def _map_speakers_to_roles(self, segments: List[Dict]) -> List[Dict]:
        """
        Map generic speaker IDs to roles (vet/caregiver)

        Strategy: Assume the first speaker is the caregiver (initiates conversation)
        and subsequent unique speaker is the vet
        """
        if not segments:
            return []

        # Identify unique speakers
        speakers = list(set(seg["speaker"] for seg in segments))

        # Map first speaker to caregiver, second to vet
        speaker_to_role = {}
        if len(speakers) >= 1:
            speaker_to_role[speakers[0]] = "caregiver"
        if len(speakers) >= 2:
            speaker_to_role[speakers[1]] = "vet"
        # Additional speakers also map to vet (or could be "unknown")
        for speaker in speakers[2:]:
            speaker_to_role[speaker] = "vet"

        # Apply mapping
        final_segments = []
        for segment in segments:
            role = speaker_to_role.get(segment["speaker"], "caregiver")
            final_segments.append({
                "speaker": role,
                "text": segment["text"],
                "start": segment["start"],
                "end": segment["end"]
            })

        return final_segments

    def _merge_short_segments(
        self,
        segments: List[Dict],
        min_duration: float = 3.0,      # Minimum segment duration in seconds
        max_pause: float = 1.0,          # Max pause between segments to still merge
        same_speaker_only: bool = True   # Only merge segments from same speaker
    ) -> List[Dict]:
        """
        Merge short adjacent segments to reduce fragmentation

        This helps create more natural conversation bubbles by combining
        short phrases like "Thank you", "And so", "is our puddle okay?"
        into a single bubble instead of 3 separate ones.

        Args:
            segments: List of segment dictionaries with 'speaker', 'text', 'start', 'end'
            min_duration: Segments shorter than this will be merged (seconds)
            max_pause: Only merge if pause between segments is less than this (seconds)
            same_speaker_only: If True, only merge segments from same speaker

        Returns:
            List of merged segments
        """
        if not segments:
            return segments

        merged = []
        current_segment = None

        for segment in segments:
            if current_segment is None:
                # First segment - start accumulating
                current_segment = segment.copy()
                continue

            # Calculate metrics
            current_duration = current_segment['end'] - current_segment['start']
            segment_duration = segment['end'] - segment['start']
            pause = segment['start'] - current_segment['end']
            same_speaker = segment['speaker'] == current_segment['speaker']

            # Determine if we should merge this segment with current
            should_merge = (
                (not same_speaker_only or same_speaker) and  # Speaker check
                pause < max_pause and                         # Pause check
                (current_duration < min_duration or           # Current is short, or
                 segment_duration < min_duration)             # New segment is short
            )

            if should_merge:
                # Merge: extend end time and concatenate text
                current_segment['end'] = segment['end']
                current_segment['text'] = current_segment['text'].strip() + ' ' + segment['text'].strip()
                logger.debug(f"Merged segment: '{segment['text'][:30]}...' into previous")
            else:
                # Don't merge: save current segment and start new one
                merged.append(current_segment)
                current_segment = segment.copy()

        # Don't forget the last segment
        if current_segment:
            merged.append(current_segment)

        logger.info(f"Segment merging: {len(segments)} → {len(merged)} segments")
        return merged


# Global instance (lazy loading)
_transcription_service = None

def get_transcription_service() -> TranscriptionService:
    """Get or create transcription service instance"""
    global _transcription_service
    if _transcription_service is None:
        _transcription_service = TranscriptionService()
    return _transcription_service
