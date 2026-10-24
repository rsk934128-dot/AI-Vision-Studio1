import React, { useState, useEffect, useMemo } from 'react';
import { 
  History, 
  Film, 
  Download, 
  Play, 
  Pause, 
  Sparkles, 
  Trash2, 
  RefreshCw, 
  ExternalLink, 
  Copy, 
  Check, 
  Subtitles, 
  Youtube, 
  Clock, 
  Search, 
  Filter, 
  Layers, 
  ShieldCheck, 
  ArrowRight, 
  HardDrive, 
  Cloud, 
  CheckCircle2, 
  AlertCircle,
  FileVideo,
  FileText,
  Smartphone,
  Monitor,
  Square
} from 'lucide-react';
import { Language, VideoJob, StudioTab } from '../types';
import { fetchAllProjectHistory, deleteJobFromFirestore } from '../services/firebase';
import { useToast } from '../context/ToastContext';
import { YouTubeUploadModal } from './YouTubeUploadModal';

interface ProjectHistoryProps {
  lang: Language;
  onNavigateTab?: (tab: StudioTab) => void;
  onSendToSubtitles?: (srt: string) => void;
}

export const ProjectHistory: React.FC<ProjectHistoryProps> = ({
  lang,
  onNavigateTab,
  onSendToSubtitles
}) => {
  const isBn = lang === 'bn';
  const { notifySuccess, notifyError, notifyInfo } = useToast();

  const [projects, setProjects] = useState<VideoJob[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedRatio, setSelectedRatio] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [playingVideoId, setPlayingVideoId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // YouTube publish modal state
  const [uploadModalJob, setUploadModalJob] = useState<VideoJob | null>(null);

  const loadProjects = async () => {
    setIsLoading(true);
    try {
      const data = await fetchAllProjectHistory();
      setProjects(data);
    } catch (err: any) {
      console.error('Failed to load project history:', err);
      notifyError('Failed to load history', 'Could not retrieve projects from Firestore', 'হিস্ট্রি লোড করতে ব্যর্থ', 'ক্লাউড ফায়ারস্টোর থেকে প্রজেক্ট পাওয়া যায়নি।');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const handleCopyPrompt = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    notifyInfo('Prompt Copied', 'Prompt copied to clipboard', 'প্রম্পট কপি হয়েছে', 'ভিডিও প্রম্পট ক্লিপবোর্ডে কপি করা হয়েছে।');
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm(isBn ? 'আপনি কি নিশ্চিত যে এই প্রজেক্টটি ডিলিট করতে চান?' : 'Are you sure you want to remove this project from your history?')) {
      return;
    }
    setDeletingId(id);
    try {
      await deleteJobFromFirestore(id);
      setProjects((prev) => prev.filter((p) => p.id !== id));
      notifySuccess('Project Deleted', 'Project removed from history', 'প্রজেক্ট মুছে ফেলা হয়েছে', 'প্রজেক্টটি সফলভাবে মুছে ফেলা হয়েছে।');
    } catch (_err) {
      notifyError('Delete failed', 'Could not delete project', 'ব্যর্থ হয়েছে', 'প্রজেক্ট মুছতে ব্যর্থ হয়েছে।');
    } finally {
      setDeletingId(null);
    }
  };

  const handleDownloadVideo = (job: VideoJob) => {
    if (!job.videoUrl) {
      notifyError('No Video File', 'No downloadable video URL found', 'ভিডিও ফাইল নেই', 'এই প্রজেক্টের জন্য কোনো ভিডিও পাওয়া যায়নি।');
      return;
    }
    const a = document.createElement('a');
    a.href = job.videoUrl;
    a.download = `ai-video-${job.id}.mp4`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    notifySuccess('Download Started', `Downloading ${job.id}.mp4`, 'ডাউনলোড শুরু হয়েছে', `ভিডিও ফাইলটি সেভ করা হচ্ছে।`);
  };

  const handleDownloadSrt = (job: VideoJob) => {
    if (!job.srtContent) {
      notifyError('No Subtitles', 'No SRT subtitles found for this video', 'সাবটাইটেল নেই', 'এই ভিডিওর জন্য কোনো SRT ফাইল নেই।');
      return;
    }
    const blob = new Blob([job.srtContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `subtitles-${job.id}.srt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    notifySuccess('Subtitles Downloaded', `Saved subtitles-${job.id}.srt`, 'সাবটাইটেল ডাউনলোড হয়েছে', 'SRT ফাইলটি সেভ করা হয়েছে।');
  };

  // Filtered projects
  const filteredProjects = useMemo(() => {
    return projects.filter((job) => {
      const matchesSearch = 
        !searchQuery.trim() ||
        job.prompt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (job.style && job.style.toLowerCase().includes(searchQuery.toLowerCase())) ||
        job.id.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesRatio = selectedRatio === 'all' || job.aspectRatio === selectedRatio;
      const matchesStatus = selectedStatus === 'all' || job.status === selectedStatus;

      return matchesSearch && matchesRatio && matchesStatus;
    });
  }, [projects, searchQuery, selectedRatio, selectedStatus]);

  const totalCreditsUsed = useMemo(() => {
    return projects.reduce((acc, curr) => acc + (curr.creditsUsed || 0), 0);
  }, [projects]);

  const readyVideosCount = useMemo(() => {
    return projects.filter((p) => p.status === 'completed' && p.videoUrl).length;
  }, [projects]);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/20 p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold">
              <Cloud className="w-3.5 h-3.5" />
              <span>{isBn ? 'ক্লাউড ফায়ারস্টোর পারসিস্টেন্স' : 'Cloud Firestore Persistence'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
              <History className="w-8 h-8 text-indigo-400" />
              <span>{isBn ? 'প্রজেক্ট হিস্ট্রি ও ক্লাউড লাইব্রেরি' : 'Project History & Cloud Library'}</span>
            </h1>
            <p className="text-slate-400 text-sm max-w-2xl leading-relaxed">
              {isBn
                ? 'আপনার তৈরি করা সমস্ত টেক্সট-টু-ভিডিও এবং সিনেমাটিক মিউজিক ভিডিও ক্লাউড ফায়ারস্টোরে সুরক্ষিত থাকে। এখান থেকে যেকোনো সময় প্রিভিউ দেখুন, ফুল রেজোলিউশনে MP4 ডাউনলোড করুন বা সরাসরি ইউটিউবে পাবলিশ করুন।'
                : 'All your text-to-video renders and music videos are persistently stored in Google Cloud Firestore. Preview full videos, re-download high-definition MP4s, extract SRT subtitles, or export directly to YouTube.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={loadProjects}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-indigo-400' : ''}`} />
              <span>{isBn ? 'রিফ্রেশ করুন' : 'Refresh'}</span>
            </button>

            {onNavigateTab && (
              <button
                onClick={() => onNavigateTab('text-to-video')}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isBn ? 'নতুন ভিডিও বানান' : 'Create New Video'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-slate-800/80">
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
            <div className="flex items-center gap-2 text-slate-400 text-xs">
              <Film className="w-4 h-4 text-indigo-400" />
              <span>{isBn ? 'মোট প্রজেক্ট' : 'Total Projects'}</span>
            </div>
            <p className="text-2xl font-bold text-white mt-1">{projects.length}</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
            <div className="flex items-center gap-2 text-slate-400 text-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{isBn ? 'ডাউনলোড রেডি' : 'Ready to Download'}</span>
            </div>
            <p className="text-2xl font-bold text-emerald-400 mt-1">{readyVideosCount}</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
            <div className="flex items-center gap-2 text-slate-400 text-xs">
              <HardDrive className="w-4 h-4 text-cyan-400" />
              <span>{isBn ? 'ব্যবহৃত ক্রেডিট' : 'Credits Invested'}</span>
            </div>
            <p className="text-2xl font-bold text-cyan-400 mt-1">{totalCreditsUsed}</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
            <div className="flex items-center gap-2 text-slate-400 text-xs">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>{isBn ? 'ক্লাউড স্টোরেজ' : 'Cloud DB'}</span>
            </div>
            <p className="text-sm font-bold text-slate-200 mt-2 truncate">Firestore Active</p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isBn ? 'প্রম্পট, স্টাইল বা আইডি দিয়ে খুঁজুন...' : 'Search by prompt, style, or task ID...'}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-100 placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-indigo-500 transition"
          />
        </div>

        {/* Aspect Ratio Filter */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          <Filter className="w-4 h-4 text-slate-400 flex-shrink-0" />
          <span className="text-xs text-slate-400 font-medium whitespace-nowrap">{isBn ? 'রেশিও:' : 'Ratio:'}</span>
          {[
            { id: 'all', label: isBn ? 'সকল' : 'All' },
            { id: '16:9', label: '16:9', icon: <Monitor className="w-3 h-3" /> },
            { id: '9:16', label: '9:16', icon: <Smartphone className="w-3 h-3" /> },
            { id: '1:1', label: '1:1', icon: <Square className="w-3 h-3" /> },
          ].map((r) => (
            <button
              key={r.id}
              onClick={() => setSelectedRatio(r.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
                selectedRatio === r.id
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-700/60'
              }`}
            >
              {r.icon}
              <span>{r.label}</span>
            </button>
          ))}
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-medium">{isBn ? 'স্ট্যাটাস:' : 'Status:'}</span>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-indigo-500 transition cursor-pointer"
          >
            <option value="all">{isBn ? 'সকল স্ট্যাটাস' : 'All Statuses'}</option>
            <option value="completed">{isBn ? 'সফল (Completed)' : 'Completed'}</option>
            <option value="processing">{isBn ? 'চলমান (Processing)' : 'Processing'}</option>
            <option value="failed">{isBn ? 'ব্যর্থ (Failed)' : 'Failed'}</option>
          </select>
        </div>
      </div>

      {/* Projects List / Grid */}
      {isLoading ? (
        <div className="py-20 text-center space-y-4">
          <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mx-auto" />
          <p className="text-sm text-slate-400 font-medium">
            {isBn ? 'ক্লাউড ফায়ারস্টোর থেকে প্রজেক্ট লোড হচ্ছে...' : 'Fetching your projects from Cloud Firestore...'}
          </p>
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="py-16 text-center rounded-3xl bg-slate-900/40 border border-slate-800/80 p-8 space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-center mx-auto text-slate-400 shadow-xl">
            <Film className="w-8 h-8 text-indigo-400" />
          </div>
          <h3 className="text-lg font-bold text-white">
            {isBn ? 'কোনো প্রজেক্ট পাওয়া যায়নি' : 'No Projects Found'}
          </h3>
          <p className="text-slate-400 text-xs sm:text-sm max-w-md mx-auto">
            {searchQuery || selectedRatio !== 'all' || selectedStatus !== 'all'
              ? isBn
                ? 'আপনার সার্চ ফিল্টারের সাথে কোনো প্রজেক্ট মিলছে না। ফিল্টার পরিবর্তন করে দেখুন।'
                : 'No projects match your active search filters. Try clearing filters.'
              : isBn
              ? 'আপনার ক্লাউড হিস্ট্রিতে এখনো কোনো ভিডিও তৈরি করা হয়নি। এখনই আপনার প্রথম এআই ভিডিও তৈরি করুন!'
              : 'You have not rendered any video projects yet. Generate your first video using Text-to-Video or Photo Music Video!'}
          </p>
          {onNavigateTab && (
            <button
              onClick={() => onNavigateTab('text-to-video')}
              className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-xl shadow-indigo-600/30 transition cursor-pointer"
            >
              {isBn ? 'ভিডিও স্টুডিওতে যান' : 'Go to Video Studio'}
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((job) => {
            const isPlaying = playingVideoId === job.id;
            const isCompleted = job.status === 'completed';
            const isProcessing = job.status === 'processing';
            const isFailed = job.status === 'failed';

            return (
              <div
                key={job.id}
                className="flex flex-col justify-between rounded-3xl bg-slate-900/90 border border-slate-800 hover:border-indigo-500/40 shadow-xl hover:shadow-indigo-500/10 transition-all duration-300 overflow-hidden group"
              >
                <div>
                  {/* Media Preview Player */}
                  <div className="relative aspect-video bg-slate-950 overflow-hidden">
                    {job.videoUrl ? (
                      <video
                        src={job.videoUrl}
                        controls
                        playsInline
                        loop
                        className="w-full h-full object-cover"
                        onPlay={() => setPlayingVideoId(job.id)}
                        onPause={() => setPlayingVideoId(null)}
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center space-y-2 bg-gradient-to-b from-slate-900 to-slate-950">
                        <FileVideo className="w-10 h-10 text-slate-600" />
                        <span className="text-xs text-slate-500">
                          {isProcessing ? (isBn ? 'রেন্ডারিং চলমান...' : 'Rendering in progress...') : (isBn ? 'ভিডিও প্রিভিউ নেই' : 'No video preview')}
                        </span>
                      </div>
                    )}

                    {/* Aspect Ratio Badge */}
                    <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-950/80 backdrop-blur-md border border-slate-700/80 text-[11px] font-bold text-slate-200">
                      {job.aspectRatio === '9:16' ? (
                        <Smartphone className="w-3 h-3 text-cyan-400" />
                      ) : job.aspectRatio === '1:1' ? (
                        <Square className="w-3 h-3 text-amber-400" />
                      ) : (
                        <Monitor className="w-3 h-3 text-indigo-400" />
                      )}
                      <span>{job.aspectRatio || '16:9'}</span>
                    </div>

                    {/* Status Pill */}
                    <div className="absolute top-3 right-3">
                      {isCompleted && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/20 backdrop-blur-md border border-emerald-500/40 text-emerald-300 text-[11px] font-bold">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>{isBn ? 'প্রস্তুত' : 'Ready'}</span>
                        </span>
                      )}
                      {isProcessing && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-cyan-500/20 backdrop-blur-md border border-cyan-500/40 text-cyan-300 text-[11px] font-bold">
                          <RefreshCw className="w-3 h-3 animate-spin" />
                          <span>{job.progress}%</span>
                        </span>
                      )}
                      {isFailed && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-500/20 backdrop-blur-md border border-red-500/40 text-red-300 text-[11px] font-bold">
                          <AlertCircle className="w-3 h-3" />
                          <span>{isBn ? 'ব্যর্থ' : 'Failed'}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 space-y-4">
                    {/* Style and Timestamp */}
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span className="font-semibold text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded-md border border-indigo-500/20 truncate max-w-[60%]">
                        {job.style || 'Cinematic Generative'}
                      </span>
                      <span className="flex items-center gap-1 font-mono text-[11px]">
                        <Clock className="w-3 h-3" />
                        {new Date(job.createdAt || Date.now()).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>

                    {/* Prompt Text with Copy */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                          {isBn ? 'প্রম্পট' : 'Prompt'}
                        </span>
                        <button
                          onClick={() => handleCopyPrompt(job.prompt, job.id)}
                          className="flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300 transition cursor-pointer"
                        >
                          {copiedId === job.id ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedId === job.id ? (isBn ? 'কপি হয়েছে' : 'Copied') : (isBn ? 'কপি' : 'Copy')}</span>
                        </button>
                      </div>
                      <p className="text-xs text-slate-200 line-clamp-3 leading-relaxed bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
                        {job.prompt}
                      </p>
                    </div>

                    {/* Subtitle preview if present */}
                    {job.srtContent && (
                      <div className="p-2.5 rounded-xl bg-slate-950/40 border border-slate-800 text-[11px] text-slate-400 space-y-1">
                        <div className="flex items-center gap-1.5 text-cyan-400 font-semibold">
                          <Subtitles className="w-3.5 h-3.5" />
                          <span>{isBn ? 'সিনক্রোনাইজড সাবটাইটেল অন্তর্ভুক্ত' : 'Synchronized SRT Subtitles'}</span>
                        </div>
                        <p className="line-clamp-2 italic text-slate-300">
                          {job.srtContent.split('\n').filter((l) => !l.includes('-->') && isNaN(Number(l))).slice(0, 2).join(' ')}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Action Buttons */}
                <div className="p-5 pt-0 mt-2 space-y-2.5 border-t border-slate-800/80">
                  <div className="grid grid-cols-2 gap-2 pt-4">
                    {/* Download MP4 */}
                    <button
                      onClick={() => handleDownloadVideo(job)}
                      disabled={!job.videoUrl}
                      className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>{isBn ? 'MP4 ডাউনলোড' : 'Download MP4'}</span>
                    </button>

                    {/* YouTube Publish */}
                    <button
                      onClick={() => setUploadModalJob(job)}
                      disabled={!job.videoUrl}
                      className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold shadow-md shadow-red-600/20 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Youtube className="w-3.5 h-3.5" />
                      <span>{isBn ? 'ইউটিউবে পোস্ট' : 'To YouTube'}</span>
                    </button>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-1 text-xs">
                    {/* Download SRT or Send to Subtitle Engine */}
                    {job.srtContent ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleDownloadSrt(job)}
                          className="text-[11px] text-cyan-400 hover:text-cyan-300 font-medium underline cursor-pointer"
                        >
                          {isBn ? 'SRT ফাইল' : 'Get SRT'}
                        </button>
                        {onSendToSubtitles && (
                          <button
                            onClick={() => onSendToSubtitles(job.srtContent!)}
                            className="text-[11px] text-indigo-400 hover:text-indigo-300 font-medium underline cursor-pointer"
                          >
                            {isBn ? 'এডিটর এ খুলুন' : 'Open in Editor'}
                          </button>
                        )}
                      </div>
                    ) : (
                      <span className="text-[11px] text-slate-500">{job.id}</span>
                    )}

                    {/* Delete Action */}
                    <button
                      onClick={() => handleDelete(job.id)}
                      disabled={deletingId === job.id}
                      className="text-slate-500 hover:text-red-400 text-xs transition cursor-pointer p-1"
                      title={isBn ? 'ডিলিট করুন' : 'Delete Project'}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* YouTube Upload Modal when triggered */}
      {uploadModalJob && (
        <YouTubeUploadModal
          isOpen={!!uploadModalJob}
          onClose={() => setUploadModalJob(null)}
          lang={lang}
          initialTitle={`${uploadModalJob.prompt.slice(0, 60)} (AI Generated 4K)`}
          initialDescription={`Created with AI Video Studio Bangladesh.\nStyle: ${uploadModalJob.style || 'Cinematic'}\n#AIVideo #Shorts #AIMusicVideo`}
          initialTags={['AIVideo', 'Shorts', 'AIMusicVideo', 'BanglaAI']}
          videoUrl={uploadModalJob.videoUrl}
        />
      )}
    </div>
  );
};
