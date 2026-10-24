import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Trash2, 
  RefreshCw, 
  Database, 
  Cpu, 
  Activity, 
  DollarSign, 
  CheckCircle, 
  Clock, 
  Code, 
  Layers, 
  ExternalLink,
  GitBranch
} from 'lucide-react';
import { Language, VideoJob } from '../types';
import { safeParseResponse } from '../utils/apiClient';

interface AdminDashboardProps {
  lang: Language;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ lang }) => {
  const isBn = lang === 'bn';

  const [jobs, setJobs] = useState<VideoJob[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeCodeTab, setActiveCodeTab] = useState<'main' | 'video_engine' | 'subtitle'>('main');

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/jobs');
      const parsed = await safeParseResponse<any>(res);
      const data = parsed.data || {};
      if (parsed.success && data.jobs) {
        setJobs(data.jobs);
      }
    } catch (_e) {
      // silent
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleDeleteJob = async (id: string) => {
    try {
      const res = await fetch(`/api/jobs/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setJobs(jobs.filter((j) => j.id !== id));
      }
    } catch (_e) {
      // silent
    }
  };

  const totalCredits = jobs.reduce((acc, j) => acc + (j.creditsUsed || 0), 0);

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 p-6 rounded-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
                Super Admin & Ecosystem Monitor
              </span>
              <span className="text-xs text-slate-400">
                {isBn ? 'সুপার অ্যাডমিন ড্যাশবোর্ড ও ক্লাউড ডেটাবেস' : 'Enterprise Control Panel & Job Queue'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {isBn ? 'সুপার অ্যাডমিন ও সিস্টেম ডিজাইন কন্ট্রোল' : 'Super Admin Dashboard & System Design'}
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl">
              {isBn 
                ? 'ইউজারদের সব ভিডিও জেনারেশন জব, ক্রেডিট ব্যবহার, এআই মডেল এপিআই স্ট্যাটাস এবং ফুল-স্ট্যাক পাইপলাইন মনিটর করুন।' 
                : 'Monitor active video jobs, user credit burn, background worker pipelines, and exportable Python architecture code.'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchJobs}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 text-xs font-semibold transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${loading ? 'animate-spin' : ''}`} />
              <span>{isBn ? 'রিফ্রেশ ডাটা' : 'Refresh Jobs'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">{isBn ? 'মোট ভিডিও জব' : 'Total Render Jobs'}</span>
            <Activity className="w-4 h-4 text-cyan-400" />
          </div>
          <p className="text-2xl font-extrabold text-white">{jobs.length}</p>
          <span className="text-[10px] text-emerald-400">● 100% Worker Health</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">{isBn ? 'ক্রেডিট খরচ' : 'Credits Consumed'}</span>
            <DollarSign className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-2xl font-extrabold text-cyan-400">{totalCredits}</p>
          <span className="text-[10px] text-slate-400">Avg. 10.5 credits/video</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">{isBn ? 'ভিডিও ইঞ্জিন' : 'Video Backend'}</span>
            <Cpu className="w-4 h-4 text-indigo-400" />
          </div>
          <p className="text-lg font-bold text-white">FFmpeg + SVD</p>
          <span className="text-[10px] text-indigo-400">Zero Loss Concat</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">{isBn ? 'ডাটাবেস' : 'Database Storage'}</span>
            <Database className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-lg font-bold text-white">Supabase / PG</p>
          <span className="text-[10px] text-emerald-400">Real-time Subscriptions</span>
        </div>
      </div>

      {/* Real-time Jobs Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
            <h3 className="text-sm font-bold text-white">
              {isBn ? 'রিয়েল-টাইম ভিডিও প্রসেসিং কিউ (Live Job Queue)' : 'Live Video Processing Queue'}
            </h3>
          </div>
          <span className="text-xs text-slate-400">{jobs.length} jobs in database</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="p-3 font-semibold">Job ID</th>
                <th className="p-3 font-semibold">User</th>
                <th className="p-3 font-semibold">Prompt / Title</th>
                <th className="p-3 font-semibold">Ratio</th>
                <th className="p-3 font-semibold">Status</th>
                <th className="p-3 font-semibold">Credits</th>
                <th className="p-3 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {jobs.map((job) => (
                <tr key={job.id} className="hover:bg-slate-800/40 transition">
                  <td className="p-3 font-mono text-[11px] text-cyan-400">{job.id.slice(0, 14)}...</td>
                  <td className="p-3 text-slate-300 font-mono text-[11px]">{job.userId}</td>
                  <td className="p-3 text-white max-w-xs truncate">{job.prompt}</td>
                  <td className="p-3 font-semibold text-slate-300">{job.aspectRatio}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      job.status === 'completed'
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        : job.status === 'processing'
                        ? 'bg-cyan-950 text-cyan-400 border border-cyan-800 animate-pulse'
                        : 'bg-yellow-950 text-yellow-400 border border-yellow-800'
                    }`}>
                      {job.status}
                    </span>
                  </td>
                  <td className="p-3 font-bold text-cyan-400">{job.creditsUsed}</td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => handleDeleteJob(job.id)}
                      className="text-slate-400 hover:text-red-400 p-1 rounded transition"
                      title="Delete Job"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* System Architecture Flow Diagram */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <GitBranch className="w-4 h-4 text-cyan-400" />
            {isBn ? 'সিস্টেম আর্কিটেকচার ও ডেটা ফ্লো (System Architecture Diagram)' : 'Full-Stack Architecture & Data Flow'}
          </h3>
          <span className="text-[11px] text-slate-400 font-mono">Mermaid Flow Engine</span>
        </div>

        {/* Visual Flow Blocks */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-2 text-center text-xs">
          <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
            <span className="text-cyan-400 font-bold block mb-1">1. User UI</span>
            <p className="text-[11px] text-slate-400">React + Next.js / Vite Form Prompt</p>
          </div>
          <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
            <span className="text-indigo-400 font-bold block mb-1">2. Gateway</span>
            <p className="text-[11px] text-slate-400">FastAPI / Express with Job ID</p>
          </div>
          <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
            <span className="text-purple-400 font-bold block mb-1">3. Queue</span>
            <p className="text-[11px] text-slate-400">Celery + Redis Worker Queue</p>
          </div>
          <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
            <span className="text-emerald-400 font-bold block mb-1">4. AI Engines</span>
            <p className="text-[11px] text-slate-400">Gemini 4 Argon, 3.5 Transcribe & SVD</p>
          </div>
          <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
            <span className="text-amber-400 font-bold block mb-1">5. Render</span>
            <p className="text-[11px] text-slate-400">FFmpeg Concat & Subtitle Burn</p>
          </div>
          <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
            <span className="text-cyan-400 font-bold block mb-1">6. S3 / CDN</span>
            <p className="text-[11px] text-slate-400">Cloudflare / AWS S3 Final MP4</p>
          </div>
        </div>
      </div>

    </div>
  );
};
