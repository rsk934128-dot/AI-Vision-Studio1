import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  Film, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Terminal, 
  Volume2, 
  Download, 
  Maximize2, 
  Minimize2, 
  X, 
  Clock, 
  Play, 
  Subtitles, 
  Share2, 
  Copy, 
  Check, 
  FileText,
  Layers,
  ArrowRight,
  Cpu,
  RefreshCw,
  Sliders,
  ExternalLink
} from 'lucide-react';
import { VideoJob, Language } from '../types';
import { useToast } from '../context/ToastContext';

interface VideoRenderProgressIndicatorProps {
  job: VideoJob | null;
  lang: Language;
  onComplete?: (job: VideoJob) => void;
  onCancel?: () => void;
  onOpenVideo?: (videoUrl: string) => void;
  onPublishToYouTube?: (job: VideoJob) => void;
  showLogsToggle?: boolean;
  compact?: boolean;
  className?: string;
  allowFloatingMinimize?: boolean;
}

interface PipelineStage {
  id: string;
  nameBn: string;
  nameEn: string;
  descBn: string;
  descEn: string;
  minProgress: number;
  maxProgress: number;
  icon: string;
}

const PIPELINE_STAGES: PipelineStage[] = [
  {
    id: 'script',
    nameBn: 'স্ক্রিপ্ট ও স্টোরিবোর্ড',
    nameEn: 'Script & Storyboard',
    descBn: 'সিন প্রম্পট ও মেটাডাটা পার্সিং',
    descEn: 'Parsing visual prompt & scenes',
    minProgress: 0,
    maxProgress: 25,
    icon: '📄'
  },
  {
    id: 'frames',
    nameBn: 'এআই ফ্রেম সিন্থেসিস',
    nameEn: 'AI Frame Synthesis',
    descBn: '১০৮০পি ফ্রেম ও অপটিক্যাল ফ্লো',
    descEn: 'Synthesizing 1080p high-res frames',
    minProgress: 25,
    maxProgress: 55,
    icon: '🎨'
  },
  {
    id: 'audio',
    nameBn: 'ভয়েসওভার ও বিজিএম মিক্স',
    nameEn: 'Voiceover & BGM Mix',
    descBn: 'অ্যাকোস্টিক সাউন্ড ও অডিও ডাকিং',
    descEn: 'Acoustic voice synthesis & BGM ducking',
    minProgress: 55,
    maxProgress: 75,
    icon: '🎙️'
  },
  {
    id: 'subtitles',
    nameBn: 'সাবটাইটেল সিঙ্ক ও বার্নিং',
    nameEn: 'Subtitle Burning',
    descBn: 'শব্দভিত্তিক ডায়নামিক ক্যাপশনিং',
    descEn: 'Synchronizing animated karaoke SRT',
    minProgress: 75,
    maxProgress: 90,
    icon: '🔤'
  },
  {
    id: 'encoding',
    nameBn: 'FFmpeg H.264 এনকোডিং',
    nameEn: 'FFmpeg Muxing',
    descBn: 'মাল্টি-লেয়ার ভিডিও রেন্ডার ও এক্সপোর্ট',
    descEn: 'Final multi-layer MP4 packaging',
    minProgress: 90,
    maxProgress: 100,
    icon: '⚡'
  }
];

