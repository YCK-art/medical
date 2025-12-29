# Audio Transcription & Speaker Diarization Setup

This backend service provides audio transcription and speaker diarization using:
- **Whisper**: Speech-to-text transcription
- **WhisperX**: Word-level timestamp alignment
- **pyannote.audio**: Speaker diarization

## Prerequisites

### 1. System Requirements
- Python 3.9+
- FFmpeg (for audio processing)
- CUDA-capable GPU (optional, but recommended for faster processing)

### 2. Install FFmpeg

#### macOS:
```bash
brew install ffmpeg
```

#### Ubuntu/Debian:
```bash
sudo apt update
sudo apt install ffmpeg
```

#### Windows:
Download from https://ffmpeg.org/download.html

### 3. HuggingFace Token

You need a HuggingFace token to use pyannote.audio models:

1. Create account at https://huggingface.co/
2. Go to Settings → Access Tokens → Create new token
3. Accept user agreements for:
   - https://huggingface.co/pyannote/speaker-diarization-3.1
   - https://huggingface.co/pyannote/segmentation-3.0
4. Copy your token

## Installation

### 1. Create Virtual Environment

```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

**Note**: This may take 10-15 minutes due to PyTorch and audio processing libraries.

### 3. Configure Environment Variables

Create a `.env` file in the `backend` directory:

```bash
cp .env.example .env
```

Edit `.env` and add your HuggingFace token:

```
HF_TOKEN=your_huggingface_token_here
```

## Running the Server

```bash
# Make sure you're in the backend directory with venv activated
cd backend
source venv/bin/activate
python main.py
```

The server will start on http://localhost:8000

## API Usage

### Transcribe Audio

**Endpoint**: `POST /transcribe`

**Parameters**:
- `file` (form-data): Audio file (webm, mp3, wav, etc.)
- `language` (optional, default: "ko"): Language code (ko, en, ja, etc.)
- `num_speakers` (optional, default: 2): Expected number of speakers

**Example using curl**:

```bash
curl -X POST http://localhost:8000/transcribe \
  -F "file=@recording.webm" \
  -F "language=ko" \
  -F "num_speakers=2"
```

**Response**:

```json
{
  "segments": [
    {
      "speaker": "caregiver",
      "text": "안녕하세요, 저희 강아지가 요즘 잘 안 먹어요.",
      "start": 0.0,
      "end": 3.5
    },
    {
      "speaker": "vet",
      "text": "언제부터 식욕이 떨어졌나요?",
      "start": 3.5,
      "end": 6.2
    }
  ],
  "language": "ko",
  "duration": 22.5,
  "full_text": "안녕하세요, 저희 강아지가..."
}
```

## Speaker Mapping

The system automatically maps speaker IDs to roles:
- **First speaker** (typically initiates conversation): `caregiver`
- **Second speaker**: `vet`
- Additional speakers: `vet` (or can be customized)

## Performance Notes

### CPU vs GPU

- **CPU**: ~2-3x real-time (10 min audio → 20-30 min processing)
- **GPU**: ~0.5-1x real-time (10 min audio → 5-10 min processing)

### Model Sizes

Whisper model sizes (trade-off between speed and accuracy):
- `tiny`: Fastest, lowest accuracy
- `base`: Good balance (currently used)
- `small`: Better accuracy, slower
- `medium`: Best accuracy for Korean, much slower
- `large`: Best overall, very slow

To change model size, edit `backend/app/transcription.py`:

```python
self.whisper_model = whisper.load_model("small", device=self.device)  # Change "base" to "small"
```

## Troubleshooting

### "FFmpeg not found"
Install FFmpeg (see Prerequisites above)

### "CUDA out of memory"
- Use a smaller Whisper model (e.g., "tiny" or "base")
- Process shorter audio clips
- Use CPU instead: Remove `device="cuda"` parameters

### "Invalid HuggingFace token"
- Verify token is correct in `.env`
- Ensure you accepted user agreements for pyannote models
- Token needs "read" permissions

### "WhisperX alignment failed"
- Check audio file format (prefer WAV or MP3)
- Verify language code is correct
- Try re-encoding audio: `ffmpeg -i input.webm -ar 16000 output.wav`

## Integration with Frontend

The frontend (`ChatView.tsx`) automatically calls this API when processing recordings:

1. User clicks STOP RECORDING
2. Frontend uploads audio to `/transcribe`
3. Backend processes (transcribe → align → diarize)
4. Frontend receives transcript with speaker labels
5. Results saved to Firebase Storage + Firestore

## Production Deployment

For production, consider:
- Using a dedicated GPU server
- Implementing request queuing (multiple simultaneous transcriptions can overwhelm server)
- Adding caching for repeated transcriptions
- Using a smaller model for faster processing
- Setting up monitoring/logging
