import React from 'react';
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
  CreditCard
} from 'lucide-react';
import { StudioTab, Language } from '../types';

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

  const tabs: { id: StudioTab; labelBn: string; labelEn: string; icon: React.ReactNode; badge?: string }[] = [
    {
      id: 'text-to-video',
      labelBn: 'টেক্সট-টু-ভিডিও',
      labelEn: 'Text to Video',
      icon: <Video className="w-4 h-4" />
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
    <header className="sticky top-0 z-50 bg-[#0f172a]/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('text-to-video')}>
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
              <p className="text-[11px] text-slate-400 font-medium">
                {isBn ? 'ইউটিউব ও শর্টসের এআই ভিডিও প্ল্যাটফর্ম' : 'AI Video Generation & Intelligence'}
              </p>
            </div>
          </div>

          {/* Center Navigation Tabs */}
          <nav className="hidden lg:flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-slate-800/80">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-cyan-600 to-indigo-600 text-white shadow-md shadow-cyan-500/20'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  {tab.icon}
                  <span>{isBn ? tab.labelBn : tab.labelEn}</span>
                  {tab.badge && (
                    <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold ${
                      isActive ? 'bg-black/30 text-white' : 'bg-cyan-950 text-cyan-400 border border-cyan-800/40'
                    }`}>
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Action Tools: Language & Credits */}
          <div className="flex items-center gap-3">
            {/* Credit Badge */}
            <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-800/80 border border-slate-700/80 rounded-lg text-xs">
              <Cpu className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-slate-400">{isBn ? 'ক্রেডিট:' : 'Credits:'}</span>
              <span className="font-bold text-cyan-400">{credits}</span>
            </div>

            {/* Language Switcher */}
            <button
              onClick={() => setLang(lang === 'bn' ? 'en' : 'bn')}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 transition border border-slate-700"
              title="Toggle Language (বাংলা / English)"
            >
              <Globe className="w-3.5 h-3.5 text-indigo-400" />
              <span className="font-bold text-cyan-400">{isBn ? 'BN' : 'EN'}</span>
            </button>
          </div>

        </div>

        {/* Mobile/Tablet Horizontal Scroll Tabs */}
        <div className="flex lg:hidden overflow-x-auto pb-2 pt-1 gap-1.5 no-scrollbar">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`whitespace-nowrap flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold ${
                  isActive
                    ? 'bg-cyan-600 text-white'
                    : 'bg-slate-800/80 text-slate-300'
                }`}
              >
                {tab.icon}
                <span>{isBn ? tab.labelBn : tab.labelEn}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
