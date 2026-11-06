import React, { useState } from 'react';
import { 
  Sparkles, 
  Video, 
  Film, 
  Smartphone, 
  Monitor, 
  Square, 
  Play, 
  Download, 
  Wand2, 
  Volume2, 
  Layers, 
  Clock, 
  FileText,
  AlertCircle,
  Loader2,
  Music,
  ArrowRight,
  Youtube
} from 'lucide-react';
import { Language, VideoScript, VideoJob, StudioTab } from '../types';
import { GenerativeVideoPlayer } from './GenerativeVideoPlayer';
import { VideoPreviewPlayer, PreviewClipItem } from './VideoPreviewPlayer';
import { YouTubeUploadModal } from './YouTubeUploadModal';
import { VideoRenderProgressIndicator } from './VideoRenderProgressIndicator';
import { useToast } from '../context/ToastContext';
import { safeParseResponse } from '../utils/apiClient';
import { saveJobToFirestore } from '../services/firebase';

interface TextToVideoProps {
  lang: Language;
  onJobCreated?: (job: VideoJob) => void;
  presetSrt?: string;
  onNavigateTab?: (tab: StudioTab) => void;
}


const STYLE_PRESETS = [
  { id: 'veo_cinematic', labelBn: 'গুগল ভিও ২ আল্ট্রা (Google Veo 2)', labelEn: 'Google Veo 2 Ultra', icon: '⚡' },
  { id: 'cinematic', labelBn: 'সিনেমাটিক ৮কে (Cinematic 8K)', labelEn: 'Cinematic 8K', icon: '🎬' },
  { id: 'cyberpunk', labelBn: 'সাইবারপাঙ্ক নিয়ন (Cyberpunk)', labelEn: 'Cyberpunk Neon', icon: '🌆' },
  { id: 'anime', labelBn: 'অ্যানিমে / গিবলি স্টাইল', labelEn: 'Anime / Ghibli', icon: '✨' },
  { id: 'realistic', labelBn: 'হাইপার-রিয়েলিস্টিক ৩ডি', labelEn: 'Hyper-Realistic 3D', icon: '🚀' },
  { id: 'vintage', labelBn: 'ভিন্টেজ ফিল্ম নয়ার (Vintage)', labelEn: 'Vintage Film Noir', icon: '🎞️' },
  { id: 'claymation', labelBn: 'ক্লে-অ্যানিমেশন (Claymation)', labelEn: 'Claymation Art', icon: '🎨' },
];

