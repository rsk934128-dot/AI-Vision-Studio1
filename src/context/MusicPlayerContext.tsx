import React, { createContext, useContext, useState, useEffect, useRef, useCallback, ReactNode } from 'react';
import { YouTubeTrack } from '../types';

export type PlayMode = 'video' | 'audio';
export type RepeatMode = 'none' | 'one' | 'all';

interface MusicPlayerContextType {
  currentTrack: YouTubeTrack | null;
  isPlaying: boolean;
  playMode: PlayMode;
  isScreenOffAudioMode: boolean;
  isWakeLockActive: boolean;
  isFullModalOpen: boolean;
  isMiniPlayerVisible: boolean;
  queue: YouTubeTrack[];
  history: YouTubeTrack[];
  sleepTimerMinutes: number | null;
  sleepTimerRemaining: number | null;
  volume: number;
  isMuted: boolean;
  repeatMode: RepeatMode;
  playTrack: (track: YouTubeTrack, mode?: PlayMode, immediatePlayList?: YouTubeTrack[]) => void;
  togglePlay: () => void;
  pauseTrack: () => void;
  resumeTrack: () => void;
  setPlayMode: (mode: PlayMode) => void;
  nextTrack: () => void;
  prevTrack: () => void;
  addToQueue: (track: YouTubeTrack) => void;
  removeFromQueue: (trackId: string) => void;
  clearQueue: () => void;
  setSleepTimer: (minutes: number | null) => void;
  toggleWakeLock: () => Promise<void>;
  openFullModal: () => void;
  closeFullModal: () => void;
  setIsMiniPlayerVisible: (visible: boolean) => void;
  setVolume: (val: number) => void;
  toggleMute: () => void;
  setRepeatMode: (mode: RepeatMode) => void;
}

const MusicPlayerContext = createContext<MusicPlayerContextType | undefined>(undefined);

// Base64 silent audio WAV data (valid 1-second silence loop)
const SILENT_AUDIO_URI = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA';

