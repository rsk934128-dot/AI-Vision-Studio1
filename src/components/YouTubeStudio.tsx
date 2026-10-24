import React, { useState } from 'react';
import { 
  Youtube, 
  Upload, 
  Sparkles, 
  CheckCircle2, 
  ExternalLink, 
  Eye, 
  Users, 
  Video, 
  ShieldCheck, 
  LogOut, 
  RefreshCw, 
  Play, 
  Clock, 
  Globe, 
  Lock, 
  Share2, 
  FileVideo, 
  TrendingUp, 
  Tag, 
  AlertCircle,
  Film,
  Tv,
  Radio
} from 'lucide-react';
import { Language } from '../types';
import { useYouTubeAuth } from '../context/YouTubeAuthContext';
import { YouTubeInAppPlayer } from './YouTubeInAppPlayer';

interface YouTubeStudioProps {
  lang: Language;
  onNavigateTab?: (tab: any) => void;
}

export const YouTubeStudio: React.FC<YouTubeStudioProps> = ({ lang, onNavigateTab }) => {
  const isBn = lang === 'bn';
  const {
    user,
    channel,
    recentVideos,
    isAuthenticated,
    isDemoMode,
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
  } = useYouTubeAuth();

  // Sub Tab Navigation: 'watch' (In-App Player), 'upload' (Publisher), 'channel' (Analytics)
  const [activeSubTab, setActiveSubTab] = useState<'watch' | 'upload' | 'channel'>('watch');
  const [selectedVideoId, setSelectedVideoId] = useState<string>('aircAruvnKk');

  // Upload Form State
  const [videoTitle, setVideoTitle] = useState<string>('AI Music Video - আমার ভালোবাসার গান (Official 4K)');
  const [videoDesc, setVideoDesc] = useState<string>(
    'Generated with AI Video Studio Bangladesh.\nFeaturing AI Model & Generative Synthesizer.\n#AIMusicVideo #BanglaSong #Shorts #AIVideoStudio'
  );
  const [tagsInput, setTagsInput] = useState<string>('AIMusic, BanglaSong, BengaliMusic, Shorts, AIVideo');
  const [privacy, setPrivacy] = useState<'public' | 'unlisted' | 'private'>('public');
  const [category, setCategory] = useState<string>('10'); // 10 = Music
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploadSuccess, setUploadSuccess] = useState<{ videoId: string; watchUrl: string; studioUrl: string } | null>(null);

  const formatNumber = (numStr?: string) => {
    if (!numStr) return '0';
    const n = parseInt(numStr, 10);
    if (isNaN(n)) return numStr;
    if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
    if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
    return n.toLocaleString();
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      await signIn();
      return;
    }
    setUploadSuccess(null);
    setUploadProgress(10);

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    try {
      const result = await uploadVideo(
        {
          title: videoTitle,
          description: videoDesc,
          tags,
          privacyStatus: privacy,
          categoryId: category
        },
        (p) => setUploadProgress(p)
      );
      setUploadSuccess(result);
    } catch (err) {
      console.error(err);
    }
  };

  const handlePlayVideoInApp = (id: string) => {
    setSelectedVideoId(id);
    setActiveSubTab('watch');
    window.scrollTo({ top: 180, behavior: 'smooth' });
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Banner / Hero Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-red-950/60 via-slate-900 to-slate-900 border border-red-900/40 p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-600 to-rose-700 flex items-center justify-center shadow-lg shadow-red-600/30 text-white flex-shrink-0">
              <Youtube className="w-9 h-9" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  {isBn ? 'ইউটিউব ওয়াচ ও ক্রিয়েটর স্টুডিও' : 'YouTube Watch & Creator Studio'}
                </h1>
                <span className="px-2.5 py-0.5 text-xs font-semibold bg-red-600/20 text-red-400 border border-red-500/30 rounded-full">
                  Official In-App Hub
                </span>
              </div>
              <p className="text-slate-400 text-sm mt-1 max-w-2xl">
                {isBn
                  ? 'অ্যাপের ভেতরেই যেকোনো ইউটিউব ভিডিও সরাসরি দেখুন, গান শুনুন, চ্যানেল কানেক্ট করুন এবং ১-ক্লিকে ভিডিও পাবলিশ করুন।'
                  : 'Watch any YouTube video directly inside the app, listen to music, manage your channel, and publish creations seamlessly.'}
              </p>
            </div>
          </div>

          {/* Authentication Call-to-Action */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
            {!isAuthenticated ? (
              <>
                <button
                  onClick={signIn}
                  disabled={isConnecting}
                  className="flex items-center justify-center gap-3 px-6 py-3.5 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-sm shadow-xl hover:shadow-red-500/10 transition-all duration-200 border border-slate-200 disabled:opacity-50 cursor-pointer"
                >
                  {/* Official Google SVG Icon */}
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>
                    {isConnecting
                      ? isBn
                        ? 'কানেক্ট হচ্ছে...'
                        : 'Connecting...'
                      : isBn
                      ? 'ইউটিউব চ্যানেল কানেক্ট করুন'
                      : 'Sign in with Google'}
                  </span>
                </button>

                <button
                  onClick={connectDemoChannel}
                  className="flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30 text-xs font-bold transition shadow-lg cursor-pointer"
                  title="Test all features without Google OAuth"
                >
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  <span>{isBn ? 'ডেমো চ্যানেল টেস্ট করুন' : 'Test Demo Channel'}</span>
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                {isDemoMode && (
                  <span className="px-2.5 py-1 text-xs font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 rounded-lg">
                    {isBn ? 'ডেমো মোড' : 'Demo Mode'}
                  </span>
                )}
                <button
                  onClick={refreshChannel}
                  title="রিফ্রেশ করুন / Refresh Channel"
                  className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
                <button
                  onClick={signOut}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-red-950/60 text-slate-300 hover:text-red-400 border border-slate-700/80 hover:border-red-800 transition text-xs font-semibold cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>{isBn ? 'লগআউট' : 'Sign Out'}</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Error notification */}
        {error && (
          <div className="mt-4 p-4 bg-red-950/80 border border-red-800/80 rounded-xl text-red-200 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5 sm:mt-0" />
              <div>
                <p className="font-semibold text-red-100">{isBn ? 'কানেকশন অ্যালার্ট' : 'OAuth Connection Notice'}</p>
                <p className="text-red-300 mt-0.5 leading-relaxed">{error}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0 self-end sm:self-auto">
              {!isAuthenticated && (
                <button
                  onClick={connectDemoChannel}
                  className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs transition cursor-pointer"
                >
                  {isBn ? 'ডেমো চ্যানেল কানেক্ট করুন' : 'Connect Demo Channel'}
                </button>
              )}
              <button
                onClick={clearError}
                className="text-red-400 hover:text-white text-xs underline font-medium cursor-pointer ml-1"
              >
                {isBn ? 'বন্ধ করুন' : 'Dismiss'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modern Sub-navigation Bar */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveSubTab('watch')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer ${
              activeSubTab === 'watch'
                ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-800'
            }`}
          >
            <Tv className="w-4 h-4 text-white" />
            <span>{isBn ? 'ইউটিউব ভিডিও দেখুন (Watch Player)' : 'Watch YouTube In-App'}</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse ml-0.5" />
          </button>

          <button
            onClick={() => setActiveSubTab('upload')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer ${
              activeSubTab === 'upload'
                ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-800'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>{isBn ? 'ভিডিও আপলোড ও পাবলিশ' : 'Direct Upload'}</span>
          </button>

          {isAuthenticated && (
            <button
              onClick={() => setActiveSubTab('channel')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer ${
                activeSubTab === 'channel'
                  ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
                  : 'bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-800'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>{isBn ? 'চ্যানেল অ্যানালিটিক্স' : 'Channel Hub'}</span>
            </button>
          )}
        </div>

        {/* Active Now Pill */}
        <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-400">
          <Youtube className="w-4 h-4 text-red-500" />
          <span>{isBn ? 'ইউটিউব সিনেমা মোড রেডি' : 'In-App Theater Engine Ready'}</span>
        </div>
      </div>

      {/* TAB 1: WATCH YOUTUBE IN-APP PLAYER */}
      {activeSubTab === 'watch' && (
        <YouTubeInAppPlayer
          lang={lang}
          onNavigateTab={onNavigateTab}
          initialVideoId={selectedVideoId}
          channelVideos={recentVideos}
        />
      )}

      {/* TAB 2: CHANNEL HUB / ANALYTICS */}
      {activeSubTab === 'channel' && isAuthenticated && channel && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
          {/* Main Channel Identity Card */}
          <div className="lg:col-span-2 rounded-2xl bg-slate-900/90 border border-slate-800 p-6 flex flex-col justify-between shadow-xl">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
              <div className="relative">
                <img
                  src={
                    channel.thumbnails.medium?.url ||
                    channel.thumbnails.default?.url ||
                    user?.photoURL ||
                    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80'
                  }
                  alt={channel.title}
                  className="w-20 h-20 rounded-2xl object-cover ring-2 ring-red-500 shadow-md"
                />
                <div className="absolute -bottom-1 -right-1 bg-red-600 rounded-full p-1 text-white shadow">
                  <Youtube className="w-3.5 h-3.5" />
                </div>
              </div>

              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-xl font-bold text-white">{channel.title}</h2>
                  <span className="flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800/60">
                    <CheckCircle2 className="w-3 h-3" />
                    {isBn ? 'অথেন্টিকেটেড' : 'Authorized'}
                  </span>
                </div>
                <p className="text-slate-400 text-xs font-mono mt-0.5">
                  {channel.customUrl || (user?.email ? `@${user.email.split('@')[0]}` : '@channel')}
                </p>
                <p className="text-slate-300 text-xs mt-2 line-clamp-2">
                  {channel.description || (isBn ? 'ইউটিউব ক্রিয়েটর চ্যানেল কানেক্ট করা হয়েছে।' : 'YouTube Creator account linked.')}
                </p>
              </div>
            </div>

            {/* Channel Statistics Bar */}
            <div className="grid grid-cols-3 gap-3 mt-6 pt-5 border-t border-slate-800">
              <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/60 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-red-950/60 text-red-400">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[11px] text-slate-400">{isBn ? 'সাবস্ক্রাইবার' : 'Subscribers'}</div>
                  <div className="text-base font-bold text-white">
                    {formatNumber(channel.statistics.subscriberCount)}
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/60 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-indigo-950/60 text-indigo-400">
                  <Eye className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[11px] text-slate-400">{isBn ? 'মোট ভিউজ' : 'Total Views'}</div>
                  <div className="text-base font-bold text-white">
                    {formatNumber(channel.statistics.viewCount)}
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/60 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-cyan-950/60 text-cyan-400">
                  <Video className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[11px] text-slate-400">{isBn ? 'ভিডিও সংখ্যা' : 'Videos'}</div>
                  <div className="text-base font-bold text-white">
                    {formatNumber(channel.statistics.videoCount)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick YouTube Links & Security Card */}
          <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-6 flex flex-col justify-between shadow-xl">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-slate-200 mb-3">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>{isBn ? 'সিকিউরিটি ও স্কোপ ভেরিফিকেশন' : 'Permissions & Scopes'}</span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/50 flex items-center justify-between">
                  <span className="text-slate-300 font-mono text-[11px]">youtube.readonly</span>
                  <span className="text-emerald-400 text-[10px] font-bold uppercase">{isBn ? 'সক্রিয়' : 'Active'}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/50 flex items-center justify-between">
                  <span className="text-slate-300 font-mono text-[11px]">youtube.upload</span>
                  <span className="text-emerald-400 text-[10px] font-bold uppercase">{isBn ? 'সক্রিয়' : 'Active'}</span>
                </div>
              </div>
            </div>

            <div className="space-y-2 pt-4">
              <a
                href={
                  channel.id && channel.id !== user?.uid
                    ? `https://www.youtube.com/channel/${channel.id}`
                    : 'https://studio.youtube.com'
                }
                target="_blank"
                rel="noreferrer"
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold text-xs transition shadow-md shadow-red-600/20"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>{isBn ? 'ইউটিউব চ্যানেল ওপেন করুন' : 'View on YouTube'}</span>
              </a>
              <a
                href="https://studio.youtube.com"
                target="_blank"
                rel="noreferrer"
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs border border-slate-700 transition"
              >
                <Youtube className="w-3.5 h-3.5 text-red-400" />
                <span>YouTube Creator Studio</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: DIRECT PUBLISHING & UPLOAD STUDIO */}
      {activeSubTab === 'upload' && (
        <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-2xl animate-fadeIn">
          <div className="p-6 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-tr from-red-600 to-rose-600 text-white">
                <Upload className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">
                  {isBn ? 'সরাসরি ইউটিউবে ভিডিও আপলোড ও পাবলিশ' : 'Direct YouTube Video Publisher'}
                </h2>
                <p className="text-slate-400 text-xs mt-0.5">
                  {isBn
                    ? 'আপনার প্রস্তুতকৃত মিউজিক ভিডিও বা এআই কনটেন্ট সরাসরি টাইটেল, ডেসক্রিপশন ও ট্যাগসহ চ্যানেলে পাঠান।'
                    : 'Publish your created music video or AI scenes with tailored metadata and privacy controls.'}
                </p>
              </div>
            </div>
            {onNavigateTab && (
              <button
                onClick={() => onNavigateTab('photo-music-video')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-cyan-400 border border-slate-700 transition cursor-pointer"
              >
                <Film className="w-3.5 h-3.5" />
                <span>{isBn ? 'নতুন মিউজিক ভিডিও বানান' : 'Create New Video'}</span>
              </button>
            )}
          </div>

          <form onSubmit={handleUploadSubmit} className="p-6 space-y-6">
            {/* Upload Success Alert */}
            {uploadSuccess && (
              <div className="p-4 rounded-xl bg-emerald-950/80 border border-emerald-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-6 h-6 text-emerald-400 flex-shrink-0" />
                  <div>
                    <div className="text-sm font-bold text-white">
                      {isBn ? 'অভিনন্দন! ভিডিওটি সফলভাবে আপলোড হয়েছে' : 'Video Successfully Published to YouTube!'}
                    </div>
                    <div className="text-xs text-emerald-300 font-mono mt-0.5">
                      Video ID: {uploadSuccess.videoId}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handlePlayVideoInApp(uploadSuccess.videoId)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>{isBn ? 'অ্যাপের ভেতরেই দেখুন' : 'Watch in App'}</span>
                  </button>
                  <a
                    href={uploadSuccess.studioUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs border border-slate-700 transition"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Studio Edit</span>
                  </a>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column: Title & Description */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    {isBn ? 'ভিডিও টাইটেল (Title)' : 'Video Title'}
                  </label>
                  <input
                    type="text"
                    value={videoTitle}
                    onChange={(e) => setVideoTitle(e.target.value)}
                    required
                    placeholder="e.g. AI Music Video - Romantic Rain (Bangla)"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/90 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    {isBn ? 'ডেসক্রিপশন ও ক্রেডিট (Description)' : 'Video Description'}
                  </label>
                  <textarea
                    rows={4}
                    value={videoDesc}
                    onChange={(e) => setVideoDesc(e.target.value)}
                    placeholder="Add video overview, lyrics, credits, hashtags..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/90 border border-slate-700 text-white placeholder-slate-500 text-xs focus:outline-none focus:ring-2 focus:ring-red-500 resize-none font-sans"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                    <span>{isBn ? 'ট্যাগস (কমা দিয়ে আলাদা করুন)' : 'YouTube Tags (Comma separated)'}</span>
                    <Tag className="w-3 h-3 text-slate-400" />
                  </label>
                  <input
                    type="text"
                    value={tagsInput}
                    onChange={(e) => setTagsInput(e.target.value)}
                    placeholder="AIMusic, BanglaSong, Shorts, 4K"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/90 border border-slate-700 text-white placeholder-slate-500 text-xs focus:outline-none focus:ring-2 focus:ring-red-500 font-mono"
                  />
                </div>
              </div>

              {/* Right Column: Settings & Privacy */}
              <div className="space-y-4 flex flex-col justify-between">
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      {isBn ? 'ভিজিবিলিটি / প্রাইভেসী (Privacy Status)' : 'Privacy Status'}
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'public', labelBn: 'পাবলিক (Public)', labelEn: 'Public', icon: <Globe className="w-3.5 h-3.5 text-emerald-400" /> },
                        { id: 'unlisted', labelBn: 'আনলিস্টেড (Unlisted)', labelEn: 'Unlisted', icon: <Share2 className="w-3.5 h-3.5 text-cyan-400" /> },
                        { id: 'private', labelBn: 'প্রাইভেট (Private)', labelEn: 'Private', icon: <Lock className="w-3.5 h-3.5 text-amber-400" /> }
                      ].map((opt) => (
                        <button
                          type="button"
                          key={opt.id}
                          onClick={() => setPrivacy(opt.id as any)}
                          className={`flex items-center gap-1.5 p-2.5 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                            privacy === opt.id
                              ? 'bg-red-950/60 border-red-500 text-white'
                              : 'bg-slate-800/70 border-slate-700 text-slate-400 hover:text-white'
                          }`}
                        >
                          {opt.icon}
                          <span>{isBn ? opt.labelBn : opt.labelEn}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      {isBn ? 'ক্যাটাগরি (Category)' : 'Video Category'}
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/90 border border-slate-700 text-white text-xs focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                      <option value="10">{isBn ? 'মিউজিক (Music - Category 10)' : 'Music (10)'}</option>
                      <option value="24">{isBn ? 'বিনোদন (Entertainment - Category 24)' : 'Entertainment (24)'}</option>
                      <option value="22">{isBn ? 'পিপল অ্যান্ড ব্লগস (People & Blogs - Category 22)' : 'People & Blogs (22)'}</option>
                      <option value="28">{isBn ? 'বিজ্ঞান ও প্রযুক্তি (Science & Tech - Category 28)' : 'Science & Technology (28)'}</option>
                    </select>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-700/60 text-xs text-slate-300 space-y-1">
                    <div className="font-semibold text-white flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>{isBn ? 'এআই ইউটিউব অটোমেশন' : 'AI YouTube Optimization'}</span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      {isBn
                        ? 'অটোমেটিক ইউটিউব এসইও, সাউন্ডট্র্যাক ক্লিয়ারেন্স ট্যাগ এবং ফুল এইচডি/৪কে এনকোডিং অপ্টিমাইজড।'
                        : 'Automatic YouTube SEO indexing, audio rights clearance headers, and high bitrate optimization enabled.'}
                    </p>
                  </div>
                </div>

                {/* Progress bar if uploading */}
                {isUploading && (
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs text-slate-300">
                      <span>{isBn ? 'ইউটিউবে আপলোড হচ্ছে...' : 'Uploading to YouTube...'}</span>
                      <span className="font-mono text-red-400">{uploadProgress}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-red-600 to-rose-500 transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isUploading}
                  className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-rose-600 text-white font-bold text-sm shadow-xl shadow-red-600/25 flex items-center justify-center gap-2 transition duration-200 disabled:opacity-50 cursor-pointer"
                >
                  <Youtube className="w-4 h-4" />
                  <span>
                    {!isAuthenticated
                      ? isBn
                        ? 'ইউটিউব দিয়ে সাইন ইন করে আপলোড করুন'
                        : 'Sign In to Publish'
                      : isUploading
                      ? isBn
                        ? 'আপলোড হচ্ছে...'
                        : 'Publishing to YouTube...'
                      : isBn
                      ? 'ইউটিউব চ্যানেলে পাবলিশ করুন'
                      : 'Publish Video to YouTube'}
                  </span>
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Recent Channel Uploads Gallery - Always Available at Bottom */}
      {isAuthenticated && recentVideos.length > 0 && (
        <div className="space-y-4 pt-4 border-t border-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-red-400" />
              <h3 className="text-base font-bold text-white">
                {isBn ? 'আপনার ইউটিউব চ্যানেলের সাম্প্রতিক আপলোড' : 'Your Recent Channel Uploads'}
              </h3>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-400">
                {isBn ? 'যেকোনো ভিডিওতে ক্লিক করে অ্যাপের ভেতরেই চালান' : 'Click any video to play in-app'}
              </span>
              <button
                onClick={fetchVideos}
                className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" />
                <span>{isBn ? 'রিফ্রেশ' : 'Refresh'}</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {recentVideos.map((video) => (
              <div
                key={video.id}
                onClick={() => handlePlayVideoInApp(video.id)}
                className="group rounded-xl bg-slate-900 border border-slate-800 hover:border-red-600/60 overflow-hidden transition shadow-lg flex flex-col cursor-pointer"
              >
                <div className="relative aspect-video bg-slate-800 overflow-hidden">
                  <img
                    src={
                      video.thumbnailUrl ||
                      'https://images.unsplash.com/photo-1518770660439-4636190af475?w=500&auto=format&fit=crop&q=80'
                    }
                    alt={video.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                  <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition flex items-center justify-center">
                    <div className="w-10 h-10 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg transform group-hover:scale-110 transition">
                      <Play className="w-4 h-4 ml-0.5 fill-current" />
                    </div>
                  </div>
                </div>
                <div className="p-3 flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-white line-clamp-2 group-hover:text-red-400 transition">
                      {video.title}
                    </h4>
                    <p className="text-[11px] text-slate-400 line-clamp-1 mt-1">
                      {video.description || 'No description'}
                    </p>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-500 mt-3 pt-2 border-t border-slate-800">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(video.publishedAt).toLocaleDateString()}
                    </span>
                    <span className="capitalize text-emerald-400 font-semibold">
                      {video.privacyStatus}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
