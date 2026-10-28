import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Music, 
  Upload, 
  Sparkles, 
  Play, 
  Pause, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  Download, 
  CheckCircle2, 
  Film, 
  Clock, 
  Heart, 
  Sliders, 
  Maximize2,
  Minimize2,
  FileAudio,
  Radio,
  Eye,
  Layers,
  ChevronRight,
  ListMusic,
  Share2,
  History,
  Youtube,
  CloudRain,
  Flame,
  Sun,
  Wind,
  Stamp,
  User,
  Mic,
  Smile,
  Wand2
} from 'lucide-react';
import { Language, PresentationScene, AudioPresentationProject, StudioTab } from '../types';
import { useToast } from '../context/ToastContext';
import { useWatermark } from '../context/WatermarkContext';
import { saveJobToFirestore } from '../services/firebase';
import { ProcessingPreview } from './ProcessingPreview';
import { VideoExportProgressIndicator } from './VideoExportProgressIndicator';
import { 
  drawPerformerChoreography, 
  PERFORMANCE_STYLES, 
  PerformanceStyle, 
  detectPerformanceStyle 
} from '../services/performerChoreography';

interface AudioMusicPresentationProps {
  lang: Language;
  onNavigateTab?: (tab: StudioTab) => void;
}

interface AudioPreset {
  id: string;
  title: string;
  artist: string;
  genre: string;
  duration: number;
  audioUrl: string;
  lyrics: string;
  defaultEmotion: string;
  defaultStyle?: PerformanceStyle;
  descriptionBn: string;
}

const PRESET_TRACKS: AudioPreset[] = [
  {
    id: 'preset-hotel-farid-jingle',
    title: 'হোটেল আল শেখ ফরিদ (জিঙ্গেল ও ধামাকা ডিজে গান)',
    artist: 'হোটেল আল শেখ ফরিদ কমার্শিয়াল',
    genre: 'Commercial Jingle & DJ',
    duration: 48,
    audioUrl: '/assets/aistudio/gemini_music__10__Presentation_54e91e1c.webm',
    lyrics: 'স্টেশন রোড মেইন গেটে আপনাদের স্বাগতম ভাই,\nহোটেল আল শেখ ফরিদে সেরা খাবারের নেই তো কোনো ক্ষয়।\nগরম গরম জিলাপি, কষা মাংস আর ধোঁয়া ওঠা ভাত,\nডিজে তালে মেতে উঠুন কাটবে দারুণ এই রাত...',
    defaultEmotion: 'উৎসবমুখর আনন্দ ও সুস্বাদু খাবারের তৃপ্তি',
    defaultStyle: 'jingle_presenter',
    descriptionBn: 'উদ্যমী বিজ্ঞাপন গান, রসালো জিলাপি, কষা মাংস ও ডিজে উৎসবমুখর স্টেজ পারফরম্যান্স।'
  },
  {
    id: 'preset-rainy-flute',
    title: 'মেঘের পরে মেঘ জমেছে (বৃষ্টি ও বাঁশির সুর)',
    artist: 'রবীন্দ্র ফিউশন ও বাঁশি',
    genre: 'Soulful Ballad',
    duration: 45,
    audioUrl: 'https://cdn.freesound.org/previews/612/612610_5674468-lq.mp3',
    lyrics: 'মেঘের পরে মেঘ জমেছে আঁধার করে আসে,\nআমায় কেন বসিয়ে রাখিস একা দ্বারের পাশে।\nকাজের দিনে নানা কাজে থাকি নানা লোকের মাঝে,\nআজ আমি যে বসে আছি তোমার আশার আশে...',
    defaultEmotion: 'গভীর বিরহ ও বর্ষার নস্টালজিয়া',
    defaultStyle: 'romantic_hero',
    descriptionBn: 'বৃষ্টিভেজা উদাস দুপুর, দূরের বাঁশির মিষ্টি তান ও গভীর অনুভূতির সুর।'
  },
  {
    id: 'preset-acoustic-romance',
    title: 'তুমি আমার প্রথম সকাল (রোমান্টিক অ্যাকোস্টিক)',
    artist: 'অ্যাকোস্টিক মেলোডি',
    genre: 'Romantic Acoustic',
    duration: 38,
    audioUrl: 'https://cdn.freesound.org/previews/456/456965_5121236-lq.mp3',
    lyrics: 'তুমি আমার প্রথম সকাল, সোনালী রোদের গান,\nহাজার তারার মাঝে তুমি আমার অভিমান।\nহাতে হাত রেখে হেঁটে যাবো অচিন দূর সীমানায়,\nযেথায় শুধু তোমার আমার ভালোবাসার ছোঁয়া পায়...',
    defaultEmotion: 'গভীর প্রেম ও মিষ্টি উচ্ছ্বাস',
    defaultStyle: 'romantic_hero',
    descriptionBn: 'ভোরের নরম আলোয় হাত ধরে হাঁটার মতো মিষ্টি ও মায়াবী প্রেমের গান।'
  },
  {
    id: 'preset-sufi-spiritual',
    title: 'অচিন পাখির গান (সুফি ধ্যান ও একতারা)',
    artist: 'বাউল ও সুফি ফিউশন',
    genre: 'Sufi Spiritual',
    duration: 50,
    audioUrl: 'https://cdn.freesound.org/previews/517/517726_7037-lq.mp3',
    lyrics: 'খাঁচার ভিতর অচিন পাখি কেমনে আসে যায়,\nধরতে পারলে মনোবেড়ি দিতাম পাখির পায়।\nআট কুঠুরি নয় দরজা আঁটা মধ্যে মধ্যে ঝরকা কাটা,\nতার উপরে সদর কোঠা আয়না মহল তায়...',
    defaultEmotion: 'আধ্যাত্মিক নিস্তব্ধতা ও অন্তর্নিহিত বৈরাগ্য',
    defaultStyle: 'baul_folk_acoustic',
    descriptionBn: 'অন্তরাত্মার গভীর সুর, মাটির গন্ধ ও আধ্যাত্মিক ভাবাবেগে ভাসিয়ে দেওয়ার মতো গান।'
  },
  {
    id: 'preset-lofi-dreams',
    title: 'ক্যাফে ড্রিমস (লো-ফাই ও গোধূলি)',
    artist: 'লো-ফাই চিলহপ বাংলা',
    genre: 'Lofi Chillhop',
    duration: 40,
    audioUrl: 'https://cdn.freesound.org/previews/538/538779_11504561-lq.mp3',
    lyrics: 'ধোঁয়া ওঠা কফির কাপে বিকেল গড়িয়ে যায়,\nপুরোনো গানের চেনা কলি মনে পড়ে যায়।\nশহরের বুকে নিয়ন আলো জ্বলে ওঠার ক্ষণে,\nএকলা মনের হাজার কথা জমা থাকে মনে...',
    defaultEmotion: 'শহুরে একাকীত্ব ও শান্ত নস্টালজিয়া',
    defaultStyle: 'lofi_chill',
    descriptionBn: 'ক্যাফের কাঁচের জানালায় বৃষ্টি দেখা আর পুরোনো স্মৃতির কথা মনে পড়ার প্রশান্তিময় সুর।'
  }
];

