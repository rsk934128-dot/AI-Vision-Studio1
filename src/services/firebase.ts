import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  getDocFromServer, 
  collection, 
  setDoc, 
  getDocs, 
  deleteDoc, 
  query, 
  orderBy 
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { VideoJob } from '../types';

// Initialize Firebase App
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Auth
export const auth = getAuth(app);

// Initialize Firestore (with provisioned databaseId if provided)
const dbId = (firebaseConfig as any).firestoreDatabaseId;
export const db = dbId ? getFirestore(app, dbId) : getFirestore(app);

const LOCAL_STORAGE_JOBS_KEY = 'aivideostudio_project_history_v1';

// Connectivity check as required by Firebase skill
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error: any) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client is offline or network is unreachable.');
    }
  }
}

testConnection();

export function getActiveUserId(): string {
  if (auth.currentUser?.uid) return auth.currentUser.uid;
  try {
    const raw = localStorage.getItem('ai_video_studio_auth_session');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.user?.uid) return parsed.user.uid;
    }
  } catch (_e) {}
  return 'sf0745026_creator';
}

/**
 * Save a video job to Firestore in /users/{userId}/jobs/{jobId}
 * Also backs up to localStorage so users never lose their generated videos.
 */
export async function saveJobToFirestore(job: VideoJob, customUserId?: string): Promise<boolean> {
  // Always update local cache first for instant feedback
  try {
    const local = getLocalJobs();
    const filtered = local.filter((j) => j.id !== job.id);
    localStorage.setItem(LOCAL_STORAGE_JOBS_KEY, JSON.stringify([job, ...filtered]));
  } catch (_e) {
    // quiet local storage quota errors
  }

  const userId = customUserId || getActiveUserId();

  try {
    const jobDocRef = doc(db, 'users', userId, 'jobs', job.id);
    await setDoc(jobDocRef, {
      ...job,
      updatedAt: new Date().toISOString()
    }, { merge: true });
    return true;
  } catch (err) {
    console.warn('Firestore job save notice (will rely on local/backend storage):', err);
    return false;
  }
}

/**
 * Fetch jobs for current user from Firestore
 */
export async function fetchJobsFromFirestore(customUserId?: string): Promise<VideoJob[]> {
  const userId = customUserId || getActiveUserId();

  try {
    const jobsColRef = collection(db, 'users', userId, 'jobs');
    const q = query(jobsColRef);
    const snap = await getDocs(q);
    const list: VideoJob[] = [];
    snap.forEach((d) => {
      list.push(d.data() as VideoJob);
    });
    return list;
  } catch (err) {
    console.warn('Failed to fetch jobs from Firestore:', err);
    return [];
  }
}

/**
 * Delete a job from Firestore
 */
export async function deleteJobFromFirestore(jobId: string, customUserId?: string): Promise<boolean> {
  // Remove from local cache
  try {
    const local = getLocalJobs();
    localStorage.setItem(LOCAL_STORAGE_JOBS_KEY, JSON.stringify(local.filter((j) => j.id !== jobId)));
  } catch (_e) {
    // ignore
  }

  const userId = customUserId || getActiveUserId();

  try {
    const jobDocRef = doc(db, 'users', userId, 'jobs', jobId);
    await deleteDoc(jobDocRef);
    return true;
  } catch (err) {
    console.warn('Failed to delete job from Firestore:', err);
    return false;
  }
}

/**
 * Helper to get local offline jobs
 */
export function getLocalJobs(): VideoJob[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_JOBS_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (_e) {
    return [];
  }
}

/**
 * Unified loader that retrieves jobs from Firestore (if user signed in),
 * merges with server backend /api/jobs, and integrates localStorage tasks.
 */
export async function fetchAllProjectHistory(customUserId?: string): Promise<VideoJob[]> {
  const jobsMap = new Map<string, VideoJob>();

  // 1. Load from localStorage
  const localJobs = getLocalJobs();
  localJobs.forEach((j) => jobsMap.set(j.id, j));

  // 2. Load from server /api/jobs
  try {
    const res = await fetch('/api/jobs');
    const contentType = res.headers.get('content-type') || '';
    if (res.ok && contentType.includes('application/json')) {
      const data = await res.json();
      if (data.success && Array.isArray(data.jobs)) {
        data.jobs.forEach((j: VideoJob) => jobsMap.set(j.id, j));
      }
    }
  } catch (_e) {
    // quiet server offline
  }

  // 3. Load from Firestore
  try {
    const firestoreJobs = await fetchJobsFromFirestore(customUserId);
    firestoreJobs.forEach((j) => jobsMap.set(j.id, j));
  } catch (_e) {
    // quiet
  }

  // Convert to sorted array, newest created first
  const result = Array.from(jobsMap.values());
  result.sort((a, b) => {
    const timeA = new Date(a.createdAt || 0).getTime();
    const timeB = new Date(b.createdAt || 0).getTime();
    return timeB - timeA;
  });

  return result;
}
