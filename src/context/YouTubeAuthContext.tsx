import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from 'react';
import { User } from 'firebase/auth';
import { 
  signInWithYouTube, 
  signOutFromYouTube, 
  initYouTubeAuth, 
  fetchYouTubeChannel, 
  fetchRecentYouTubeVideos, 
  uploadVideoToYouTube, 
  YouTubeUploadPayload,
  getCachedAccessToken
} from '../services/youtubeAuth';
import { YouTubeChannelProfile, YouTubeUploadedVideo } from '../types';

interface YouTubeAuthContextType {
  user: User | null;
  accessToken: string | null;
  channel: YouTubeChannelProfile | null;
  recentVideos: YouTubeUploadedVideo[];
  isAuthenticated: boolean;
  isLoading: boolean;
  isConnecting: boolean;
  isUploading: boolean;
  error: string | null;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshChannel: () => Promise<void>;
  fetchVideos: () => Promise<void>;
  uploadVideo: (
    payload: YouTubeUploadPayload, 
    onProgress?: (percent: number) => void
  ) => Promise<{ videoId: string; watchUrl: string; studioUrl: string }>;
  clearError: () => void;
}

const EMPTY_VIDEOS: YouTubeUploadedVideo[] = [];

const YouTubeAuthContext = createContext<YouTubeAuthContextType | undefined>(undefined);

export const YouTubeAuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [channel, setChannel] = useState<YouTubeChannelProfile | null>(null);
  const [recentVideos, setRecentVideos] = useState<YouTubeUploadedVideo[]>(EMPTY_VIDEOS);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize auth listener
  useEffect(() => {
    let isMounted = true;
    const unsubscribe = initYouTubeAuth(
      async (authUser, token) => {
        if (!isMounted) return;
        setUser(authUser);
        setAccessToken(token);
        try {
          const ch = await fetchYouTubeChannel(token, authUser);
          if (isMounted) {
            setChannel(ch);
            if (ch?.uploadsPlaylistId) {
              const vids = await fetchRecentYouTubeVideos(token, ch.uploadsPlaylistId);
              if (isMounted) setRecentVideos(vids);
            }
          }
        } catch (err: any) {
          console.error('Error in auth state change channel fetch:', err);
        } finally {
          if (isMounted) setIsLoading(false);
        }
      },
      () => {
        if (!isMounted) return;
        setUser((prev) => (prev !== null ? null : prev));
        setAccessToken((prev) => (prev !== null ? null : prev));
        setChannel((prev) => (prev !== null ? null : prev));
        setRecentVideos((prev) => (prev.length > 0 ? EMPTY_VIDEOS : prev));
        setIsLoading(false);
      }
    );

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  const signIn = useCallback(async () => {
    setError(null);
    setIsConnecting(true);
    try {
      const res = await signInWithYouTube();
      setUser(res.user);
      setAccessToken(res.accessToken);
      setChannel(res.channel);

      // Fetch initial videos
      if (res.accessToken && res.channel?.uploadsPlaylistId) {
        const vids = await fetchRecentYouTubeVideos(res.accessToken, res.channel.uploadsPlaylistId);
        setRecentVideos(vids);
      }
    } catch (err: any) {
      console.error('Failed to sign in to YouTube:', err);
      let message = 'ইউটিউব লগইন সম্পন্ন করা যায়নি। অনুগ্রহ করে পুনরায় চেষ্টা করুন।';
      if (err?.code === 'auth/popup-closed-by-user') {
        message = 'লগইন উইন্ডোটি বন্ধ করা হয়েছে (Popup closed).';
      } else if (err?.message) {
        message = err.message;
      }
      setError(message);
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const signOut = useCallback(async () => {
    setError(null);
    try {
      await signOutFromYouTube();
      setUser(null);
      setAccessToken(null);
      setChannel(null);
      setRecentVideos(EMPTY_VIDEOS);
    } catch (err: any) {
      console.error('Sign out error:', err);
      setError(err?.message || 'লগআউট ব্যর্থ হয়েছে।');
    }
  }, []);

  const refreshChannel = useCallback(async () => {
    const token = accessToken || getCachedAccessToken();
    if (!token || !user) return;
    try {
      const ch = await fetchYouTubeChannel(token, user);
      setChannel(ch);
      if (ch?.uploadsPlaylistId) {
        const vids = await fetchRecentYouTubeVideos(token, ch.uploadsPlaylistId);
        setRecentVideos(vids);
      }
    } catch (err) {
      console.error('Refresh error:', err);
    }
  }, [accessToken, user]);

  const fetchVideos = useCallback(async () => {
    const token = accessToken || getCachedAccessToken();
    if (!token) return;
    try {
      const vids = await fetchRecentYouTubeVideos(token, channel?.uploadsPlaylistId);
      setRecentVideos(vids);
    } catch (err) {
      console.error('Error fetching videos:', err);
    }
  }, [accessToken, channel]);

  const uploadVideo = useCallback(async (
    payload: YouTubeUploadPayload,
    onProgress?: (percent: number) => void
  ) => {
    const token = accessToken || getCachedAccessToken();
    if (!token) {
      throw new Error('অনুগ্রহ করে প্রথমে ইউটিউব অ্যাকাউন্টে লগইন করুন (Please sign in to YouTube first).');
    }
    setIsUploading(true);
    setError(null);
    try {
      const result = await uploadVideoToYouTube(token, payload, onProgress);
      // Refresh uploaded list after short delay
      setTimeout(() => {
        fetchVideos();
      }, 3000);
      return result;
    } catch (err: any) {
      console.error('Upload failed:', err);
      setError(err?.message || 'ভিডিও আপলোড করতে সমস্যা হয়েছে।');
      throw err;
    } finally {
      setIsUploading(false);
    }
  }, [accessToken, fetchVideos]);

  const clearError = useCallback(() => setError(null), []);

  const value = useMemo<YouTubeAuthContextType>(() => ({
    user,
    accessToken,
    channel,
    recentVideos,
    isAuthenticated: !!user && !!accessToken,
    isLoading,
    isConnecting,
    isUploading,
    error,
    signIn,
    signOut,
    refreshChannel,
    fetchVideos,
    uploadVideo,
    clearError
  }), [
    user,
    accessToken,
    channel,
    recentVideos,
    isLoading,
    isConnecting,
    isUploading,
    error,
    signIn,
    signOut,
    refreshChannel,
    fetchVideos,
    uploadVideo,
    clearError
  ]);

  return (
    <YouTubeAuthContext.Provider value={value}>
      {children}
    </YouTubeAuthContext.Provider>
  );
};

export const useYouTubeAuth = (): YouTubeAuthContextType => {
  const context = useContext(YouTubeAuthContext);
  if (!context) {
    throw new Error('useYouTubeAuth must be used within a YouTubeAuthProvider');
  }
  return context;
};
