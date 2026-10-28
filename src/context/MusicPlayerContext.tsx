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

// Continuous low-amplitude carrier audio for uninterrupted mobile/desktop background audio
function createContinuousAudioCarrier(): HTMLAudioElement {
  try {
    const sampleRate = 8000;
    const duration = 4;
    const numFrames = sampleRate * duration;
    const buffer = new ArrayBuffer(44 + numFrames * 2);
    const view = new DataView(buffer);

    const writeStr = (offset: number, str: string) => {
      for (let i = 0; i < str.length; i++) {
        view.setUint8(offset + i, str.charCodeAt(i));
      }
    };

    writeStr(0, 'RIFF');
    view.setUint32(4, 36 + numFrames * 2, true);
    writeStr(8, 'WAVE');
    writeStr(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true); // PCM
    view.setUint16(22, 1, true); // Mono
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeStr(36, 'data');
    view.setUint32(40, numFrames * 2, true);

    // 25 Hz very soft carrier wave to maintain OS audio focus without loud buzz
    for (let i = 0; i < numFrames; i++) {
      const sample = Math.round(Math.sin((2 * Math.PI * 25 * i) / sampleRate) * 80);
      view.setInt16(44 + i * 2, sample, true);
    }

    const blob = new Blob([buffer], { type: 'audio/wav' });
    const audio = new Audio(URL.createObjectURL(blob));
    audio.loop = true;
    audio.volume = 0.05;
    return audio;
  } catch (_e) {
    const fallback = new Audio('data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA');
    fallback.loop = true;
    fallback.volume = 0.05;
    return fallback;
  }
}

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

  const carrierAudioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const carrierOscRef = useRef<OscillatorNode | null>(null);
  const carrierGainRef = useRef<GainNode | null>(null);
  const wakeLockRef = useRef<any>(null);
  const timerIntervalRef = useRef<any>(null);

  // Initialize Web Audio and carrier element for OS audio session retention
  const ensureBackgroundAudioActive = useCallback(() => {
    try {
      if (!carrierAudioRef.current) {
        carrierAudioRef.current = createContinuousAudioCarrier();
      }
      carrierAudioRef.current.play().catch(() => {});

      // Web Audio API session unlock for Android AudioTrack & iOS CoreAudio
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        if (!audioContextRef.current) {
          audioContextRef.current = new AudioCtx();
        }
        if (audioContextRef.current.state === 'suspended') {
          audioContextRef.current.resume().catch(() => {});
        }
        if (!carrierOscRef.current && audioContextRef.current) {
          const osc = audioContextRef.current.createOscillator();
          const gain = audioContextRef.current.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(26, audioContextRef.current.currentTime);
          gain.gain.setValueAtTime(0.001, audioContextRef.current.currentTime);
          osc.connect(gain);
          gain.connect(audioContextRef.current.destination);
          osc.start();
          carrierOscRef.current = osc;
          carrierGainRef.current = gain;
        }
      }
    } catch (err) {
      console.warn('Background audio session initialization notice:', err);
    }
  }, []);

  const pauseBackgroundAudio = useCallback(() => {
    try {
      carrierAudioRef.current?.pause();
      if (audioContextRef.current && audioContextRef.current.state === 'running') {
        audioContextRef.current.suspend().catch(() => {});
      }
    } catch (_e) {}
  }, []);

  // Update MediaSession API for Android/iOS Lock Screen Controls and notification shade
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
        ensureBackgroundAudioActive();
      });

      navigator.mediaSession.setActionHandler('pause', () => {
        setIsPlaying(false);
        pauseBackgroundAudio();
      });

      navigator.mediaSession.setActionHandler('previoustrack', () => {
        prevTrack();
      });

      navigator.mediaSession.setActionHandler('nexttrack', () => {
        nextTrack();
      });

      navigator.mediaSession.setActionHandler('stop', () => {
        setIsPlaying(false);
        pauseBackgroundAudio();
      });

      navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';
    } catch (e) {
      console.warn('MediaSession notice:', e);
    }
  }, [currentTrack, isPlaying, ensureBackgroundAudioActive, pauseBackgroundAudio]);

  // Keep background audio active when tab is hidden, screen locks, or user navigates away
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (isPlaying) {
        ensureBackgroundAudioActive();
        if ('mediaSession' in navigator) {
          navigator.mediaSession.playbackState = 'playing';
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('pagehide', handleVisibilityChange);
    window.addEventListener('blur', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('pagehide', handleVisibilityChange);
      window.removeEventListener('blur', handleVisibilityChange);
    };
  }, [isPlaying, ensureBackgroundAudioActive]);

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
            pauseBackgroundAudio();
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
  }, [sleepTimerMinutes, isPlaying, pauseBackgroundAudio]);

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

    ensureBackgroundAudioActive();

    if (immediatePlayList && immediatePlayList.length > 0) {
      const remaining = immediatePlayList.filter((t) => t.id !== track.id);
      setQueue(remaining);
    }

    setHistory((prev) => [track, ...prev.filter((p) => p.id !== track.id)].slice(0, 30));
  }, [ensureBackgroundAudioActive]);

  const togglePlay = useCallback(() => {
    setIsPlaying((prev) => {
      const next = !prev;
      if (next) {
        ensureBackgroundAudioActive();
      } else {
        pauseBackgroundAudio();
      }
      return next;
    });
  }, [ensureBackgroundAudioActive, pauseBackgroundAudio]);

  const pauseTrack = useCallback(() => {
    setIsPlaying(false);
    pauseBackgroundAudio();
  }, [pauseBackgroundAudio]);

  const resumeTrack = useCallback(() => {
    setIsPlaying(true);
    ensureBackgroundAudioActive();
  }, [ensureBackgroundAudioActive]);

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
