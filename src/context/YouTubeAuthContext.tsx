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
  isDemoMode: boolean;
  isLoading: boolean;
  isConnecting: boolean;
  isUploading: boolean;
  error: string | null;
  signIn: () => Promise<void>;
  connectDemoChannel: () => void;
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

const DEMO_CHANNEL: YouTubeChannelProfile = {
  id: 'UC_ai_video_studio_bd_official',
  title: 'AI Video Studio Bangladesh (Official)',
  description: 'AI Generated Cinema, 4K Music Videos & YouTube Shorts Studio powered by Google Gemini.',
  customUrl: '@AIVideoStudioBD',
  thumbnails: {
    default: { url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80' },
    medium: { url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&auto=format&fit=crop&q=80' },
    high: { url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80' },
  },
  statistics: {
    viewCount: '184920',
    subscriberCount: '24500',
    hiddenSubscriberCount: false,
    videoCount: '18'
  }
};

const INITIAL_DEMO_VIDEOS: YouTubeUploadedVideo[] = [
  {
    id: 'aircAruvnKk',
    title: 'Cox\'s Bazar Sunset - AI Romantic Music Video (Official 4K)',
    description: 'Generated with AI Video Studio Bangladesh featuring high-definition neural synthesizer and Bengali vocal highlights.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&auto=format&fit=crop&q=80',
    publishedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    privacyStatus: 'public',
    videoUrl: 'https://www.youtube.com/watch?v=aircAruvnKk'
  },
  {
    id: '7NOSDKb0HlU',
    title: 'Sundarbans Mystery - Cinematic Drone Travelogue',
    description: 'Multimodal AI video understanding and dynamic scene cut generation.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80',
    publishedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    privacyStatus: 'public',
    videoUrl: 'https://www.youtube.com/watch?v=7NOSDKb0HlU'
  }
];

const YouTubeAuthContext = createContext<YouTubeAuthContextType | undefined>(undefined);

export const YouTubeAuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [channel, setChannel] = useState<YouTubeChannelProfile | null>(null);
  const [recentVideos, setRecentVideos] = useState<YouTubeUploadedVideo[]>(EMPTY_VIDEOS);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(false);
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
        setIsDemoMode(false);
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
        if (!isDemoMode) {
          setUser((prev) => (prev !== null ? null : prev));
          setAccessToken((prev) => (prev !== null ? null : prev));
          setChannel((prev) => (prev !== null ? null : prev));
          setRecentVideos((prev) => (prev.length > 0 ? EMPTY_VIDEOS : prev));
        }
        setIsLoading(false);
      }
    );

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [isDemoMode]);

  const connectDemoChannel = useCallback(() => {
    setError(null);
    setIsDemoMode(true);
    setAccessToken('demo_token_creator_verified');
    setUser({
      uid: 'demo_creator_bangladesh',
      displayName: 'Creator (AI Studio BD)',
      email: 'creator@aivideostudio.com',
      photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    } as unknown as User);
    setChannel(DEMO_CHANNEL);
    setRecentVideos(INITIAL_DEMO_VIDEOS);
    setIsLoading(false);
  }, []);

  const signIn = useCallback(async () => {
    setError(null);
    setIsConnecting(true);
    try {
      const res = await signInWithYouTube();
      setUser(res.user);
      setAccessToken(res.accessToken);
      setChannel(res.channel);
      setIsDemoMode(false);

      // Fetch initial videos
      if (res.accessToken && res.channel?.uploadsPlaylistId) {
        const vids = await fetchRecentYouTubeVideos(res.accessToken, res.channel.uploadsPlaylistId);
        setRecentVideos(vids);
      }
    } catch (err: any) {
      console.error('Failed to sign in to YouTube:', err);
      const rawMsg = err?.message || '';
      const isInvalidAction = 
        rawMsg.includes('requested action is invalid') ||
        err?.code === 'auth/invalid-action-code' ||
        err?.code === 'auth/unauthorized-domain' ||
        err?.code === 'auth/operation-not-allowed';

      let message = 'ইউটিউব গুগল অ্যাকাউন্টে লগইন করা যায়নি।';
      if (err?.code === 'auth/popup-closed-by-user') {
        message = 'লগইন উইন্ডোটি বন্ধ করা হয়েছে (Popup closed).';
      } else if (isInvalidAction) {
        message = 'গুগল অথরাইজেশন এরর ("The requested action is invalid"): প্রিভিউ আইফ্রেম ডোমেইন বা থার্ড-পার্টি কুকিজ রেস্ট্রিকশনের কারণে লাইভ পপআপ ব্লক হয়েছে। অনুগ্রহ করে "ডেমো চ্যানেল কানেক্ট করুন" বাটনে ক্লিক করুন।';
      } else if (rawMsg) {
        message = rawMsg;
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
      setIsDemoMode(false);
      setRecentVideos(EMPTY_VIDEOS);
    } catch (err: any) {
      console.error('Sign out error:', err);
      setError(err?.message || 'লগআউট ব্যর্থ হয়েছে।');
    }
  }, []);

  const refreshChannel = useCallback(async () => {
    if (isDemoMode) {
      setChannel(DEMO_CHANNEL);
      return;
    }
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
  }, [accessToken, user, isDemoMode]);

  const fetchVideos = useCallback(async () => {
    if (isDemoMode) {
      setRecentVideos(INITIAL_DEMO_VIDEOS);
      return;
    }
    const token = accessToken || getCachedAccessToken();
    if (!token) return;
    try {
      const vids = await fetchRecentYouTubeVideos(token, channel?.uploadsPlaylistId);
      setRecentVideos(vids);
    } catch (err) {
      console.error('Error fetching videos:', err);
    }
  }, [accessToken, channel, isDemoMode]);

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

    // If Demo Mode, simulate complete YouTube deployment pipeline
    if (isDemoMode) {
      if (onProgress) onProgress(25);
      await new Promise((r) => setTimeout(r, 600));
      if (onProgress) onProgress(65);
      await new Promise((r) => setTimeout(r, 600));
      if (onProgress) onProgress(100);

      const demoVideoId = 'yt_demo_' + Math.random().toString(36).substring(2, 9);
      const newVideo: YouTubeUploadedVideo = {
        id: demoVideoId,
        title: payload.title,
        description: payload.description,
        thumbnailUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80',
        publishedAt: new Date().toISOString(),
        privacyStatus: payload.privacyStatus,
        videoUrl: `https://www.youtube.com/watch?v=${demoVideoId}`
      };
      setRecentVideos((prev) => [newVideo, ...prev]);
      setIsUploading(false);
      return {
        videoId: demoVideoId,
        watchUrl: `https://www.youtube.com/watch?v=${demoVideoId}`,
        studioUrl: `https://studio.youtube.com/video/${demoVideoId}/edit`
      };
    }

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
  }, [accessToken, fetchVideos, isDemoMode]);

  const clearError = useCallback(() => setError(null), []);

  const value = useMemo<YouTubeAuthContextType>(() => ({
    user,
    accessToken,
    channel,
    recentVideos,
    isAuthenticated: (!!user && !!accessToken) || isDemoMode,
    isDemoMode,
    isLoading,
    isConnecting,
    isUploading,
    error,
    signIn,
    connectDemoChannel,
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
    isDemoMode,
    isLoading,
    isConnecting,
    isUploading,
    error,
    signIn,
    connectDemoChannel,
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
