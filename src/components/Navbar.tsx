import React, { useState } from 'react';
import { 
  Video, 
  Sparkles, 
  Mic, 
  Search, 
  Layers, 
  Subtitles, 
  ShieldCheck, 
  Globe, 
  Cpu, 
  CreditCard,
  Music,
  Camera,
  Youtube,
  LogOut,
  CheckCircle2,
  ChevronDown
} from 'lucide-react';
import { StudioTab, Language } from '../types';
import { useYouTubeAuth } from '../context/YouTubeAuthContext';

interface NavbarProps {
  activeTab: StudioTab;
  setActiveTab: (tab: StudioTab) => void;
  lang: Language;
  setLang: (lang: Language) => void;
  credits: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  lang,
  setLang,
  credits
}) => {
  const isBn = lang === 'bn';
  const { user, channel, isAuthenticated, isConnecting, signIn, signOut } = useYouTubeAuth();
  const [showUserMenu, setShowUserMenu] = useState<boolean>(false);

  const tabs: { id: StudioTab; labelBn: string; labelEn: string; icon: React.ReactNode; badge?: string; badgeColor?: string }[] = [
    {
      id: 'photo-music-video',
      labelBn: 'ছবি-টু-মিউজিক ভিডিও',
      labelEn: 'Photo Music Video',
      icon: <Music className="w-4 h-4" />,
      badge: 'মডেল ও গান'
    },
    {
      id: 'text-to-video',
      labelBn: 'টেক্সট-টু-ভিডিও',
      labelEn: 'Text to Video',
      icon: <Video className="w-4 h-4" />
    },
    {
      id: 'youtube-studio',
      labelBn: 'ইউটিউব স্টুডিও',
      labelEn: 'YouTube Studio',
      icon: <Youtube className="w-4 h-4 text-red-500" />,
      badge: isAuthenticated ? 'Connected' : 'OAuth',
      badgeColor: isAuthenticated ? 'bg-red-950 text-red-400 border-red-800' : 'bg-slate-800 text-slate-400 border-slate-700'
    },
    {
      id: 'video-understanding',
      labelBn: 'ভিডিও বিশ্লেষণ',
      labelEn: 'Video Analysis',
      icon: <Search className="w-4 h-4" />,
      badge: 'Gemini 4 Argon'
    },
    {
      id: 'audio-transcribe',
      labelBn: 'মাইক ও ট্রান্সক্রাইব',
      labelEn: 'Mic & Transcribe',
      icon: <Mic className="w-4 h-4" />,
      badge: 'Gemini 3.5'
    },
    {
      id: 'video-to-video',
      labelBn: 'ভিডিও-টু-ভিডিও',
      labelEn: 'Video-to-Video',
      icon: <Layers className="w-4 h-4" />
    },
    {
      id: 'subtitles',
      labelBn: 'সাবটাইটেল ও FFmpeg',
      labelEn: 'Subtitles & FFmpeg',
      icon: <Subtitles className="w-4 h-4" />
    },
    {
      id: 'shurjopay-gmail',
      labelBn: 'shurjoPay জিমেইল',
      labelEn: 'shurjoPay & Gmail',
      icon: <CreditCard className="w-4 h-4" />,
      badge: 'Fintech'
    },
    {
      id: 'admin',
      labelBn: 'সুপার অ্যাডমিন',
      labelEn: 'Admin & Pipeline',
      icon: <ShieldCheck className="w-4 h-4" />
    }
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#0f172a]/95 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('photo-music-video')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <Sparkles className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-cyan-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
                  AI Video Studio
                </span>
                <span className="px-2 py-0.5 text-[10px] font-semibold bg-cyan-950 text-cyan-300 border border-cyan-800/60 rounded-full">
                  PRO
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium hidden sm:block">
                {isBn ? 'ইউটিউব ও শর্টসের এআই ভিডিও প্ল্যাটফর্ম' : 'AI Video Generation & YouTube Studio'}
              </p>
            </div>
          </div>

          {/* Center Navigation Tabs */}
          <nav className="hidden xl:flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-slate-800/80">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-r from-cyan-600 to-indigo-600 text-white shadow-md shadow-cyan-500/20'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  {tab.icon}
                  <span>{isBn ? tab.labelBn : tab.labelEn}</span>
                  {tab.badge && (
                    <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold border ${
                      tab.badgeColor || (isActive ? 'bg-black/30 text-white border-transparent' : 'bg-cyan-950 text-cyan-400 border-cyan-800/40')
                    }`}>
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Action Tools: YouTube Auth, Language, Credits */}
          <div className="flex items-center gap-2.5">
            {/* YouTube Login / Profile Button */}
            {!isAuthenticated ? (
              <button
                onClick={signIn}
                disabled={isConnecting}
                title={isBn ? 'ইউটিউব অ্যাকাউন্ট দিয়ে লগইন করুন' : 'Sign in with YouTube'}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold border border-red-500/40 hover:border-red-500 shadow-md shadow-red-500/10 transition cursor-pointer"
              >
                {/* Google Icon */}
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
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
                <div className="flex items-center gap-1.5">
                  <Youtube className="w-3.5 h-3.5 text-red-500" />
                  <span className="hidden sm:inline">
                    {isConnecting
                      ? isBn ? 'কানেক্টিং...' : 'Connecting...'
                      : isBn ? 'ইউটিউব লগইন' : 'YouTube Login'}
                  </span>
                </div>
              </button>
            ) : (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 px-2.5 py-1 rounded-xl bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700 text-xs text-white transition cursor-pointer"
                >
                  <img
                    src={
                      channel?.thumbnails?.default?.url ||
                      user?.photoURL ||
                      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'
                    }
                    alt={user?.displayName || 'User'}
                    className="w-5 h-5 rounded-full object-cover ring-1 ring-red-500"
                  />
                  <span className="max-w-[100px] truncate font-semibold text-slate-200 hidden sm:inline">
                    {channel?.title || user?.displayName || 'YouTube'}
                  </span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>

                {/* Dropdown Menu */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-56 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl py-2 z-50 animate-fadeIn text-xs">
                    <div className="px-3 py-2 border-b border-slate-800">
                      <div className="font-bold text-white truncate">
                        {channel?.title || user?.displayName}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate">
                        {channel?.customUrl || user?.email}
                      </div>
                      <div className="flex items-center gap-1 mt-1 text-[10px] text-emerald-400">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>{isBn ? 'ইউটিউব ভেরিফাইড সংযুক্ত' : 'YouTube Connected'}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        setActiveTab('youtube-studio');
                      }}
                      className="w-full px-3 py-2 text-left text-slate-200 hover:bg-slate-800 flex items-center gap-2 cursor-pointer"
                    >
                      <Youtube className="w-4 h-4 text-red-500" />
                      <span>{isBn ? 'ইউটিউব স্টুডিও ও চ্যানেল' : 'YouTube Studio & Hub'}</span>
                    </button>

                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        signOut();
                      }}
                      className="w-full px-3 py-2 text-left text-rose-400 hover:bg-slate-800 flex items-center gap-2 border-t border-slate-800 mt-1 cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>{isBn ? 'লগআউট করুন' : 'Sign Out'}</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Credit Badge */}
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1 bg-slate-800/80 border border-slate-700/80 rounded-lg text-xs">
              <Cpu className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-slate-400">{isBn ? 'ক্রেডিট:' : 'Credits:'}</span>
              <span className="font-bold text-cyan-400">{credits}</span>
            </div>

            {/* Language Switcher */}
            <button
              onClick={() => setLang(lang === 'bn' ? 'en' : 'bn')}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 transition border border-slate-700 cursor-pointer"
              title="Toggle Language (বাংলা / English)"
            >
              <Globe className="w-3.5 h-3.5 text-indigo-400" />
              <span className="font-bold text-cyan-400">{isBn ? 'BN' : 'EN'}</span>
            </button>
          </div>

        </div>

        {/* Mobile/Tablet Horizontal Scroll Tabs */}
        <div className="flex xl:hidden overflow-x-auto pb-2 pt-1 gap-1.5 no-scrollbar">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`whitespace-nowrap flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                  isActive
                    ? 'bg-cyan-600 text-white'
                    : 'bg-slate-800/80 text-slate-300'
                }`}
              >
                {tab.icon}
                <span>{isBn ? tab.labelBn : tab.labelEn}</span>
                {tab.badge && (
                  <span className="text-[9px] px-1 bg-black/30 text-white rounded">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
