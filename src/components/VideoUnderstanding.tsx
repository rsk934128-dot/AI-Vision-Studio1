import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, 
  Upload, 
  Play, 
  Sparkles, 
  Clock, 
  Eye, 
  ListOrdered, 
  TrendingUp, 
  Copy, 
  Check, 
  Film,
  Camera,
  AlertCircle,
  FileVideo,
  Cpu,
  Sliders
} from 'lucide-react';
import { Language, VideoUnderstandingMetadata } from '../types';
import { VideoMetadataSidebar } from './VideoMetadataSidebar';

interface VideoUnderstandingProps {
  lang: Language;
}


interface SampleVideo {
  titleBn: string;
  titleEn: string;
  category: string;
  duration: string;
  url: string;
  thumbnail: string;
  defaultPrompt: string;
}

const SAMPLE_VIDEOS: SampleVideo[] = [
  {
    titleBn: 'মঙ্গল গ্রহে মানব উপনিবেশ ও রোভার অভিযান',
    titleEn: 'Mars Colonization & Autonomous Rover',
    category: 'Sci-Fi / Space',
    duration: '0:15',
    url: '/videos/sample1.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?w=600&auto=format&fit=crop&q=80',
    defaultPrompt: 'Analyze the landscape, rover movements, atmospheric lighting, and assess YouTube viral potential.'
  },
  {
    titleBn: '২০৯৯ সালের সাইবারপাঙ্ক নিয়ন মেগাসিটি',
    titleEn: 'Cyberpunk Neon Megacity 2099',
    category: 'Futuristic 3D',
    duration: '0:12',
    url: '/videos/shorts_9_16.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=80',
    defaultPrompt: 'Examine lighting dynamics, flying vehicles, architectural scale, and pacing for a sci-fi trailer.'
  },
  {
    titleBn: 'প্রকৃতি ও বন্যপ্রাণীর আল্ট্রা-এইচডি ড্রোন শট',
    titleEn: 'Cinematic Wildlife & Nature Drone Flight',
    category: 'Documentary',
    duration: '0:20',
    url: '/videos/sample2.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=600&auto=format&fit=crop&q=80',
    defaultPrompt: 'Break down camera framing, natural lighting transitions, and generate optimized YouTube video titles.'
  }
];