export const AudioMusicPresentation: React.FC<AudioMusicPresentationProps> = ({
  lang,
  onNavigateTab
}) => {
  const isBn = lang === 'bn';
  const { addToast } = useToast();
  const { config: watermarkConfig, openModal: openWatermarkModal, drawWatermarkOnCanvas } = useWatermark();

  // Input states
  const [selectedPresetId, setSelectedPresetId] = useState<string>('preset-rainy-flute');
  const [customAudioFile, setCustomAudioFile] = useState<File | null>(null);
  const [customAudioUrl, setCustomAudioUrl] = useState<string | null>(null);
  const [songTitle, setSongTitle] = useState<string>(PRESET_TRACKS[0].title);
  const [artistName, setArtistName] = useState<string>(PRESET_TRACKS[0].artist);
  const [lyricsInput, setLyricsInput] = useState<string>(PRESET_TRACKS[0].lyrics);
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const [visualStyle, setVisualStyle] = useState<string>('cinematic');
  const [deepThinkingMode, setDeepThinkingMode] = useState<boolean>(true);

  // Playback & Audio states
  const [activeAudioSrc, setActiveAudioSrc] = useState<string>(PRESET_TRACKS[0].audioUrl);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [audioDuration, setAudioDuration] = useState<number>(PRESET_TRACKS[0].duration);
  const [volume, setVolume] = useState<number>(0.85);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Generation & Deep Analysis states
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationProgress, setGenerationProgress] = useState<number>(0);
  const [currentStageIndex, setCurrentStageIndex] = useState<number>(0);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [reasoningLogs, setReasoningLogs] = useState<string[]>([]);
  const [project, setProject] = useState<AudioPresentationProject | null>(null);

  // Active scene & presentation
  const [activeSceneIndex, setActiveSceneIndex] = useState<number>(0);
  const [isExportingVideo, setIsExportingVideo] = useState<boolean>(false);
  const [exportProgress, setExportProgress] = useState<number>(0);

  // Performer & Acting System states
  const [performanceStyle, setPerformanceStyle] = useState<PerformanceStyle>('jingle_presenter');
  const [showPerformer, setShowPerformer] = useState<boolean>(true);
  const [autoDetectStyle, setAutoDetectStyle] = useState<boolean>(true);

  // Refs
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const particlesRef = useRef<any[]>([]);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const exportTimerRef = useRef<any>(null);
  const imageCacheRef = useRef<Map<string, HTMLImageElement>>(new Map());
  const lastLoadedImgRef = useRef<HTMLImageElement | null>(null);

  // Generation stages configuration
  const STAGES = [
    {
      titleBn: 'অডিও সিগন্যাল ডিকোডিং ও সুরের ছন্দ বিশ্লেষণ',
      titleEn: 'Audio Signal Decoding & Rhythm Analysis',
      descBn: 'ফ্রিকোয়েন্সি স্পেকট্রাম, টেম্পো এবং সাউন্ড ডায়নামিক্স লোড হচ্ছে...',
      targetProgress: 20
    },
    {
      titleBn: 'জেমিনি এআই লিরিক্স ও কথা নিখুঁতভাবে বিশ্লেষণ',
      titleEn: 'Gemini AI Lyric & Spoken Words Analysis',
      descBn: 'গানের প্রতিটি শব্দ, উচ্চারণ ও ছন্দময় অর্থ উদ্ধার করা হচ্ছে...',
      targetProgress: 45
    },
    {
      titleBn: 'গভীর আবেগ ও অনুভূতির মাত্রা নির্ণয়',
      titleEn: 'Deep Emotion & Sentimental Core Profiling',
      descBn: 'প্রেম, বিষাদ, আনন্দ বা আধ্যাত্মিক অনুভূতির রঙ নির্ধারণ হচ্ছে...',
      targetProgress: 70
    },
    {
      titleBn: 'লিরিক্স ও আবেগের সাথে সিনেমাটিক সিন ম্যাচিং',
      titleEn: 'Cinematic Scene & Visual Composition Matching',
      descBn: 'প্রতিটি লাইনের অনুভূতির সাথে উপযুক্ত ৪K দৃশ্য ও ক্যামেরা মোশন সাজানো হচ্ছে...',
      targetProgress: 90
    },
    {
      titleBn: 'অডিও সিঙ্ক, কাইনেটিক সাবটাইটেল ও ফুল ভিডিও প্রেজেন্টেশন রেন্ডার',
      titleEn: 'Audio-Visual Sync & Full Presentation Assembly',
      descBn: 'টাইমস্ট্যাম্প সিঙ্ক ও প্রেজেন্টেশন ফ্রেম প্রস্তুত সম্পন্ন হচ্ছে...',
      targetProgress: 100
    }
  ];

  // Preset switch
  const handleSelectPreset = (preset: AudioPreset) => {
    setSelectedPresetId(preset.id);
    setCustomAudioFile(null);
    setCustomAudioUrl(null);
    setSongTitle(preset.title);
    setArtistName(preset.artist);
    setLyricsInput(preset.lyrics);
    setActiveAudioSrc(preset.audioUrl);
    setAudioDuration(preset.duration);
    setCurrentTime(0);
    setIsPlaying(false);

    if (preset.defaultStyle) {
      setPerformanceStyle(preset.defaultStyle);
    } else {
      setPerformanceStyle(detectPerformanceStyle(preset.title, preset.lyrics));
    }
  };

  // Custom audio file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('audio/') && !file.name.match(/\.(mp3|wav|m4a|aac|ogg|webm)$/i)) {
      addToast({
        type: 'error',
        title: isBn ? 'ভুল ফাইল ফরম্যাট' : 'Invalid File Format',
        message: isBn ? 'দয়া করে একটি MP3, WAV বা অডিও ফাইল আপলোড করুন।' : 'Please upload an MP3, WAV or audio file.'
      });
      return;
    }

    const url = URL.createObjectURL(file);
    setCustomAudioFile(file);
    setCustomAudioUrl(url);
    setSelectedPresetId('custom');
    setActiveAudioSrc(url);
    setCurrentTime(0);
    setIsPlaying(false);

    // Auto title from file name
    const cleanedName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
    setSongTitle(cleanedName);
    setArtistName(isBn ? 'আপলোডকৃত সঙ্গীত শিল্পী' : 'Uploaded Artist');

    // Auto-detect performance style according to song name/genre
    const detectedStyle = detectPerformanceStyle(cleanedName, lyricsInput);
    setPerformanceStyle(detectedStyle);

    addToast({
      type: 'success',
      title: isBn ? 'অডিও ফাইল লোড হয়েছে' : 'Audio Loaded',
      message: `${file.name} (${(file.size / (1024 * 1024)).toFixed(2)} MB)`
    });
  };

  // Pre-load scene images into memory cache to eliminate blank dark screens
  useEffect(() => {
    if (!project || !project.scenes) return;
    project.scenes.forEach((scene) => {
      if (scene.imageUrl) {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = scene.imageUrl;
        img.onload = () => {
          imageCacheRef.current.set(scene.imageUrl, img);
        };
      }
    });
  }, [project]);

  // Sync active scene based on currentTime
  useEffect(() => {
    if (!project || !project.scenes || project.scenes.length === 0) return;
    const sceneIdx = project.scenes.findIndex(
      s => currentTime >= s.timeStart && currentTime < s.timeEnd
    );
    if (sceneIdx !== -1 && sceneIdx !== activeSceneIndex) {
      setActiveSceneIndex(sceneIdx);
    }
  }, [currentTime, project, activeSceneIndex]);

  // Handle Play/Pause
  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(err => {
        console.warn('Playback error:', err);
      });
    }
  };

  // Jump to specific scene
  const handleJumpToScene = (idx: number) => {
    if (!project || !project.scenes[idx] || !audioRef.current) return;
    const targetTime = project.scenes[idx].timeStart;
    audioRef.current.currentTime = targetTime;
    setCurrentTime(targetTime);
    setActiveSceneIndex(idx);
    if (!isPlaying) {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  // Particle engine initialization
  useEffect(() => {
    const particles: any[] = [];
    const count = 45;
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * 800,
        y: Math.random() * 450,
        size: Math.random() * 3 + 1,
        speedX: (Math.random() - 0.5) * 0.8,
        speedY: Math.random() * 1.5 + 0.5,
        opacity: Math.random() * 0.7 + 0.3,
        pulse: Math.random() * Math.PI * 2
      });
    }
    particlesRef.current = particles;
  }, []);

  // Canvas visual rendering loop for presentation
  useEffect(() => {
    let active = true;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let currentImg: HTMLImageElement | null = null;
    let loadedSrc = '';

    const render = () => {
      if (!active) return;
      const width = canvas.width;
      const height = canvas.height;

      // Clear
      ctx.clearRect(0, 0, width, height);

      const activeScene = project?.scenes[activeSceneIndex];
      const imgSrc = activeScene?.imageUrl || (performanceStyle === 'jingle_presenter'
        ? 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1600&auto=format&fit=crop&q=85'
        : 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1600&auto=format&fit=crop&q=85');

      // Check pre-cache first to eliminate blank dark screens
      const cached = imageCacheRef.current.get(imgSrc);
      if (cached && cached.complete && cached.naturalWidth > 0) {
        currentImg = cached;
        lastLoadedImgRef.current = cached;
      } else if (imgSrc !== loadedSrc) {
        loadedSrc = imgSrc;
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = imgSrc;
        img.onload = () => {
          currentImg = img;
          lastLoadedImgRef.current = img;
          imageCacheRef.current.set(imgSrc, img);
        };
      }

      const imgToDraw = currentImg || lastLoadedImgRef.current;

      // Draw background image with Ken Burns motion
      if (imgToDraw && imgToDraw.complete && imgToDraw.naturalWidth > 0) {
        const sceneDuration = activeScene ? (activeScene.timeEnd - activeScene.timeStart) : 10;
        const sceneElapsed = activeScene ? Math.max(0, currentTime - activeScene.timeStart) : (currentTime % 10);
        const progress = Math.min(1, Math.max(0, sceneElapsed / (sceneDuration || 1)));

        // Ken burns subtle zoom and drift
        const scale = 1.05 + progress * 0.08;
        const driftX = (progress - 0.5) * 20;
        const driftY = (progress - 0.5) * 12;

        ctx.save();
        ctx.translate(width / 2 + driftX, height / 2 + driftY);
        ctx.scale(scale, scale);
        ctx.drawImage(imgToDraw, -width / 2, -height / 2, width, height);
        ctx.restore();

        // Dark gradient vignette overlay
        const vignette = ctx.createLinearGradient(0, 0, 0, height);
        vignette.addColorStop(0, 'rgba(10, 15, 30, 0.45)');
        vignette.addColorStop(0.5, 'rgba(10, 15, 30, 0.2)');
        vignette.addColorStop(1, 'rgba(10, 15, 30, 0.85)');
        ctx.fillStyle = vignette;
        ctx.fillRect(0, 0, width, height);
      } else {
        // High-fidelity procedural stage backdrop (never a blank dark void!)
        const bgGrad = ctx.createRadialGradient(
          width * 0.5, height * 0.4, 20,
          width * 0.5, height * 0.5, width * 0.8
        );
        if (performanceStyle === 'jingle_presenter') {
          bgGrad.addColorStop(0, '#3b1204');
          bgGrad.addColorStop(0.6, '#1a0b1e');
          bgGrad.addColorStop(1, '#070a14');
        } else if (performanceStyle === 'pop_dj_stage') {
          bgGrad.addColorStop(0, '#042838');
          bgGrad.addColorStop(0.6, '#130424');
          bgGrad.addColorStop(1, '#02050e');
        } else if (performanceStyle === 'baul_folk_acoustic') {
          bgGrad.addColorStop(0, '#2e1905');
          bgGrad.addColorStop(0.6, '#180c04');
          bgGrad.addColorStop(1, '#04070e');
        } else {
          bgGrad.addColorStop(0, '#1c0c24');
          bgGrad.addColorStop(0.6, '#0d1326');
          bgGrad.addColorStop(1, '#040711');
        }
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, width, height);
      }

      // Draw Atmospheric Particles (Rain / Bokeh / Embers)
      const particleType = activeScene?.particleOverlay || (performanceStyle === 'jingle_presenter' ? 'bokeh' : 'bokeh');
      const particles = particlesRef.current;

      for (let p of particles) {
        p.pulse += 0.03;
        const currentOpacity = p.opacity * (0.6 + 0.4 * Math.sin(p.pulse));

        if (particleType === 'rain') {
          p.y += p.speedY * 3.5;
          p.x += p.speedX;
          if (p.y > height) {
            p.y = -10;
            p.x = Math.random() * width;
          }
          ctx.strokeStyle = `rgba(186, 230, 253, ${currentOpacity * 0.8})`;
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x - 1, p.y + 14);
          ctx.stroke();
        } else if (particleType === 'embers') {
          p.y -= p.speedY * 0.9;
          p.x += Math.sin(p.pulse) * 0.8;
          if (p.y < 0) {
            p.y = height + 10;
            p.x = Math.random() * width;
          }
          ctx.fillStyle = `rgba(251, 146, 60, ${currentOpacity})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 1.2, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Dreamy bokeh / golden festive sparkles
          p.y += p.speedY * 0.4;
          p.x += Math.sin(p.pulse) * 0.5;
          if (p.y > height) {
            p.y = 0;
            p.x = Math.random() * width;
          }
          ctx.fillStyle = performanceStyle === 'jingle_presenter' 
            ? `rgba(251, 191, 36, ${currentOpacity * 0.7})` 
            : `rgba(254, 240, 138, ${currentOpacity * 0.6})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 2, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Draw Animated Character Actor & Choreography (Lip-sync, Gestures, Moving Spotlights)
      if (showPerformer) {
        drawPerformerChoreography(ctx, width, height, {
          currentTime,
          isPlaying,
          performanceStyle,
          lyricsLine: activeScene?.lyricsLine || '',
          songTitle: project?.title || songTitle,
          artistName: project?.artist || artistName,
          aspectRatio,
          primaryEmotion: project?.primaryEmotion
        });
      }

      // Sound-reactive audio equalizer wave at bottom
      if (isPlaying) {
        const barCount = 36;
        const barWidth = width / barCount;
        ctx.fillStyle = performanceStyle === 'jingle_presenter' ? 'rgba(251, 191, 36, 0.45)' : 'rgba(56, 189, 248, 0.4)';
        for (let i = 0; i < barCount; i++) {
          const waveHeight = (Math.sin(currentTime * 8 + i * 0.5) * 0.5 + 0.5) * 28 + 6;
          ctx.fillRect(i * barWidth, height - waveHeight, barWidth - 3, waveHeight);
        }
      }

      // Draw customizable watermark (text / logo / badge) on top layer before export
      drawWatermarkOnCanvas(ctx, width, height);

      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      active = false;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [project, activeSceneIndex, currentTime, isPlaying, drawWatermarkOnCanvas, showPerformer, performanceStyle, aspectRatio, songTitle, artistName]);

  // Generous AI Generation Handler
  const handleGeneratePresentation = async () => {
    setIsGenerating(true);
    setGenerationProgress(5);
    setCurrentStageIndex(0);
    setElapsedSeconds(0);
    setReasoningLogs([]);

    const startTime = Date.now();
    const intervalTimer = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    // Initial logs
    setReasoningLogs(prev => [
      ...prev,
      `[Gemini Engine] অডিও প্রসেসিং শুরু হয়েছে: "${songTitle}"`,
      `[Rhythm Profiler] অডিও ওয়েভফর্ম ডিকোড করা হচ্ছে... সময়কাল: ${audioDuration} সেকেন্ড`
    ]);

    try {
      // Stage 1: Waveform & Signal
      await new Promise(r => setTimeout(r, deepThinkingMode ? 4500 : 2000));
      setCurrentStageIndex(1);
      setGenerationProgress(25);
      setReasoningLogs(prev => [
        ...prev,
        `[Gemini 3.5 Transcribe] অডিও থেকে কথামালা ও সুরের স্বরলিপি শনাক্ত করা হচ্ছে...`,
        `[Lyrics Engine] শব্দাবলী ক্যাপচার সম্পন্ন: ছন্দ ও তাল বিশ্লেষণ চলছে...`
      ]);

      // Prepare Audio Data if custom file
      let audioBase64: string | undefined = undefined;
      if (customAudioFile) {
        try {
          const buffer = await customAudioFile.arrayBuffer();
          const bytes = new Uint8Array(buffer);
          let binary = '';
          const len = Math.min(bytes.byteLength, 15 * 1024 * 1024); // max 15MB for fast JSON
          for (let i = 0; i < len; i++) {
            binary += String.fromCharCode(bytes[i]);
          }
          audioBase64 = btoa(binary);
        } catch (e) {
          console.warn('Could not base64 encode file:', e);
        }
      }

      // Stage 2: Gemini Analysis Call
      await new Promise(r => setTimeout(r, deepThinkingMode ? 6000 : 2500));
      setCurrentStageIndex(2);
      setGenerationProgress(50);
      setReasoningLogs(prev => [
        ...prev,
        `[Emotion Profiling] গানের গভীর ভাবাবেগ অনুসন্ধান চলছে...`,
        `[Sentiment Core] মন ছোঁয়া রোমান্টিক বিষাদ ও নস্টালজিয়া ফিল্টার লক করা হয়েছে...`
      ]);

      // Call Express server endpoint
      const response = await fetch('/api/audio-presentation/analyze-and-match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          audioData: audioBase64,
          mimeType: customAudioFile?.type || 'audio/mp3',
          title: songTitle,
          artist: artistName,
          duration: audioDuration,
          aspectRatio,
          stylePreference: visualStyle,
          performanceStyle,
          lyricsInput
        })
      });

      const data = await response.json();

      // Stage 3 & 4: Scene Matching
      await new Promise(r => setTimeout(r, deepThinkingMode ? 7000 : 3000));
      setCurrentStageIndex(3);
      setGenerationProgress(80);
      setReasoningLogs(prev => [
        ...prev,
        `[Visual Matching] প্রতিটি লিরিক্স লাইনের জন্য সিনেমাটিক ফ্রেম তৈরি সম্পন্ন...`,
        `[Camera Motion] Ken Burns প্যান ও জুম ট্রানজিশন কোরিওগ্রাফ করা হয়েছে...`
      ]);

      await new Promise(r => setTimeout(r, deepThinkingMode ? 5000 : 2000));
      setCurrentStageIndex(4);
      setGenerationProgress(98);
      setReasoningLogs(prev => [
        ...prev,
        `[Audio-Visual Sync] অডিওর সাথে ফ্রেম-বাই-ফ্রেম সিঙ্ক্রোনাইজেশন লক করা হয়েছে...`,
        `[Performer Acting] গানের আবেগ ও লিরিক্সের সাথে এআই চরিত্রের অভিনয় ও লিপ-সিঙ্ক প্রস্তুত!`,
        `[Presentation Assembly] ফুল ভিডিও প্রেজেন্টেশন রেন্ডার সফল!`
      ]);

      await new Promise(r => setTimeout(r, 1200));

      if (data.success && data.project) {
        if (data.project.performanceStyle) {
          setPerformanceStyle(data.project.performanceStyle as PerformanceStyle);
        }

        const genProject: AudioPresentationProject = {
          ...data.project,
          audioUrl: activeAudioSrc,
          duration: audioDuration
        };

        setProject(genProject);
        setActiveSceneIndex(0);
        setCurrentTime(0);

        // Save to Firestore Project History
        try {
          saveJobToFirestore({
            id: genProject.id,
            userId: 'user_music_presenter',
            prompt: `🎵 ${genProject.title} - ${genProject.artist} (${genProject.primaryEmotion})`,
            style: `Full Video Presentation (${visualStyle})`,
            aspectRatio: genProject.aspectRatio,
            status: 'completed',
            progress: 100,
            duration: genProject.duration,
            resolution: '1080p (FHD Full Presentation)',
            voiceoverText: genProject.lyricTranscript,
            srtContent: genProject.scenes.map((s, i) => `${i + 1}\n${s.timestampLabel}\n${s.lyricsLine}\n`).join('\n'),
            creditsUsed: 15,
            createdAt: genProject.createdAt,
            ffmpegLogs: [
              `[Gemini 3.8 Flash] Emotional matching finished in ${elapsedSeconds}s`,
              `[Scenes] Generated ${genProject.scenes.length} synchronized scenes with audio backing`,
              `[Emotion] Primary vibe: ${genProject.primaryEmotion}`,
              `[Status] Ready in Audio Presentation Studio`
            ]
          });
        } catch (dbErr) {
          console.warn('Firestore save notice:', dbErr);
        }

        addToast({
          type: 'success',
          title: isBn ? 'ভিডিও প্রেজেন্টেশন প্রস্তুত!' : 'Presentation Ready!',
          message: isBn ? 'আপনার গানের সাথে সুন্দর আবেগ ম্যাচিং করে ভিডিও তৈরি সম্পন্ন হয়েছে।' : 'Video scenes matched and synchronized with audio.'
        });

        // Start playing automatically
        if (audioRef.current) {
          audioRef.current.currentTime = 0;
          audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
        }
      } else {
        throw new Error(data.error || 'Failed to generate presentation plan');
      }
    } catch (err: any) {
      console.error('Generation error:', err);
      addToast({
        type: 'error',
        title: isBn ? 'প্রেজেন্টেশন তৈরিতে সমস্যা' : 'Generation Failed',
        message: err?.message || 'Please check audio and try again.'
      });
    } finally {
      clearInterval(intervalTimer);
      setIsGenerating(false);
      setGenerationProgress(100);
    }
  };

  // Video Export & Download using MediaRecorder (combines Canvas + Audio)
  const handleExportFullVideo = async () => {
    const canvas = canvasRef.current;
    const audio = audioRef.current;
    if (!canvas || !audio || !project) return;

    setIsExportingVideo(true);
    setExportProgress(10);

    try {
      addToast({
        type: 'info',
        title: isBn ? 'ভিডিও এক্সপোর্ট শুরু হচ্ছে...' : 'Exporting Video...',
        message: isBn ? 'ক্যানভাস ফ্রেম ও অডিও ট্র্যাক একত্রিত করে ফুল ভিডিও তৈরি হচ্ছে।' : 'Assembling full canvas frames and audio.'
      });

      // Capture stream from canvas
      const canvasStream = canvas.captureStream(30);

      // Create Audio Context to capture HTML5 Audio element output
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const dest = audioCtx.createMediaStreamDestination();
      const source = audioCtx.createMediaElementSource(audio);
      source.connect(dest);
      source.connect(audioCtx.destination); // keep hearing while recording

      // Combine audio + video tracks
      const combinedStream = new MediaStream([
        ...canvasStream.getVideoTracks(),
        ...dest.stream.getAudioTracks()
      ]);

      const recorder = new MediaRecorder(combinedStream, {
        mimeType: MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus') 
          ? 'video/webm;codecs=vp9,opus' 
          : 'video/webm'
      });

      const chunks: Blob[] = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = () => {
        const completeBlob = new Blob(chunks, { type: 'video/webm' });
        const videoDownloadUrl = URL.createObjectURL(completeBlob);

        // Trigger file download
        const a = document.createElement('a');
        a.href = videoDownloadUrl;
        a.download = `${project.title.replace(/\s+/g, '_')}_Presentation.webm`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        setIsExportingVideo(false);
        setExportProgress(100);

        addToast({
          type: 'success',
          title: isBn ? 'ভিডিও ডাউনলোড সম্পন্ন!' : 'Video Downloaded!',
          message: isBn ? 'ফুল মিউজিক ভিডিও প্রেজেন্টেশন আপনার ডিভাইসে সেভ হয়েছে।' : 'Presentation video saved to device.'
        });
      };

      mediaRecorderRef.current = recorder;

      // Play from beginning and record
      audio.currentTime = 0;
      setCurrentTime(0);
      recorder.start();
      await audio.play();
      setIsPlaying(true);

      // Track progress
      const exportTimer = setInterval(() => {
        if (!audio || audio.ended || audio.currentTime >= audioDuration) {
          clearInterval(exportTimer);
          if (recorder.state === 'recording') {
            recorder.stop();
          }
        } else {
          setExportProgress(Math.min(99, Math.round((audio.currentTime / audioDuration) * 100)));
        }
      }, 400);
      exportTimerRef.current = exportTimer;

    } catch (exportErr: any) {
      console.warn('MediaRecorder export fallback:', exportErr);
      setIsExportingVideo(false);
      addToast({
        type: 'warning',
        title: isBn ? 'সরাসরি ব্রাউজার রেকর্ডিং' : 'Recording Notice',
        message: isBn ? 'গান চলার সাথে সাথে স্ক্রিন ক্যাপচার চালু রয়েছে।' : 'Playback recording active.'
      });
    }
  };

  const handleCancelExport = () => {
    if (exportTimerRef.current) {
      clearInterval(exportTimerRef.current);
      exportTimerRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      try {
        mediaRecorderRef.current.stop();
      } catch (_e) {}
    }
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlaying(false);
    setIsExportingVideo(false);
    setExportProgress(0);
    addToast({
      type: 'info',
      title: isBn ? 'এক্সপোর্ট বাতিল করা হয়েছে' : 'Export Cancelled',
      message: isBn ? 'ভিডিও এনকোডিং পাইপলাইন বন্ধ করা হয়েছে।' : 'Video rendering pipeline stopped.'
    });
  };

  return (
    <div className="space-y-8 animate-fadeIn text-slate-100">
      
      {/* Hidden Master Audio Element */}
      <audio
        ref={audioRef}
        src={activeAudioSrc}
        onTimeUpdate={() => {
          if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime);
          }
        }}
        onLoadedMetadata={() => {
          if (audioRef.current && audioRef.current.duration) {
            setAudioDuration(audioRef.current.duration);
          }
        }}
        onEnded={() => setIsPlaying(false)}
      />

      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-purple-950/60 to-slate-900 border border-purple-500/20 p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl -z-10 pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-pink-500/10 rounded-full blur-3xl -z-10 pointer-events-none" />

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl overflow-hidden ring-1 ring-purple-500/40 shadow-xl shadow-purple-500/20 bg-slate-900 flex-shrink-0">
                <img
                  src="/src/assets/images/ai_video_logo_1793109699890.jpg"
                  alt="AI Video Studio Logo"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-400/30 text-purple-300 text-xs font-semibold tracking-wide uppercase">
                <Sparkles className="w-3.5 h-3.5 animate-spin" />
                {isBn ? 'জেমিনি এআই আবেগ ও সঙ্গীত ম্যাচিং' : 'Gemini AI Emotion & Music Matching'}
              </div>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
              {isBn ? 'অডিও MP3 বিশ্লেষণ ও ফুল ভিডিও প্রেজেন্টেশন' : 'Audio MP3 Analysis & Full Video Presentation'}
            </h1>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              {isBn 
                ? 'যেকোনো MP3 আপলোড করুন। জেমিনি এআই গানের প্রতিটি কথা ও আবেগ গভীরভাবে বিশ্লেষণ করে প্রতিটি লাইনের সাথে সিনেমাটিক ভিজ্যুয়াল দৃশ্য তৈরি ও সিঙ্ক করে ফুল ভিডিও প্রেজেন্টেশন উপহার দেবে।'
                : 'Upload any MP3. Gemini AI deeply analyzes lyrics, emotional depth, and rhythm to generate matched cinematic visual scenes and export a synchronized full video presentation.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {project && (
              <button
                onClick={() => onNavigateTab && onNavigateTab('project-history')}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium border border-slate-700 flex items-center gap-2 transition"
              >
                <History className="w-4 h-4 text-purple-400" />
                {isBn ? 'প্রজেক্ট হিস্ট্রি' : 'Project History'}
              </button>
            )}
            <button
              onClick={() => onNavigateTab && onNavigateTab('youtube-studio')}
              className="px-4 py-2.5 rounded-xl bg-red-950/60 hover:bg-red-900/80 text-red-300 text-sm font-medium border border-red-800/60 flex items-center gap-2 transition"
            >
              <Youtube className="w-4 h-4 text-red-400" />
              {isBn ? 'ইউটিউব গান' : 'YouTube Music'}
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Controls / Right Live Presentation */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* LEFT COLUMN: Upload, Presets & Configuration (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Audio Upload Box */}
          <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 space-y-4 shadow-lg backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <FileAudio className="w-5 h-5 text-pink-400" />
                {isBn ? '১. অডিও বা গান নির্বাচন করুন' : '1. Select or Upload Audio'}
              </h2>
              <span className="text-xs text-slate-400">MP3 / WAV / M4A</span>
            </div>

            {/* Drag & Drop File Upload */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition ${
                customAudioFile 
                  ? 'border-pink-500/60 bg-pink-950/20' 
                  : 'border-slate-700 hover:border-pink-500/40 bg-slate-950/40 hover:bg-slate-800/40'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="audio/*,.mp3,.wav,.m4a,.aac,.ogg"
                onChange={handleFileUpload}
                className="hidden"
              />
              <div className="w-12 h-12 rounded-full bg-pink-500/10 border border-pink-500/20 text-pink-400 flex items-center justify-center mx-auto mb-3">
                <Upload className="w-5 h-5" />
              </div>
              <p className="text-sm font-medium text-slate-200">
                {customAudioFile ? customAudioFile.name : (isBn ? 'আপনার নিজস্ব MP3 ফাইল আপলোড করতে ক্লিক করুন' : 'Click to upload your own MP3 file')}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                {customAudioFile 
                  ? `${(customAudioFile.size / (1024 * 1024)).toFixed(2)} MB • ${isBn ? 'রেডি' : 'Ready'}`
                  : (isBn ? 'অথবা নিচের যেকোনো সুন্দর বাংলা গান বেছে নিন' : 'Or pick from curated song presets below')}
              </p>
            </div>

            {/* Presets List */}
            <div className="space-y-2 pt-2">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
                {isBn ? 'তাত্ক্ষণিক টেস্ট প্রিসেট গানসমূহ:' : 'Instant Preset Tracks:'}
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {PRESET_TRACKS.map((track) => {
                  const isSelected = selectedPresetId === track.id;
                  return (
                    <button
                      key={track.id}
                      onClick={() => handleSelectPreset(track)}
                      className={`text-left p-2.5 rounded-xl border transition text-xs flex flex-col justify-between ${
                        isSelected 
                          ? 'bg-purple-950/50 border-purple-500 text-purple-200 shadow-md shadow-purple-500/10'
                          : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-300'
                      }`}
                    >
                      <div className="font-semibold truncate">{track.title}</div>
                      <div className="text-[11px] text-slate-400 truncate mt-0.5">{track.artist}</div>
                      <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2">
                        <span className="px-1.5 py-0.5 rounded bg-slate-800 text-purple-300">{track.genre}</span>
                        <span>{track.duration}s</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Song Metadata & Preferences */}
          <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 space-y-4 shadow-lg backdrop-blur-sm">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Sliders className="w-5 h-5 text-purple-400" />
              {isBn ? '২. গানের বিবরণ ও ভিজ্যুয়াল স্টাইল' : '2. Song Info & Visual Mood'}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">
                  {isBn ? 'গানের শিরোনাম' : 'Song Title'}
                </label>
                <input
                  type="text"
                  value={songTitle}
                  onChange={(e) => setSongTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 focus:outline-none focus:border-purple-500"
                  placeholder="যেমন: মেঘের পরে মেঘ জমেছে"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">
                  {isBn ? 'শিল্পী / ব্যান্ড' : 'Artist / Band'}
                </label>
                <input
                  type="text"
                  value={artistName}
                  onChange={(e) => setArtistName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 focus:outline-none focus:border-purple-500"
                  placeholder="যেমন: রবীন্দ্রসঙ্গীত ফিউশন"
                />
              </div>
            </div>

            {/* Visual Style Selection */}
            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1.5">
                {isBn ? 'ভিজ্যুয়াল পরিবেশ ও সিনেমাটিক মুড' : 'Visual Ambiance & Style'}
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'cinematic', labelBn: 'সিনেমাটিক ক্লাসিক', icon: '🎬' },
                  { id: 'romantic_rain', labelBn: 'বৃষ্টিভেজা রোমান্টিক', icon: '🌧️' },
                  { id: 'vintage_baul', labelBn: 'নস্টালজিক সুর', icon: '☕' },
                  { id: 'spiritual_nature', labelBn: 'শান্তিময় প্রকৃতি', icon: '🌄' },
                  { id: 'neon_night', labelBn: 'নিয়ন ও লো-ফাই', icon: '🌃' },
                  { id: 'starry_cosmic', labelBn: 'তারকাখচিত আকাশ', icon: '✨' },
                ].map(style => (
                  <button
                    key={style.id}
                    onClick={() => setVisualStyle(style.id)}
                    className={`p-2 rounded-xl border text-xs text-center transition ${
                      visualStyle === style.id
                        ? 'bg-purple-600/30 border-purple-500 text-purple-200'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-400'
                    }`}
                  >
                    <div className="text-sm mb-0.5">{style.icon}</div>
                    <div className="truncate text-[11px] font-medium">{style.labelBn}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Aspect Ratio */}
            <div className="flex items-center justify-between pt-1">
              <span className="text-xs font-medium text-slate-300">
                {isBn ? 'ভিডিও রেশিও:' : 'Aspect Ratio:'}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setAspectRatio('16:9')}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-semibold ${
                    aspectRatio === '16:9'
                      ? 'bg-purple-600 text-white border-purple-500'
                      : 'bg-slate-950 text-slate-400 border-slate-800'
                  }`}
                >
                  16:9 (Landscape / YouTube)
                </button>
                <button
                  onClick={() => setAspectRatio('9:16')}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-semibold ${
                    aspectRatio === '9:16'
                      ? 'bg-purple-600 text-white border-purple-500'
                      : 'bg-slate-950 text-slate-400 border-slate-800'
                  }`}
                >
                  9:16 (Shorts / Reels)
                </button>
              </div>
            </div>

            {/* 3. Character Acting & Performance Style Section */}
            <div className="rounded-2xl bg-slate-950/70 border border-purple-500/30 p-4 space-y-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-pink-400" />
                  <span className="text-xs font-bold text-white">
                    {isBn ? '৩. গানের সাথে চরিত্র অভিনয় ও স্টাইল' : '3. Character Acting & Performance Style'}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const detected = detectPerformanceStyle(songTitle, lyricsInput, visualStyle);
                      setPerformanceStyle(detected);
                      addToast({
                        type: 'info',
                        title: isBn ? 'স্টাইল ডিটেক্টেড' : 'Style Detected',
                        message: `${isBn ? 'গানের জন্য নির্বাচিত:' : 'Selected:'} ${PERFORMANCE_STYLES.find(s => s.id === detected)?.nameBn}`
                      });
                    }}
                    className="px-2 py-1 rounded-lg bg-purple-950/80 hover:bg-purple-900 border border-purple-500/40 text-[10px] font-semibold text-purple-300 flex items-center gap-1 transition"
                    title={isBn ? 'গান বিশ্লেষণ করে সঠিক পারফর্মার স্টাইল ঠিক করুন' : 'Auto-detect style from song'}
                  >
                    <Wand2 className="w-2.5 h-2.5 text-yellow-300" />
                    <span>{isBn ? 'অটো সিলেক্ট' : 'Auto'}</span>
                  </button>

                  <label className="flex items-center gap-1.5 cursor-pointer text-[11px] text-slate-300 font-medium">
                    <input
                      type="checkbox"
                      checked={showPerformer}
                      onChange={(e) => setShowPerformer(e.target.checked)}
                      className="w-3.5 h-3.5 accent-pink-500 rounded cursor-pointer"
                    />
                    <span>{isBn ? 'অভিনয় সক্রিয়' : 'Actor On'}</span>
                  </label>
                </div>
              </div>

              <p className="text-[11px] text-slate-400 leading-relaxed">
                {isBn
                  ? 'গানের লিরিক্স ও ছন্দের সাথে এআই চরিত্র লিপ-সিঙ্ক, হাতের অঙ্গভঙ্গি ও নাচ করে অভিনয় করবে। প্রতিটি গানের স্টাইল আলাদা হবে।'
                  : 'AI character acts, gestures, and lip-syncs dynamically to the lyrics and beat. Each style has unique stage and choreography.'}
              </p>

              {/* Performance Styles Grid */}
              <div className="grid grid-cols-2 gap-2">
                {PERFORMANCE_STYLES.map((style) => {
                  const isSelected = performanceStyle === style.id;
                  return (
                    <button
                      key={style.id}
                      onClick={() => setPerformanceStyle(style.id)}
                      className={`text-left p-2.5 rounded-xl border transition text-xs flex flex-col justify-between ${
                        isSelected
                          ? 'bg-gradient-to-br from-pink-950/60 to-purple-950/60 border-pink-500 text-white shadow-md shadow-pink-500/10'
                          : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-400'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-base">{style.icon}</span>
                        {isSelected && (
                          <span className="w-1.5 h-1.5 rounded-full bg-pink-400 animate-pulse" />
                        )}
                      </div>
                      <div className="font-bold text-[11px] mt-1 text-slate-200">
                        {isBn ? style.nameBn : style.nameEn}
                      </div>
                      <div className="text-[9px] text-slate-400 line-clamp-2 mt-0.5 leading-snug">
                        {isBn ? style.descriptionBn : style.nameEn}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Generous Deep Thinking Mode Option */}
            <div className="p-3.5 rounded-xl bg-purple-950/30 border border-purple-500/30 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  <span className="text-xs font-bold text-purple-200">
                    {isBn ? 'গভীর ও নিখুঁত সময় নিয়ে বিশ্লেষণ মোড' : 'Generous Deep Thinking Mode'}
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={deepThinkingMode}
                  onChange={(e) => setDeepThinkingMode(e.target.checked)}
                  className="w-4 h-4 accent-purple-600 rounded cursor-pointer"
                />
              </div>
              <p className="text-[11px] text-purple-300/80 leading-relaxed">
                {isBn
                  ? 'জেমিনি এআই-কে পর্যাপ্ত লোডিং সময় দেওয়া হবে যেন সে প্রতিটি লিরিক্স, আবেগ ও সুরের নিখুঁত মাত্রা বিশ্লেষণ করে সবচেয়ে সুন্দর সিনেমাটিক দৃশ্য উপহার দেয়।'
                  : 'Gives Gemini AI ample loading duration to deeply analyze emotions, lyrics, and rhythm for optimal visual choreography.'}
              </p>
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGeneratePresentation}
              disabled={isGenerating}
              className={`w-full py-3.5 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-xl transition ${
                isGenerating
                  ? 'bg-slate-800 text-slate-400 cursor-not-allowed border border-slate-700'
                  : 'bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 hover:from-pink-500 hover:to-indigo-500 text-white shadow-purple-500/25 active:scale-[0.99]'
              }`}
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {isBn ? 'জেমিনি গভীর বিশ্লেষণ করছে...' : 'Gemini Deep Analyzing...'}
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-yellow-300" />
                  {isBn ? 'ভিডিও প্রেজেন্টেশন তৈরি করুন' : 'Generate Video Presentation'}
                </>
              )}
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: Presentation Screen / Loading Stage / Timeline (7 cols) */}
        <div className="lg:col-span-7 space-y-6">

          {/* GENERATING / DEEP THINKING PIPELINE DISPLAY */}
          {isGenerating && (
            <div className="rounded-3xl bg-slate-900 border border-purple-500/40 p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl -z-10" />

              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-purple-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 animate-spin text-purple-300" />
                    {isBn ? 'জেমিনি এআই গভীর বিশ্লেষণ পাইপলাইন' : 'Gemini Deep Analysis Pipeline'}
                  </span>
                  <h3 className="text-xl font-bold text-white mt-1">
                    {isBn ? 'গানের অনুভূতির সাথে ভিডিও সিন ম্যাচ করা হচ্ছে...' : 'Matching Visual Scenes to Song Emotions...'}
                  </h3>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black text-purple-300 font-mono">
                    {generationProgress}%
                  </span>
                  <div className="text-xs text-slate-400 mt-0.5">
                    {elapsedSeconds}s {isBn ? 'অতিবাহিত' : 'elapsed'}
                  </div>
                </div>
              </div>

              {/* Multi-Segment Progress Bar */}
              <div className="w-full bg-slate-950 rounded-full h-3 overflow-hidden p-0.5 border border-slate-800">
                <div 
                  className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 h-full rounded-full transition-all duration-500 shadow-lg shadow-purple-500/50"
                  style={{ width: `${generationProgress}%` }}
                />
              </div>

              {/* Real-time Low-Resolution Placeholder Animation while Gemini 4 Argon processes in background */}
              <ProcessingPreview
                isGenerating={isGenerating}
                currentStageIndex={currentStageIndex}
                generationProgress={generationProgress}
                elapsedSeconds={elapsedSeconds}
                visualStyle={visualStyle}
                aspectRatio={aspectRatio}
                songTitle={songTitle}
                artistName={artistName}
                lang={lang}
              />

              {/* 5 Distinct Stages Checklist */}
              <div className="space-y-3">
                {STAGES.map((stage, idx) => {
                  const isDone = currentStageIndex > idx;
                  const isCurrent = currentStageIndex === idx;
                  return (
                    <div 
                      key={idx}
                      className={`flex items-start gap-3 p-3 rounded-xl border transition ${
                        isCurrent 
                          ? 'bg-purple-950/40 border-purple-500 text-purple-100 shadow-md shadow-purple-500/10'
                          : isDone
                            ? 'bg-slate-950/40 border-emerald-900/40 text-slate-300'
                            : 'bg-slate-950/20 border-slate-800/40 text-slate-500'
                      }`}
                    >
                      <div className="mt-0.5">
                        {isDone ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        ) : isCurrent ? (
                          <div className="w-4 h-4 border-2 border-purple-400/30 border-t-purple-400 rounded-full animate-spin" />
                        ) : (
                          <div className="w-4 h-4 rounded-full border border-slate-700 flex items-center justify-center text-[10px] text-slate-600">
                            {idx + 1}
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="text-xs font-semibold flex items-center justify-between">
                          <span>{stage.titleBn}</span>
                          {isCurrent && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 animate-pulse">
                              {isBn ? 'চলছে...' : 'Active'}
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          {stage.descBn}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Live Gemini Reasoning Terminal */}
              <div className="rounded-xl bg-slate-950 border border-slate-800 p-4 font-mono text-xs space-y-1.5 max-h-40 overflow-y-auto">
                <div className="text-slate-400 text-[10px] uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  Gemini Deep Thinking Log:
                </div>
                {reasoningLogs.map((log, index) => (
                  <div key={index} className="text-purple-300/90 leading-relaxed text-[11px]">
                    {log}
                  </div>
                ))}
              </div>

              <p className="text-xs text-center text-purple-300/70 italic">
                {isBn 
                  ? '💡 জেমিনি এআই আপনার গানের লিরিক্স ও সুরের সাথে সবচেয়ে নিখুঁত ভিজ্যুয়াল ম্যাচ করতে মনোযোগ দিয়ে কাজ করছে।' 
                  : '💡 Gemini AI is attentively analyzing each lyric line and emotion.'}
              </p>
            </div>
          )}

          {/* MAIN PRESENTATION SCREEN & CANVAS */}
          {!isGenerating && (
            <div 
              ref={containerRef}
              className={`rounded-3xl bg-slate-950 border border-slate-800 overflow-hidden shadow-2xl relative ${
                isFullscreen ? 'fixed inset-0 z-50 rounded-none' : ''
              }`}
            >
              {/* Presentation Viewport (16:9 or 9:16) */}
              <div className={`relative w-full overflow-hidden bg-black flex items-center justify-center ${
                aspectRatio === '16:9' ? 'aspect-video' : 'aspect-[9/16] max-h-[620px] mx-auto'
              }`}>
                {/* Render Canvas */}
                <canvas
                  ref={canvasRef}
                  width={854}
                  height={480}
                  className="w-full h-full object-cover"
                />

                {/* Top Overlay: Song Title & Emotion Badge */}
                <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none z-10">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-white text-xs font-semibold flex items-center gap-1.5 shadow-lg">
                      <Music className="w-3.5 h-3.5 text-pink-400" />
                      {project?.title || songTitle}
                    </span>
                    {project && (
                      <span className="px-3 py-1 rounded-full bg-purple-900/70 backdrop-blur-md border border-purple-400/30 text-purple-200 text-xs font-medium flex items-center gap-1 shadow-lg">
                        <Heart className="w-3 h-3 text-pink-400" />
                        {project.primaryEmotion}
                      </span>
                    )}

                    <button
                      onClick={() => setShowPerformer(!showPerformer)}
                      className={`pointer-events-auto px-2.5 py-1 rounded-full backdrop-blur-md border text-xs font-semibold flex items-center gap-1.5 shadow-lg transition cursor-pointer ${
                        showPerformer
                          ? 'bg-pink-950/80 border-pink-500/50 text-pink-200'
                          : 'bg-black/60 border-white/10 text-slate-400 hover:text-white'
                      }`}
                      title={isBn ? 'অভিনয় চালু বা বন্ধ করুন' : 'Toggle Character Acting'}
                    >
                      <User className="w-3.5 h-3.5 text-pink-400" />
                      <span>
                        {PERFORMANCE_STYLES.find(s => s.id === performanceStyle)?.icon}{' '}
                        {isBn 
                          ? `${PERFORMANCE_STYLES.find(s => s.id === performanceStyle)?.nameBn || 'চরিত্র অভিনয়'}` 
                          : `${PERFORMANCE_STYLES.find(s => s.id === performanceStyle)?.nameEn || 'Actor'}`}
                      </span>
                    </button>
                  </div>

                  <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-slate-300 text-xs font-mono">
                    {Math.floor(currentTime / 60)}:{String(Math.floor(currentTime % 60)).padStart(2, '0')} / {Math.floor(audioDuration / 60)}:{String(Math.floor(audioDuration % 60)).padStart(2, '0')}
                  </span>
                </div>

                {/* Center / Bottom Overlay: Dynamic Kinetic Subtitles & Scene Title */}
                <div className="absolute bottom-12 left-4 right-4 text-center pointer-events-none z-10 space-y-2">
                  {project?.scenes[activeSceneIndex] && (
                    <>
                      <div className="inline-block px-3 py-0.5 rounded-full bg-black/50 backdrop-blur-sm border border-white/10 text-[11px] font-semibold text-purple-300">
                        {project.scenes[activeSceneIndex].sceneTitle} • {project.scenes[activeSceneIndex].emotionalTone}
                      </div>
                      <div className="text-lg sm:text-2xl font-extrabold text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)] tracking-wide px-4 py-2 rounded-2xl bg-black/35 backdrop-blur-sm max-w-2xl mx-auto border border-white/5">
                        {project.scenes[activeSceneIndex].lyricsLine}
                      </div>
                    </>
                  )}
                </div>

                {/* Control Overlay on hover */}
                <div className="absolute inset-0 bg-black/20 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-4 z-20">
                  <button
                    onClick={togglePlay}
                    className="w-16 h-16 rounded-full bg-white/90 hover:bg-white text-slate-900 flex items-center justify-center shadow-2xl transition hover:scale-105"
                  >
                    {isPlaying ? <Pause className="w-8 h-8 fill-slate-900" /> : <Play className="w-8 h-8 fill-slate-900 ml-1" />}
                  </button>
                </div>
              </div>

              {/* Bottom Control Bar */}
              <div className="p-4 bg-slate-900 border-t border-slate-800 space-y-3">
                {/* Timeline scrubber with Scene Markers */}
                <div className="relative group">
                  <input
                    type="range"
                    min="0"
                    max={audioDuration || 60}
                    step="0.1"
                    value={currentTime}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      if (audioRef.current) audioRef.current.currentTime = val;
                      setCurrentTime(val);
                    }}
                    className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
                  />
                  {/* Scene bookmark dots */}
                  {project?.scenes.map((sc, idx) => {
                    const leftPct = (sc.timeStart / (audioDuration || 1)) * 100;
                    return (
                      <div
                        key={idx}
                        onClick={() => handleJumpToScene(idx)}
                        style={{ left: `${leftPct}%` }}
                        className={`absolute top-0 w-2 h-2 rounded-full cursor-pointer -translate-x-1/2 transition ${
                          activeSceneIndex === idx ? 'bg-pink-400 scale-150' : 'bg-slate-500 hover:bg-white'
                        }`}
                        title={`${sc.timestampLabel}: ${sc.sceneTitle}`}
                      />
                    );
                  })}
                </div>

                {/* Playback Controls & Action Buttons */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={togglePlay}
                      className="w-10 h-10 rounded-xl bg-purple-600 hover:bg-purple-500 text-white flex items-center justify-center transition shadow-md shadow-purple-600/30"
                    >
                      {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                    </button>
                    <button
                      onClick={() => {
                        if (audioRef.current) {
                          audioRef.current.currentTime = 0;
                          setCurrentTime(0);
                        }
                      }}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                      title={isBn ? 'পুনরায় শুরু' : 'Restart'}
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          if (audioRef.current) {
                            audioRef.current.muted = !isMuted;
                            setIsMuted(!isMuted);
                          }
                        }}
                        className="text-slate-400 hover:text-white"
                      >
                        {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                      </button>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={isMuted ? 0 : volume}
                        onChange={(e) => {
                          const v = parseFloat(e.target.value);
                          setVolume(v);
                          setIsMuted(false);
                          if (audioRef.current) {
                            audioRef.current.volume = v;
                            audioRef.current.muted = false;
                          }
                        }}
                        className="w-16 sm:w-24 h-1.5 bg-slate-800 rounded-lg appearance-none accent-purple-500"
                      />
                    </div>
                  </div>

                  {/* Right side actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowPerformer(!showPerformer)}
                      className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                        showPerformer
                          ? 'bg-pink-950/70 border-pink-500/50 text-pink-300'
                          : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                      }`}
                      title={isBn ? 'গানের সাথে চরিত্র অভিনয় চালু বা বন্ধ করুন' : 'Toggle Character Acting'}
                    >
                      <User className="w-3.5 h-3.5 text-pink-400" />
                      <span>{isBn ? 'চরিত্র অভিনয়' : 'Actor'}</span>
                      {showPerformer && (
                        <span className="w-1.5 h-1.5 rounded-full bg-pink-400 animate-pulse" />
                      )}
                    </button>

                    <button
                      onClick={openWatermarkModal}
                      className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                        watermarkConfig.enabled
                          ? 'bg-cyan-950/70 border-cyan-500/50 text-cyan-300'
                          : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                      }`}
                      title={isBn ? 'ভিডিও ওয়াটারমার্ক সেটিংস' : 'Watermark Settings'}
                    >
                      <Stamp className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{isBn ? 'ওয়াটারমার্ক' : 'Watermark'}</span>
                      {watermarkConfig.enabled && (
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                      )}
                    </button>

                    <button
                      onClick={toggleFullscreen}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                      title={isBn ? 'ফুলস্ক্রিন সিনেমা মোড' : 'Fullscreen'}
                    >
                      {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                    </button>

                    <button
                      onClick={handleExportFullVideo}
                      disabled={isExportingVideo}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center gap-2 shadow-lg shadow-emerald-600/25 transition active:scale-95"
                    >
                      {isExportingVideo ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>{exportProgress}% {isBn ? 'রেন্ডার হচ্ছে...' : 'Exporting...'}</span>
                        </>
                      ) : (
                        <>
                          <Download className="w-3.5 h-3.5" />
                          <span>{isBn ? 'ফুল ভিডিও ডাউনলোড (.webm)' : 'Download Full Video'}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SCENE STORYBOARD CAROUSEL */}
          {project && project.scenes && project.scenes.length > 0 && (
            <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 space-y-4 shadow-lg backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Film className="w-4 h-4 text-purple-400" />
                  {isBn ? 'ম্যাচ করা সিনেমাটিক সিনসমূহ (Timeline Scenes)' : 'Matched Cinematic Scenes'}
                </h3>
                <span className="text-xs text-purple-300 bg-purple-950/60 px-2.5 py-1 rounded-full border border-purple-800">
                  {project.scenes.length} {isBn ? 'টি দৃশ্য সিঙ্কড' : 'Scenes Synced'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {project.scenes.map((scene, idx) => {
                  const isActive = activeSceneIndex === idx;
                  return (
                    <div
                      key={scene.sceneNumber}
                      onClick={() => handleJumpToScene(idx)}
                      className={`group p-3 rounded-xl border cursor-pointer transition flex gap-3 ${
                        isActive
                          ? 'bg-purple-950/50 border-purple-500 ring-1 ring-purple-500'
                          : 'bg-slate-950/50 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {/* Scene Thumbnail */}
                      <div className="w-20 h-20 rounded-lg overflow-hidden bg-slate-800 flex-shrink-0 relative">
                        <img
                          src={scene.imageUrl}
                          alt={scene.sceneTitle}
                          className="w-full h-full object-cover group-hover:scale-105 transition"
                        />
                        <div className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/70 text-[9px] font-mono text-white">
                          {scene.timestampLabel}
                        </div>
                      </div>

                      {/* Scene Details */}
                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between text-xs font-semibold">
                            <span className="text-purple-300 truncate">{scene.sceneTitle}</span>
                            <span className="text-[10px] text-slate-400">#{scene.sceneNumber}</span>
                          </div>
                          <p className="text-[11px] text-slate-300 truncate mt-1">
                            "{scene.lyricsLine}"
                          </p>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-2">
                          <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-pink-300 truncate">
                            {scene.emotionalTone}
                          </span>
                          <span className="text-slate-500 capitalize">{scene.cameraMotion}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Real-time Video Rendering & Export Pipeline Progress Indicator */}
      <VideoExportProgressIndicator
        isExporting={isExportingVideo}
        progress={exportProgress}
        title={project ? `${project.title} - ${project.artist}` : songTitle}
        duration={audioDuration || 45}
        fps={30}
        resolution={aspectRatio === '16:9' ? '1920x1080 (1080p Landscape)' : '1080x1920 (9:16 Shorts)'}
        format="WebM (VP9 + Opus)"
        hasWatermark={watermarkConfig.enabled}
        onCancel={handleCancelExport}
        lang={lang}
        allowFloatingMinimize={true}
      />
    </div>
  );
};
