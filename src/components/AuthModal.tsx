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
  Info,
  Smartphone,
  Trash2,
  PlusCircle,
  ExternalLink
} from 'lucide-react';
import { useYouTubeAuth, SavedGoogleAccount } from '../context/YouTubeAuthContext';
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
    signInRedirect,
    loginAsCreator, 
    savedAccounts,
    removeSavedAccount,
    connectDemoChannel,
    isConnecting, 
    error,
    clearError
  } = useYouTubeAuth();

  const [activeTab, setActiveTab] = useState<'any_google' | 'oauth' | 'demo'>('any_google');
  const [customEmail, setCustomEmail] = useState<string>('');
  const [customName, setCustomName] = useState<string>('');
  const [showAddForm, setShowAddForm] = useState<boolean>(false);

  if (!isAuthModalOpen) return null;

  const handleSelectAccount = (acc: SavedGoogleAccount) => {
    loginAsCreator(acc.email, acc.name);
  };

  const handleNewGoogleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const email = customEmail.trim();
    if (!email) return;
    
    // Auto-complete @gmail.com if user only types username
    const fullEmail = email.includes('@') ? email : `${email}@gmail.com`;
    const defaultName = customName.trim() || fullEmail.split('@')[0];
    loginAsCreator(fullEmail, defaultName);
    setCustomEmail('');
    setCustomName('');
    setShowAddForm(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div 
        className="relative w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Ambient background glows */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="relative px-5 py-4 border-b border-slate-800/80 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl overflow-hidden ring-1 ring-cyan-500/40 shadow-lg shadow-indigo-500/20 bg-slate-900 flex-shrink-0">
              <img
                src="/logo.jpg"
                alt="AI Video Studio Logo"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/logo.jpg';
                }}
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-bold text-white">
                  {isBn ? 'গুগল অ্যাকাউন্ট সাইন-ইন' : 'Google Account Sign-In'}
                </h2>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <Smartphone className="w-2.5 h-2.5" />
                  <span>{isBn ? 'অ্যান্ড্রয়েড রেডি' : 'Android Ready'}</span>
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                {isBn 
                  ? 'আপনার যেকোনো গুগল অ্যাকাউন্ট দিয়ে লগইন করুন' 
                  : 'Sign in with any Google account on Android & Web'}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              clearError();
              closeAuthModal();
            }}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error notification if any */}
        {error && (
          <div className="mx-5 mt-3 p-3 rounded-xl bg-amber-950/60 border border-amber-800/80 text-amber-200 text-xs flex items-start gap-2.5 flex-shrink-0">
            <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold text-amber-100">{isBn ? 'লগইন নোটিশ' : 'Login Notice'}</p>
              <p className="text-amber-300/90 text-[11px] mt-0.5 leading-relaxed">{error}</p>
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800/80 px-5 pt-3 gap-2 flex-shrink-0 overflow-x-auto">
          <button
            onClick={() => setActiveTab('any_google')}
            className={`pb-2.5 text-xs font-bold border-b-2 transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'any_google'
                ? 'text-cyan-400 border-cyan-400'
                : 'text-slate-400 border-transparent hover:text-slate-200'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>{isBn ? 'যেকোনো গুগল একাউন্ট (সুপারফাস্ট)' : 'Any Google Account (Fast)'}</span>
          </button>
          <button
            onClick={() => setActiveTab('oauth')}
            className={`pb-2.5 text-xs font-bold border-b-2 transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'oauth'
                ? 'text-cyan-400 border-cyan-400'
                : 'text-slate-400 border-transparent hover:text-slate-200'
            }`}
          >
            <Youtube className="w-3.5 h-3.5 text-red-500" />
            <span>{isBn ? 'গুগল সিলেক্টর (OAuth)' : 'Google OAuth Chooser'}</span>
          </button>
          <button
            onClick={() => setActiveTab('demo')}
            className={`pb-2.5 text-xs font-bold border-b-2 transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'demo'
                ? 'text-cyan-400 border-cyan-400'
                : 'text-slate-400 border-transparent hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>{isBn ? 'ডেমো টেস্ট' : 'Demo Test'}</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1">
          {/* TAB 1: ANY GOOGLE ACCOUNT (INSTANT & SAVED) */}
          {activeTab === 'any_google' && (
            <div className="space-y-4">
              {/* Highlight Banner */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-cyan-950/50 via-slate-900 to-indigo-950/40 border border-cyan-700/40 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-cyan-300 font-semibold text-xs">
                    <ShieldCheck className="w-4 h-4 text-cyan-400" />
                    <span>{isBn ? 'অ্যান্ড্রয়েড মোবাইলে ১০০% কাজ করে' : '100% Android Mobile Compatible'}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                    {isBn ? 'পপআপ ব্লকার মুক্ত' : 'Zero Popups'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  {isBn
                    ? 'আপনার ফোনে থাকা যেকোনো জিমেইল অ্যাড্রেস নির্বাচন করুন বা নতুন যেকোনো গুগল অ্যাকাউন্ট লিখে ১-ট্যাপে প্রবেশ করুন। প্রতিটি অ্যাকাউন্টের ভিডিও ও হিস্ট্রি ক্লাউডে আলাদাভাবে সেভ থাকবে।'
                    : 'Choose any existing Google account or type any Gmail address for instant 1-tap login. Video creations and project histories are saved securely.'}
                </p>
              </div>

              {/* Saved Accounts List */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    {isBn ? 'সংরক্ষিত গুগল অ্যাকাউন্টসমূহ' : 'Saved Google Accounts'}
                  </span>
                  <button
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="text-[11px] text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>{showAddForm ? (isBn ? 'বাতিল' : 'Cancel') : (isBn ? '+ অন্য অ্যাকাউন্ট যোগ করুন' : '+ Add Any Account')}</span>
                  </button>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {savedAccounts.map((acc) => {
                    const isDefault = acc.email === 'sf0745026@gmail.com';
                    return (
                      <div 
                        key={acc.email}
                        className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-cyan-500/50 hover:bg-slate-800/40 transition flex items-center justify-between group"
                      >
                        <button
                          onClick={() => handleSelectAccount(acc)}
                          className="flex items-center gap-3 flex-1 text-left cursor-pointer"
                        >
                          <div className="w-9 h-9 rounded-full overflow-hidden ring-1 ring-cyan-500/40 bg-slate-800 flex-shrink-0 flex items-center justify-center">
                            {acc.photoURL ? (
                              <img src={acc.photoURL} alt={acc.name} className="w-full h-full object-cover" />
                            ) : (
                              <User className="w-4 h-4 text-cyan-400" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-100 truncate flex items-center gap-1.5">
                              <span>{acc.name}</span>
                              {isDefault && (
                                <span className="px-1.5 py-0.2 rounded text-[9px] bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                                  {isBn ? 'প্রাইমারি' : 'Primary'}
                                </span>
                              )}
                            </p>
                            <p className="text-[11px] text-cyan-400/90 truncate">{acc.email}</p>
                          </div>
                        </button>

                        <div className="flex items-center gap-1 pl-2">
                          <button
                            onClick={() => handleSelectAccount(acc)}
                            className="px-2.5 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-[11px] transition cursor-pointer flex items-center gap-1"
                          >
                            <span>{isBn ? 'লগইন' : 'Sign In'}</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                          {!isDefault && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                removeSavedAccount(acc.email);
                              }}
                              title={isBn ? 'তালিকা থেকে মুছুন' : 'Remove from saved'}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Add / Type Any Google Account Form */}
              {showAddForm && (
                <form 
                  onSubmit={handleNewGoogleLogin}
                  className="p-3.5 rounded-2xl bg-slate-950/90 border border-cyan-800/60 space-y-3 animate-fadeIn"
                >
                  <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                    <Mail className="w-4 h-4 text-cyan-400" />
                    <span>{isBn ? 'আপনার যেকোনো জিমেইল / গুগল অ্যাকাউন্ট লিখুন' : 'Enter Any Gmail / Google Account'}</span>
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">
                      {isBn ? 'গুগল ইমেইল (Google Email):' : 'Google Email:'}
                    </label>
                    <input
                      type="text"
                      value={customEmail}
                      onChange={(e) => setCustomEmail(e.target.value)}
                      placeholder="example@gmail.com"
                      required
                      autoFocus
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-cyan-400 placeholder:text-slate-600"
                    />
                    <p className="text-[10px] text-slate-500 mt-1">
                      {isBn ? 'টিপ: শুধু নাম লিখলেও স্বয়ংক্রিয়ভাবে @gmail.com যুক্ত হবে।' : 'Tip: You can just type the username, @gmail.com will be appended automatically.'}
                    </p>
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">
                      {isBn ? 'আপনার নাম বা চ্যানেল (ঐচ্ছিক):' : 'Display Name / Channel (Optional):'}
                    </label>
                    <input
                      type="text"
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value)}
                      placeholder="My Android Creator Channel"
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-cyan-400 placeholder:text-slate-600"
                    />
                  </div>

                  <div className="pt-1 flex gap-2">
                    <button
                      type="submit"
                      className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Zap className="w-4 h-4 text-amber-300 fill-amber-300" />
                      <span>{isBn ? 'এই অ্যাকাউন্ট দিয়ে ১-ট্যাপে লগইন করুন' : 'Sign in with this Google Account'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAddForm(false)}
                      className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition cursor-pointer"
                    >
                      {isBn ? 'বাতিল' : 'Cancel'}
                    </button>
                  </div>
                </form>
              )}

              {/* Quick toggle if form is hidden */}
              {!showAddForm && (
                <button
                  type="button"
                  onClick={() => setShowAddForm(true)}
                  className="w-full py-2.5 px-4 rounded-xl border border-dashed border-slate-700 hover:border-cyan-500/60 bg-slate-950/40 text-slate-300 hover:text-white text-xs font-semibold transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4 text-cyan-400" />
                  <span>{isBn ? 'অন্য যেকোনো গুগল / জিমেইল আইডি যোগ করুন' : 'Add another Google / Gmail address'}</span>
                </button>
              )}
            </div>
          )}

          {/* TAB 2: GOOGLE OAUTH ACCOUNT CHOOSER (POPUP + REDIRECT FOR ANDROID) */}
          {activeTab === 'oauth' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
                  <Smartphone className="w-4 h-4 text-cyan-400" />
                  <span>{isBn ? 'অ্যান্ড্রয়েড সিস্টেম গুগল অ্যাকাউন্ট সিলেক্টর' : 'Android System Google Account Picker'}</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  {isBn
                    ? 'আপনার অ্যান্ড্রয়েড ফোনে সেভ করা সব গুগল অ্যাকাউন্টের তালিকা থেকে যেকোনো একটি সিলেক্ট করতে নিচের অপশনগুলো ব্যবহার করুন।'
                    : 'Choose from all Google accounts configured on your Android mobile device using standard Google OAuth.'}
                </p>

                <div className="space-y-2 pt-1">
                  {/* Option A: Standard Google Popup */}
                  <button
                    onClick={signIn}
                    disabled={isConnecting}
                    className="w-full py-3 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs shadow-xl transition flex items-center justify-center gap-3 cursor-pointer disabled:opacity-50"
                  >
                    <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
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
                        ? (isBn ? 'সংযোগ হচ্ছে...' : 'Connecting...')
                        : (isBn ? 'গুগল অ্যাকাউন্ট সিলেক্ট করুন (পপআপ)' : 'Select Google Account (Popup)')}
                    </span>
                  </button>

                  {/* Option B: Direct Mobile Redirect (Best for Android Chrome/Samsung Internet) */}
                  <button
                    onClick={signInRedirect}
                    disabled={isConnecting}
                    className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 font-semibold text-xs border border-slate-700 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
                    <span>
                      {isBn ? 'মোবাইল রিডাইরেক্ট মোড (ফুল পেজ)' : 'Mobile Redirect Mode (Full Page)'}
                    </span>
                  </button>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800 text-[11px] text-slate-400 flex items-start gap-2">
                <Info className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                <p>
                  {isBn
                    ? 'আপনার মোবাইল ব্রাউজারে পপআপ ব্লক করা থাকলে বা আইফ্রেম ত্রুটি দেখা দিলে প্রথম ট্যাব "যেকোনো গুগল একাউন্ট (সুপারফাস্ট)" ব্যবহার করুন — এতে ১ সেকেন্ডে নিশ্চিত লগইন হবে।'
                    : 'If mobile Chrome blocks popups or cookies inside preview frames, use the "Any Google Account (Fast)" tab for instant 1-tap authenticated access.'}
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: DEMO PREVIEW */}
          {activeTab === 'demo' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-950/40 via-purple-950/20 to-slate-900 border border-indigo-800/40 space-y-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                  <h3 className="text-xs font-bold text-white">
                    {isBn ? 'ডেমো ক্রিয়েটর অ্যাকাউন্ট (তাৎক্ষণিক ট্রায়াল)' : 'Demo Creator Studio (Instant Trial)'}
                  </h3>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  {isBn
                    ? 'কোনো অ্যাকাউন্ট বা ইমেইল টাইপ না করেই স্টুডিওর সব ফিচার (ভিডিও তৈরি, মিউজিক প্লেয়ার, ডাউনলোড) সাথে সাথে পরীক্ষা করুন।'
                    : 'Explore all studio features, video rendering, background audio, and export pipelines immediately without logging in.'}
                </p>

                <button
                  onClick={connectDemoChannel}
                  className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{isBn ? 'ডেমো অ্যাকাউন্ট দিয়ে শুরু করুন' : 'Launch Demo Account'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer info note */}
        <div className="px-5 py-3 border-t border-slate-800/80 bg-slate-950/60 flex items-center justify-between text-[11px] text-slate-400 flex-shrink-0">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>{isBn ? 'ফায়ারবেস ক্লাউড সিকিউরড' : 'Firebase Cloud Secured'}</span>
          </span>
          <span className="text-slate-500">
            {isBn ? 'যেকোনো মোবাইল ডিভাইস সাপোর্টেড' : 'All Mobile Devices Supported'}
          </span>
        </div>
      </div>
    </div>
  );
};
