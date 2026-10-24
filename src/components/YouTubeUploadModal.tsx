import React, { useState } from 'react';
import { 
  Youtube, 
  X, 
  CheckCircle2, 
  ExternalLink, 
  Globe, 
  Share2, 
  Lock, 
  Upload, 
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { Language } from '../types';
import { useYouTubeAuth } from '../context/YouTubeAuthContext';

interface YouTubeUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  initialTitle?: string;
  initialDescription?: string;
  initialTags?: string[];
  videoBlob?: Blob;
  videoUrl?: string;
}

export const YouTubeUploadModal: React.FC<YouTubeUploadModalProps> = ({
  isOpen,
  onClose,
  lang,
  initialTitle = 'AI Music Video (Bangla)',
  initialDescription = 'Created with AI Video Studio Bangladesh #AIMusic #Shorts',
  initialTags = ['AIMusicVideo', 'BanglaSong', 'Shorts', 'AIVideo'],
  videoBlob,
  videoUrl
}) => {
  const isBn = lang === 'bn';
  const {
    user,
    channel,
    isAuthenticated,
    isConnecting,
    isUploading,
    signIn,
    connectDemoChannel,
    uploadVideo,
    error,
    clearError
  } = useYouTubeAuth();

  const [title, setTitle] = useState<string>(initialTitle);
  const [description, setDescription] = useState<string>(initialDescription);
  const [tagsInput, setTagsInput] = useState<string>(initialTags.join(', '));
  const [privacy, setPrivacy] = useState<'public' | 'unlisted' | 'private'>('public');
  const [progress, setProgress] = useState<number>(0);
  const [result, setResult] = useState<{ videoId: string; watchUrl: string; studioUrl: string } | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      await signIn();
      return;
    }
    setResult(null);
    setProgress(15);
    const tags = tagsInput.split(',').map((t) => t.trim()).filter(Boolean);

    try {
      const res = await uploadVideo(
        {
          title,
          description,
          tags,
          privacyStatus: privacy,
          categoryId: '10', // Music
          videoBlob,
          videoUrl
        },
        (p) => setProgress(p)
      );
      setResult(res);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl relative">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/40">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-red-600 rounded-lg text-white">
              <Youtube className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">
                {isBn ? 'ইউটিউবে সরাসরি আপলোড' : 'Publish to YouTube'}
              </h3>
              <p className="text-[11px] text-slate-400">
                {isAuthenticated && channel
                  ? `${channel.title} (${channel.customUrl || user?.email || 'Connected'})`
                  : isBn
                  ? 'গুগল দিয়ে সাইন ইন প্রয়োজন'
                  : 'Google OAuth Sign-in required'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-950/80 border border-red-800 rounded-xl text-red-200 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                <span className="leading-snug">{error}</span>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0 self-end sm:self-auto">
                <button
                  type="button"
                  onClick={connectDemoChannel}
                  className="px-2.5 py-1 bg-emerald-500 hover:bg-emerald-600 text-slate-950 rounded-lg font-bold text-[11px] transition"
                >
                  {isBn ? 'ডেমো চ্যানেল ব্যবহার করুন' : 'Use Demo Channel'}
                </button>
                <button type="button" onClick={clearError} className="underline text-red-400 hover:text-white text-xs">
                  {isBn ? 'বাদ দিন' : 'Dismiss'}
                </button>
              </div>
            </div>
          )}

          {result ? (
            <div className="space-y-4 text-center py-4">
              <div className="w-14 h-14 bg-emerald-950 text-emerald-400 border border-emerald-800 rounded-full flex items-center justify-center mx-auto shadow-lg">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <h4 className="text-base font-bold text-white">
                  {isBn ? 'ভিডিও সফলভাবে পাবলিশ হয়েছে!' : 'Video Uploaded to YouTube!'}
                </h4>
                <p className="text-xs text-slate-400 mt-1">
                  {isBn
                    ? 'আপনার চ্যানেলে ভিডিওটি প্রস্তুত। নিচের লিংকে ক্লিক করে সরাসরি দেখতে পারেন।'
                    : 'The video has been published to your YouTube account.'}
                </p>
              </div>

              <div className="flex flex-col gap-2 pt-2">
                <a
                  href={result.watchUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold text-xs flex items-center justify-center gap-2 transition"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>{isBn ? 'ইউটিউবে ভিডিও দেখুন' : 'Watch on YouTube'}</span>
                </a>
                <a
                  href={result.studioUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs flex items-center justify-center gap-2 border border-slate-700 transition"
                >
                  <Youtube className="w-4 h-4 text-red-400" />
                  <span>Open in YouTube Studio</span>
                </a>
              </div>

              <button
                onClick={onClose}
                className="mt-2 text-xs text-slate-400 hover:text-white underline font-medium"
              >
                {isBn ? 'উইন্ডো বন্ধ করুন' : 'Close window'}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isAuthenticated && (
                <div className="p-3.5 bg-red-950/30 border border-red-800/40 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Youtube className="w-5 h-5 text-red-400 flex-shrink-0" />
                    <span className="text-xs text-slate-300">
                      {isBn
                        ? 'ভিডিও আপলোড করতে অনুগ্রহ করে প্রথমে সাইন ইন করুন।'
                        : 'Please authenticate with YouTube to upload directly.'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={signIn}
                    disabled={isConnecting}
                    className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs flex items-center gap-1.5 transition flex-shrink-0"
                  >
                    <span>{isConnecting ? '...' : isBn ? 'লগইন' : 'Sign In'}</span>
                  </button>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {isBn ? 'ভিডিও টাইটেল' : 'Video Title'}
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:ring-2 focus:ring-red-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {isBn ? 'ডেসক্রিপশন' : 'Description'}
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:ring-2 focus:ring-red-500 focus:outline-none resize-none font-sans"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {isBn ? 'ট্যাগস (কমা দিয়ে পৃথক করুন)' : 'Tags'}
                </label>
                <input
                  type="text"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:ring-2 focus:ring-red-500 focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {isBn ? 'প্রাইভেসী' : 'Privacy'}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'public', label: 'Public', icon: <Globe className="w-3 h-3 text-emerald-400" /> },
                    { id: 'unlisted', label: 'Unlisted', icon: <Share2 className="w-3 h-3 text-cyan-400" /> },
                    { id: 'private', label: 'Private', icon: <Lock className="w-3 h-3 text-amber-400" /> }
                  ].map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setPrivacy(p.id as any)}
                      className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-medium border transition ${
                        privacy === p.id
                          ? 'bg-red-950/70 border-red-500 text-white'
                          : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-white'
                      }`}
                    >
                      {p.icon}
                      <span>{p.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {isUploading && (
                <div className="space-y-1 pt-1">
                  <div className="flex justify-between text-xs text-slate-300">
                    <span>{isBn ? 'আপলোড হচ্ছে...' : 'Uploading...'}</span>
                    <span className="font-mono text-red-400">{progress}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-red-600 transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isUploading}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-xs shadow-lg shadow-red-600/30 flex items-center justify-center gap-2 transition disabled:opacity-50 cursor-pointer"
                >
                  <Upload className="w-4 h-4" />
                  <span>
                    {!isAuthenticated
                      ? isBn
                        ? 'ইউটিউব দিয়ে সাইন ইন করুন'
                        : 'Sign In to Publish'
                      : isUploading
                      ? isBn
                        ? 'আপলোড হচ্ছে...'
                        : 'Uploading...'
                      : isBn
                      ? 'এখনই আপলোড করুন'
                      : 'Upload Now'}
                  </span>
                </button>
              </div>
            </form>
          )}
        </div>

      </div>
    </div>
  );
};
