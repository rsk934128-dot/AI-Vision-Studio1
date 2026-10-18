import React, { useState } from 'react';
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
  RefreshCw
} from 'lucide-react';
import { Language } from '../types';

interface VideoToVideoProps {
  lang: Language;
}

const CONTROLNET_MODELS = [
  { id: 'canny', name: 'ControlNet Canny Edge', descBn: 'ভিডিওর রূপরেখা ও অবজেক্টের সীমানা ধরে রাখে', descEn: 'Maintains object outlines and hard edges' },
  { id: 'openpose', name: 'ControlNet OpenPose', descBn: 'মানুষের শারীরিক অঙ্গভঙ্গি ও নাচ হুবহু কপি করে', descEn: 'Transfers human body poses, gestures, and dance' },
  { id: 'tile', name: 'ControlNet Tile / Blur', descBn: 'ধারাবাহিকতা (Consistency) বজায় রেখে স্টাইল দেয়', descEn: 'Ensures temporal consistency across frames' },
  { id: 'depth', name: 'ControlNet Depth Midas', descBn: 'ত্রিমাত্রিক গভীরতা ও ক্যামেরার দৃষ্টিকোণ রক্ষা করে', descEn: 'Preserves 3D spatial depth and parallax' },
];

export const VideoToVideo: React.FC<VideoToVideoProps> = ({ lang }) => {
  const isBn = lang === 'bn';

  const [prompt, setPrompt] = useState<string>('Cyberpunk cyborg warrior with glowing neon cyan circuitry and dark reflective armor');
  const [selectedControlNet, setSelectedControlNet] = useState<string>('openpose');
  const [denoisingStrength, setDenoisingStrength] = useState<number>(0.45);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [activePreset, setActivePreset] = useState<number>(0);

  const presets = [
    {
      titleBn: 'সাইবারপাঙ্ক নিয়ন স্টাইল',
      titleEn: 'Cyberpunk Neon Glow',
      prompt: 'Cyberpunk anime protagonist, bioluminescent cyan lighting, reflections, high detail',
      beforeVideo: '/videos/sample1.mp4',
      afterVideo: '/videos/shorts_9_16.mp4',
      beforeThumb: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=400&auto=format&fit=crop&q=80',
      afterThumb: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=400&auto=format&fit=crop&q=80',
    },
    {
      titleBn: 'ক্লে-মডেল অ্যানিমেশন',
      titleEn: 'Claymation Stop-Motion Art',
      prompt: 'Claymation stop-motion texture, plasticine handmade characters, warm studio lighting',
      beforeVideo: '/videos/sample2.mp4',
      afterVideo: '/videos/sample3.mp4',
      beforeThumb: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=400&auto=format&fit=crop&q=80',
      afterThumb: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=400&auto=format&fit=crop&q=80',
    }
  ];

  const handleRunTransfer = () => {
    setIsProcessing(true);
    setProgress(10);

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsProcessing(false);
          return 100;
        }
        return prev + 15;
      });
    }, 400);
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 p-6 rounded-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-950 text-indigo-300 border border-indigo-800">
                ControlNet + AnimateDiff Engine
              </span>
              <span className="text-xs text-slate-400">
                {isBn ? 'ভিডিও-টু-ভিডিও স্টাইল সিন্থেসিস' : 'Video-to-Video Temporal Style Transfer'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {isBn ? 'ভিডিও-টু-ভিডিও স্টাইল রূপান্তর ও কন্ট্রোল-নেট' : 'Video-to-Video AI Style Transfer'}
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl">
              {isBn 
                ? 'একটি আসল ভিডিওকে এআই দিয়ে নতুন কোনো শৈলীতে (যেমন: সাইবারপাঙ্ক, অ্যানিমে বা ক্লেমেশন) রূপান্তর করুন। কন্ট্রোলনেট ফ্রেমের অঙ্গভঙ্গি হুবহু অক্ষত রাখে।' 
                : 'Transform existing video footage into futuristic styles while keeping motion, human poses, and camera parallax intact via ControlNet.'}
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Settings & ControlNet Selector (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                {isBn ? 'নতুন স্টাইল প্রম্পট (Style Target):' : 'Target Visual Style Prompt:'}
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={3}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-cyan-500 transition resize-none"
              />
            </div>

            {/* ControlNet Model Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-2">
                {isBn ? 'কন্ট্রোল-নেট প্রসেসর (ControlNet Backbone):' : 'ControlNet Guidance Model:'}
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
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 transition disabled:opacity-50"
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
        </div>

        {/* Right: Side-by-Side Before vs After Comparison (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-cyan-400" />
                {isBn ? 'আসল ভিডিও বনাম এআই স্টাইল ট্রান্সফার' : 'Source Video vs AI Transferred Style'}
              </h3>
              <div className="flex gap-2">
                {presets.map((p, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setActivePreset(i);
                      setPrompt(p.prompt);
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                      activePreset === i
                        ? 'bg-cyan-600 text-white'
                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                    }`}
                  >
                    {isBn ? p.titleBn : p.titleEn}
                  </button>
                ))}
              </div>
            </div>

            {/* Side-by-Side Dual Player Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Before Source */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-300">
                  <span className="font-semibold text-slate-400">{isBn ? 'আসল ইনপুট ভিডিও' : 'Original Video'}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400">Raw Input</span>
                </div>
                <div className="relative rounded-xl overflow-hidden bg-black aspect-video border border-slate-800">
                  <video 
                    src={presets[activePreset].beforeVideo} 
                    controls 
                    loop 
                    className="w-full h-full object-cover" 
                  />
                </div>
              </div>

              {/* After AI ControlNet Result */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-300">
                  <span className="font-semibold text-cyan-400">{isBn ? 'এআই জেনারেটেড স্টাইল' : 'AI ControlNet Result'}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 font-bold">
                    Consistent 60FPS
                  </span>
                </div>
                <div className="relative rounded-xl overflow-hidden bg-black aspect-video border border-cyan-500/50 shadow-lg shadow-cyan-950">
                  <video 
                    src={presets[activePreset].afterVideo} 
                    controls 
                    loop 
                    className="w-full h-full object-cover" 
                  />
                </div>
              </div>

            </div>

            {/* Technical Explanation Accordion */}
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
              <span className="text-xs font-bold text-cyan-400 flex items-center gap-1.5 uppercase tracking-wider">
                <Cpu className="w-3.5 h-3.5" />
                {isBn ? 'কিভাবে কাজ করে এই প্রযুক্তি? (Architecture)' : 'How Video-to-Video Works Under the Hood'}
              </span>
              <p className="text-xs text-slate-300 leading-relaxed">
                {isBn 
                  ? '১. FFmpeg প্রতিটি ভিডিও ফ্রেমকে এক্সট্রাক্ট করে -> ২. ControlNet প্রতিটি ফ্রেমে মানুষের পোজ ও প্রান্তরেখা ডিটেক্ট করে -> ৩. Stable Diffusion নতুন স্টাইল আঁকে -> ৪. ফ্রেমগুলো একসাথে রেন্ডার হয়।' 
                  : '1. FFmpeg extracts raw frames -> 2. ControlNet OpenPose/Canny detects structural skeleton -> 3. AnimateDiff synthesizes stylized frames -> 4. FFmpeg stitches them into a synchronized MP4.'}
              </p>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
