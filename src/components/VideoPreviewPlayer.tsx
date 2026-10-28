import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  Maximize2, 
  Minimize2, 
  Download, 
  CheckCircle2, 
  Sparkles, 
  Layers, 
  Film, 
  Stamp, 
  Sliders, 
  Clock, 
  Smartphone, 
  Monitor, 
  Square, 
  Eye, 
  Youtube, 
  RefreshCw, 
  Columns, 
  Split, 
  StepBack, 
  StepForward,
  Check,
  Subtitles,
  ExternalLink,
  Info
} from 'lucide-react';
import { Language, VideoScriptScene, VideoJob } from '../types';
import { useWatermark } from '../context/WatermarkContext';

export interface PreviewClipItem {
  id: string;
  title: string;
  titleBn: string;
  duration: number; // in seconds
  videoUrl?: string;
  thumbnailUrl?: string;
  visualPrompt?: string;
  narration?: string;
  bgmStyle?: string;
  cameraMovement?: string;
  sceneNumber?: number;
}

interface VideoPreviewPlayerProps {
  mode: 'text-to-video' | 'video-to-video';
  lang: Language;
  // Text to video specific props
  clips?: PreviewClipItem[];
  activeClipIndex?: number;
  onSelectClip?: (index: number) => void;
  aspectRatio?: '16:9' | '9:16' | '1:1';
  onAspectRatioChange?: (ratio: '16:9' | '9:16' | '1:1') => void;
  // Video to video specific props
  sourceVideoUrl?: string;
  stylizedVideoUrl?: string;
  modelName?: string;
  denoisingStrength?: number;
  // Common action hooks
  onFinalize?: () => void;
  isFinalizing?: boolean;
  onReGenerateClip?: (clipIndex: number) => void;
  onDownloadPreview?: (url?: string) => void;
  onPublishToYouTube?: () => void;
  onSendToSubtitles?: () => void;
}

