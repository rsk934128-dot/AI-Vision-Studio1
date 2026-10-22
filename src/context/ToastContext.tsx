import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { 
  CheckCircle2, 
  AlertCircle, 
  Info, 
  AlertTriangle, 
  X, 
  Film, 
  Download, 
  Play, 
  Volume2, 
  VolumeX, 
  ExternalLink,
  RotateCcw
} from 'lucide-react';
import { ToastNotification, ToastType, ToastAction, VideoJob, Language } from '../types';

interface ToastContextType {
  toasts: ToastNotification[];
  addToast: (toast: Omit<ToastNotification, 'id' | 'timestamp'>) => string;
  removeToast: (id: string) => void;
  clearToasts: () => void;
  notifyRenderSuccess: (job: VideoJob, actions?: ToastAction[]) => string;
  notifyRenderError: (errorMessage: string, job?: VideoJob, actions?: ToastAction[]) => string;
  notifySuccess: (title: string, message?: string, titleBn?: string, messageBn?: string) => string;
  notifyError: (title: string, message?: string, titleBn?: string, messageBn?: string) => string;
  notifyInfo: (title: string, message?: string, titleBn?: string, messageBn?: string) => string;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

// Web Audio API Synthesizer for subtle tactile feedback
function playSound(type: 'success' | 'error' | 'info') {
  if (typeof window === 'undefined') return;
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    if (type === 'success') {
      // Pleasant melodic chime: D5 -> A5 (587Hz -> 880Hz)
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.frequency.setValueAtTime(587.33, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.35);
    } else if (type === 'error') {
      // Gentle warning buzz tone: 220Hz -> 180Hz
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.frequency.setValueAtTime(260, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(180, ctx.currentTime + 0.25);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.3);
    }
  } catch (_e) {
    // Ignore audio permission or autoplay restrictions
  }
}

