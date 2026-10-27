import React, { useState, useRef } from 'react';
import { 
  Layers, 
  Upload, 
  Sparkles, 
  Sliders, 
  Play, 
  ArrowRight, 
  Repeat, 
  CheckCircle2, 
  Cpu,
  RefreshCw,
  Film,
  Download,
  Youtube,
  Subtitles,
  FileVideo,
  Check,
  History
} from 'lucide-react';
import { Language, StudioTab, VideoJob } from '../types';
import { VideoPreviewPlayer } from './VideoPreviewPlayer';
import { YouTubeUploadModal } from './YouTubeUploadModal';
import { useToast } from '../context/ToastContext';
import { saveJobToFirestore } from '../services/firebase';

interface VideoToVideoProps {
  lang: Language;
  onNavigateTab?: (tab: StudioTab) => void;
}

const CONTROLNET_MODELS = [
  { id: 'canny', name: 'ControlNet Canny Edge', descBn: 'ভিডিওর রূপরেখা ও অবজেক্টের সীমানা ধরে রাখে', descEn: 'Maintains object outlines and hard edges' },
  { id: 'openpose', name: 'ControlNet OpenPose', descBn: 'মানুষের শারীরিক অঙ্গভঙ্গি ও নাচ হুবহু কপি করে', descEn: 'Transfers human body poses, gestures, and dance' },
  { id: 'tile', name: 'ControlNet Tile / Blur', descBn: 'ধারাবাহিকতা (Consistency) বজায় রেখে স্টাইল দেয়', descEn: 'Ensures temporal consistency across frames' },
  { id: 'depth', name: 'ControlNet Depth Midas', descBn: 'ত্রিমাত্রিক গভীরতা ও ক্যামেরার দৃষ্টিকোণ রক্ষা করে', descEn: 'Preserves 3D spatial depth and parallax' },
];

