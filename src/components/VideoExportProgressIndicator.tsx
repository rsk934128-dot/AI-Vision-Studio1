import React, { useState, useEffect, useRef } from 'react';
import { 
  Download, 
  X, 
  CheckCircle2, 
  Loader2, 
  Clock, 
  Cpu, 
  Maximize2, 
  Minimize2, 
  Layers, 
  Volume2, 
  Sparkles, 
  Film, 
  Stamp, 
  ShieldCheck,
  Check,
  Zap,
  ArrowRight
} from 'lucide-react';
import { Language } from '../types';

export interface VideoExportProgressIndicatorProps {
  isExporting: boolean;
  progress: number; // 0 to 100
  title?: string;
  duration?: number; // duration of video in seconds
  fps?: number; // target recording FPS (e.g. 30)
  resolution?: string; // e.g. '1080p (FHD)' or '854x480'
  format?: string; // e.g. 'WebM (VP9)' or 'MP4'
  hasWatermark?: boolean;
  onCancel?: () => void;
  lang?: Language;
  allowFloatingMinimize?: boolean;
  onComplete?: () => void;
}

interface ExportPipelineStage {
  id: string;
  nameBn: string;
  nameEn: string;
  descBn: string;
  descEn: string;
  minProgress: number;
  maxProgress: number;
  icon: string;
}

const EXPORT_STAGES: ExportPipelineStage[] = [
  {
    id: 'init',
    nameBn: 'স্ট্রিম ইনিশিয়ালাইজেশন',
    nameEn: 'Stream Initialization',
    descBn: 'ক্যানভাস ও অডিও কনটেক্সট সংযুক্ত করা হচ্ছে',
    descEn: 'Binding canvas stream & audio graph',
    minProgress: 0,
    maxProgress: 15,
    icon: '⚙️'
  },
  {
    id: 'frames',
    nameBn: 'ফ্রেম ও ওয়াটারমার্ক রেন্ডারিং',
    nameEn: 'Frame & Watermark Rendering',
    descBn: '৩০ FPS ফ্রেম-বাই-ফ্রেম ক্যানভাস ক্যাপচার',
    descEn: 'Capturing canvas frames with watermark',
    minProgress: 15,
    maxProgress: 75,
    icon: '🎬'
  },
  {
    id: 'audio_sync',
    nameBn: 'অডিও ও ভিডিও মাল্টিপ্লেক্সিং',
    nameEn: 'Audio Multiplexing & Muxing',
    descBn: 'সাউন্ডট্র্যাক ও ফ্রেম ট্র্যাকিং সমন্বয়',
    descEn: 'Synchronizing Opus audio with VP9 video',
    minProgress: 75,
    maxProgress: 92,
    icon: '🎵'
  },
  {
    id: 'packaging',
    nameBn: 'ভিডিও ব্লব ও ফাইল প্যাকেজিং',
    nameEn: 'Packaging Video File',
    descBn: 'রেন্ডার শেষ ও ফাইল ডাউনলোড প্রস্তুত',
    descEn: 'Finalizing chunks into downloadable video',
    minProgress: 92,
    maxProgress: 100,
    icon: '📦'
  }
];

