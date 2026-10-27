import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  User, 
  Mail, 
  Youtube, 
  ArrowRight,
  Zap,
  Info
} from 'lucide-react';
import { useYouTubeAuth } from '../context/YouTubeAuthContext';
import { Language } from '../types';

interface AuthModalProps {
  lang: Language;
}

export const AuthModal: React.FC<AuthModalProps> = ({ lang }) => {
  const isBn = lang === 'bn';
  const { 
    isAuthModalOpen, 
    closeAuthModal, 
    signIn, 
    loginAsCreator, 
    connectDemoChannel,
    isConnecting, 
    error,
    clearError
  } = useYouTubeAuth();

  const [activeTab, setActiveTab] = useState<'quick' | 'google' | 'custom'>('quick');
  const [customEmail, setCustomEmail] = useState<string>('sf0745026@gmail.com');
  const [customName, setCustomName] = useState<string>('Creator Studio');

  if (!isAuthModalOpen) return null;

  const handleQuickLogin = () => {
    loginAsCreator('sf0745026@gmail.com', 'Creator (sf0745026)');
  };

  const handleCustomLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customEmail.trim()) return;
    loginAsCreator(customEmail, customName);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div 
        className="relative w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow Effects */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="relative px-6 pt-6 pb-4 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl overflow-hidden ring-1 ring-cyan-500/40 shadow-lg shadow-indigo-500/20 bg-slate-900 flex-shrink-0">
              <img
                src="/src/assets/images/ai_video_logo_1793109699890.jpg"
                alt="AI Video Studio Logo"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">
                {isBn ? 'স্টুডিও অ্যাকাউন্ট লগইন' : 'Studio Account Login'}
              </h2>
              <p className="text-[11px] text-slate-400">
                {isBn ? 'প্রজেক্ট হিস্ট্রি সেভ ও ইউটিউব ইন্টিগ্রেশন' : 'Save project history to Firestore & publish to YouTube'}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              clearError();
              closeAuthModal();
            }}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error notification if any */}
        {error && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-amber-950/60 border border-amber-800/80 text-amber-200 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold text-amber-100">{isBn ? 'লগইন নোটিশ' : 'Login Notice'}</p>
              <p className="text-amber-300/90 text-[11px] mt-0.5 leading-relaxed">{error}</p>
            </div>
          </div>
        )}

        {/* Tab Selection */}
        <div className="flex border-b border-slate-800/80 px-6 pt-3 gap-2">
          <button
            onClick={() => setActiveTab('quick')}
            className={`pb-2.5 text-xs font-bold border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'quick'
                ? 'text-cyan-400 border-cyan-400'
                : 'text-slate-400 border-transparent hover:text-slate-200'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>{isBn ? '১-ক্লিক লগইন (সুপারফাস্ট)' : '1-Click Login'}</span>
          </button>
          <button
            onClick={() => setActiveTab('google')}
            className={`pb-2.5 text-xs font-bold border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'google'
                ? 'text-cyan-400 border-cyan-400'
                : 'text-slate-400 border-transparent hover:text-slate-200'
            }`}
          >
            <Youtube className="w-3.5 h-3.5 text-red-500" />
            <span>{isBn ? 'Google OAuth' : 'Google OAuth'}</span>
          </button>
          <button
            onClick={() => setActiveTab('custom')}
            className={`pb-2.5 text-xs font-bold border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'custom'
                ? 'text-cyan-400 border-cyan-400'
                : 'text-slate-400 border-transparent hover:text-slate-200'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>{isBn ? 'কাস্টম ইমেইল' : 'Custom Email'}</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4">
          {activeTab === 'quick' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-gradient-to-r from-cyan-950/40 via-indigo-950/30 to-slate-900 border border-cyan-800/40 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                    {isBn ? 'প্রস্তাবিত পদ্ধতি (Recommended)' : 'Recommended (No Popups)'}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full overflow-hidden ring-2 ring-cyan-500/50 bg-slate-800 flex-shrink-0">
                    <img 
                      src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80" 
                      alt="Creator Avatar" 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                      <span>sf0745026@gmail.com</span>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      {isBn 
                        ? 'আপনার প্রাইমারি ক্রিয়েটর অ্যাকাউন্ট • ফুল স্টুডিও অ্যাক্সেস' 
                        : 'Primary Creator Profile • Full Studio Access'}
                    </p>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={handleQuickLogin}
                    className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Zap className="w-4 h-4 text-amber-300 fill-amber-300" />
                    <span>
                      {isBn ? 'সরাসরি এই অ্যাকাউন্টে লগইন করুন' : 'Sign in as sf0745026@gmail.com'}
                    </span>
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </button>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-[11px] text-slate-400 flex items-start gap-2">
                <Info className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                <p>
                  {isBn
                    ? 'আইফ্রেম প্রিভিউতে ব্রাউজার পপআপ বা থার্ড-পার্টি কুকিজ ব্লক হলেও এই পদ্ধতিতে আপনি কোনো ঝামেলা ছাড়াই সরাসরি সাইন-ইন হয়ে সব ফিচার ব্যবহার করতে পারবেন।'
                    : 'Bypasses iframe browser popup blockers and third-party cookie restrictions for instant authenticated access.'}
                </p>
              </div>
            </div>
          )}

          {activeTab === 'google' && (
            <div className="space-y-4">
              <div className="text-center p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
                <p className="text-xs text-slate-300 leading-relaxed">
                  {isBn
                    ? 'ব্রাউজারে গুগল পপআপ উইন্ডো ওপেন করে আপনার গুগল অ্যাকাউন্টের মাধ্যমে সাইন-ইন করুন।'
                    : 'Open Google OAuth popup to connect your official Google/YouTube channel directly.'}
                </p>

                <button
                  onClick={signIn}
                  disabled={isConnecting}
                  className="w-full py-3 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs shadow-xl transition flex items-center justify-center gap-3 cursor-pointer disabled:opacity-50"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
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
                      ? (isBn ? 'কানেক্ট হচ্ছে...' : 'Connecting...')
                      : (isBn ? 'Google দিয়ে সাইন-ইন করুন' : 'Sign in with Google Popup')}
                  </span>
                </button>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800 text-[11px] text-slate-400">
                <p>
                  {isBn 
                    ? 'টিপস: ব্রাউজারে পপআপ ব্লক থাকলে বা "The requested action is invalid" দেখালে "১-ক্লিক লগইন" ট্যাব ব্যবহার করুন।' 
                    : 'Tip: If browser blocks the popup inside the iframe preview, switch to the "1-Click Login" tab.'}
                </p>
              </div>
            </div>
          )}

          {activeTab === 'custom' && (
            <form onSubmit={handleCustomLogin} className="space-y-3">
              <div>
                <label className="text-[11px] text-slate-400 font-semibold block mb-1">
                  {isBn ? 'ইমেইল অ্যাড্রেস:' : 'Email Address:'}
                </label>
                <input
                  type="email"
                  value={customEmail}
                  onChange={(e) => setCustomEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 font-semibold block mb-1">
                  {isBn ? 'ক্রিয়েটর বা চ্যানেলের নাম:' : 'Creator / Channel Name:'}
                </label>
                <input
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="My Studio Channel"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-cyan-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                <span>{isBn ? 'কাস্টম প্রোফাইল দিয়ে লগইন করুন' : 'Sign In with Custom Profile'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* Quick Demo Option */}
          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
            <span className="text-slate-400 text-[11px]">
              {isBn ? 'শুধুমাত্র টেস্ট করতে চান?' : 'Want to test instantly?'}
            </span>
            <button
              onClick={connectDemoChannel}
              className="text-cyan-400 hover:text-cyan-300 font-semibold cursor-pointer underline text-[11px]"
            >
              {isBn ? 'ডেমো চ্যানেল কানেক্ট করুন' : 'Connect Demo Channel'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