interface ToastProviderProps {
  children: React.ReactNode;
  lang?: Language;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children, lang = 'bn' }) => {
  const [toasts, setToasts] = useState<ToastNotification[]>([]);
  const [soundEnabled, setSoundEnabledState] = useState<boolean>(() => {
    try {
      return localStorage.getItem('ai_studio_toast_sound') !== 'false';
    } catch {
      return true;
    }
  });

  const setSoundEnabled = (enabled: boolean) => {
    setSoundEnabledState(enabled);
    try {
      localStorage.setItem('ai_studio_toast_sound', enabled ? 'true' : 'false');
    } catch {
      // Ignore
    }
  };

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const clearToasts = useCallback(() => {
    setToasts([]);
  }, []);

  const addToast = useCallback(
    (toastData: Omit<ToastNotification, 'id' | 'timestamp'>) => {
      const id = `toast-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
      const newToast: ToastNotification = {
        ...toastData,
        id,
        timestamp: Date.now(),
        duration: toastData.duration !== undefined ? toastData.duration : 6000,
      };

      if (soundEnabled) {
        if (toastData.type === 'success' || toastData.type === 'render') {
          playSound('success');
        } else if (toastData.type === 'error') {
          playSound('error');
        } else {
          playSound('info');
        }
      }

      setToasts((prev) => [newToast, ...prev].slice(0, 5)); // Keep max 5 toasts on screen
      return id;
    },
    [soundEnabled]
  );

  // Specialized Helper: Video Render Success Toast
  const notifyRenderSuccess = useCallback(
    (job: VideoJob, customActions?: ToastAction[]) => {
      const defaultActions: ToastAction[] = [];

      if (job.videoUrl) {
        defaultActions.push({
          label: 'Download MP4',
          labelBn: 'ভিডিও ডাউনলোড (MP4)',
          variant: 'primary',
          onClick: () => {
            const a = document.createElement('a');
            a.href = job.videoUrl!;
            a.download = `video_render_${job.id}.mp4`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
          },
        });
      }

      return addToast({
        type: 'render',
        title: 'Video Export Completed! 🎬',
        titleBn: 'ভিডিও রেন্ডারিং সফলভাবে সম্পন্ন হয়েছে! 🎬',
        message: `"${job.prompt.slice(0, 48)}${job.prompt.length > 48 ? '...' : ''}" (1080p ${job.aspectRatio}) is ready for download and publishing.`,
        messageBn: `"${job.prompt.slice(0, 48)}${job.prompt.length > 48 ? '...' : ''}" (${job.aspectRatio}) এর রেন্ডার সম্পন্ন হয়েছে। আপনি এখন ডাউনলোড বা ইউটিউবে পোস্ট করতে পারেন।`,
        duration: 8000,
        videoJob: job,
        actions: customActions || defaultActions,
      });
    },
    [addToast]
  );

  // Specialized Helper: Video Render Error Toast
  const notifyRenderError = useCallback(
    (errorMessage: string, job?: VideoJob, customActions?: ToastAction[]) => {
      return addToast({
        type: 'error',
        title: 'Video Render Error ❌',
        titleBn: 'ভিডিও রেন্ডারিংয়ে সমস্যা হয়েছে ❌',
        message: errorMessage || 'An unexpected error occurred during frame synthesis or FFmpeg encoding.',
        messageBn: errorMessage || 'ভিডিও ফ্রেম সিন্থেসিস বা FFmpeg এনকোডিং প্রক্রিয়ায় ত্রুটি দেখা দিয়েছে। দয়া করে আবার চেষ্টা করুন।',
        duration: 9000,
        videoJob: job,
        actions: customActions || [],
      });
    },
    [addToast]
  );

  const notifySuccess = useCallback(
    (title: string, message = '', titleBn?: string, messageBn?: string) => {
      return addToast({
        type: 'success',
        title,
        titleBn,
        message,
        messageBn,
        duration: 5000,
      });
    },
    [addToast]
  );

  const notifyError = useCallback(
    (title: string, message = '', titleBn?: string, messageBn?: string) => {
      return addToast({
        type: 'error',
        title,
        titleBn,
        message,
        messageBn,
        duration: 7000,
      });
    },
    [addToast]
  );

  const notifyInfo = useCallback(
    (title: string, message = '', titleBn?: string, messageBn?: string) => {
      return addToast({
        type: 'info',
        title,
        titleBn,
        message,
        messageBn,
        duration: 5000,
      });
    },
    [addToast]
  );

  return (
    <ToastContext.Provider
      value={{
        toasts,
        addToast,
        removeToast,
        clearToasts,
        notifyRenderSuccess,
        notifyRenderError,
        notifySuccess,
        notifyError,
        notifyInfo,
        soundEnabled,
        setSoundEnabled,
      }}
    >
      {children}
      <ToastContainer 
        toasts={toasts} 
        onRemove={removeToast} 
        lang={lang} 
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled(!soundEnabled)}
      />
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

// ==========================================
// TOAST CONTAINER & INDIVIDUAL TOAST ITEM UI
// ==========================================

interface ToastContainerProps {
  toasts: ToastNotification[];
  onRemove: (id: string) => void;
  lang: Language;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

const ToastContainer: React.FC<ToastContainerProps> = ({ 
  toasts, 
  onRemove, 
  lang,
  soundEnabled,
  onToggleSound
}) => {
  if (toasts.length === 0) return null;

  return (
    <div 
      aria-live="polite"
      aria-label="Notification Center"
      className="fixed top-4 right-4 z-[9999] flex flex-col gap-3 max-w-sm sm:max-w-md w-[calc(100vw-2rem)] pointer-events-none"
    >
      {toasts.map((toast) => (
        <ToastItem
          key={toast.id}
          toast={toast}
          onClose={() => onRemove(toast.id)}
          lang={lang}
        />
      ))}
    </div>
  );
};

interface ToastItemProps {
  toast: ToastNotification;
  onClose: () => void;
  lang: Language;
}

const ToastItem: React.FC<ToastItemProps> = ({ toast, onClose, lang }) => {
  const isBn = lang === 'bn';
  const [isHovered, setIsHovered] = useState(false);
  const [remainingPercent, setRemainingPercent] = useState(100);
  const duration = toast.duration || 6000;
  const startTimeRef = useRef<number>(Date.now());
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (duration <= 0) return; // persistent toast

    const updateInterval = 50;
    const interval = setInterval(() => {
      if (isHovered) {
        startTimeRef.current += updateInterval;
        return;
      }
      const elapsed = Date.now() - startTimeRef.current;
      const percent = Math.max(0, 100 - (elapsed / duration) * 100);
      setRemainingPercent(percent);

      if (elapsed >= duration) {
        clearInterval(interval);
        onClose();
      }
    }, updateInterval);

    return () => clearInterval(interval);
  }, [duration, isHovered, onClose]);

  const titleText = (isBn && toast.titleBn) ? toast.titleBn : toast.title;
  const messageText = (isBn && toast.messageBn) ? toast.messageBn : toast.message;

  // Visual style config depending on toast type
  const getStyleConfig = () => {
    switch (toast.type) {
      case 'render':
      case 'success':
        return {
          icon: <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5 animate-pulse" />,
          border: 'border-emerald-500/50 shadow-emerald-950/50',
          bg: 'bg-gradient-to-br from-slate-900/98 via-slate-900/95 to-emerald-950/30',
          badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
          badgeLabel: isBn ? 'রেন্ডার সম্পন্ন' : 'RENDER SUCCESS',
          progressColor: 'bg-emerald-400',
          glow: 'from-emerald-500/10 to-teal-500/10'
        };
      case 'error':
        return {
          icon: <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />,
          border: 'border-rose-500/50 shadow-rose-950/50',
          bg: 'bg-gradient-to-br from-slate-900/98 via-slate-900/95 to-rose-950/30',
          badgeBg: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
          badgeLabel: isBn ? 'রেন্ডার এরর' : 'RENDER FAILED',
          progressColor: 'bg-rose-500',
          glow: 'from-rose-500/10 to-red-500/10'
        };
      case 'warning':
        return {
          icon: <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />,
          border: 'border-amber-500/50 shadow-amber-950/50',
          bg: 'bg-gradient-to-br from-slate-900/98 via-slate-900/95 to-amber-950/30',
          badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
          badgeLabel: isBn ? 'সতর্কতা' : 'WARNING',
          progressColor: 'bg-amber-400',
          glow: 'from-amber-500/10 to-yellow-500/10'
        };
      default:
        return {
          icon: <Info className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />,
          border: 'border-cyan-500/50 shadow-cyan-950/50',
          bg: 'bg-gradient-to-br from-slate-900/98 via-slate-900/95 to-cyan-950/30',
          badgeBg: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
          badgeLabel: isBn ? 'নোটিফিকেশন' : 'INFO',
          progressColor: 'bg-cyan-400',
          glow: 'from-cyan-500/10 to-indigo-500/10'
        };
    }
  };

  const style = getStyleConfig();

  return (
    <div
      role="alert"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`pointer-events-auto relative overflow-hidden rounded-2xl border ${style.border} ${style.bg} p-4 shadow-2xl backdrop-blur-xl transition-all duration-300 transform translate-y-0 opacity-100 hover:scale-[1.01]`}
    >
      {/* Subtle Ambient Glow */}
      <div className={`absolute -top-12 -right-12 w-32 h-32 rounded-full bg-gradient-to-br ${style.glow} blur-2xl pointer-events-none`} />

      <div className="flex items-start gap-3 relative z-10">
        {style.icon}

        <div className="flex-1 min-w-0 pr-6">
          <div className="flex items-center gap-2 mb-1">
            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wider uppercase border ${style.badgeBg}`}>
              {style.badgeLabel}
            </span>
            <span className="text-[10px] text-slate-500 font-mono">
              {new Date(toast.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
          </div>

          <h4 className="text-xs sm:text-sm font-bold text-white tracking-wide">
            {titleText}
          </h4>

          {messageText && (
            <p className="text-xs text-slate-300 mt-1 leading-relaxed line-clamp-3">
              {messageText}
            </p>
          )}

          {/* Video preview / Action Toolbar */}
          {toast.actions && toast.actions.length > 0 && (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {toast.actions.map((act, idx) => {
                const label = (isBn && act.labelBn) ? act.labelBn : act.label;
                const isPrimary = act.variant === 'primary' || idx === 0;

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      act.onClick();
                      onClose();
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                      isPrimary
                        ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/30'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                    }`}
                  >
                    {isPrimary && <Download className="w-3.5 h-3.5" />}
                    <span>{label}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close notification"
          className="absolute top-3 right-3 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Countdown Progress Bar (auto-dismiss indicator) */}
      {duration > 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-950/60 overflow-hidden">
          <div
            className={`h-full ${style.progressColor} transition-all duration-75`}
            style={{ width: `${remainingPercent}%` }}
          />
        </div>
      )}
    </div>
  );
};