export const VideoExportProgressIndicator: React.FC<VideoExportProgressIndicatorProps> = ({
  isExporting,
  progress: rawProgress,
  title = 'AI Video Export',
  duration = 30,
  fps = 30,
  resolution = '1080p (FHD)',
  format = 'WebM (VP9 / Opus)',
  hasWatermark = true,
  onCancel,
  lang = 'bn',
  allowFloatingMinimize = true,
  onComplete
}) => {
  const isBn = lang === 'bn';
  const progress = Math.min(100, Math.max(0, Math.round(rawProgress)));
  const isCompleted = progress >= 100;

  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const startTimeRef = useRef<number>(Date.now());
  const hasTriggeredComplete = useRef<boolean>(false);

  // Reset timer on start of new export
  useEffect(() => {
    if (isExporting && progress < 10) {
      startTimeRef.current = Date.now();
      setElapsedSeconds(0);
      hasTriggeredComplete.current = false;
    }
  }, [isExporting]);

  // Elapsed timer ticker
  useEffect(() => {
    if (!isExporting || isCompleted) return;

    const timer = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 400);

    return () => clearInterval(timer);
  }, [isExporting, isCompleted]);

  // Handle completion trigger
  useEffect(() => {
    if (isCompleted && !hasTriggeredComplete.current) {
      hasTriggeredComplete.current = true;
      if (onComplete) onComplete();
    }
  }, [isCompleted, onComplete]);

  if (!isExporting && !isCompleted) return null;

  // Calculate estimated frames
  const totalFrames = Math.max(1, Math.round(duration * fps));
  const currentFrame = Math.min(totalFrames, Math.round((progress / 100) * totalFrames));

  // Determine active pipeline stage
  const currentStage = EXPORT_STAGES.find(
    (s) => progress >= s.minProgress && progress < s.maxProgress
  ) || EXPORT_STAGES[EXPORT_STAGES.length - 1];

  // Calculate ETA (Remaining time)
  const calculateEta = (): string => {
    if (isCompleted) return isBn ? 'সম্পন্ন হয়েছে!' : 'Finished!';
    if (progress <= 5) return isBn ? 'গণনা হচ্ছে...' : 'Estimating...';
    const totalEstSeconds = elapsedSeconds / (progress / 100);
    const remaining = Math.max(1, Math.round(totalEstSeconds - elapsedSeconds));
    return isBn ? `~${remaining} সেকেন্ড বাকি` : `~${remaining}s left`;
  };

  // Minimized floating bubble
  if (isMinimized && allowFloatingMinimize) {
    return (
      <div className="fixed bottom-6 right-6 z-50 animate-bounce-short select-none">
        <div 
          onClick={() => setIsMinimized(false)}
          className={`flex items-center gap-3 px-4 py-3 rounded-2xl shadow-2xl border backdrop-blur-md cursor-pointer transition-all hover:scale-105 ${
            isCompleted 
              ? 'bg-emerald-950/95 border-emerald-500/80 text-white shadow-emerald-950/60'
              : 'bg-slate-900/95 border-cyan-500/80 text-white shadow-cyan-950/60'
          }`}
        >
          <div className="relative w-8 h-8 rounded-full flex items-center justify-center bg-slate-800">
            {isCompleted ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            ) : (
              <Loader2 className="w-5 h-5 text-cyan-400 animate-spin" />
            )}
          </div>

          <div className="text-left">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold truncate max-w-[150px]">
                {title}
              </span>
              <span className="text-xs font-mono font-bold text-cyan-400">
                {progress}%
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              {isCompleted 
                ? (isBn ? 'এক্সপোর্ট সম্পন্ন! ক্লিক করুন' : 'Export Ready! Click to expand') 
                : (isBn ? currentStage.nameBn : currentStage.nameEn)}
            </p>
          </div>

          <Maximize2 className="w-4 h-4 text-slate-400 hover:text-white ml-1" />
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md select-none animate-fadeIn">
      
      {/* Modal Dialog Card */}
      <div className="relative w-full max-w-xl overflow-hidden rounded-3xl bg-slate-900 border border-slate-700/80 p-6 sm:p-7 shadow-2xl space-y-6">
        
        {/* Ambient Top Glow */}
        <div 
          className={`absolute -top-24 -right-24 w-80 h-80 rounded-full blur-3xl pointer-events-none transition-all duration-700 ${
            isCompleted 
              ? 'bg-emerald-500/15' 
              : 'bg-gradient-to-br from-cyan-500/20 via-purple-600/20 to-pink-500/15'
          }`} 
        />

        {/* Header Bar */}
        <div className="flex items-start justify-between relative z-10 border-b border-slate-800/80 pb-4">
          <div className="flex items-center gap-3">
            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all ${
              isCompleted
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-lg shadow-emerald-500/20'
                : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 shadow-lg shadow-cyan-500/20'
            }`}>
              {isCompleted ? (
                <CheckCircle2 className="w-6 h-6" />
              ) : (
                <Loader2 className="w-6 h-6 animate-spin" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-white tracking-wide">
                  {isCompleted
                    ? (isBn ? 'ভিডিও এক্সপোর্ট সম্পন্ন!' : 'Video Export Completed!')
                    : (isBn ? 'ভিডিও রেন্ডারিং পাইপলাইন চলছে' : 'Video Rendering Pipeline')}
                </h3>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                  isCompleted
                    ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700'
                    : 'bg-cyan-950/80 text-cyan-300 border-cyan-700 animate-pulse'
                }`}>
                  {isCompleted ? (isBn ? 'সম্পন্ন' : 'READY') : (isBn ? 'লাইভ এনকোডিং' : 'LIVE ENCODING')}
                </span>
              </div>
              <p className="text-xs text-slate-400 truncate max-w-sm sm:max-w-md mt-0.5" title={title}>
                {title}
              </p>
            </div>
          </div>

          {/* Header Controls: Minimize & Cancel */}
          <div className="flex items-center gap-1.5">
            {allowFloatingMinimize && !isCompleted && (
              <button
                onClick={() => setIsMinimized(true)}
                title={isBn ? 'মিনিমাইজ করুন' : 'Minimize'}
                className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
              >
                <Minimize2 className="w-4 h-4" />
              </button>
            )}

            {onCancel && !isCompleted && (
              <button
                onClick={onCancel}
                title={isBn ? 'এক্সপোর্ট বাতিল করুন' : 'Cancel Export'}
                className="p-2 rounded-xl bg-slate-800/80 hover:bg-red-950 hover:text-red-400 text-slate-400 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            {isCompleted && (
              <button
                onClick={() => {
                  if (onCancel) onCancel();
                  else setIsMinimized(true);
                }}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Real-Time Progress Bar & Metrics */}
        <div className="space-y-4 relative z-10">
          
          {/* Top Progress Percentage & Counter */}
          <div className="flex items-baseline justify-between">
            <div className="flex items-baseline gap-2">
              <span className="text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-indigo-300 to-emerald-400 font-mono tracking-tight">
                {progress}%
              </span>
              <span className="text-xs sm:text-sm font-semibold text-slate-300">
                {isBn ? currentStage.nameBn : currentStage.nameEn}
              </span>
            </div>

            <div className="flex flex-col items-end gap-1">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cyan-950/70 border border-cyan-800/70 text-cyan-300 font-mono text-xs">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                <span>{calculateEta()}</span>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">
                {elapsedSeconds}s {isBn ? 'অতিবাহিত' : 'elapsed'}
              </span>
            </div>
          </div>

          {/* High-Tech Glowing Multi-Layer Progress Bar */}
          <div className="relative w-full h-4 bg-slate-950 rounded-full overflow-hidden border border-slate-800 shadow-inner p-0.5">
            <div 
              className={`h-full rounded-full transition-all duration-300 relative ${
                isCompleted 
                  ? 'bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-300 shadow-lg shadow-emerald-500/60' 
                  : 'bg-gradient-to-r from-cyan-500 via-indigo-500 to-purple-500 shadow-lg shadow-cyan-500/50'
              }`}
              style={{ width: `${progress}%` }}
            >
              {/* Animated Leading Shimmer Light */}
              {!isCompleted && (
                <div className="absolute right-0 top-0 bottom-0 w-8 bg-white/40 blur-xs animate-pulse rounded-full" />
              )}
            </div>
          </div>

          {/* Real-Time Pipeline Specs Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
            <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 block">{isBn ? 'ফ্রেম কাউন্টার' : 'Rendered Frames'}</span>
              <span className="text-xs font-mono font-bold text-white mt-0.5 block">
                {currentFrame} / {totalFrames}
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 block">{isBn ? 'ফ্রেম রেট' : 'Frame Rate'}</span>
              <span className="text-xs font-mono font-bold text-cyan-400 mt-0.5 block">
                {fps} FPS
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 block">{isBn ? 'রেজোলিউশন ও ফরম্যাট' : 'Resolution'}</span>
              <span className="text-xs font-mono font-bold text-purple-300 mt-0.5 block truncate" title={`${resolution} • ${format}`}>
                {resolution}
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 block">{isBn ? 'ওয়াটারমার্ক' : 'Watermark'}</span>
              <span className="text-xs font-mono font-bold text-emerald-400 mt-0.5 flex items-center justify-center gap-1">
                <Stamp className="w-3 h-3 text-cyan-400" />
                <span>{hasWatermark ? (isBn ? 'খোদাই হচ্ছে' : 'Baked In') : (isBn ? 'বন্ধ' : 'Off')}</span>
              </span>
            </div>
          </div>

          {/* 4-Stage Stepper Pipeline */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
            {EXPORT_STAGES.map((stage, idx) => {
              const isStageDone = progress >= stage.maxProgress || isCompleted;
              const isStageActive = progress >= stage.minProgress && progress < stage.maxProgress && !isCompleted;

              return (
                <div 
                  key={stage.id}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    isStageDone
                      ? 'bg-emerald-950/30 border-emerald-500/50 text-emerald-300'
                      : isStageActive
                      ? 'bg-cyan-950/60 border-cyan-500 ring-1 ring-cyan-500/40 text-white shadow-lg shadow-cyan-950/50'
                      : 'bg-slate-950/40 border-slate-800/80 text-slate-500'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm">{stage.icon}</span>
                    {isStageDone ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[3]" />
                    ) : isStageActive ? (
                      <Loader2 className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
                    ) : (
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-700" />
                    )}
                  </div>
                  <div className="text-[11px] font-bold truncate">
                    {isBn ? stage.nameBn : stage.nameEn}
                  </div>
                  <div className="text-[9px] text-slate-400 truncate mt-0.5">
                    {isBn ? stage.descBn : stage.descEn}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Live Audio & Frame Rasterizing Waveform Animation */}
          {!isCompleted && (
            <div className="p-3 rounded-2xl bg-slate-950/90 border border-slate-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5">
                <div className="flex items-end gap-1 h-5">
                  <span className="w-1 bg-cyan-400 rounded-full animate-bounce h-2.5" style={{ animationDelay: '0.1s' }} />
                  <span className="w-1 bg-indigo-400 rounded-full animate-bounce h-5" style={{ animationDelay: '0.2s' }} />
                  <span className="w-1 bg-purple-400 rounded-full animate-bounce h-3.5" style={{ animationDelay: '0.3s' }} />
                  <span className="w-1 bg-pink-400 rounded-full animate-bounce h-4.5" style={{ animationDelay: '0.15s' }} />
                  <span className="w-1 bg-emerald-400 rounded-full animate-bounce h-3" style={{ animationDelay: '0.25s' }} />
                  <span className="w-1 bg-cyan-300 rounded-full animate-bounce h-4" style={{ animationDelay: '0.35s' }} />
                </div>
                <div>
                  <div className="text-[11px] font-semibold text-slate-200">
                    {isBn ? currentStage.descBn : currentStage.descEn}
                  </div>
                  <div className="text-[10px] text-cyan-400 font-mono mt-0.5">
                    MediaRecorder VP9 • Canvas Capture Stream 30 FPS
                  </div>
                </div>
              </div>

              <span className="text-[10px] text-slate-400 font-mono hidden sm:inline-block">
                Bitrate: ~4.5 Mbps
              </span>
            </div>
          )}

          {/* Completion Celebration Footer */}
          {isCompleted && (
            <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-3 animate-fadeIn">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-bold text-emerald-400">
                  {isBn ? 'ভিডিও ফাইলটি সফলভাবে ডাউনলোড হয়েছে' : 'Video file downloaded successfully'}
                </span>
              </div>

              <button
                onClick={() => {
                  if (onCancel) onCancel();
                  else setIsMinimized(true);
                }}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition shadow-lg shadow-emerald-600/30 cursor-pointer"
              >
                {isBn ? 'সম্পন্ন' : 'Done'}
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default VideoExportProgressIndicator;