export const TextToVideo: React.FC<TextToVideoProps> = ({ lang, onJobCreated, presetSrt, onNavigateTab }) => {
  const isBn = lang === 'bn';
  const { notifySuccess, notifyError, notifyRenderError, notifyInfo } = useToast();

  const [prompt, setPrompt] = useState<string>(
    'ম্যানহাটনের ব্যস্ত রাজপথে দুই বন্ধুর সিনেমাটিক হাঁটা ও কমেডি অভিনয়, সাথে ম্যাজিক স্মোক ট্রানজিশনে বিদূষক ও জাদুকরের পোশাক পরিবর্তন।'
  );
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16' | '1:1'>('9:16');
  const [selectedStyle, setSelectedStyle] = useState<string>('veo_cinematic');
  const [duration, setDuration] = useState<string>('15s');
  const [videoQuality, setVideoQuality] = useState<'4k' | '1080p' | '720p'>('1080p');
  const [fpsRate, setFpsRate] = useState<24 | 30 | 60>(24);

  // AI Script generation state
  const [isGeneratingScript, setIsGeneratingScript] = useState<boolean>(false);
  const [generatedScript, setGeneratedScript] = useState<VideoScript | null>(null);

  // Video Rendering Job State
  const [isRendering, setIsRendering] = useState<boolean>(false);
  const [activeJob, setActiveJob] = useState<VideoJob | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [apiKeyNotice, setApiKeyNotice] = useState<string | null>(null);
  const [showYouTubeModal, setShowYouTubeModal] = useState<boolean>(false);
  const [selectedClipIndex, setSelectedClipIndex] = useState<number>(0);
  const [playerViewMode, setPlayerViewMode] = useState<'preview-player' | 'canvas-engine'>('preview-player');

  // Preview clips derived from storyboard or prompt
  const defaultStoryboardScenes = [
    { sceneNumber: 1, timestamp: '00:00 - 00:06', visualPrompt: prompt || 'ম্যানহাটনের এভিনিউতে দুই বন্ধু গ্রে ব্লেজারে সিনেমাটিক হাঁটা', narration: 'নিউইয়র্কের রাজপথে দুই বন্ধুর হাসিখুশি প্রাণবন্ত যাত্রা শুরু।', bgmStyle: 'Veo Cinematic Folk' },
    { sceneNumber: 2, timestamp: '00:06 - 00:12', visualPrompt: 'বেগুনি ম্যাজিক ধোঁয়ায় ক্লাউন ও অ্যাকর্ডিয়ন শিল্পীতে রূপান্তর', narration: 'হঠাৎ জাদুকরি ধোঁয়ার সাথে সাথে ক্লাউন ও বাজনার রঙিন সুর ফুটে ওঠে।', bgmStyle: 'Playful Accordion' },
    { sceneNumber: 3, timestamp: '00:12 - 00:18', visualPrompt: 'ম্যাজিক স্পার্কল ছড়িয়ে সবুজ জাদুকর ও রাজকীয় পোশাকে রূপবদল', narration: 'জাদুর পরশে সবুজ টুপি ও কাঠির ঝলকানিতে চারপাশ ঝলমলিয়ে ওঠে।', bgmStyle: 'Mystical Sparkles' },
    { sceneNumber: 4, timestamp: '00:18 - 00:24', visualPrompt: 'লাল ও নীল ব্লেজারে সানগ্লাস পরে ক্লাসিক বন্ধুত্ব ও সংলাপ', narration: 'সবশেষে রঙিন পোশাকে ফিরে আসে আসল আড্ডা ও জমজমাট সমাপ্তি।', bgmStyle: 'Epic Finale' }
  ];

  // Map high quality video assets
  const getClipVideoUrl = (sceneIdx: number) => {
    if (activeJob?.videoUrl) return activeJob.videoUrl;
    if (selectedStyle === 'veo_cinematic' || aspectRatio === '9:16' || /বাদশা|ম্যাজিক|veo|magic/i.test(prompt)) {
      return aspectRatio === '16:9' ? '/videos/veo_16_9_showcase.mp4' : '/assets/aistudio/_badsha_720p__f22e7e8f.mp4';
    }
    return (
      sceneIdx === 0 ? '/videos/sample1.mp4' :
      sceneIdx === 1 ? '/videos/sample2.mp4' :
      sceneIdx === 2 ? '/videos/sample3.mp4' :
      '/videos/shorts_9_16.mp4'
    );
  };

  const previewClips: PreviewClipItem[] = (generatedScript?.scenes || defaultStoryboardScenes).map((sc, i) => ({
    id: `scene-clip-${i + 1}`,
    sceneNumber: sc.sceneNumber,
    title: `Scene ${sc.sceneNumber}: ${sc.visualPrompt.slice(0, 22)}...`,
    titleBn: `সিন ${sc.sceneNumber}: ${sc.visualPrompt.slice(0, 18)}...`,
    duration: 6,
    visualPrompt: sc.visualPrompt,
    narration: sc.narration,
    bgmStyle: sc.bgmStyle,
    videoUrl: getClipVideoUrl(i)
  }));

  const handleDownloadClipPreview = (url?: string) => {
    const targetUrl = url || activeJob?.videoUrl || '/videos/sample1.mp4';
    const a = document.createElement('a');
    a.href = targetUrl;
    a.download = `clip-preview-scene-${selectedClipIndex + 1}.mp4`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    notifySuccess(
      'Clip Download Started',
      'Your preview clip is downloading.',
      'ক্লিপ ডাউনলোড শুরু হয়েছে',
      'প্রিভিউ ক্লিপটি সফলভাবে ডাউনলোড হচ্ছে।'
    );
  };

  // Generate Script using Gemini 3.8 Flash
  const handleGenerateScript = async () => {
    setIsGeneratingScript(true);
    setErrorMsg(null);
    setApiKeyNotice(null);
    try {
      const res = await fetch('/api/generate-script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: prompt,
          duration,
          language: isBn ? 'Bengali with catchy modern tone' : 'English with viral retention hook',
          style: selectedStyle,
        }),
      });

      const parsed = await safeParseResponse<any>(res);
      const data = parsed.data || {};
      if (data.script) {
        setGeneratedScript(data.script);
        notifySuccess(
          'AI Script Generated ✨',
          `Generated "${data.script.title}" with ${data.script.scenes.length} storyboard scenes.`,
          'এআই চিত্রনাট্য প্রস্তুত ✨',
          `"${data.script.title}" - ${data.script.scenes.length}টি সিনেমাটিক সিন প্রস্তুত হয়েছে।`
        );
        if (data.apiKeyNotice) {
          setApiKeyNotice(data.apiKeyNotice);
        }
      } else {
        const err = data.error || parsed.error || 'Failed to generate script';
        setErrorMsg(err);
        notifyError('Script Generation Error', err, 'স্ক্রিপ্ট তৈরিতে ত্রুটি', err);
      }
    } catch (_err: any) {
      const msg = 'Script generation failed. Please try again.';
      setErrorMsg(msg);
      notifyError('Script Generation Error', msg, 'স্ক্রিপ্ট তৈরিতে ত্রুটি', 'স্ক্রিপ্ট তৈরিতে ব্যর্থ হয়েছে। পুনরায় চেষ্টা করুন।');
    } finally {
      setIsGeneratingScript(false);
    }
  };

  // Submit Video Generation Job
  const handleStartRender = async () => {
    setIsRendering(true);
    setErrorMsg(null);

    let currentScenes = generatedScript?.scenes;
    let currentVoiceover = generatedScript?.fullVoiceoverText;

    // If script not generated yet, generate one first so custom scenes match prompt
    if (!currentScenes || currentScenes.length === 0) {
      try {
        const scriptRes = await fetch('/api/generate-script', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            topic: prompt,
            duration,
            language: isBn ? 'Bengali with catchy modern tone' : 'English with viral retention hook',
            style: selectedStyle,
          }),
        });
        const parsedScript = await safeParseResponse<any>(scriptRes);
        const scriptData = parsedScript.data;
        if (scriptData?.script) {
          setGeneratedScript(scriptData.script);
          currentScenes = scriptData.script.scenes;
          currentVoiceover = scriptData.script.fullVoiceoverText;
        }
      } catch (_e) {
        // proceed with render
      }
    }

    try {
      const res = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          style: selectedStyle,
          aspectRatio,
          duration: parseInt(duration.replace('s', ''), 10) || 15,
          resolution: videoQuality === '4k' ? '4K Ultra HD (3840×2160)' : videoQuality === '1080p' ? '1080p Full HD (1920×1080)' : '720p HD (1280×720)',
          fps: fpsRate,
          voiceoverText: currentVoiceover,
          customSrt: presetSrt,
          scenes: currentScenes,
        }),
      });

      const parsed = await safeParseResponse<any>(res);
      const data = parsed.data;
      if (!parsed.success || !data?.job) {
        throw new Error(data?.error || parsed.error || 'Failed to submit render job');
      }

      setActiveJob(data.job);
      if (onJobCreated) onJobCreated(data.job);

      notifyInfo(
        'Video Rendering Started 🚀',
        `Synthesizing ${aspectRatio} scenes. Real-time progress is active.`,
        'ভিডিও রেন্ডারিং শুরু হয়েছে 🚀',
        `${aspectRatio} অ্যাসপেক্ট রেশিওতে সিন্থেসিস ও অডিও সিঙ্ক শুরু হয়েছে।`
      );

      // Poll job status until complete
      const pollInterval = setInterval(async () => {
        try {
          const pollRes = await fetch(`/api/jobs/${data.job.id}`);
          const parsedPoll = await safeParseResponse<any>(pollRes);
          const pollData = parsedPoll.data;
          if (pollData?.success && pollData.job) {
            setActiveJob(pollData.job);
            if (pollData.job.status === 'completed' || pollData.job.status === 'failed') {
              clearInterval(pollInterval);
              setIsRendering(false);
              if (pollData.job.status === 'completed') {
                saveJobToFirestore(pollData.job);
              }
            }
          }
        } catch (_e) {
          clearInterval(pollInterval);
          setIsRendering(false);
        }
      }, 1500);

    } catch (err: any) {
      const errorText = err?.message || 'Failed to initiate video rendering. Please try again.';
      setErrorMsg(errorText);
      notifyRenderError(errorText);
      setIsRendering(false);
    }
  };


  return (
    <div className="space-y-8">
      {/* Hero Studio Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-cyan-950/30 to-slate-900 border border-slate-800 p-6 rounded-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
                Text-to-Video Engine
              </span>
              <span className="text-xs text-slate-400">
                {isBn ? 'AI স্ক্রিপ্ট, ভিডিও সিন্থেসিস ও অটোমেটিক এডিটিং' : 'Multi-scene scripting & video rendering pipeline'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {isBn ? 'টেক্সট থেকে পূর্ণাঙ্গ এআই ভিডিও তৈরি করুন' : 'Generate Full AI Videos from Text Prompts'}
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl">
              {isBn 
                ? 'আপনার ভিডিওর আইডিয়া লিখুন। জেমিনি মডেল স্ক্রিপ্ট লিখে দেবে এবং টেক্সট-টু-ভিডিও ইঞ্জিন স্বয়ংক্রিয়ভাবে ভিডিও ক্লিপ ও অডিও মিক্স করবে।' 
                : 'Input your creative prompt to generate multi-scene scripts, cinematic clips, voiceover sync, and dynamic captions.'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleGenerateScript}
              disabled={isGeneratingScript}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/30 transition disabled:opacity-50"
            >
              {isGeneratingScript ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Wand2 className="w-4 h-4" />
              )}
              {isBn ? 'এআই স্ক্রিপ্ট জেনারেট করুন' : 'AI Script Writer'}
            </button>
          </div>
        </div>
      </div>

      {/* Main Studio Workspace: Left = Prompt & Config, Right = Live Video Canvas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Prompt Input & Production Settings (6 cols) */}
        <div className="lg:col-span-6 space-y-5">
          
          {/* Prompt Box */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-slate-300">
                  {isBn ? 'ভিডিওর আইডিয়া / প্রম্পট:' : 'Video Prompt & Scene Idea:'}
                </label>
                <span className="text-[11px] text-slate-500">
                  {isBn ? 'বাংলা বা ইংরেজিতে বিস্তারিত লিখুন' : 'Detailed visual descriptions work best'}
                </span>
              </div>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={3}
                placeholder={isBn ? 'আপনার ভিডিওর আইডিয়া লিখুন...' : 'Describe what you want to see in the video...'}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-cyan-500 transition resize-none"
              />

              {/* Instant Prompt Idea Chips */}
              <div className="flex items-center gap-1.5 flex-wrap mt-2">
                <span className="text-[10px] text-slate-400 font-semibold">{isBn ? 'আইডিয়া টেমপ্লেট:' : 'Quick Ideas:'}</span>
                {[
                  { labelBn: '⚡ বাদশা ও ম্যাজিক রূপান্তর (ভিও ২)', labelEn: '⚡ Badsha Magic Morphs (Veo 2)', text: 'ম্যানহাটনের ব্যস্ত রাজপথে দুই বন্ধুর সিনেমাটিক হাঁটা ও কমেডি অভিনয়, সাথে ম্যাজিক স্মোক ট্রানজিশনে বিদূষক ও জাদুকরের পোশাক পরিবর্তন।' },
                  { labelBn: '🐱 কিউট বিড়াল দুধ খাচ্ছে', labelEn: '🐱 Cute Kitten Drinking Milk', text: 'একটি মিষ্টি কিউট বিড়ালছানা ঘরের নরম আলোয় বাটি থেকে দুধ খাচ্ছে এবং মিষ্টি দুষ্টুমি করছে।' },
                  { labelBn: '🎵 মডেলের রোমান্টিক মিউজিক ভিডিও', labelEn: '🎵 Model Music Video', text: 'ছেলে ও মেয়ে মডেলের ছবি দিয়ে কক্সবাজারের সমুদ্র সৈকতে রোমান্টিক গানের মিউজিক ভিডিও তৈরি করুন।' },
                  { labelBn: '🍳 বিরিয়ানি রান্নার রেসিপি', labelEn: '🍳 Delicious Biryani Recipe', text: 'সুস্বাদু বিরিয়ানি রান্নার স্পেশাল রেসিপি, গরম প্যানে মশলার সুবাস আর লোভনীয় গ্রেভির সিনেমাটিক দৃশ্য।' },
                  { labelBn: '🏎️ বৃষ্টিতে সুপারকার রেসিং', labelEn: '🏎️ Supercar Drift in Rain', text: 'মধ্যরাতে বৃষ্টিভেজা রাস্তায় নিয়ন লাইটের নিচে তীব্র গতিতে ড্রিফটিং করছে একটি সুপারকার।' },
                  { labelBn: '🌿 পাহাড় ও নদীর প্রকৃতি', labelEn: '🌿 Mountains & River Nature', text: 'ভোরের কুয়াশাচ্ছন্ন সবুজ পাহাড়ের ওপর দিয়ে ড্রোন ফ্লাইট, স্বচ্ছ নদী ও পাখির কিচিরমিচির।' },
                  { labelBn: '🕌 ইসলামিক মসজিদ গোধূলি', labelEn: '🕌 Mosque Golden Twilight', text: 'সোনালী গোধূলিতে সাদা মার্বেলের মসজিদের গম্বুজ, স্নিগ্ধ চাঁদের আলো এবং অন্তরের গভীর প্রশান্তি।' },
                  { labelBn: '🚀 মহাকাশ ও মঙ্গল রোভার', labelEn: '🚀 Mars Rover Space Exploration', text: 'একটি মহাকাশচারী মঙ্গল গ্রহের লাল বালুকাময় প্রান্তরে হাঁটছে, চারপাশে নিয়ন আলো আর উড়ন্ত ড্রোন।' },
                ].map((preset, pIdx) => (
                  <button
                    key={pIdx}
                    type="button"
                    onClick={() => {
                      setPrompt(preset.text);
                      setGeneratedScript(null);
                      setActiveJob(null);
                    }}
                    className="px-2 py-0.5 rounded-lg bg-slate-950/80 hover:bg-cyan-950 text-[10px] text-slate-300 hover:text-cyan-300 border border-slate-800 transition"
                  >
                    {isBn ? preset.labelBn : preset.labelEn}
                  </button>
                ))}
              </div>

              {/* Smart Music Video Recommendation Banner */}
              {/গান|মিউজিক|মডেল|ছেলে|মেয়ে|ছবি|photo|model|music|song/i.test(prompt) && onNavigateTab && (
                <div className="mt-3 p-3 bg-gradient-to-r from-pink-950/60 to-purple-950/60 border border-pink-700/60 rounded-xl flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <Music className="w-4 h-4 text-pink-400 shrink-0" />
                    <span className="text-pink-200">
                      {isBn 
                        ? 'ছবি আপলোড করে মডেলের মিউজিক ভিডিও তৈরি করতে চান?' 
                        : 'Want to generate a music video with custom model photos & songs?'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => onNavigateTab('photo-music-video')}
                    className="px-3 py-1.5 rounded-lg bg-pink-600 hover:bg-pink-500 text-white font-bold text-[11px] flex items-center gap-1 shadow shrink-0"
                  >
                    <span>{isBn ? 'ছবি-টু-মিউজিক ভিডিও স্টুডিওতে যান' : 'Go to Photo Music Video'}</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>

            {/* Aspect Ratio Switcher */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-2">
                {isBn ? 'অ্যাসপেক্ট রেশিও (Aspect Ratio):' : 'Aspect Ratio Format:'}
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setAspectRatio('16:9')}
                  className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs font-semibold transition ${
                    aspectRatio === '16:9'
                      ? 'bg-cyan-950/60 border-cyan-500 text-cyan-300 shadow-md shadow-cyan-950'
                      : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <Monitor className="w-4 h-4 text-cyan-400" />
                  <span>16:9 {isBn ? '(ইউটিউব)' : '(YouTube)'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setAspectRatio('9:16')}
                  className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs font-semibold transition ${
                    aspectRatio === '9:16'
                      ? 'bg-cyan-950/60 border-cyan-500 text-cyan-300 shadow-md shadow-cyan-950'
                      : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <Smartphone className="w-4 h-4 text-purple-400" />
                  <span>9:16 {isBn ? '(শর্টস/রিলস)' : '(Shorts/Reels)'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setAspectRatio('1:1')}
                  className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs font-semibold transition ${
                    aspectRatio === '1:1'
                      ? 'bg-cyan-950/60 border-cyan-500 text-cyan-300 shadow-md shadow-cyan-950'
                      : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <Square className="w-4 h-4 text-emerald-400" />
                  <span>1:1 {isBn ? '(ফিড/পোস্ট)' : '(Square)'}</span>
                </button>
              </div>
            </div>

            {/* Video Resolution & Framerate Upgrade Controls */}
            <div className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
                  <Film className="w-3.5 h-3.5 text-cyan-400" />
                  {isBn ? 'ভিডিও কোয়ালিটি ও রেজোলিউশন:' : 'Video Quality & Resolution:'}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800/60">
                  Google Veo 2 Engine
                </span>
              </div>

              {/* Resolution options */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: '4k', labelBn: '৪K UHD', labelEn: '4K UHD', sub: '3840×2160 • 24M' },
                  { id: '1080p', labelBn: '১০৮০p FHD', labelEn: '1080p FHD', sub: '1920×1080 • 12M' },
                  { id: '720p', labelBn: '৭২০p HD', labelEn: '720p HD', sub: '1280×720 • 5M' },
                ].map((res) => (
                  <button
                    key={res.id}
                    type="button"
                    onClick={() => setVideoQuality(res.id as any)}
                    className={`p-2 rounded-xl border text-left transition ${
                      videoQuality === res.id
                        ? 'bg-cyan-950/80 border-cyan-400 text-cyan-200 shadow-sm'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    <div className="text-xs font-bold text-white">{isBn ? res.labelBn : res.labelEn}</div>
                    <div className="text-[9px] font-mono text-slate-400 mt-0.5">{res.sub}</div>
                  </button>
                ))}
              </div>

              {/* Frame rate options */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-900 text-xs">
                <span className="text-slate-400 text-[11px] font-medium">
                  {isBn ? 'ফ্রেম রেট (FPS):' : 'Frame Rate (FPS):'}
                </span>
                <div className="flex items-center gap-1.5">
                  {[
                    { fps: 24, labelBn: '২৪ সিনেমাটিক (Film)', labelEn: '24 Film' },
                    { fps: 30, labelBn: '৩০ স্ট্যান্ডার্ড', labelEn: '30 Standard' },
                    { fps: 60, labelBn: '৬০ আল্ট্রা-স্মুথ', labelEn: '60 Smooth' },
                  ].map((f) => (
                    <button
                      key={f.fps}
                      type="button"
                      onClick={() => setFpsRate(f.fps as any)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${
                        fpsRate === f.fps
                          ? 'bg-cyan-600 text-white shadow-sm'
                          : 'bg-slate-900 text-slate-400 hover:text-white'
                      }`}
                    >
                      {f.fps} FPS
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Visual Style Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-2">
                {isBn ? 'ভিজ্যুয়াল আর্ট স্টাইল:' : 'Visual Art Style:'}
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {STYLE_PRESETS.map((st) => (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => setSelectedStyle(st.id)}
                    className={`flex items-center gap-2 p-2 rounded-xl border text-xs font-medium transition ${
                      selectedStyle === st.id
                        ? 'bg-cyan-950/80 border-cyan-400 text-white ring-1 ring-cyan-400'
                        : 'bg-slate-800/40 border-slate-700/50 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <span>{st.icon}</span>
                    <span className="truncate">{isBn ? st.labelBn : st.labelEn}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Duration & Subtitle Tag */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-slate-400">{isBn ? 'দৈর্ঘ্য:' : 'Duration:'}</span>
                <select
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-white text-xs"
                >
                  <option value="15s">15 Seconds (Shorts)</option>
                  <option value="30s">30 Seconds (Social)</option>
                  <option value="60s">60 Seconds (Story)</option>
                </select>
              </div>

              {presetSrt && (
                <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-bold">
                  ✓ Custom SRT Subtitles Attached
                </span>
              )}
            </div>

            {/* Main Render Action Button */}
            <button
              onClick={handleStartRender}
              disabled={isRendering || !prompt.trim()}
              className="w-full py-4 px-4 rounded-xl bg-gradient-to-r from-cyan-500 via-indigo-600 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-extrabold text-sm shadow-xl shadow-cyan-500/25 flex items-center justify-center gap-2 transition disabled:opacity-50"
            >
              {isRendering ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{isBn ? 'ভিডিও রেন্ডারিং চলছে...' : 'Synthesizing & Rendering Video...'}</span>
                </>
              ) : (
                <>
                  <Video className="w-4 h-4" />
                  <span>{isBn ? 'ভিডিও জেনারেট করুন (Generate Video)' : 'Generate Full AI Video'}</span>
                </>
              )}
            </button>

            {apiKeyNotice && (
              <div className="p-3 bg-amber-950/40 border border-amber-800/80 rounded-xl text-xs text-amber-200 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <p className="font-semibold text-amber-300">
                    {isBn ? 'স্টুডিও স্ক্রিপ্ট ইঞ্জিন সক্রিয় (Studio Engine Active)' : 'Studio Script Engine Active'}
                  </p>
                  <p className="text-[11px] text-amber-300/80">
                    {isBn 
                      ? 'জেমিনি ক্লাউড এপিআই 403 এরর দেওয়ায় স্ক্রিপ্টটি স্টুডিও ইঞ্জিন দ্বারা নির্মিত হয়েছে। সম্পূর্ণ এআই ক্লাউড সংযোগের জন্য Settings > Secrets প্যানেল চেক করুন।' 
                      : `${apiKeyNotice} Scripts are generating via the Studio Built-in Engine.`}
                  </p>
                </div>
              </div>
            )}

            {errorMsg && (
              <div className="p-3 bg-red-950/50 border border-red-800/80 rounded-xl text-xs text-red-200 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}
          </div>

          {/* AI Generated Screenplay Accordion if available */}
          {generatedScript && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs font-bold text-indigo-400 flex items-center gap-1.5 uppercase tracking-wider">
                  <FileText className="w-3.5 h-3.5" />
                  {isBn ? 'এআই চিত্রনাট্য (Screenplay Breakdown)' : 'AI Screenplay Breakdown'}
                </span>
                <span className="text-[11px] text-slate-400 font-mono">
                  {generatedScript.estimatedDuration}
                </span>
              </div>

              <div>
                <p className="text-xs font-bold text-white mb-0.5">{generatedScript.title}</p>
                <p className="text-xs text-cyan-300 italic">"Hook: {generatedScript.hook}"</p>
              </div>

              <div className="space-y-2 mt-3 max-h-56 overflow-y-auto pr-1">
                {generatedScript.scenes.map((sc, i) => (
                  <div key={i} className="p-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-xs space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span className="font-bold text-indigo-300">Scene {sc.sceneNumber} ({sc.timestamp})</span>
                      <span className="text-purple-300">BGM: {sc.bgmStyle}</span>
                    </div>
                    <p className="text-slate-300"><strong className="text-slate-200">Visual:</strong> {sc.visualPrompt}</p>
                    <p className="text-cyan-200"><strong className="text-slate-200">Narration:</strong> {sc.narration}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Right Column: Live Video Canvas & Render Logs (6 cols) */}
        <div className="lg:col-span-6 space-y-5">
          
          {/* Real-time Video Render Progress Indicator Component */}
          {activeJob && (
            <VideoRenderProgressIndicator
              job={activeJob}
              lang={lang}
              onComplete={(completedJob) => {
                setActiveJob(completedJob);
                setIsRendering(false);
              }}
              onCancel={() => {
                setIsRendering(false);
              }}
              onPublishToYouTube={() => setShowYouTubeModal(true)}
              allowFloatingMinimize={true}
              showLogsToggle={true}
            />
          )}

          {/* Video Preview & Canvas Mode Switcher Bar */}
          <div className="flex items-center justify-between p-2 rounded-2xl bg-slate-900 border border-slate-800">
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setPlayerViewMode('preview-player')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  playerViewMode === 'preview-player'
                    ? 'bg-gradient-to-r from-cyan-600 to-indigo-600 text-white shadow-md shadow-cyan-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Film className="w-3.5 h-3.5" />
                <span>{isBn ? 'ভিডিও ক্লিপ প্রিভিউ প্লেয়ার' : 'Clip Preview Player'}</span>
              </button>

              <button
                onClick={() => setPlayerViewMode('canvas-engine')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  playerViewMode === 'canvas-engine'
                    ? 'bg-gradient-to-r from-cyan-600 to-indigo-600 text-white shadow-md shadow-cyan-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isBn ? 'ক্যানভাস ইঞ্জিন' : 'Canvas Engine'}</span>
              </button>
            </div>

            <span className="text-[11px] text-cyan-400 font-semibold hidden sm:inline-block px-2.5 py-0.5 rounded-full bg-cyan-950 border border-cyan-800/60">
              {isBn ? 'চূড়ান্ত করার আগে ক্লিপগুলো দেখুন' : 'Inspect Clips Before Finalizing'}
            </span>
          </div>

          {/* Render Mode 1: New Dedicated VideoPreviewPlayer */}
          {playerViewMode === 'preview-player' ? (
            <VideoPreviewPlayer
              mode="text-to-video"
              lang={lang}
              clips={previewClips}
              activeClipIndex={selectedClipIndex}
              onSelectClip={setSelectedClipIndex}
              aspectRatio={aspectRatio}
              onAspectRatioChange={setAspectRatio}
              onFinalize={handleStartRender}
              isFinalizing={isRendering}
              onDownloadPreview={handleDownloadClipPreview}
              onPublishToYouTube={() => setShowYouTubeModal(true)}
              onSendToSubtitles={() => {
                if (onNavigateTab) onNavigateTab('subtitles');
              }}
            />
          ) : (
            /* Render Mode 2: Generative Canvas Player Card */
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
                <div className="flex items-center gap-2">
                  <Film className="w-4 h-4 text-cyan-400" />
                  <h3 className="text-sm font-bold text-white">
                    {isBn ? 'ভিডিও সিন্থেসিস ক্যানভাস' : 'Video Canvas Engine'}
                  </h3>
                </div>

                {activeJob && (
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                    activeJob.status === 'completed'
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                      : 'bg-cyan-950 text-cyan-400 border border-cyan-800 animate-pulse'
                  }`}>
                    {activeJob.status}
                  </span>
                )}
              </div>

              <div className="w-full">
                {activeJob?.status === 'completed' || (!isRendering && generatedScript) ? (
                  <GenerativeVideoPlayer
                    job={activeJob}
                    script={generatedScript}
                    aspectRatio={aspectRatio}
                    lang={lang}
                  />
                ) : isRendering ? (
                  <div className={`relative rounded-xl overflow-hidden bg-black border border-slate-800 flex flex-col items-center justify-center p-8 text-center space-y-3 transition-all duration-300 ${
                    aspectRatio === '9:16' ? 'aspect-[9/16] max-h-[480px] mx-auto w-full max-w-[280px]' : aspectRatio === '1:1' ? 'aspect-square max-h-[440px] mx-auto' : 'aspect-video w-full'
                  }`}>
                    <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 animate-spin">
                      <Loader2 className="w-6 h-6" />
                    </div>
                    <p className="text-xs font-bold text-white">
                      {isBn ? 'মাল্টি-স্টেজ ভিডিও রেন্ডারিং ও সিন্থেসিস চলছে...' : 'Active Multi-Stage Pipeline Synthesis...'}
                    </p>
                    <p className="text-[11px] text-slate-400 max-w-xs">
                      {isBn 
                        ? 'উপরের প্রগ্রেস ইন্ডিকেটরে ফ্রেম ও অডিও সিন্থেসিসের রিয়েল-টাইম স্ট্যাটাস এবং FFmpeg লগ পর্যবেক্ষণ করুন।'
                        : 'Watch the real-time stages and FFmpeg console above as the export renders.'}
                    </p>
                  </div>
                ) : (
                  <div className={`relative rounded-xl overflow-hidden bg-black border border-slate-800 flex flex-col items-center justify-center p-8 text-center text-slate-500 space-y-3 transition-all duration-300 ${
                    aspectRatio === '9:16' ? 'aspect-[9/16] max-h-[480px] mx-auto w-full max-w-[280px]' : aspectRatio === '1:1' ? 'aspect-square max-h-[440px] mx-auto' : 'aspect-video w-full'
                  }`}>
                    <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                      <Play className="w-6 h-6 fill-current" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-200">
                        {isBn ? 'আপনার পছন্দের যেকোনো ভিডিও তৈরি করুন' : 'AI Video Synthesizer Ready'}
                      </p>
                      <p className="text-[11px] text-slate-400 max-w-xs mt-1">
                        {isBn 
                          ? 'বিড়াল/পোষা প্রাণী, রান্না, রেসিং কার, শান্ত নদী-পাহাড়, ইসলামিক দৃশ্য বা টেক টিউটোরিয়াল—যেকোনো প্রম্পট দিলেই নিখুঁত ভিডিও তৈরি হবে।' 
                          : 'Accurately synthesizes scenes matching any prompt with subtitles, voiceover and export.'}
                      </p>
                    </div>
                    <button
                      onClick={handleStartRender}
                      disabled={!prompt.trim()}
                      className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs transition shadow-md shadow-cyan-600/30 flex items-center gap-1.5 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{isBn ? 'এখনই তৈরি করুন' : 'Generate Now'}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>

      </div>

      {/* YouTube Upload Modal */}
      {showYouTubeModal && (
        <YouTubeUploadModal
          isOpen={showYouTubeModal}
          onClose={() => setShowYouTubeModal(false)}
          lang={lang}
          initialTitle={generatedScript?.title || prompt.slice(0, 60)}
          initialDescription={`${generatedScript?.fullVoiceoverText || prompt}\n\nGenerated with AI Video Studio Bangladesh.\n#AIVideo #Shorts #GenerativeAI`}
          initialTags={generatedScript?.recommendedTags || ['AIVideo', 'Shorts', 'AIStudio']}
          videoUrl={activeJob?.videoUrl}
        />
      )}
    </div>
  );
};