export const VideoUnderstanding: React.FC<VideoUnderstandingProps> = ({ lang }) => {
  const isBn = lang === 'bn';

  const [selectedModel, setSelectedModel] = useState<'gemini-3.8-flash' | 'gemini-4-argon'>('gemini-4-argon');
  const [modelUsed, setModelUsed] = useState<string>('gemini-4-argon');
  const [selectedVideoUrl, setSelectedVideoUrl] = useState<string>(SAMPLE_VIDEOS[0].url);
  const [videoTitle, setVideoTitle] = useState<string>(SAMPLE_VIDEOS[0].titleEn);
  const [userPrompt, setUserPrompt] = useState<string>(SAMPLE_VIDEOS[0].defaultPrompt);
  const [loading, setLoading] = useState<boolean>(false);
  const [metadataLoading, setMetadataLoading] = useState<boolean>(false);
  const [metadata, setMetadata] = useState<VideoUnderstandingMetadata | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [activePreset, setActivePreset] = useState<string>('all');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Fetch structured metadata powered by Gemini 4 Argon
  const fetchMetadata = async (title = videoTitle, prompt = userPrompt) => {
    setMetadataLoading(true);
    try {
      const res = await fetch('/api/video-metadata', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          videoTitle: title,
          prompt,
          model: 'gemini-4-argon',
        }),
      });
      const data = await res.json();
      if (data.success && data.metadata) {
        setMetadata(data.metadata);
      }
    } catch (_err) {
      console.warn('Failed to load video metadata');
    } finally {
      setMetadataLoading(false);
    }
  };

  useEffect(() => {
    fetchMetadata(SAMPLE_VIDEOS[0].titleEn, SAMPLE_VIDEOS[0].defaultPrompt);
  }, []);

  const quickPresets = [
    {
      id: 'all',
      labelBn: 'সম্পূর্ণ বিশ্লেষণ (Full Report)',
      labelEn: 'Complete Executive Report',
      prompt: 'Extract key information, summarize core content, analyze scene-by-scene timeline, and provide YouTube SEO optimization.'
    },
    {
      id: 'timeline',
      labelBn: 'টাইমলাইন ও দৃশ্য বিন্যাস',
      labelEn: 'Scene-by-Scene Timeline',
      prompt: 'Provide a precise timeline of every visual transition, action change, and object movement with estimated timestamps.'
    },
    {
      id: 'youtube',
      labelBn: 'ইউটিউব টাইটেল ও ভাইরাল হুক',
      labelEn: 'YouTube Titles & Viral Hooks',
      prompt: 'Suggest 5 ultra high-CTR viral YouTube titles, the opening 3-second hook, and 10 algorithmic search tags based on this video.'
    },
    {
      id: 'cinematography',
      labelBn: 'ক্যামেরা ও লাইটিং বিশ্লেষণ',
      labelEn: 'Cinematography & Visuals',
      prompt: 'Analyze visual aesthetics: camera angles, drone motion, color palette, lighting temperature, and visual mood.'
    }
  ];

  const handleSelectSample = (sample: SampleVideo) => {
    setSelectedVideoUrl(sample.url);
    const title = isBn ? sample.titleBn : sample.titleEn;
    setVideoTitle(title);
    setUserPrompt(sample.defaultPrompt);
    setAnalysisResult(null);
    setErrorMsg(null);
    fetchMetadata(title, sample.defaultPrompt);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      setErrorMsg(isBn ? 'অনুগ্রহ করে একটি সঠিক ভিডিও ফাইল নির্বাচন করুন।' : 'Please select a valid video file.');
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setSelectedVideoUrl(objectUrl);
    setVideoTitle(file.name);
    setAnalysisResult(null);
    setErrorMsg(null);
    fetchMetadata(file.name, userPrompt);
  };

  const handleSeek = (seconds: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = seconds;
      videoRef.current.play().catch(() => {});
    }
  };

  const handleAnalyze = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/analyze-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: selectedModel,
          videoTitle,
          prompt: userPrompt,
          question: userPrompt,
          mimeType: 'video/mp4'
        }),
      });

      const data = await res.json();
      if (data.analysis) {
        setAnalysisResult(data.analysis);
        if (data.modelUsed) {
          setModelUsed(data.modelUsed);
        }
        if (data.metadata) {
          setMetadata(data.metadata);
        }
      } else if (!res.ok || !data.success) {
        setErrorMsg(data.error || 'Failed to analyze video');
      }
    } catch (_err: any) {
      setErrorMsg('Could not complete video analysis. Please check network connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (analysisResult) {
      navigator.clipboard.writeText(analysisResult);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };


  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 p-6 rounded-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
                Gemini 4 Argon Engine
              </span>
              <span className="text-xs text-slate-400">
                {isBn ? 'মাল্টিমোডাল ভিডিও আন্ডারস্ট্যান্ডিং' : 'Advanced Video Intelligence & Scene Parsing'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {isBn ? 'ভিডিও বিশ্লেষণ ও কী-ইনফরমেশন এক্সট্র্যাক্টর' : 'Analyze Video Content with Gemini 4 Argon'}
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl">
              {isBn 
                ? 'ভিডিও আপলোড করুন বা স্যাম্পল ভিডিও সিলেক্ট করে জেমিনি ৪ আর্গনের সাহায্যে ভিডিওর বিষয়বস্তু, দৃশ্যভিত্তিক টাইমলাইন ও এসইও ট্যাগ বিশ্লেষণ করুন।' 
                : 'Extract actionable intelligence, scene-by-scene timelines, visual aesthetics, and YouTube optimization using the flagship Gemini 4 Argon model.'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition border ${
                isSidebarOpen
                  ? 'bg-purple-950 text-purple-300 border-purple-700 shadow-lg shadow-purple-950/40'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
              }`}
            >
              <Sliders className="w-4 h-4 text-purple-400" />
              <span>{isBn ? 'মেটাডাটা সাইডবার' : 'Metadata Sidebar'}</span>
              {metadata && (
                <span className="px-1.5 py-0.2 rounded-full bg-purple-900 text-purple-200 text-[10px] font-mono">
                  {metadata.detectedObjects.length} Objs
                </span>
              )}
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 text-xs font-semibold transition"
            >
              <Upload className="w-4 h-4 text-cyan-400" />
              {isBn ? 'নতুন ভিডিও আপলোড' : 'Upload Video File'}
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileUpload} 
              accept="video/*" 
              className="hidden" 
            />
          </div>
        </div>
      </div>

      {/* Main Container with Metadata Sidebar */}
      <div className="flex flex-col lg:flex-row items-start gap-6">
        
        {/* Left & Center Main Content Area */}
        <div className="flex-1 w-full space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left Column: Video Preview & Sample Selector (5 cols) */}
            <div className="lg:col-span-5 space-y-5">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <Film className="w-3.5 h-3.5 text-cyan-400" />
                    {videoTitle}
                  </span>
                  <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded">
                    Preview Player
                  </span>
                </div>

                {/* Video Player Box with time tracking */}
                <div className="relative rounded-xl overflow-hidden bg-black aspect-video border border-slate-800 group shadow-inner">
                  <video
                    ref={videoRef}
                    src={selectedVideoUrl}
                    controls
                    playsInline
                    onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
                    className="w-full h-full object-contain"
                  />
                </div>


            {/* Video Info Badges */}
            <div className="grid grid-cols-3 gap-2 mt-4 text-center">
              <div className="bg-slate-800/60 p-2 rounded-lg border border-slate-700/50">
                <p className="text-[10px] text-slate-400">{isBn ? 'রেজোলিউশন' : 'Resolution'}</p>
                <p className="text-xs font-bold text-white">1080p Full HD</p>
              </div>
              <div className="bg-slate-800/60 p-2 rounded-lg border border-slate-700/50">
                <p className="text-[10px] text-slate-400">{isBn ? 'মডেল' : 'AI Model'}</p>
                <p className="text-xs font-bold text-cyan-400">Gemini 4 Argon</p>
              </div>
              <div className="bg-slate-800/60 p-2 rounded-lg border border-slate-700/50">
                <p className="text-[10px] text-slate-400">{isBn ? 'প্রসেসিং' : 'Latency'}</p>
                <p className="text-xs font-bold text-emerald-400">Deep Reasoning</p>
              </div>
            </div>
          </div>

          {/* Sample Videos Selector */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
            <h3 className="text-xs font-bold text-slate-300 mb-3 flex items-center gap-1.5 uppercase tracking-wider">
              <Eye className="w-3.5 h-3.5 text-indigo-400" />
              {isBn ? 'টেস্ট করার জন্য স্যাম্পল ভিডিও' : 'Select Sample Video to Test'}
            </h3>
            <div className="space-y-2.5">
              {SAMPLE_VIDEOS.map((sample, idx) => {
                const isSelected = selectedVideoUrl === sample.url;
                return (
                  <div
                    key={idx}
                    onClick={() => handleSelectSample(sample)}
                    className={`flex items-center gap-3 p-2.5 rounded-xl border cursor-pointer transition ${
                      isSelected
                        ? 'bg-cyan-950/40 border-cyan-500/80 shadow-md shadow-cyan-900/20'
                        : 'bg-slate-800/50 border-slate-700/60 hover:bg-slate-800'
                    }`}
                  >
                    <img 
                      src={sample.thumbnail} 
                      alt={sample.titleEn} 
                      className="w-16 h-12 object-cover rounded-lg shrink-0 border border-slate-700" 
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-semibold text-cyan-400">{sample.category}</span>
                        <span className="text-[10px] text-slate-400">{sample.duration}</span>
                      </div>
                      <p className="text-xs font-semibold text-white truncate">
                        {isBn ? sample.titleBn : sample.titleEn}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Prompt & Gemini 4 Argon Analysis Report (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          
          {/* Analysis Config Box */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                {isBn ? 'জেমিনি ৪ আর্গন প্রম্পট / বিশ্লেষণ ফোকাস:' : 'Gemini 4 Argon Query / Focus Area:'}
              </label>
              <textarea
                value={userPrompt}
                onChange={(e) => setUserPrompt(e.target.value)}
                rows={3}
                placeholder={isBn ? 'আপনি ভিডিওটির কোন বিষয় বিশ্লেষণ করতে চান?...' : 'What would you like Gemini 4 Argon to analyze? (e.g. key takeaways, timestamps, YouTube SEO)...'}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-cyan-500 transition resize-none"
              />
            </div>

            {/* Model Selector */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-300">
                  {isBn ? 'বিশ্লেষণ মডেল (AI Model):' : 'Analysis AI Model:'}
                </label>
                <span className="text-[10px] text-emerald-400 font-semibold">
                  {selectedModel === 'gemini-3.8-flash' ? '✓ Free Tier Active (No Paid Key Required)' : 'Pro Model'}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedModel('gemini-3.8-flash')}
                  className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
                    selectedModel === 'gemini-3.8-flash'
                      ? 'bg-cyan-950/80 border-cyan-500 text-cyan-300 shadow-md shadow-cyan-950'
                      : 'bg-slate-800/40 border-slate-700/60 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Gemini 3.8 Flash (Free)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedModel('gemini-4-argon')}
                  className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
                    selectedModel === 'gemini-4-argon'
                      ? 'bg-purple-950/80 border-purple-500 text-purple-300 shadow-md shadow-purple-950'
                      : 'bg-slate-800/40 border-slate-700/60 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  <Cpu className="w-3.5 h-3.5 text-purple-400" />
                  <span>Gemini 4 Argon (Pro)</span>
                </button>
              </div>
            </div>

            {/* Quick Presets */}
            <div>
              <p className="text-[11px] font-semibold text-slate-400 mb-2">
                {isBn ? 'দ্রুত বিশ্লেষণ প্রিসেট:' : 'Quick Analysis Presets:'}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {quickPresets.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => {
                      setActivePreset(preset.id);
                      setUserPrompt(preset.prompt);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                      activePreset === preset.id
                        ? 'bg-cyan-600 text-white'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {isBn ? preset.labelBn : preset.labelEn}
                  </button>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <button
              onClick={handleAnalyze}
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 transition disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>
                    {isBn 
                      ? `${selectedModel === 'gemini-3.8-flash' ? 'জেমিনি ৩.৮ ফ্ল্যাশ' : 'জেমিনি ৪ আর্গন'} দিয়ে বিশ্লেষণ চলছে...` 
                      : `Analyzing with ${selectedModel === 'gemini-3.8-flash' ? 'Gemini 3.8 Flash' : 'Gemini 4 Argon'}...`}
                  </span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>
                    {isBn 
                      ? `${selectedModel === 'gemini-3.8-flash' ? 'জেমিনি ৩.৮ ফ্ল্যাশ' : 'জেমিনি ৪ আর্গন'} দিয়ে বিশ্লেষণ করুন` 
                      : `Run Video Understanding (${selectedModel === 'gemini-3.8-flash' ? 'Gemini 3.8 Flash' : 'Gemini 4 Argon'})`}
                  </span>
                </>
              )}
            </button>

            {errorMsg && (
              <div className="p-3 bg-red-950/50 border border-red-800/80 rounded-xl text-xs text-red-200 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}
          </div>

          {/* Analysis Results Display */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl min-h-[360px] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  {isBn 
                    ? `বিশ্লেষণ ফলাফল (${modelUsed === 'gemini-4-argon' ? 'Gemini 4 Argon' : 'Gemini 3.8 Flash'})` 
                    : `Video Intelligence Report (${modelUsed === 'gemini-4-argon' ? 'Gemini 4 Argon' : 'Gemini 3.8 Flash'})`}
                </h3>
              </div>

              {analysisResult && (
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 transition"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? (isBn ? 'কপি হয়েছে' : 'Copied') : (isBn ? 'কপি রিপোর্ট' : 'Copy Report')}</span>
                </button>
              )}
            </div>

            {loading ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 animate-pulse">
                  <Film className="w-6 h-6" />
                </div>
                <p className="text-sm font-semibold text-white">
                  {isBn ? 'জেমিনি ৪ আর্গন ভিডিওটির ফ্রেম ও দৃশ্য স্ক্যান করছে...' : 'Gemini 4 Argon is inspecting video temporal frames & sound cues...'}
                </p>
                <p className="text-xs text-slate-400 max-w-sm">
                  {isBn 
                    ? 'গভীর নিউরাল নেটওয়ার্ক অবজেক্ট ট্র্যাকিং, কালার প্যালেট ও সোশ্যাল এসইও পোটেনশিয়াল অ্যানালাইসিস সম্পন্ন করছে।' 
                    : 'Performing deep reasoning for scene semantics, cinematographic composition, and viral reach.'}
                </p>
              </div>
            ) : analysisResult ? (
              <div className="flex-1 overflow-y-auto max-h-[500px] pr-2 text-sm text-slate-200 space-y-3 leading-relaxed whitespace-pre-wrap font-sans">
                {analysisResult}
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-500 space-y-2">
                <Search className="w-10 h-10 opacity-40 text-cyan-400" />
                <p className="text-xs font-medium text-slate-400">
                  {isBn ? 'বিশ্লেষণ শুরু করতে উপরের বাটনে ক্লিক করুন।' : 'Click the button above to run Gemini 4 Argon video intelligence.'}
                </p>
                <p className="text-[11px] text-slate-500">
                  {isBn ? 'এটি অবজেক্ট, দৃশ্য বিন্যাস, টাইমলাইন ও এসইও ট্যাগ স্বয়ংক্রিয়ভাবে বের করে দেবে।' : 'Extracts entities, actions, color palette, timestamps, and YouTube viral tags.'}
                </p>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>

    {/* Gemini 4 Argon Video Metadata Sidebar */}
    <VideoMetadataSidebar
      metadata={metadata}
      loading={metadataLoading}
      lang={lang}
      currentTime={currentTime}
      onSeek={handleSeek}
      onScanWithGeminiArgon={() => fetchMetadata(videoTitle, userPrompt)}
      isOpen={isSidebarOpen}
      onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
    />

  </div>
</div>
);
};
