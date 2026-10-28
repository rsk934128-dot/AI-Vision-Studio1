import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack, 
  Volume2, 
  VolumeX, 
  Maximize2, 
  Minimize2, 
  Music, 
  Video, 
  Clock, 
  Moon, 
  Sun, 
  Lock, 
  Sparkles, 
  Radio, 
  ListMusic, 
  X, 
  ChevronUp, 
  ChevronDown, 
  Repeat, 
  Repeat1, 
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  HelpCircle,
  Headphones,
  Smartphone,
  Info
} from 'lucide-react';
import { useMusicPlayer } from '../context/MusicPlayerContext';
import { Language } from '../types';

interface GlobalMusicBarProps {
  lang: Language;
}

export const GlobalMusicBar: React.FC<GlobalMusicBarProps> = ({ lang }) => {
  const isBn = lang === 'bn';
  const {
    currentTrack,
    isPlaying,
    playMode,
    isScreenOffAudioMode,
    isWakeLockActive,
    isFullModalOpen,
    isMiniPlayerVisible,
    queue,
    sleepTimerMinutes,
    sleepTimerRemaining,
    volume,
    isMuted,
    repeatMode,
    togglePlay,
    setPlayMode,
    nextTrack,
    prevTrack,
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
  } = useMusicPlayer();

  const [isIframeReady, setIsIframeReady] = useState<boolean>(false);
  const [showQueueInModal, setShowQueueInModal] = useState<boolean>(false);
  const [showSleepMenu, setShowSleepMenu] = useState<boolean>(false);
  const [showBackgroundHelpModal, setShowBackgroundHelpModal] = useState<boolean>(false);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  // Send commands to YouTube iframe via postMessage
  const postIframeCommand = (func: string, args: any[] = []) => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        JSON.stringify({ event: 'command', func, args }),
        '*'
      );
    }
  };

  useEffect(() => {
    if (isPlaying) {
      postIframeCommand('playVideo');
    } else {
      postIframeCommand('pauseVideo');
    }
  }, [isPlaying]);

  // Keep playback alive when user leaves the browser tab, minimizes app, or locks screen
  useEffect(() => {
    const handleVisibility = () => {
      if (isPlaying) {
        postIframeCommand('playVideo');
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('focus', handleVisibility);
    window.addEventListener('pagehide', handleVisibility);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('focus', handleVisibility);
      window.removeEventListener('pagehide', handleVisibility);
    };
  }, [isPlaying]);

  useEffect(() => {
    postIframeCommand('setVolume', [isMuted ? 0 : volume]);
  }, [volume, isMuted]);

  // Format seconds to mm:ss
  const formatTimer = (totalSeconds: number | null) => {
    if (totalSeconds === null) return '';
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  if (!currentTrack || !isMiniPlayerVisible) {
    return null;
  }

  // YouTube embed URL with API enabled
  const embedUrl = `https://www.youtube.com/embed/${currentTrack.id}?enablejsapi=1&autoplay=1&playsinline=1&controls=1&rel=0&origin=${typeof window !== 'undefined' ? window.location.origin : ''}`;

  return (
    <>
      {/* Persistent YouTube Embed: NEVER placed at -9999px or w-1 h-1 opacity-0 so mobile Chrome/Safari never pauses audio */}
      <div 
        className={
          playMode === 'video' && !isFullModalOpen
            ? 'fixed bottom-24 right-4 z-40 w-72 sm:w-80 aspect-video rounded-2xl overflow-hidden shadow-2xl border-2 border-red-500/60 bg-black transition-all animate-fadeIn'
            : isFullModalOpen && playMode === 'video'
            ? 'fixed -left-[9999px] -top-[9999px] w-1 h-1 opacity-0 pointer-events-none'
            : 'fixed bottom-1 left-1 z-0 w-32 h-20 rounded-xl overflow-hidden border border-indigo-500/10 bg-slate-950 pointer-events-none opacity-[0.02] transition-all'
        }
      >
        <iframe
          ref={iframeRef}
          src={embedUrl}
          title={currentTrack.title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="w-full h-full"
          onLoad={() => {
            setIsIframeReady(true);
            if (isPlaying) {
              setTimeout(() => postIframeCommand('playVideo'), 400);
            }
          }}
        />
        {playMode === 'video' && !isFullModalOpen && (
          <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/60 backdrop-blur-md rounded-lg p-1">
            <button
              onClick={() => setPlayMode('audio')}
              title={isBn ? 'অডিও মোডে পরিবর্তন' : 'Switch to Audio Mode'}
              className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-600 text-white cursor-pointer"
            >
              <Music className="w-3 h-3 inline mr-1" />
              Audio
            </button>
            <button
              onClick={openFullModal}
              title={isBn ? 'বড় করুন' : 'Expand'}
              className="p-1 rounded text-white hover:bg-white/20 cursor-pointer"
            >
              <Maximize2 className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>

      {/* Floating Bottom Mini Player Bar */}
      <div className="fixed bottom-3 left-1/2 -translate-x-1/2 z-50 w-[96%] max-w-4xl rounded-2xl bg-slate-900/95 backdrop-blur-xl border border-slate-700/80 shadow-2xl p-2 sm:p-3 text-white transition-all animate-slideUp">
        <div className="flex items-center justify-between gap-3">
          
          {/* Left: Thumbnail & Song Info */}
          <div 
            onClick={openFullModal}
            className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer group"
          >
            <div className="relative w-11 h-11 sm:w-12 sm:h-12 rounded-xl overflow-hidden bg-slate-950 flex-shrink-0 shadow-md ring-1 ring-slate-700 group-hover:ring-cyan-500 transition">
              <img 
                src={currentTrack.thumbnail} 
                alt={currentTrack.title}
                className={`w-full h-full object-cover transition duration-500 ${isPlaying ? 'scale-105' : 'grayscale'}`}
              />
              {isPlaying && (
                <div className="absolute inset-0 bg-cyan-950/30 flex items-center justify-center">
                  <div className="flex items-end gap-0.5 h-3">
                    <span className="w-1 bg-cyan-400 animate-pulse h-full rounded-full" />
                    <span className="w-1 bg-cyan-300 animate-pulse delay-75 h-2/3 rounded-full" />
                    <span className="w-1 bg-cyan-400 animate-pulse delay-150 h-4/5 rounded-full" />
                  </div>
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h4 className="text-xs sm:text-sm font-bold text-slate-100 truncate group-hover:text-cyan-300 transition">
                  {currentTrack.title}
                </h4>
                {/* Screen-Off Background Badge */}
                <span 
                  className="hidden md:inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 whitespace-nowrap"
                  title={isBn ? 'ডিসপ্লে বন্ধ করলেও ব্যাকগ্রাউন্ডে চলবে' : 'Keeps playing with screen locked/off'}
                >
                  <Lock className="w-2.5 h-2.5" />
                  <span>{isBn ? 'স্ক্রিন-অফ অডিও চালু' : 'Screen-Off Mode'}</span>
                </span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-slate-400 truncate">
                <span className="truncate">{currentTrack.channel}</span>
                <span>•</span>
                <span className="font-mono text-[10px] text-cyan-400">{currentTrack.duration}</span>
                {sleepTimerRemaining !== null && (
                  <>
                    <span>•</span>
                    <span className="text-amber-400 flex items-center gap-1 font-mono text-[10px]">
                      <Clock className="w-2.5 h-2.5" />
                      {formatTimer(sleepTimerRemaining)}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Center: Playback Controls */}
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={prevTrack}
              title={isBn ? 'পূর্ববর্তী গান' : 'Previous'}
              className="p-1.5 sm:p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            >
              <SkipBack className="w-4 h-4" />
            </button>

            <button
              onClick={togglePlay}
              title={isPlaying ? (isBn ? 'পজ করুন' : 'Pause') : (isBn ? 'প্লে করুন' : 'Play')}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white flex items-center justify-center shadow-lg shadow-cyan-500/30 transition transform active:scale-95 cursor-pointer"
            >
              {isPlaying ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white ml-0.5" />}
            </button>

            <button
              onClick={nextTrack}
              title={isBn ? 'পরবর্তী গান' : 'Next'}
              className="p-1.5 sm:p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            >
              <SkipForward className="w-4 h-4" />
            </button>
          </div>

          {/* Right: Mode Toggle, WakeLock, Queue, Expand */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Video vs Audio Mode Switch */}
            <button
              onClick={() => setPlayMode(playMode === 'video' ? 'audio' : 'video')}
              title={playMode === 'video' ? (isBn ? 'অডিও মোড (স্ক্রিন-অফ)' : 'Switch to Audio') : (isBn ? 'ভিডিও মোড' : 'Switch to Video')}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer border ${
                playMode === 'audio'
                  ? 'bg-indigo-950 text-indigo-300 border-indigo-700/80 shadow-sm'
                  : 'bg-red-950 text-red-300 border-red-700/80'
              }`}
            >
              {playMode === 'audio' ? (
                <>
                  <Music className="w-3.5 h-3.5 text-indigo-400" />
                  <span className="hidden sm:inline">{isBn ? 'অডিও' : 'Audio'}</span>
                </>
              ) : (
                <>
                  <Video className="w-3.5 h-3.5 text-red-400" />
                  <span className="hidden sm:inline">{isBn ? 'ভিডিও' : 'Video'}</span>
                </>
              )}
            </button>

            {/* WakeLock Display Toggle */}
            <button
              onClick={toggleWakeLock}
              title={isWakeLockActive ? (isBn ? 'ডিসপ্লে জাগ্রত রাখা বন্ধ করুন' : 'Release Screen WakeLock') : (isBn ? 'ডিসপ্লে চালু রাখুন (স্লিপ বন্ধ)' : 'Keep Screen Awake')}
              className={`p-1.5 sm:p-2 rounded-xl transition border cursor-pointer ${
                isWakeLockActive 
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/50' 
                  : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:text-white'
              }`}
            >
              {isWakeLockActive ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5" />}
            </button>

            {/* Background Audio Guide Button */}
            <button
              onClick={() => setShowBackgroundHelpModal(true)}
              title={isBn ? 'ব্যাকগ্রাউন্ডে অবিরাম চালানোর নির্দেশিকা' : 'Background Audio Guide'}
              className="p-1.5 sm:p-2 rounded-xl bg-cyan-950/60 hover:bg-cyan-900/80 text-cyan-300 border border-cyan-700/60 transition cursor-pointer"
            >
              <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
            </button>

            {/* Expand into Full Player Modal */}
            <button
              onClick={openFullModal}
              title={isBn ? 'সম্পূর্ণ প্লেয়ার খুলুন' : 'Open Full Player'}
              className="p-1.5 sm:p-2 rounded-xl bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-700 border border-slate-700 transition cursor-pointer"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>

            {/* Close Mini Player */}
            <button
              onClick={() => setIsMiniPlayerVisible(false)}
              title={isBn ? 'হাইড করুন' : 'Hide Mini Bar'}
              className="p-1.5 sm:p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>
      </div>

      {/* FULL-SCREEN AUDIO & VIDEO MODAL */}
      {isFullModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/90 backdrop-blur-2xl animate-fadeIn">
          <div className="relative w-full max-w-3xl max-h-[92vh] overflow-y-auto rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-5 sm:p-8 flex flex-col justify-between">
            {/* Top Bar */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-white shadow-lg">
                  <Music className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                    <span>{isBn ? 'ইউটিউব ব্যাকগ্রাউন্ড মিউজিক স্টুডিও' : 'YouTube Background Music Studio'}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      {isBn ? 'ডিসপ্লে বন্ধেও চলবে' : 'Screen-Off Ready'}
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {isBn ? 'লক স্ক্রিন কন্ট্রোল ও অবিরাম গান শোনার সুবিধা' : 'Lock screen controls & uninterrupted continuous audio'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowQueueInModal(!showQueueInModal)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                    showQueueInModal 
                      ? 'bg-cyan-600 text-white border-cyan-500' 
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'
                  }`}
                >
                  <ListMusic className="w-3.5 h-3.5" />
                  <span>{isBn ? `কিউ (${queue.length})` : `Queue (${queue.length})`}</span>
                </button>

                <button
                  onClick={closeFullModal}
                  className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Center Content: Vinyl/Artwork or Video or Queue */}
            <div className="py-6 flex flex-col items-center justify-center">
              {showQueueInModal ? (
                /* Playlist Queue List */
                <div className="w-full max-w-lg space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                      {isBn ? 'পরবর্তী গানের তালিকা' : 'Up Next in Queue'}
                    </span>
                    {queue.length > 0 && (
                      <button
                        onClick={clearQueue}
                        className="text-xs text-rose-400 hover:underline cursor-pointer"
                      >
                        {isBn ? 'সব মুছুন' : 'Clear All'}
                      </button>
                    )}
                  </div>

                  {queue.length === 0 ? (
                    <div className="py-12 text-center text-slate-500 space-y-2">
                      <ListMusic className="w-10 h-10 mx-auto text-slate-600" />
                      <p className="text-xs">
                        {isBn ? 'কিউতে কোনো গান নেই। সার্চ রেজাল্ট থেকে গান যোগ করুন।' : 'Queue is empty. Add songs from search results.'}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                      {queue.map((t, idx) => (
                        <div
                          key={t.id + idx}
                          className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 transition"
                        >
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <span className="text-xs font-mono text-slate-500 w-5 text-right">{idx + 1}</span>
                            <img src={t.thumbnail} alt={t.title} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-semibold text-white truncate">{t.title}</p>
                              <p className="text-[10px] text-slate-400 truncate">{t.channel}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => removeFromQueue(t.id)}
                            className="p-1.5 text-slate-500 hover:text-rose-400 transition cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : playMode === 'video' ? (
                /* Video Player Mode inside Modal */
                <div className="w-full max-w-xl aspect-video rounded-2xl overflow-hidden bg-black shadow-2xl border border-slate-800">
                  <iframe
                    src={embedUrl}
                    title={currentTrack.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    className="w-full h-full"
                  />
                </div>
              ) : (
                /* Audio Mode with Glowing Album Artwork & Waveform */
                <div className="flex flex-col items-center space-y-6 text-center">
                  <div className="relative">
                    <div className={`w-48 h-48 sm:w-56 sm:h-56 rounded-full p-2 bg-gradient-to-tr from-cyan-500 via-indigo-600 to-pink-500 shadow-2xl transition duration-700 ${isPlaying ? 'shadow-cyan-500/20 ring-4 ring-cyan-500/30' : ''}`}>
                      <div className="w-full h-full rounded-full overflow-hidden bg-slate-950 relative border-4 border-slate-900">
                        <img 
                          src={currentTrack.thumbnail} 
                          alt={currentTrack.title} 
                          className={`w-full h-full object-cover ${isPlaying ? 'animate-spin-slow' : 'grayscale'}`}
                          style={{ animationDuration: '18s' }}
                        />
                        {/* Center Vinyl Spindle Hole */}
                        <div className="absolute inset-0 m-auto w-10 h-10 rounded-full bg-slate-900 border-2 border-slate-700 flex items-center justify-center">
                          <div className="w-3 h-3 rounded-full bg-cyan-400" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Title & Channel */}
                  <div className="space-y-1 max-w-lg px-4">
                    <h2 className="text-base sm:text-lg font-bold text-white leading-snug">
                      {currentTrack.title}
                    </h2>
                    <p className="text-xs text-slate-400 font-medium">
                      {currentTrack.channel}
                    </p>
                  </div>

                  {/* Audio Equalizer Animated Bars */}
                  <div className="flex items-end justify-center gap-1.5 h-8">
                    {[12, 24, 16, 28, 20, 32, 18, 26, 14, 30, 22, 16].map((h, i) => (
                      <span 
                        key={i} 
                        className={`w-1 rounded-full transition-all duration-300 ${
                          isPlaying 
                            ? 'bg-gradient-to-t from-cyan-500 to-indigo-400 animate-pulse' 
                            : 'bg-slate-700 h-2'
                        }`}
                        style={{ 
                          height: isPlaying ? `${h}px` : '6px',
                          animationDelay: `${i * 80}ms`
                        }}
                      />
                    ))}
                  </div>

                  {/* Screen-Off Background Notice Alert */}
                  <div className="p-3 rounded-2xl bg-slate-950/80 border border-emerald-500/30 max-w-md text-left flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <div className="text-[11px] text-slate-300 space-y-0.5">
                      <p className="font-bold text-emerald-300">
                        {isBn ? 'স্ক্রিন-অফ ব্যাকগ্রাউন্ড মোড সক্রিয়' : 'Screen-Off Background Mode Active'}
                      </p>
                      <p className="text-slate-400 leading-relaxed">
                        {isBn 
                          ? 'আপনার ফোনের ডিসপ্লে লক বা বন্ধ করলেও গান অবিরাম চলতে থাকবে। লক স্ক্রিন থেকেই গান পজ বা নেক্সট করা যাবে।' 
                          : 'Music continues playing even when the phone screen is locked or turned off. Controls appear on lock screen.'}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Controls inside Modal */}
            <div className="pt-4 border-t border-slate-800 space-y-4">
              {/* Playback Button Row */}
              <div className="flex items-center justify-center gap-4 sm:gap-6">
                <button
                  onClick={() => setRepeatMode(repeatMode === 'none' ? 'all' : repeatMode === 'all' ? 'one' : 'none')}
                  title={isBn ? 'রিপিট মোড' : 'Repeat'}
                  className={`p-2 rounded-xl transition cursor-pointer ${
                    repeatMode !== 'none' ? 'text-cyan-400 bg-cyan-950/40 border border-cyan-800' : 'text-slate-500 hover:text-white'
                  }`}
                >
                  {repeatMode === 'one' ? <Repeat1 className="w-4 h-4" /> : <Repeat className="w-4 h-4" />}
                </button>

                <button
                  onClick={prevTrack}
                  className="p-3 rounded-2xl bg-slate-800/80 hover:bg-slate-700 text-white transition cursor-pointer"
                >
                  <SkipBack className="w-5 h-5" />
                </button>

                <button
                  onClick={togglePlay}
                  className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white flex items-center justify-center shadow-xl shadow-cyan-500/40 transition transform active:scale-95 cursor-pointer"
                >
                  {isPlaying ? <Pause className="w-6 h-6 fill-white" /> : <Play className="w-6 h-6 fill-white ml-0.5" />}
                </button>

                <button
                  onClick={nextTrack}
                  className="p-3 rounded-2xl bg-slate-800/80 hover:bg-slate-700 text-white transition cursor-pointer"
                >
                  <SkipForward className="w-5 h-5" />
                </button>

                {/* Sleep Timer Menu Toggle */}
                <div className="relative">
                  <button
                    onClick={() => setShowSleepMenu(!showSleepMenu)}
                    title={isBn ? 'স্লিপ টাইমার' : 'Sleep Timer'}
                    className={`p-2 rounded-xl transition cursor-pointer border ${
                      sleepTimerMinutes 
                        ? 'text-amber-400 bg-amber-950/40 border-amber-800' 
                        : 'text-slate-500 hover:text-white border-transparent'
                    }`}
                  >
                    <Clock className="w-4 h-4" />
                  </button>

                  {showSleepMenu && (
                    <div className="absolute bottom-12 right-0 w-44 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-2 z-50 text-xs animate-fadeIn space-y-1">
                      <p className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase">
                        {isBn ? 'স্লিপ টাইমার সেট করুন' : 'Sleep Timer'}
                      </p>
                      {[
                        { label: isBn ? 'বন্ধ' : 'Off', value: null },
                        { label: '15 Min', value: 15 },
                        { label: '30 Min', value: 30 },
                        { label: '45 Min', value: 45 },
                        { label: '60 Min (1 Hour)', value: 60 }
                      ].map((item) => (
                        <button
                          key={String(item.value)}
                          onClick={() => {
                            setSleepTimer(item.value);
                            setShowSleepMenu(false);
                          }}
                          className={`w-full text-left px-2.5 py-1.5 rounded-lg transition cursor-pointer font-medium ${
                            sleepTimerMinutes === item.value 
                              ? 'bg-cyan-600 text-white' 
                              : 'text-slate-300 hover:bg-slate-800'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Volume Slider & Mode Controls */}
              <div className="flex items-center justify-between gap-4 pt-2">
                <div className="flex items-center gap-2 flex-1 max-w-xs">
                  <button onClick={toggleMute} className="text-slate-400 hover:text-white cursor-pointer">
                    {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={isMuted ? 0 : volume}
                    onChange={(e) => setVolume(parseInt(e.target.value, 10))}
                    className="w-full accent-cyan-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                  />
                  <span className="text-[10px] font-mono text-slate-400 w-6">{isMuted ? 0 : volume}%</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPlayMode(playMode === 'video' ? 'audio' : 'video')}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition cursor-pointer"
                  >
                    {playMode === 'video' ? (isBn ? '🎵 অডিও মোডে শুনুন' : '🎵 Audio Mode') : (isBn ? '🎬 ভিডিও মোডে দেখুন' : '🎬 Video Mode')}
                  </button>

                  <a
                    href={`https://www.youtube.com/watch?v=${currentTrack.id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 transition cursor-pointer"
                    title={isBn ? 'ইউটিউবে খুলুন' : 'Open in YouTube'}
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Background Playback & Screen-Off Guide Modal */}
      {showBackgroundHelpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-700 shadow-2xl p-5 sm:p-7 space-y-4 text-white">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-cyan-600/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center">
                  <Headphones className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    {isBn ? 'অ্যাপ থেকে বের হলেও যেভাবে গান চালু থাকবে' : 'How to Keep Music Playing in Background'}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {isBn ? 'মোবাইল ব্রাউজার ও স্ক্রিন-অফ অডিও গাইড' : 'Mobile browser & screen-off playback guide'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowBackgroundHelpModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs text-slate-300 max-h-[70vh] overflow-y-auto pr-1">
              <div className="p-3.5 rounded-2xl bg-amber-950/30 border border-amber-600/40 space-y-1">
                <p className="font-bold text-amber-300 flex items-center gap-1.5">
                  <Info className="w-4 h-4 text-amber-400" />
                  {isBn ? 'কেন স্বাভাবিকভাবে সাউন্ড বন্ধ হয়ে যায়?' : 'Why does audio stop normally?'}
                </p>
                <p className="text-slate-300 leading-relaxed text-[11px]">
                  {isBn 
                    ? 'অ্যান্ড্রয়েড এবং আইফোনের ব্রাউজার (Chrome/Safari) ব্যাটারি ও মেমোরি বাঁচানোর জন্য অন্য কোনো অ্যাপে ঢুকলে বা ডিসপ্লে বন্ধ করলে স্বয়ংক্রিয়ভাবে ব্যাকগ্রাউন্ডের ওয়েব ভিডিও ও সাউন্ড সাময়িক পজ (Pause) করে দেয়।' 
                    : 'Mobile browsers pause video tabs when you switch apps or turn off your screen to conserve battery and data.'}
                </p>
              </div>

              <div className="space-y-2.5">
                <p className="font-bold text-white text-xs">
                  {isBn ? '💡 অবিরাম গান চালু রাখার ৩টি সহজ পদ্ধতি:' : '💡 3 Easy Ways to Keep Audio Playing:'}
                </p>

                <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
                  <div className="flex items-center gap-2 text-cyan-400 font-bold">
                    <span className="w-5 h-5 rounded-full bg-cyan-600/30 flex items-center justify-center text-[11px]">১</span>
                    <span>{isBn ? 'অডিও মোড (Audio Mode) সক্রিয় রাখুন' : 'Keep Audio Mode Selected'}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 pl-7">
                    {isBn
                      ? 'প্লেয়ারের "অডিও (Audio)" বাটন সিলেক্ট রাখুন। আমাদের সিস্টেমে ব্যাকগ্রাউন্ড অডিও ক্যারিয়ার এবং মিডিয়াসেশন যুক্ত করা আছে যা স্ক্রিন লক করলেও গান বন্ধ হতে দেয় না।'
                      : 'Keep Audio mode active. The app will maintain an OS audio session with live lock screen controls.'}
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
                  <div className="flex items-center gap-2 text-indigo-400 font-bold">
                    <span className="w-5 h-5 rounded-full bg-indigo-600/30 flex items-center justify-center text-[11px]">২</span>
                    <span>{isBn ? 'লক স্ক্রিন বা নোটিফিকেশন বার থেকে Play চাপুন' : 'Lock Screen & Notification Controls'}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 pl-7">
                    {isBn
                      ? 'ফোন লক করলে যদি গান থেমে যায়, আপনার ফোনের নোটিফিকেশন শেড বা লক স্ক্রিন দেখুন—সেখানে এই গানের থাম্বনেইল ও প্লে বাটন দেখা যাবে। সেখান থেকে সরাসরি Play চাপলে ব্যাকগ্রাউন্ডে গান চলবে।'
                      : 'If your phone pauses, check the lock screen or swipe down notifications—tap Play to resume in background.'}
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold">
                    <span className="w-5 h-5 rounded-full bg-emerald-600/30 flex items-center justify-center text-[11px]">৩</span>
                    <span>{isBn ? 'ফোনের স্ক্রিন অন রাখতে WakeLock চালু করুন' : 'Keep Screen Awake (WakeLock)'}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 pl-7">
                    {isBn
                      ? 'প্লেয়ারের সূর্য/চাঁদ (Sun/Moon) আইকন চাপুন। এটি ডিসপ্লে অটো-স্লিপ বন্ধ রাখবে যাতে গান একটানা শুনতে পারেন।'
                      : 'Tap the Sun/Moon icon on the player bar to prevent your phone screen from timing out.'}
                  </p>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => setShowBackgroundHelpModal(false)}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold text-xs transition cursor-pointer shadow-lg shadow-cyan-600/30"
                >
                  {isBn ? 'বুঝেছি, ব্যাকগ্রাউন্ড মিউজিক উপভোগ করুন' : 'Got it, Enjoy Background Music'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