export const VideoRenderProgressIndicator: React.FC<VideoRenderProgressIndicatorProps> = ({
  job: initialJob,
  lang,
  onComplete,
  onCancel,
  onOpenVideo,
  onPublishToYouTube,
  showLogsToggle = true,
  compact = false,
  className = '',
  allowFloatingMinimize = true
}) => {
  const isBn = lang === 'bn';
  const { notifyRenderSuccess, notifyRenderError } = useToast();

  const [currentJob, setCurrentJob] = useState<VideoJob | null>(initialJob);
  const [showLogs, setShowLogs] = useState<boolean>(false);
  const [copiedLog, setCopiedLog] = useState<boolean>(false);
  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  const logsEndRef = useRef<HTMLDivElement>(null);
  const startTimeRef = useRef<number>(Date.now());
  const hasTriggeredCompleteRef = useRef<boolean>(false);

  // Synchronize when initialJob changes
  useEffect(() => {
    if (initialJob) {
      setCurrentJob(initialJob);
      if (initialJob.status === 'processing') {
        hasTriggeredCompleteRef.current = false;
        startTimeRef.current = Date.now();
      }
    }
  }, [initialJob]);

  // Connect to Real-time Backend Pipeline (EventSource SSE with polling fallback)
  useEffect(() => {
    if (!currentJob || currentJob.status === 'completed' || currentJob.status === 'failed') {
      return;
    }

    let isSubscribed = true;
    let eventSource: EventSource | null = null;
    let pollInterval: NodeJS.Timeout | null = null;

    const fetchLatestJobState = async () => {
      try {
        const res = await fetch(`/api/jobs/${currentJob.id}`);
        if (!res.ok) return;
        const contentType = res.headers.get('content-type') || '';
        if (!contentType.includes('application/json')) return;
        const data = await res.json();
        if (isSubscribed && data.success && data.job) {
          setCurrentJob(data.job);
          if (data.job.status === 'completed' || data.job.status === 'failed') {
            if (pollInterval) clearInterval(pollInterval);
          }
        }
      } catch (_err) {
        // ignore transient network glitch
      }
    };

    // Try Real-time Server-Sent Events (SSE)
    try {
      eventSource = new EventSource(`/api/jobs/${currentJob.id}/stream`);

      eventSource.onmessage = (event) => {
        if (!isSubscribed) return;
        try {
          const data = JSON.parse(event.data);
          if (data.success && data.job) {
            setCurrentJob(data.job);
            if (data.job.status === 'completed' || data.job.status === 'failed') {
              eventSource?.close();
            }
          }
        } catch (_e) {
          // parse error
        }
      };

      eventSource.onerror = () => {
        // Fallback to rapid polling if SSE connection drops
        eventSource?.close();
        if (!pollInterval && isSubscribed) {
          pollInterval = setInterval(fetchLatestJobState, 500);
        }
      };
    } catch (_err) {
      pollInterval = setInterval(fetchLatestJobState, 500);
    }

    return () => {
      isSubscribed = false;
      if (eventSource) eventSource.close();
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [currentJob?.id, currentJob?.status]);

  // Elapsed timer calculation
  useEffect(() => {
    if (currentJob?.status !== 'processing') return;

    const timer = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 500);

    return () => clearInterval(timer);
  }, [currentJob?.status]);

  // Autoscroll logs to bottom
  useEffect(() => {
    if (showLogs && logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [showLogs, currentJob?.ffmpegLogs?.length]);

  // Trigger toast alert and notify parent on completion or failure
  useEffect(() => {
    if (currentJob?.status === 'completed' && !hasTriggeredCompleteRef.current) {
      hasTriggeredCompleteRef.current = true;
      if (onComplete) {
        onComplete(currentJob);
      }

      // Display rich success toast alert with actions
      notifyRenderSuccess(currentJob, [
        ...(currentJob.videoUrl ? [{
          label: 'Download MP4',
          labelBn: 'ভিডিও ডাউনলোড (MP4)',
          variant: 'primary' as const,
          onClick: () => {
            const a = document.createElement('a');
            a.href = currentJob.videoUrl!;
            a.download = `video_render_${currentJob.id}.mp4`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
          }
        }] : []),
        ...(onOpenVideo && currentJob.videoUrl ? [{
          label: 'Preview',
          labelBn: 'প্লে করুন',
          variant: 'secondary' as const,
          onClick: () => onOpenVideo(currentJob.videoUrl!)
        }] : []),
        ...(onPublishToYouTube ? [{
          label: 'Publish to YouTube',
          labelBn: 'ইউটিউবে পাবলিশ',
          variant: 'secondary' as const,
          onClick: () => onPublishToYouTube(currentJob)
        }] : [])
      ]);

    } else if (currentJob?.status === 'failed' && !hasTriggeredCompleteRef.current) {
      hasTriggeredCompleteRef.current = true;
      notifyRenderError(
        isBn 
          ? 'ভিডিও ফ্রেম সিন্থেসিস বা FFmpeg এনকোডিং প্রক্রিয়ায় ত্রুটি দেখা দিয়েছে। দয়া করে আবার চেষ্টা করুন।'
          : 'Video rendering encountered an error during frame synthesis or FFmpeg encoding. Please retry.',
        currentJob
      );
    }
  }, [currentJob?.status, onComplete, notifyRenderSuccess, notifyRenderError, onOpenVideo, onPublishToYouTube, isBn]);

  if (!currentJob) return null;

  const progress = Math.min(100, Math.max(0, currentJob.progress || 0));
  const isCompleted = currentJob.status === 'completed';
  const isProcessing = currentJob.status === 'processing';
  const isFailed = currentJob.status === 'failed';

  // Calculate estimated time remaining (ETA)
  const calculateEta = (): string => {
    if (isCompleted) return isBn ? 'সম্পন্ন হয়েছে!' : 'Done!';
    if (progress <= 5) return isBn ? 'গণনা হচ্ছে...' : 'Calculating...';
    const totalEstSeconds = (elapsedSeconds / (progress / 100));
    const remaining = Math.max(1, Math.round(totalEstSeconds - elapsedSeconds));
    return isBn ? `~${remaining} সেকেন্ড বাকি` : `~${remaining}s remaining`;
  };

  // Determine active stage
  const currentStage = PIPELINE_STAGES.find(
    (s) => progress >= s.minProgress && progress < s.maxProgress
  ) || PIPELINE_STAGES[PIPELINE_STAGES.length - 1];

  const handleCopyLogs = () => {
    if (currentJob.ffmpegLogs && currentJob.ffmpegLogs.length > 0) {
      navigator.clipboard.writeText(currentJob.ffmpegLogs.join('\n'));
      setCopiedLog(true);
      setTimeout(() => setCopiedLog(false), 2000);
    }
  };

  const handleDownloadSrt = () => {
    if (!currentJob.srtContent) return;
    const blob = new Blob([currentJob.srtContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentJob.prompt.slice(0, 20).replace(/[^a-zA-Z0-9]/g, '_')}_subtitles.srt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // If user minimized to floating widget in bottom-right corner
  if (isMinimized && allowFloatingMinimize) {
    return (
      <div className="fixed bottom-6 right-6 z-50 animate-bounce-short">
        <div 
          onClick={() => setIsMinimized(false)}
          className={`flex items-center gap-3 px-4 py-3 rounded-2xl shadow-2xl border backdrop-blur-md cursor-pointer transition-all ${
            isCompleted 
              ? 'bg-emerald-950/90 border-emerald-500/80 text-white shadow-emerald-950/60'
              : 'bg-slate-900/95 border-cyan-500/80 text-white shadow-cyan-950/60'
          }`}
        >
          <div className="relative w-7 h-7 rounded-full flex items-center justify-center bg-slate-800">
            {isProcessing ? (
              <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />
            ) : isCompleted ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-400" />
            )}
          </div>

          <div className="text-left">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold truncate max-w-[140px]">
                {currentJob.prompt}
              </span>
              <span className="text-[10px] font-mono font-bold text-cyan-400">
                {progress}%
              </span>
            </div>
            <p className="text-[10px] text-slate-400">
              {isCompleted ? (isBn ? 'রেন্ডার সম্পন্ন! ক্লিক করুন' : 'Export Ready! Click to expand') : (isBn ? currentStage.nameBn : currentStage.nameEn)}
            </p>
          </div>

          <Maximize2 className="w-4 h-4 text-slate-400 hover:text-white ml-1" />
        </div>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden rounded-2xl bg-slate-900 border border-slate-800 p-5 shadow-2xl transition-all ${className}`}>
      {/* Background Subtle Ambient Glow */}
      <div 
        className={`absolute -top-24 -right-24 w-72 h-72 rounded-full blur-3xl pointer-events-none transition-all duration-700 ${
          isCompleted 
            ? 'bg-emerald-500/10' 
            : isFailed 
            ? 'bg-red-500/10' 
            : 'bg-gradient-to-br from-cyan-500/15 to-indigo-600/15'
        }`} 
      />

      {/* Header Bar */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-4 relative z-10">
        <div className="flex items-center gap-2.5">
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
            isCompleted 
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' 
              : isFailed 
              ? 'bg-red-500/20 text-red-400 border border-red-500/40' 
              : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 shadow-lg shadow-cyan-500/20'
          }`}>
            {isProcessing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : isCompleted ? (
              <CheckCircle2 className="w-4 h-4" />
            ) : (
              <AlertCircle className="w-4 h-4" />
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs sm:text-sm font-extrabold text-white tracking-wide">
                {isBn ? 'ভিডিও রেন্ডারিং পাইপলাইন স্ট্যাটাস' : 'Video Rendering Pipeline'}
              </h3>
              <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border ${
                isCompleted
                  ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800'
                  : isFailed
                  ? 'bg-red-950/80 text-red-300 border-red-800'
                  : 'bg-cyan-950/80 text-cyan-300 border-cyan-800 animate-pulse'
              }`}>
                {isCompleted ? (isBn ? 'সম্পন্ন' : 'COMPLETED') : isFailed ? (isBn ? 'ব্যর্থ' : 'FAILED') : (isBn ? 'রেন্ডারিং চলছে' : 'RENDERING')}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 truncate max-w-sm mt-0.5" title={currentJob.prompt}>
              {currentJob.prompt}
            </p>
          </div>
        </div>

        {/* Right header actions */}
        <div className="flex items-center gap-2">
          {allowFloatingMinimize && isProcessing && (
            <button
              onClick={() => setIsMinimized(true)}
              title={isBn ? 'ব্যাকগ্রাউন্ডে মিনিমাইজ করুন' : 'Minimize to background'}
              className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
            >
              <Minimize2 className="w-3.5 h-3.5" />
            </button>
          )}

          {onCancel && isProcessing && (
            <button
              onClick={onCancel}
              title={isBn ? 'রেন্ডার বাতিল করুন' : 'Cancel render'}
              className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-red-950 hover:text-red-400 text-slate-400 transition cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Main Progress Section */}
      <div className="space-y-4 relative z-10">
        
        {/* Progress Percentage & ETA Banner */}
        <div className="flex items-baseline justify-between">
          <div>
            <span className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-indigo-300 to-emerald-400 font-mono tracking-tight">
              {progress}%
            </span>
            <span className="text-xs text-slate-400 ml-2 font-medium">
              {isBn ? currentStage.nameBn : currentStage.nameEn}
            </span>
          </div>

          <div className="flex items-center gap-2 text-right">
            <span className="flex items-center gap-1 text-[11px] font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded-md border border-cyan-800/60">
              <Clock className="w-3 h-3" />
              <span>{calculateEta()}</span>
            </span>
            <span className="text-[10px] text-slate-500 font-mono">
              ({elapsedSeconds}s {isBn ? 'অতিবাহিত' : 'elapsed'})
            </span>
          </div>
        </div>

        {/* High-tech Multi-layer Progress Bar */}
        <div className="relative w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800 shadow-inner">
          {/* Animated gradient progress fill */}
          <div 
            className={`h-full transition-all duration-500 relative ${
              isCompleted 
                ? 'bg-gradient-to-r from-emerald-500 to-teal-400 shadow-lg shadow-emerald-500/50' 
                : isFailed
                ? 'bg-red-500'
                : 'bg-gradient-to-r from-cyan-500 via-indigo-500 to-purple-500 shadow-lg shadow-cyan-500/40'
            }`}
            style={{ width: `${progress}%` }}
          >
            {/* Shimmer light effect when processing */}
            {isProcessing && (
              <div className="absolute inset-0 bg-white/20 animate-pulse" />
            )}
          </div>
        </div>

        {/* 5-Stage Stepper Grid */}
        <div className="grid grid-cols-5 gap-1.5 pt-1">
          {PIPELINE_STAGES.map((stage, idx) => {
            const isStageDone = progress >= stage.maxProgress || isCompleted;
            const isStageActive = progress >= stage.minProgress && progress < stage.maxProgress && isProcessing;

            return (
              <div 
                key={stage.id}
                className={`p-2 rounded-xl border text-center transition-all ${
                  isStageDone
                    ? 'bg-emerald-950/30 border-emerald-500/50 text-emerald-300'
                    : isStageActive
                    ? 'bg-cyan-950/50 border-cyan-500 ring-1 ring-cyan-500/50 text-white shadow-md shadow-cyan-950/40'
                    : 'bg-slate-950/50 border-slate-800/80 text-slate-500'
                }`}
              >
                <div className="flex items-center justify-center gap-1 mb-1">
                  <span className="text-xs">{stage.icon}</span>
                  {isStageDone ? (
                    <Check className="w-3 h-3 text-emerald-400 stroke-[3]" />
                  ) : isStageActive ? (
                    <Loader2 className="w-3 h-3 text-cyan-400 animate-spin" />
                  ) : (
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-700" />
                  )}
                </div>
                <p className="text-[10px] font-bold truncate">
                  {isBn ? stage.nameBn : stage.nameEn}
                </p>
                <p className="text-[8px] text-slate-400 truncate hidden sm:block mt-0.5">
                  {isBn ? stage.descBn : stage.descEn}
                </p>
              </div>
            );
          })}
        </div>

        {/* Real-time Dynamic Synthesizer Waveform Animation */}
        {isProcessing && (
          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <div className="flex items-end gap-0.5 h-4">
                <span className="w-1 bg-cyan-400 rounded-full animate-bounce h-2" style={{ animationDelay: '0.1s' }} />
                <span className="w-1 bg-indigo-400 rounded-full animate-bounce h-4" style={{ animationDelay: '0.2s' }} />
                <span className="w-1 bg-purple-400 rounded-full animate-bounce h-3" style={{ animationDelay: '0.3s' }} />
                <span className="w-1 bg-emerald-400 rounded-full animate-bounce h-4" style={{ animationDelay: '0.15s' }} />
                <span className="w-1 bg-cyan-300 rounded-full animate-bounce h-2" style={{ animationDelay: '0.25s' }} />
              </div>
              <span className="text-[11px] text-slate-300 font-mono">
                {isBn 
                  ? `[অ্যাক্টিভ ফ্রেম সিন্থেসিস] ${currentStage.descBn}...` 
                  : `[Pipeline Engine] ${currentStage.descEn}...`}
              </span>
            </div>

            <span className="text-[10px] text-cyan-400 font-mono">
              FFmpeg 60fps
            </span>
          </div>
        )}

        {/* Live FFmpeg Terminal Drawer */}
        {showLogsToggle && (
          <div className="pt-2">
            <div className="flex items-center justify-between text-xs">
              <button
                onClick={() => setShowLogs(!showLogs)}
                className="flex items-center gap-1.5 text-slate-400 hover:text-cyan-300 transition cursor-pointer"
              >
                <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                <span className="font-mono text-[11px]">
                  {showLogs 
                    ? (isBn ? 'লগ কনসোল হাইড করুন' : 'Hide Pipeline Console') 
                    : (isBn ? `রিয়েল-টাইম FFmpeg লগ দেখুন (${currentJob.ffmpegLogs?.length || 0})` : `View FFmpeg Pipeline Logs (${currentJob.ffmpegLogs?.length || 0})`)}
                </span>
              </button>

              {showLogs && currentJob.ffmpegLogs?.length > 0 && (
                <button
                  onClick={handleCopyLogs}
                  className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-white transition cursor-pointer"
                >
                  {copiedLog ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedLog ? (isBn ? 'কপি হয়েছে' : 'Copied') : (isBn ? 'লগ কপি' : 'Copy Logs')}</span>
                </button>
              )}
            </div>

            {showLogs && (
              <div className="mt-2 bg-[#050811] border border-slate-800 rounded-xl p-3 font-mono text-[10px] text-slate-300 max-h-48 overflow-y-auto space-y-1 shadow-inner">
                {currentJob.ffmpegLogs && currentJob.ffmpegLogs.length > 0 ? (
                  currentJob.ffmpegLogs.map((log, idx) => (
                    <div key={idx} className="flex items-start gap-2 leading-relaxed">
                      <span className="text-slate-600 select-none">{String(idx + 1).padStart(2, '0')}</span>
                      <span className={
                        log.includes('✨') || log.includes('successfully') 
                          ? 'text-emerald-400 font-bold' 
                          : log.includes('ffmpeg') 
                          ? 'text-cyan-300' 
                          : log.includes('User') 
                          ? 'text-purple-300' 
                          : 'text-slate-300'
                      }>
                        {log}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-600 italic">No logs generated yet...</p>
                )}
                <div ref={logsEndRef} />
              </div>
            )}
          </div>
        )}

        {/* Action Toolbar on Completion */}
        {isCompleted && (
          <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 animate-fadeIn">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-bold text-emerald-400">
                {isBn ? 'ভিডিও এক্সপোর্ট রেডি!' : 'Video Export Ready!'}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {currentJob.videoUrl && (
                <>
                  <a
                    href={currentJob.videoUrl}
                    download="ai_video_studio_export.mp4"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition shadow-md shadow-emerald-600/30 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>{isBn ? 'ভিডিও ডাউনলোড (MP4)' : 'Download MP4'}</span>
                  </a>

                  {onOpenVideo && (
                    <button
                      onClick={() => onOpenVideo(currentJob.videoUrl!)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5 text-cyan-400 fill-current" />
                      <span>{isBn ? 'প্লে করুন' : 'Preview'}</span>
                    </button>
                  )}
                </>
              )}

              {currentJob.srtContent && (
                <button
                  onClick={handleDownloadSrt}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition cursor-pointer"
                  title="Download Subtitles (.srt)"
                >
                  <Subtitles className="w-3.5 h-3.5 text-purple-400" />
                  <span>{isBn ? 'সাবটাইটেল (.srt)' : 'SRT File'}</span>
                </button>
              )}

              {onPublishToYouTube && (
                <button
                  onClick={() => onPublishToYouTube(currentJob)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs transition shadow-md shadow-red-600/30 cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>{isBn ? 'ইউটিউব স্টুডিওতে পাবলিশ' : 'Publish to YouTube'}</span>
                </button>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export { VideoExportProgressIndicator } from './VideoExportProgressIndicator';
export default VideoRenderProgressIndicator;
