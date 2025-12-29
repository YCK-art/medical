import { storage, db } from './firebase';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { collection, addDoc, getDocs, query, where, orderBy, deleteDoc, doc, getDoc, Timestamp } from 'firebase/firestore';

export interface RecordingMetadata {
  id?: string;
  userId: string;
  date: string;
  time: string;
  duration: number; // in seconds
  audioUrl: string;
  transcript: TranscriptSegment[];
  createdAt: Timestamp;
}

export interface TranscriptSegment {
  speaker: 'vet' | 'caregiver';
  text: string;
  start: number;
  end: number;
}

/**
 * Upload audio file to Firebase Storage
 * @param audioBlob - The audio blob to upload
 * @param userId - The user ID
 * @returns Download URL of the uploaded file
 */
export async function uploadAudioFile(audioBlob: Blob, userId: string): Promise<string> {
  try {
    const timestamp = Date.now();
    const filename = `recordings/${userId}/${timestamp}.webm`;
    const storageRef = ref(storage, filename);

    console.log('📤 Uploading audio file to:', filename);
    await uploadBytes(storageRef, audioBlob);

    const downloadURL = await getDownloadURL(storageRef);
    console.log('✅ Audio file uploaded successfully:', downloadURL);

    return downloadURL;
  } catch (error) {
    console.error('❌ Error uploading audio file:', error);
    throw error;
  }
}

/**
 * Save recording metadata to Firestore
 * @param metadata - Recording metadata
 * @returns Document ID
 */
export async function saveRecording(metadata: Omit<RecordingMetadata, 'id'>): Promise<string> {
  try {
    console.log('💾 Saving recording metadata to Firestore...');
    const docRef = await addDoc(collection(db, 'recordings'), {
      ...metadata,
      createdAt: Timestamp.now()
    });

    console.log('✅ Recording saved with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('❌ Error saving recording metadata:', error);
    throw error;
  }
}

/**
 * Get all recordings for a user
 * @param userId - The user ID
 * @returns Array of recordings
 */
export async function getUserRecordings(userId: string): Promise<RecordingMetadata[]> {
  try {
    const q = query(
      collection(db, 'recordings'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const recordings: RecordingMetadata[] = [];

    querySnapshot.forEach((doc) => {
      recordings.push({
        id: doc.id,
        ...doc.data()
      } as RecordingMetadata);
    });

    console.log('📋 Loaded', recordings.length, 'recordings for user:', userId);
    return recordings;
  } catch (error) {
    console.error('❌ Error loading recordings:', error);
    throw error;
  }
}

/**
 * Delete a recording (both Firestore metadata and Storage audio file)
 * @param recordingId - The recording ID
 */
export async function deleteRecording(recordingId: string): Promise<void> {
  try {
    // First, get the recording document to extract the audioUrl
    const recordingDoc = await getDoc(doc(db, 'recordings', recordingId));

    if (!recordingDoc.exists()) {
      console.warn('⚠️ Recording not found:', recordingId);
      return;
    }

    const recordingData = recordingDoc.data() as RecordingMetadata;
    const audioUrl = recordingData.audioUrl;

    // Delete the audio file from Storage
    if (audioUrl) {
      try {
        // Extract the storage path from the URL
        // URL format: https://firebasestorage.googleapis.com/v0/b/{bucket}/o/{path}?alt=media&token={token}
        const decodedUrl = decodeURIComponent(audioUrl);
        const pathMatch = decodedUrl.match(/\/o\/(.+?)\?/);

        if (pathMatch && pathMatch[1]) {
          const storagePath = pathMatch[1];
          const storageRef = ref(storage, storagePath);

          await deleteObject(storageRef);
          console.log('🗑️ Audio file deleted from Storage:', storagePath);
        } else {
          console.warn('⚠️ Could not extract storage path from URL:', audioUrl);
        }
      } catch (storageError) {
        console.error('❌ Error deleting audio file from Storage:', storageError);
        // Continue with Firestore deletion even if Storage deletion fails
      }
    }

    // Delete the Firestore document
    await deleteDoc(doc(db, 'recordings', recordingId));
    console.log('🗑️ Recording deleted from Firestore:', recordingId);
  } catch (error) {
    console.error('❌ Error deleting recording:', error);
    throw error;
  }
}

/**
 * Format duration in seconds to MM:SS
 * @param seconds - Duration in seconds
 * @returns Formatted duration string
 */
export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Format date to "MMM DD, YYYY"
 * @param date - Date object or Timestamp
 * @returns Formatted date string
 */
export function formatDate(date: Date | Timestamp): string {
  const d = date instanceof Timestamp ? date.toDate() : date;
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[d.getMonth()]} ${d.getDate().toString().padStart(2, '0')}, ${d.getFullYear()}`;
}

/**
 * Format time to "HH:MM AM/PM"
 * @param date - Date object or Timestamp
 * @returns Formatted time string
 */
export function formatTime(date: Date | Timestamp): string {
  const d = date instanceof Timestamp ? date.toDate() : date;
  let hours = d.getHours();
  const minutes = d.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  const minutesStr = minutes < 10 ? '0' + minutes : minutes;
  return `${hours}:${minutesStr} ${ampm}`;
}