export const VideoToVideo: React.FC<VideoToVideoProps> = ({ lang, onNavigateTab }) => {
  const isBn = lang === 'bn';
  const { notifySuccess, notifyError, notifyInfo } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [prompt, setPrompt] = useState<string>('Cyberpunk cyborg warrior with glowing neon cyan circuitry and dark reflective armor');
  const [selectedControlNet, setSelectedControlNet] = useState<string>('openpose');
  const [denoisingStrength, setDenoisingStrength] = useState<number>(0.45);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [activePreset, setActivePreset] = useState<number>(0);
  const [customVideoUrl, setCustomVideoUrl] = useState<string | null>(null);
  const [customVideoName, setCustomVideoName] = useState<string | null>(null);
  const [isFinalizing, setIsFinalizing] = useState<boolean>(false);
  const [showYouTubeModal, setShowYouTubeModal] = useState<boolean>(false);
  const [completedJob, setCompletedJob] = useState<VideoJob | null>(null);

  const presets = [
    {
      titleBn: 'সাইবারপাঙ্ক নিয়ন স্টাইল',
      titleEn: 'Cyberpunk Neon Glow',
      prompt: 'Cyberpunk anime protagonist, bioluminescent cyan lighting, reflections, high detail',
      beforeVideo: '/videos/sample1.mp4',
      afterVideo: '/videos/shorts_9_16.mp4',
    },
    {
      titleBn: 'ক্লে-মডেল অ্যানিমেশন',
      titleEn: 'Claymation Stop-Motion Art',
      prompt: 'Claymation stop-motion texture, plasticine handmade characters, warm studio lighting',
      beforeVideo: '/videos/sample2.mp4',
      afterVideo: '/videos/sample3.mp4',
    },
    {
      titleBn: 'অ্যানিমে ফিউশন আর্ট',
      titleEn: 'Anime Ghibli Fusion',
      prompt: 'Studio Ghibli aesthetic, hand-drawn anime cel shaded, vibrant watercolor landscapes',
      beforeVideo: '/videos/sample3.mp4',
      afterVideo: '/videos/sample1.mp4',
    }
  ];

  // Active video sources
  const currentSourceVideo = customVideoUrl || presets[activePreset].beforeVideo;
  const currentStylizedVideo = presets[activePreset].afterVideo;

  // Handle custom video upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setCustomVideoUrl(url);
      setCustomVideoName(file.name);
      notifySuccess(
        'Source Video Uploaded',
        `Loaded "${file.name}" for style transfer.`,
        'ভিডিও আপলোড সম্পন্ন',
        `স্টাইল রূপান্তরের জন্য "${file.name}" যুক্ত করা হয়েছে।`
      );
    }
  };

  // Run style transfer simulation
  const handleRunTransfer = () => {
    setIsProcessing(true);
    setProgress(10);
    notifyInfo(
      'Style Transfer Active',
      `Synthesizing frames with ${selectedControlNet.toUpperCase()}...`,
      'স্টাইল রূপান্তর চলছে',
      `${selectedControlNet.toUpperCase()} কন্ট্রোল-নেট ফ্রেম সিন্থেসিস শুরু হয়েছে...`
    );

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsProcessing(false);
          notifySuccess(
            'Transfer Complete ✨',
            'Watch the comparison in the Video Preview Player before finalizing.',
            'রূপান্তর সম্পন্ন ✨',
            'ভিডিও প্রিভিউ প্লেয়ারে ক্লিপটি যাচাই করে চূড়ান্ত করুন।'
          );
          return 100;
        }
        return prev + 15;
      });
    }, 450);
  };

  // Finalize stylized video clip
  const handleFinalizeVideo = async () => {
    setIsFinalizing(true);
    try {
      const selectedModelObj = CONTROLNET_MODELS.find(m => m.id === selectedControlNet);
      const job: VideoJob = {
        id: `v2v-${Date.now()}`,
        userId: 'sf0745026@gmail.com',
        prompt,
        style: selectedModelObj ? selectedModelObj.name : 'ControlNet Style Transfer',
        aspectRatio: '16:9',
        status: 'completed',
        progress: 100,
        duration: 15,
        resolution: '1080p (FHD 60FPS)',
        videoUrl: currentStylizedVideo,
        category: 'video-to-video',
        creditsUsed: 15,
        createdAt: new Date().toISOString(),
        ffmpegLogs: [
          `[ControlNet] Applied ${selectedControlNet} with denoise ${denoisingStrength}`,
          `[AnimateDiff] Temporal consistency score: 0.98`,
          `[FFmpeg] Rendered 60FPS H.264 video successfully`
        ]
      };

      setCompletedJob(job);
      await saveJobToFirestore(job);

      notifySuccess(
        'Video Finalized & Saved 🎉',
        'Video saved to Project History. Ready to download or publish.',
        'ভিডিও চূড়ান্ত ও সংরক্ষণ সম্পন্ন 🎉',
        'ভিডিওটি সফলভাবে প্রজেক্ট হিস্ট্রিতে সংরক্ষিত হয়েছে। এখনই ডাউনলোড বা শেয়ার করতে পারেন।'
      );
    } catch (err: any) {
      console.warn('Finalize save error:', err);
    } finally {
      setIsFinalizing(false);
    }
  };

  // Download stylized clip
  const handleDownloadStylized = (url?: string) => {
    const target = url || currentStylizedVideo;
    const a = document.createElement('a');
    a.href = target;
    a.download = `stylized-${selectedControlNet}-${Date.now()}.mp4`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    notifySuccess(
      'Download Started',
      'Downloading finalized stylized clip.',
      'ডাউনলোড শুরু হয়েছে',
      'চূড়ান্ত ভিডিও ক্লিপটি ডাউনলোড হচ্ছে।'
    );
  };

  return (
    <div className="space-y-8 animate-fadeIn text-slate-100">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 p-6 rounded-3xl relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-950 text-indigo-300 border border-indigo-800">
                ControlNet + AnimateDiff Engine
              </span>
              <span className="text-xs text-slate-400">
                {isBn ? 'ভিডিও-টু-ভিডিও স্টাইল সিন্থেসিস ও ক্লিপ প্রিভিউ' : 'Video-to-Video Temporal Style Transfer & Preview'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {isBn ? 'ভিডিও-টু-ভিডিও স্টাইল রূপান্তর ও ক্লিপ প্রিভিউ' : 'Video-to-Video AI Style Transfer & Preview Player'}
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl">
              {isBn 
                ? 'আসল ভিডিওর অঙ্গভঙ্গি অক্ষত রেখে এআই স্টাইলে রূপান্তর করুন। স্প্লিট স্লাইডার প্লেয়ারের মাধ্যমে ফাইনাল করার আগে আসল ও জেনারেটেড ক্লিপটি পর্যবেক্ষণ করুন।' 
                : 'Transform existing video footage into futuristic styles while keeping motion intact. Watch and compare the synthesized clip in the interactive Preview Player before finalizing.'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {completedJob && onNavigateTab && (
              <button
                onClick={() => onNavigateTab('project-history')}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition cursor-pointer"
              >
                <History className="w-3.5 h-3.5 text-indigo-400" />
                <span>{isBn ? 'প্রজেক্ট হিস্ট্রি' : 'Project History'}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Grid: Left Controls (5 cols) / Right Interactive Preview Player (7 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Input, Settings & ControlNet Selector */}
        <div className="lg:col-span-5 space-y-5">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
            
            {/* Source Video Selection / Upload */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-slate-300">
                  {isBn ? '১. সোর্স ভিডিও ইনপুট:' : '1. Input Source Video:'}
                </label>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
                >
                  <Upload className="w-3 h-3" />
                  <span>{isBn ? 'নিজের ভিডিও আপলোড' : 'Upload MP4'}</span>
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="video/mp4,video/webm,video/quicktime"
                  className="hidden"
                />
              </div>

              {customVideoName ? (
                <div className="p-2.5 rounded-xl bg-cyan-950/40 border border-cyan-800/80 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-cyan-300 truncate">
                    <FileVideo className="w-4 h-4 shrink-0" />
                    <span className="truncate font-semibold">{customVideoName}</span>
                  </div>
                  <button
                    onClick={() => {
                      setCustomVideoUrl(null);
                      setCustomVideoName(null);
                    }}
                    className="text-[11px] text-slate-400 hover:text-red-400 transition"
                  >
                    {isBn ? 'রিমুভ' : 'Remove'}
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {presets.map((p, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setActivePreset(i);
                        setPrompt(p.prompt);
                      }}
                      className={`p-2 rounded-xl text-xs font-semibold border text-left transition cursor-pointer truncate ${
                        activePreset === i && !customVideoUrl
                          ? 'bg-cyan-950/70 border-cyan-500 text-white'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800'
                      }`}
                    >
                      <span className="block truncate font-bold">{isBn ? p.titleBn : p.titleEn}</span>
                      <span className="text-[10px] text-slate-500">Preset {i + 1}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Target Style Prompt */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                {isBn ? '২. নতুন স্টাইল প্রম্পট (Style Target):' : '2. Target Visual Style Prompt:'}
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={3}
                placeholder="Describe desired aesthetic, lighting, art style..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs sm:text-sm text-white focus:outline-none focus:border-cyan-500 transition resize-none"
              />
            </div>

            {/* ControlNet Model Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-2">
                {isBn ? '৩. কন্ট্রোল-নেট প্রসেসর (ControlNet Backbone):' : '3. ControlNet Guidance Model:'}
              </label>
              <div className="space-y-2">
                {CONTROLNET_MODELS.map((cn) => {
                  const isSelected = selectedControlNet === cn.id;
                  return (
                    <div
                      key={cn.id}
                      onClick={() => setSelectedControlNet(cn.id)}
                      className={`p-2.5 rounded-xl border cursor-pointer transition ${
                        isSelected
                          ? 'bg-cyan-950/60 border-cyan-500'
                          : 'bg-slate-800/40 border-slate-700/60 hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white">{cn.name}</span>
                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {isBn ? cn.descBn : cn.descEn}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Denoising Strength Slider */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-bold text-slate-300 flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                  {isBn ? 'ডিনয়েজিং শক্তি (Denoising Strength):' : 'Denoising Strength (Style Delta):'}
                </span>
                <span className="font-mono text-cyan-400 font-bold">{denoisingStrength}</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="0.85"
                step="0.05"
                value={denoisingStrength}
                onChange={(e) => setDenoisingStrength(parseFloat(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                <span>0.1 (Subtle Filter)</span>
                <span>0.45 (Optimal Balance)</span>
                <span>0.85 (Extreme Transformation)</span>
              </div>
            </div>

            {/* Run Button */}
            <button
              onClick={handleRunTransfer}
              disabled={isProcessing}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 transition disabled:opacity-50 cursor-pointer"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>{isBn ? `ফ্রেম রেন্ডার হচ্ছে... ${progress}%` : `Transferring Frames... ${progress}%`}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>{isBn ? 'ভিডিও-টু-ভিডিও রূপান্তর শুরু করুন' : 'Render Video-to-Video Transfer'}</span>
                </>
              )}
            </button>

          </div>

          {/* Technical Info Box */}
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-3xl space-y-2">
            <span className="text-xs font-bold text-cyan-400 flex items-center gap-1.5 uppercase tracking-wider">
              <Cpu className="w-3.5 h-3.5" />
              {isBn ? 'কন্ট্রোলনেট ও ফ্রেম পাইপলাইন' : 'ControlNet & Frame Pipeline'}
            </span>
            <p className="text-xs text-slate-400 leading-relaxed">
              {isBn 
                ? 'কন্ট্রোলনেট প্রতিটি ফ্রেমের পোজ ও ডেপথ এক্সট্রাক্ট করে এআই জেনারেটরে পাঠায়, যার ফলে আসল ভিডিওর মোশন ও অঙ্গভঙ্গি হুবহু বজায় থাকে।' 
                : 'ControlNet extracts spatial skeletons from each frame and guides the diffusion model to preserve camera parallax and human movements.'}
            </p>
          </div>
        </div>

        {/* Right: Interactive Video Preview Player Component */}
        <div className="lg:col-span-7 space-y-5">
          <VideoPreviewPlayer
            mode="video-to-video"
            lang={lang}
            sourceVideoUrl={currentSourceVideo}
            stylizedVideoUrl={currentStylizedVideo}
            modelName={CONTROLNET_MODELS.find(m => m.id === selectedControlNet)?.name}
            denoisingStrength={denoisingStrength}
            onFinalize={handleFinalizeVideo}
            isFinalizing={isFinalizing}
            onDownloadPreview={handleDownloadStylized}
            onPublishToYouTube={() => setShowYouTubeModal(true)}
            onSendToSubtitles={() => {
              if (onNavigateTab) onNavigateTab('subtitles');
            }}
          />
        </div>

      </div>

      {/* YouTube Upload Modal */}
      {showYouTubeModal && (
        <YouTubeUploadModal
          isOpen={showYouTubeModal}
          onClose={() => setShowYouTubeModal(false)}
          lang={lang}
          initialTitle={`AI Video-to-Video: ${prompt.slice(0, 50)}`}
          initialDescription={`${prompt}\n\nGenerated with AI Video Studio (ControlNet + AnimateDiff).\n#AIVideo #ControlNet #Shorts`}
          initialTags={['AIVideo', 'ControlNet', 'Animation', 'AIStudio']}
          videoUrl={currentStylizedVideo}
        />
      )}
    </div>
  );
};