export const VideoPreviewPlayer: React.FC<VideoPreviewPlayerProps> = ({
  mode,
  lang,
  clips = [],
  activeClipIndex = 0,
  onSelectClip,
  aspectRatio = '16:9',
  onAspectRatioChange,
  sourceVideoUrl = '/videos/sample1.mp4',
  stylizedVideoUrl = '/videos/shorts_9_16.mp4',
  modelName = 'ControlNet OpenPose + AnimateDiff',
  denoisingStrength = 0.45,
  onFinalize,
  isFinalizing = false,
  onReGenerateClip,
  onDownloadPreview,
  onPublishToYouTube,
  onSendToSubtitles,
}) => {
  const isBn = lang === 'bn';
  const { config: watermarkConfig, openModal: openWatermarkModal } = useWatermark();

  // Video playback elements
  const mainVideoRef = useRef<HTMLVideoElement>(null);
  const sourceVideoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // States
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [volume, setVolume] = useState<number>(1);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [playbackRate, setPlaybackRate] = useState<number>(1);
  const [isLooping, setIsLooping] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isHoveringControls, setIsHoveringControls] = useState<boolean>(true);
  const [isApproved, setIsApproved] = useState<boolean>(false);

  // Video-to-Video Comparison state
  const [compareMode, setCompareMode] = useState<'split-slider' | 'side-by-side' | 'stylized-only'>('split-slider');
  const [splitPos, setSplitPos] = useState<number>(50); // percentage 0-100
  const [isDraggingSlider, setIsDraggingSlider] = useState<boolean>(false);
  const sliderContainerRef = useRef<HTMLDivElement>(null);

  // Active clip in Text-to-Video mode
  const currentClip = clips[activeClipIndex] || clips[0] || null;

  // Active video source for Text-to-Video
  const textVideoSrc = currentClip?.videoUrl || (
    activeClipIndex === 0 ? '/videos/sample1.mp4' :
    activeClipIndex === 1 ? '/videos/sample2.mp4' :
    activeClipIndex === 2 ? '/videos/sample3.mp4' :
    '/videos/shorts_9_16.mp4'
  );

  // Sync play/pause between main and source video in Video-to-Video mode
  const handleTogglePlay = useCallback(() => {
    if (mode === 'video-to-video' && compareMode !== 'stylized-only') {
      const v1 = mainVideoRef.current;
      const v2 = sourceVideoRef.current;
      if (!v1) return;

      if (v1.paused) {
        v1.play().catch(() => {});
        if (v2) v2.play().catch(() => {});
        setIsPlaying(true);
      } else {
        v1.pause();
        if (v2) v2.pause();
        setIsPlaying(false);
      }
    } else {
      const v = mainVideoRef.current;
      if (!v) return;
      if (v.paused) {
        v.play().catch(() => {});
        setIsPlaying(true);
      } else {
        v.pause();
        setIsPlaying(false);
      }
    }
  }, [mode, compareMode]);

  // Handle Seeking
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (mainVideoRef.current) {
      mainVideoRef.current.currentTime = time;
    }
    if (sourceVideoRef.current && mode === 'video-to-video') {
      sourceVideoRef.current.currentTime = time;
    }
  };

  // Step frame forward or backward (assuming ~30fps: 0.033s per frame)
  const handleStepFrame = (direction: 'forward' | 'backward') => {
    const delta = direction === 'forward' ? 0.033 : -0.033;
    const v = mainVideoRef.current;
    if (!v) return;
    v.pause();
    setIsPlaying(false);
    const newTime = Math.max(0, Math.min(v.duration || 10, v.currentTime + delta));
    v.currentTime = newTime;
    setCurrentTime(newTime);
    if (sourceVideoRef.current && mode === 'video-to-video') {
      sourceVideoRef.current.currentTime = newTime;
    }
  };

  // Reset to beginning
  const handleRestart = () => {
    if (mainVideoRef.current) mainVideoRef.current.currentTime = 0;
    if (sourceVideoRef.current) sourceVideoRef.current.currentTime = 0;
    setCurrentTime(0);
    if (mainVideoRef.current) mainVideoRef.current.play().catch(() => {});
    if (sourceVideoRef.current && mode === 'video-to-video') sourceVideoRef.current.play().catch(() => {});
    setIsPlaying(true);
  };

  // Toggle Mute
  const handleToggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    if (mainVideoRef.current) mainVideoRef.current.muted = nextMuted;
    if (sourceVideoRef.current) sourceVideoRef.current.muted = true; // keep source muted in comparison
  };

  // Speed selector
  const handleSpeedChange = (speed: number) => {
    setPlaybackRate(speed);
    if (mainVideoRef.current) mainVideoRef.current.playbackRate = speed;
    if (sourceVideoRef.current) sourceVideoRef.current.playbackRate = speed;
  };

  // Fullscreen
  const handleToggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // Update time tracker on timeupdate
  const handleTimeUpdate = () => {
    if (mainVideoRef.current) {
      setCurrentTime(mainVideoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (mainVideoRef.current) {
      setDuration(mainVideoRef.current.duration || 10);
      if (mainVideoRef.current.playbackRate !== playbackRate) {
        mainVideoRef.current.playbackRate = playbackRate;
      }
    }
  };

  // Synchronize videos in split mode
  const handleSourceTimeUpdate = () => {
    if (mode === 'video-to-video' && mainVideoRef.current && sourceVideoRef.current) {
      // keep drift within 0.1s
      const diff = Math.abs(mainVideoRef.current.currentTime - sourceVideoRef.current.currentTime);
      if (diff > 0.12) {
        sourceVideoRef.current.currentTime = mainVideoRef.current.currentTime;
      }
    }
  };

  // Split slider drag handling
  const handleSliderMove = useCallback((clientX: number) => {
    if (!sliderContainerRef.current) return;
    const rect = sliderContainerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const pct = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSplitPos(pct);
  }, []);

  const handleMouseDownSlider = (e: React.MouseEvent) => {
    setIsDraggingSlider(true);
    handleSliderMove(e.clientX);
  };

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (isDraggingSlider) handleSliderMove(e.clientX);
    };
    const onMouseUp = () => {
      if (isDraggingSlider) setIsDraggingSlider(false);
    };
    if (isDraggingSlider) {
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [isDraggingSlider, handleSliderMove]);

  // Keyboard Shortcuts: Space for play/pause, M for mute, F for fullscreen
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.code === 'Space') {
        e.preventDefault();
        handleTogglePlay();
      } else if (e.code === 'KeyM') {
        handleToggleMute();
      } else if (e.code === 'KeyF') {
        handleToggleFullscreen();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleTogglePlay]);

  // Format time display (00:00)
  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '00:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleFinalizeClick = () => {
    setIsApproved(true);
    if (onFinalize) onFinalize();
  };

  return (
    <div 
      ref={containerRef} 
      className="bg-slate-900/95 border border-slate-800 rounded-3xl p-5 shadow-2xl space-y-4 relative overflow-hidden backdrop-blur-md"
    >
      {/* Background Ambient Glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-cyan-500/20">
            <Film className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white tracking-wide">
                {isBn ? 'ভিডিও ক্লিপ প্রিভিউ প্লেয়ার' : 'Video Clip Preview Player'}
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-cyan-950 text-cyan-300 border border-cyan-800/80 uppercase">
                {mode === 'text-to-video' ? 'Clip Review' : 'Dual Compare'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              {isBn 
                ? 'চূড়ান্ত করার আগে আপনার জেনারেটেড ভিডিও ক্লিপটি পর্যবেক্ষণ ও যাচাই করুন' 
                : 'Watch, scrub and inspect your synthesized clip before finalizing render'}
            </p>
          </div>
        </div>

        {/* Top Action Tags & Aspect Ratio or Comparison Selector */}
        <div className="flex items-center gap-2">
          {mode === 'text-to-video' && onAspectRatioChange && (
            <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => onAspectRatioChange('16:9')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                  aspectRatio === '16:9' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
                title="16:9 Landscape (YouTube)"
              >
                <Monitor className="w-3.5 h-3.5" />
                <span>16:9</span>
              </button>
              <button
                onClick={() => onAspectRatioChange('9:16')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                  aspectRatio === '9:16' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
                title="9:16 Vertical (Shorts/TikTok)"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>9:16</span>
              </button>
              <button
                onClick={() => onAspectRatioChange('1:1')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                  aspectRatio === '1:1' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
                title="1:1 Square (Feed)"
              >
                <Square className="w-3.5 h-3.5" />
                <span>1:1</span>
              </button>
            </div>
          )}

          {mode === 'video-to-video' && (
            <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setCompareMode('split-slider')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition ${
                  compareMode === 'split-slider' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
                title="Interactive Split Wipe Slider"
              >
                <Split className="w-3.5 h-3.5" />
                <span>{isBn ? 'স্প্লিট স্লাইডার' : 'Split Wipe'}</span>
              </button>
              <button
                onClick={() => setCompareMode('side-by-side')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition ${
                  compareMode === 'side-by-side' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
                title="Side by Side Dual View"
              >
                <Columns className="w-3.5 h-3.5" />
                <span>{isBn ? 'পাশাপাশি ভিউ' : 'Side-by-Side'}</span>
              </button>
              <button
                onClick={() => setCompareMode('stylized-only')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition ${
                  compareMode === 'stylized-only' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
                title="Full AI Stylized Result"
              >
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>{isBn ? 'এআই আউটপুট' : 'AI Output'}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Text-to-Video: Clip Selector Tabs (Scene 1, Scene 2, Scene 3, Scene 4, Full Sequence) */}
      {mode === 'text-to-video' && clips.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
          {clips.map((clip, index) => {
            const isSelected = activeClipIndex === index;
            return (
              <button
                key={clip.id || index}
                onClick={() => onSelectClip && onSelectClip(index)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all cursor-pointer border ${
                  isSelected
                    ? 'bg-gradient-to-r from-cyan-600 to-indigo-600 text-white border-cyan-400 shadow-md shadow-cyan-500/20'
                    : 'bg-slate-950/80 text-slate-300 border-slate-800 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <span className="w-4 h-4 rounded-full bg-black/40 flex items-center justify-center text-[10px] font-mono">
                  {clip.sceneNumber || index + 1}
                </span>
                <span>{isBn ? clip.titleBn : clip.title}</span>
                <span className="text-[10px] font-mono opacity-80">{clip.duration}s</span>
              </button>
            );
          })}
        </div>
      )}

      {/* MAIN VIDEO VIEWPORT */}
      <div 
        ref={sliderContainerRef}
        onMouseEnter={() => setIsHoveringControls(true)}
        className={`relative rounded-2xl overflow-hidden bg-black border border-slate-800 shadow-inner flex items-center justify-center mx-auto transition-all select-none ${
          aspectRatio === '9:16'
            ? 'aspect-[9/16] max-h-[520px] w-full max-w-[292px] ring-2 ring-slate-800 shadow-2xl'
            : aspectRatio === '1:1'
            ? 'aspect-square max-h-[460px] w-full max-w-[460px]'
            : 'aspect-video w-full'
        }`}
      >
        {/* MODE 1: Text-to-Video / Single Clip View */}
        {mode === 'text-to-video' && (
          <div className="relative w-full h-full flex items-center justify-center bg-black">
            <video
              ref={mainVideoRef}
              src={textVideoSrc}
              loop={isLooping}
              muted={isMuted}
              playsInline
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onClick={handleTogglePlay}
              className="w-full h-full object-cover cursor-pointer"
            />

            {/* In-Video Watermark / Status Badge */}
            <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md border border-white/10 text-white text-[11px] font-mono pointer-events-none">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>{isBn ? `সিন ${activeClipIndex + 1}` : `Scene ${activeClipIndex + 1}`}</span>
              <span className="text-slate-400">|</span>
              <span className="text-cyan-300 font-semibold">{aspectRatio}</span>
            </div>

            {/* Play Button Overlay when Paused */}
            {!isPlaying && (
              <div 
                onClick={handleTogglePlay}
                className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px] cursor-pointer transition-opacity"
              >
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-white shadow-2xl shadow-cyan-500/40 hover:scale-110 transition-transform">
                  <Play className="w-8 h-8 fill-current ml-1" />
                </div>
              </div>
            )}
          </div>
        )}

        {/* MODE 2: Video-to-Video (Dual Split Wipe or Side-by-Side) */}
        {mode === 'video-to-video' && (
          <div className="relative w-full h-full">
            {compareMode === 'split-slider' && (
              <div className="relative w-full h-full overflow-hidden select-none">
                {/* Background Video: Stylized Output */}
                <video
                  ref={mainVideoRef}
                  src={stylizedVideoUrl}
                  loop={isLooping}
                  muted={isMuted}
                  playsInline
                  onTimeUpdate={handleTimeUpdate}
                  onLoadedMetadata={handleLoadedMetadata}
                  onClick={handleTogglePlay}
                  className="w-full h-full object-cover cursor-pointer absolute inset-0"
                />

                {/* Foreground Video: Original Source clipped by splitPos */}
                <div 
                  className="absolute inset-0 overflow-hidden pointer-events-none"
                  style={{ width: `${splitPos}%` }}
                >
                  <video
                    ref={sourceVideoRef}
                    src={sourceVideoUrl}
                    loop={isLooping}
                    muted={true}
                    playsInline
                    onTimeUpdate={handleSourceTimeUpdate}
                    className="w-full h-full object-cover max-w-none"
                    style={{
                      width: sliderContainerRef.current ? `${sliderContainerRef.current.clientWidth}px` : '100%',
                      height: sliderContainerRef.current ? `${sliderContainerRef.current.clientHeight}px` : '100%',
                    }}
                  />
                </div>

                {/* Vertical Divider Line with Draggable Handle */}
                <div 
                  className="absolute top-0 bottom-0 w-1 bg-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.8)] cursor-ew-resize z-20 flex items-center justify-center -translate-x-1/2"
                  style={{ left: `${splitPos}%` }}
                  onMouseDown={handleMouseDownSlider}
                  onTouchMove={(e) => handleSliderMove(e.touches[0].clientX)}
                >
                  <div className="w-8 h-8 rounded-full bg-slate-900 border-2 border-cyan-400 text-cyan-300 flex items-center justify-center shadow-xl shadow-cyan-500/30 text-[10px] font-bold">
                    ⇄
                  </div>
                </div>

                {/* Comparison Labels */}
                <div className="absolute top-3 left-3 px-2 py-0.5 rounded bg-black/70 backdrop-blur text-white text-[10px] font-bold tracking-wider uppercase border border-white/10 pointer-events-none">
                  {isBn ? 'মূল ভিডিও (Source)' : 'Original Source'}
                </div>
                <div className="absolute top-3 right-3 px-2 py-0.5 rounded bg-cyan-950/80 backdrop-blur text-cyan-300 text-[10px] font-bold tracking-wider uppercase border border-cyan-800/80 pointer-events-none">
                  {isBn ? 'এআই স্টাইল (ControlNet)' : 'AI Transferred'}
                </div>
              </div>
            )}

            {compareMode === 'side-by-side' && (
              <div className="grid grid-cols-2 w-full h-full">
                <div className="relative border-r border-slate-800">
                  <div className="absolute top-2 left-2 z-10 px-2 py-0.5 rounded bg-black/70 text-slate-300 text-[10px] font-bold uppercase">
                    Original
                  </div>
                  <video
                    ref={sourceVideoRef}
                    src={sourceVideoUrl}
                    loop={isLooping}
                    muted={true}
                    playsInline
                    onTimeUpdate={handleSourceTimeUpdate}
                    onClick={handleTogglePlay}
                    className="w-full h-full object-cover cursor-pointer"
                  />
                </div>
                <div className="relative">
                  <div className="absolute top-2 left-2 z-10 px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 text-[10px] font-bold uppercase border border-cyan-800">
                    AI Stylized
                  </div>
                  <video
                    ref={mainVideoRef}
                    src={stylizedVideoUrl}
                    loop={isLooping}
                    muted={isMuted}
                    playsInline
                    onTimeUpdate={handleTimeUpdate}
                    onLoadedMetadata={handleLoadedMetadata}
                    onClick={handleTogglePlay}
                    className="w-full h-full object-cover cursor-pointer"
                  />
                </div>
              </div>
            )}

            {compareMode === 'stylized-only' && (
              <div className="relative w-full h-full">
                <video
                  ref={mainVideoRef}
                  src={stylizedVideoUrl}
                  loop={isLooping}
                  muted={isMuted}
                  playsInline
                  onTimeUpdate={handleTimeUpdate}
                  onLoadedMetadata={handleLoadedMetadata}
                  onClick={handleTogglePlay}
                  className="w-full h-full object-cover cursor-pointer"
                />
                <div className="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-cyan-950/80 backdrop-blur text-cyan-300 text-xs font-bold border border-cyan-800">
                  {modelName} (Denoise: {denoisingStrength})
                </div>
              </div>
            )}

            {/* Play Overlay when paused in Video-to-Video */}
            {!isPlaying && (
              <div 
                onClick={handleTogglePlay}
                className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px] cursor-pointer"
              >
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-white shadow-2xl shadow-cyan-500/40 hover:scale-110 transition-transform">
                  <Play className="w-8 h-8 fill-current ml-1" />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Customizable Live Video Watermark Overlay */}
        {watermarkConfig.enabled && (
          <div 
            className={`absolute z-30 pointer-events-none transition-all flex items-center ${
              watermarkConfig.position === 'top-left' ? 'top-3 left-3' :
              watermarkConfig.position === 'top-right' ? 'top-3 right-3' :
              watermarkConfig.position === 'bottom-left' ? 'bottom-3 left-3' :
              watermarkConfig.position === 'bottom-right' ? 'bottom-3 right-3' :
              watermarkConfig.position === 'bottom-center' ? 'bottom-3 left-1/2 -translate-x-1/2' :
              'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'
            }`}
            style={{ opacity: watermarkConfig.opacity }}
          >
            <div className={`flex items-center gap-2 ${
              watermarkConfig.showBackgroundBadge 
                ? 'px-2.5 py-1 rounded-xl bg-slate-950/80 border border-cyan-500/40 backdrop-blur-sm shadow-xl' 
                : ''
            }`}>
              {(watermarkConfig.type === 'image' || watermarkConfig.type === 'both') && watermarkConfig.imageUrl && (
                <div 
                  className="rounded-lg overflow-hidden shrink-0 shadow-sm"
                  style={{
                    width: `${Math.max(16, Math.min(50, watermarkConfig.imageSize * 0.7))}px`,
                    height: `${Math.max(16, Math.min(50, watermarkConfig.imageSize * 0.7))}px`,
                  }}
                >
                  <img 
                    src={watermarkConfig.imageUrl} 
                    alt="Watermark" 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
              )}
              {(watermarkConfig.type === 'text' || watermarkConfig.type === 'both') && watermarkConfig.text && (
                <span 
                  className="font-bold tracking-tight drop-shadow-md select-none"
                  style={{
                    color: watermarkConfig.textColor,
                    fontSize: `${Math.max(10, Math.min(22, watermarkConfig.fontSize * 0.7))}px`,
                  }}
                >
                  {watermarkConfig.text}
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* INTERACTIVE CONTROLS BAR */}
      <div className="p-3 bg-slate-950/90 border border-slate-800 rounded-2xl space-y-3">
        {/* Scrubber Timeline */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span className="text-cyan-300 font-semibold">{formatTime(currentTime)}</span>
            <span className="text-slate-500">/</span>
            <span>{formatTime(duration)}</span>
          </div>
          <input
            type="range"
            min="0"
            max={duration || 10}
            step="0.05"
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400 focus:outline-none"
          />
        </div>

        {/* Buttons Row */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Left Playback Controls */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleTogglePlay}
              className="p-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold transition shadow-md shadow-cyan-600/30 cursor-pointer"
              title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
            </button>

            <button
              onClick={handleRestart}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
              title={isBn ? 'শুরু থেকে পুনরায় চালান' : 'Restart from beginning'}
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            {/* Frame Stepping for precise review */}
            <button
              onClick={() => handleStepFrame('backward')}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer hidden sm:flex"
              title={isBn ? 'এক ফ্রেম পেছান' : 'Step 1 frame backward'}
            >
              <StepBack className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => handleStepFrame('forward')}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer hidden sm:flex"
              title={isBn ? 'এক ফ্রেম এগোন' : 'Step 1 frame forward'}
            >
              <StepForward className="w-3.5 h-3.5" />
            </button>

            {/* Volume / Mute */}
            <button
              onClick={handleToggleMute}
              className={`p-2 rounded-xl border transition cursor-pointer ${
                isMuted
                  ? 'bg-slate-800 border-slate-700 text-slate-400'
                  : 'bg-indigo-950 border-indigo-700 text-indigo-300'
              }`}
              title={isMuted ? 'Unmute (M)' : 'Mute (M)'}
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            </button>

            {/* Playback Speed dropdown */}
            <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl px-1.5 py-1">
              {[0.5, 1, 1.5, 2].map((s) => (
                <button
                  key={s}
                  onClick={() => handleSpeedChange(s)}
                  className={`px-1.5 py-0.5 rounded text-[10px] font-bold transition cursor-pointer ${
                    playbackRate === s ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {s}x
                </button>
              ))}
            </div>
          </div>

          {/* Right Action Tools: Fullscreen, YouTube, Download */}
          <div className="flex items-center gap-2">
            {onSendToSubtitles && (
              <button
                onClick={onSendToSubtitles}
                className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer hidden md:flex"
              >
                <Subtitles className="w-3.5 h-3.5 text-purple-400" />
                <span>{isBn ? 'সাবটাইটেল' : 'Subtitles'}</span>
              </button>
            )}

            {onPublishToYouTube && (
              <button
                onClick={onPublishToYouTube}
                className="px-3 py-1.5 rounded-xl bg-red-950/80 hover:bg-red-900 text-red-300 text-xs font-semibold border border-red-800/80 flex items-center gap-1.5 transition cursor-pointer"
              >
                <Youtube className="w-3.5 h-3.5 text-red-500" />
                <span>{isBn ? 'ইউটিউব' : 'YouTube'}</span>
              </button>
            )}

            {/* Watermark Quick Settings Button */}
            <button
              onClick={openWatermarkModal}
              className={`p-2 rounded-xl border transition cursor-pointer flex items-center gap-1.5 ${
                watermarkConfig.enabled
                  ? 'bg-cyan-950/70 border-cyan-500/50 text-cyan-300'
                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
              }`}
              title={isBn ? 'ভিডিও ওয়াটারমার্ক সেটিংস' : 'Video Watermark Settings'}
            >
              <Stamp className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-[10px] font-bold hidden sm:inline">
                {isBn ? 'ওয়াটারমার্ক' : 'Watermark'}
              </span>
            </button>

            {onDownloadPreview && (
              <button
                onClick={() => onDownloadPreview(mode === 'text-to-video' ? textVideoSrc : stylizedVideoUrl)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
                title={isBn ? 'ক্লিপ প্রিভিউ ডাউনলোড' : 'Download Preview Clip'}
              >
                <Download className="w-3.5 h-3.5" />
              </button>
            )}

            <button
              onClick={handleToggleFullscreen}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
              title={isBn ? 'ফুলস্ক্রিন (F)' : 'Fullscreen (F)'}
            >
              {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>

      {/* CLIP DETAILS / INSPECTION CARD */}
      {mode === 'text-to-video' && currentClip && (
        <div className="p-3.5 bg-slate-950/70 border border-slate-800/80 rounded-2xl space-y-2 text-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="font-bold text-white flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>{isBn ? currentClip.titleBn : currentClip.title}</span>
            </span>
            <span className="text-[11px] text-indigo-400 font-mono">
              BGM: {currentClip.bgmStyle || 'Cinematic Ambient'}
            </span>
          </div>

          {currentClip.visualPrompt && (
            <p className="text-slate-300 leading-relaxed">
              <strong className="text-slate-400 font-semibold">{isBn ? 'ভিজ্যুয়াল প্রম্পট:' : 'Visual Scene:'}</strong>{' '}
              {currentClip.visualPrompt}
            </p>
          )}

          {currentClip.narration && (
            <p className="text-cyan-200/90 italic">
              <strong className="text-cyan-400 font-semibold">{isBn ? 'ভয়েসওভার:' : 'Voiceover:'}</strong> "{currentClip.narration}"
            </p>
          )}
        </div>
      )}

      {/* FINALIZATION BANNER / ACTION TOOLBAR */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-cyan-500/30 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white">
              {isBn 
                ? (isApproved ? 'ক্লিপ অনুমোদন সম্পন্ন হয়েছে! চূড়ান্ত রেন্ডার চলছে' : 'ক্লিপ প্রিভিউ যাচাই করুন এবং চূড়ান্ত রেন্ডার নিশ্চিত করুন')
                : (isApproved ? 'Clip Approved! Finalizing Render...' : 'Verify Clip Quality & Finalize Full HD Video')}
            </h4>
            <p className="text-[11px] text-slate-400">
              {isBn 
                ? 'ভিডিওর রেজোলিউশন, ফ্রেম রেট ও অডিও সঠিক থাকলে চূড়ান্ত করুন বোতাম চাপুন।'
                : 'Inspect transitions, resolution, and audio timing before rendering final export.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          {mode === 'text-to-video' && onReGenerateClip && (
            <button
              onClick={() => onReGenerateClip(activeClipIndex)}
              className="flex-1 sm:flex-none px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
              <span>{isBn ? 'এই সিন পুনরায় তৈরি' : 'Re-generate Scene'}</span>
            </button>
          )}

          <button
            onClick={handleFinalizeClick}
            disabled={isFinalizing}
            className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-extrabold text-xs shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 transition disabled:opacity-50 cursor-pointer"
          >
            {isFinalizing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>{isBn ? 'চূড়ান্ত রেন্ডার হচ্ছে...' : 'Finalizing Video...'}</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4 text-white" />
                <span>{isBn ? 'ভিডিও চূড়ান্ত করুন (Finalize Video)' : 'Approve & Finalize Video'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