export const MusicPlayerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentTrack, setCurrentTrack] = useState<YouTubeTrack | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playMode, setPlayModeState] = useState<PlayMode>('audio');
  const [isScreenOffAudioMode, setIsScreenOffAudioMode] = useState<boolean>(true);
  const [isWakeLockActive, setIsWakeLockActive] = useState<boolean>(false);
  const [isFullModalOpen, setIsFullModalOpen] = useState<boolean>(false);
  const [isMiniPlayerVisible, setIsMiniPlayerVisible] = useState<boolean>(true);
  const [queue, setQueue] = useState<YouTubeTrack[]>([]);
  const [history, setHistory] = useState<YouTubeTrack[]>([]);
  const [sleepTimerMinutes, setSleepTimerMinutes] = useState<number | null>(null);
  const [sleepTimerRemaining, setSleepTimerRemaining] = useState<number | null>(null);
  const [volume, setVolumeState] = useState<number>(85);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>('all');

  const silentAudioRef = useRef<HTMLAudioElement | null>(null);
  const wakeLockRef = useRef<any>(null);
  const timerIntervalRef = useRef<any>(null);

  // Initialize background audio element
  useEffect(() => {
    const audio = new Audio(SILENT_AUDIO_URI);
    audio.loop = true;
    audio.volume = 0.01;
    silentAudioRef.current = audio;

    return () => {
      audio.pause();
    };
  }, []);

  // Update MediaSession API for Android/iOS Lock Screen Controls
  useEffect(() => {
    if (!('mediaSession' in navigator) || !currentTrack) return;

    try {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: currentTrack.title,
        artist: currentTrack.channel || 'AI Video Studio Bangladesh',
        album: 'YouTube Music • Background Audio Mode',
        artwork: [
          { src: currentTrack.thumbnail, sizes: '96x96', type: 'image/jpeg' },
          { src: currentTrack.thumbnail, sizes: '128x128', type: 'image/jpeg' },
          { src: currentTrack.thumbnail, sizes: '256x256', type: 'image/jpeg' },
          { src: currentTrack.thumbnail, sizes: '512x512', type: 'image/jpeg' },
        ]
      });

      navigator.mediaSession.setActionHandler('play', () => {
        setIsPlaying(true);
        silentAudioRef.current?.play().catch(() => {});
      });

      navigator.mediaSession.setActionHandler('pause', () => {
        setIsPlaying(false);
        silentAudioRef.current?.pause();
      });

      navigator.mediaSession.setActionHandler('previoustrack', () => {
        prevTrack();
      });

      navigator.mediaSession.setActionHandler('nexttrack', () => {
        nextTrack();
      });

      navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';
    } catch (e) {
      console.warn('MediaSession notice:', e);
    }
  }, [currentTrack, isPlaying]);

  // Keep background audio active when tab is hidden or screen locks
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && isPlaying) {
        // Phone screen turned off or user switched apps
        if (silentAudioRef.current) {
          silentAudioRef.current.play().catch(() => {});
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isPlaying]);

  // Sleep Timer Countdown
  useEffect(() => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }

    if (sleepTimerMinutes && sleepTimerMinutes > 0 && isPlaying) {
      setSleepTimerRemaining(sleepTimerMinutes * 60);

      timerIntervalRef.current = setInterval(() => {
        setSleepTimerRemaining((prev) => {
          if (prev === null || prev <= 1) {
            clearInterval(timerIntervalRef.current);
            setIsPlaying(false);
            silentAudioRef.current?.pause();
            setSleepTimerMinutes(null);
            return null;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      setSleepTimerRemaining(null);
    }

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [sleepTimerMinutes, isPlaying]);

  // Toggle Screen WakeLock
  const toggleWakeLock = useCallback(async () => {
    if ('wakeLock' in navigator) {
      try {
        if (!isWakeLockActive) {
          wakeLockRef.current = await (navigator as any).wakeLock.request('screen');
          setIsWakeLockActive(true);
          wakeLockRef.current.addEventListener('release', () => {
            setIsWakeLockActive(false);
          });
        } else {
          await wakeLockRef.current?.release();
          wakeLockRef.current = null;
          setIsWakeLockActive(false);
        }
      } catch (err) {
        console.warn('WakeLock toggle notice:', err);
      }
    }
  }, [isWakeLockActive]);

  const playTrack = useCallback((track: YouTubeTrack, mode?: PlayMode, immediatePlayList?: YouTubeTrack[]) => {
    setCurrentTrack(track);
    setIsPlaying(true);
    setIsMiniPlayerVisible(true);
    if (mode) setPlayModeState(mode);

    if (silentAudioRef.current) {
      silentAudioRef.current.play().catch(() => {});
    }

    if (immediatePlayList && immediatePlayList.length > 0) {
      const remaining = immediatePlayList.filter((t) => t.id !== track.id);
      setQueue(remaining);
    }

    setHistory((prev) => [track, ...prev.filter((p) => p.id !== track.id)].slice(0, 30));
  }, []);

  const togglePlay = useCallback(() => {
    setIsPlaying((prev) => {
      const next = !prev;
      if (next) {
        silentAudioRef.current?.play().catch(() => {});
      } else {
        silentAudioRef.current?.pause();
      }
      return next;
    });
  }, []);

  const pauseTrack = useCallback(() => {
    setIsPlaying(false);
    silentAudioRef.current?.pause();
  }, []);

  const resumeTrack = useCallback(() => {
    setIsPlaying(true);
    silentAudioRef.current?.play().catch(() => {});
  }, []);

  const nextTrack = useCallback(() => {
    if (queue.length > 0) {
      const next = queue[0];
      const remaining = queue.slice(1);
      if (repeatMode === 'all' && currentTrack) {
        setQueue([...remaining, currentTrack]);
      } else {
        setQueue(remaining);
      }
      playTrack(next);
    } else if (repeatMode === 'one' && currentTrack) {
      playTrack(currentTrack);
    }
  }, [queue, currentTrack, repeatMode, playTrack]);

  const prevTrack = useCallback(() => {
    if (history.length > 1) {
      const prev = history[1];
      playTrack(prev);
    }
  }, [history, playTrack]);

  const addToQueue = useCallback((track: YouTubeTrack) => {
    setQueue((prev) => {
      if (prev.some((t) => t.id === track.id)) return prev;
      return [...prev, track];
    });
  }, []);

  const removeFromQueue = useCallback((trackId: string) => {
    setQueue((prev) => prev.filter((t) => t.id !== trackId));
  }, []);

  const clearQueue = useCallback(() => {
    setQueue([]);
  }, []);

  const setSleepTimer = useCallback((minutes: number | null) => {
    setSleepTimerMinutes(minutes);
  }, []);

  const setPlayMode = useCallback((mode: PlayMode) => {
    setPlayModeState(mode);
  }, []);

  const setVolume = useCallback((val: number) => {
    setVolumeState(val);
    if (val === 0) setIsMuted(true);
    else setIsMuted(false);
  }, []);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => !prev);
  }, []);

  const openFullModal = useCallback(() => setIsFullModalOpen(true), []);
  const closeFullModal = useCallback(() => setIsFullModalOpen(false), []);

  return (
    <MusicPlayerContext.Provider
      value={{
        currentTrack,
        isPlaying,
        playMode,
        isScreenOffAudioMode,
        isWakeLockActive,
        isFullModalOpen,
        isMiniPlayerVisible,
        queue,
        history,
        sleepTimerMinutes,
        sleepTimerRemaining,
        volume,
        isMuted,
        repeatMode,
        playTrack,
        togglePlay,
        pauseTrack,
        resumeTrack,
        setPlayMode,
        nextTrack,
        prevTrack,
        addToQueue,
        removeFromQueue,
        clearQueue,
        setSleepTimer,
        toggleWakeLock,
        openFullModal,
        closeFullModal,
        setIsMiniPlayerVisible,
        setVolume,
        toggleMute,
        setRepeatMode
      }}
    >
      {children}
    </MusicPlayerContext.Provider>
  );
};

export const useMusicPlayer = (): MusicPlayerContextType => {
  const context = useContext(MusicPlayerContext);
  if (!context) {
    throw new Error('useMusicPlayer must be used within a MusicPlayerProvider');
  }
  return context;
};
