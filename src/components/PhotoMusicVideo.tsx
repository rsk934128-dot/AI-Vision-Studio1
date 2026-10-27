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
  Image as ImageIcon, 
  User, 
  MapPin, 
  Sliders, 
  CheckCircle2, 
  Film, 
  Camera, 
  Wand2, 
  Layers, 
  Clock, 
  Radio, 
  FileAudio, 
  Heart, 
  Zap, 
  CloudRain, 
  Sun, 
  Compass, 
  Maximize2,
  Copy,
  Check,
  Youtube
} from 'lucide-react';
import { Language, ModelProfile, LocationPreset, MusicGenrePreset, MusicVideoProject, MusicVideoScene } from '../types';
import { YouTubeUploadModal } from './YouTubeUploadModal';
import { useToast } from '../context/ToastContext';
import { safeParseResponse } from '../utils/apiClient';
import { saveJobToFirestore } from '../services/firebase';

interface PhotoMusicVideoProps {
  lang: Language;
}

// Preset Models
const PRESET_MODELS: ModelProfile[] = [
  {
    id: 'shakib_pop',
    name: 'Shakib (শাকিব)',
    nameBn: 'শাকিব (পপ স্টার ও মডেল)',
    gender: 'male',
    style: 'Modern Pop & Leather Jacket',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&auto=format&fit=crop&q=80',
    descBn: 'আকর্ষণীয় স্টাইলিশ লুক, হালকা দাড়ি ও গভীর চাহনি',
    descEn: 'Charismatic modern pop look with intense expressive eyes',
    defaultCostume: 'Black Leather Jacket over Dark Tee'
  },
  {
    id: 'ayesha_traditional',
    name: 'Ayesha (আয়েশা)',
    nameBn: 'আয়েশা (ঐতিহ্যবাহী রূপসী)',
    gender: 'female',
    style: 'Royal Jamdani Sharee & Classical',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80',
    descBn: 'লাল জামদানি শাড়ি, সোনার গহনা ও বাতাসে ওড়া এলোকেশী চুল',
    descEn: 'Crimson Jamdani saree with gold jewelry and wind-swept hair',
    defaultCostume: 'Royal Crimson Bengali Sharee with Golden Border'
  },
  {
    id: 'rayhan_street',
    name: 'Rayhan (রায়হান)',
    nameBn: 'রায়হান (সাইবারপাঙ্ক ও স্ট্রিটওয়্যার)',
    gender: 'male',
    style: 'Urban Cyberpunk Streetwear',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600&auto=format&fit=crop&q=80',
    descBn: 'নিয়ন টেকওয়্যার হুডি, আত্মবিশ্বাসী স্মার্ট লুক',
    descEn: 'Futuristic urban streetwear with neon attitude',
    defaultCostume: 'Reflective Cyberpunk Techwear Hoodie'
  },
  {
    id: 'zara_pop',
    name: 'Zara (জারা)',
    nameBn: 'জারা (ওয়েস্টার্ন পপ ডিভা)',
    gender: 'female',
    style: 'Western Stage Glamour',
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&auto=format&fit=crop&q=80',
    descBn: 'গ্ল্যামারাস কনসার্ট লুক, মাইক্রোফোন ও স্টেজ লাইট',
    descEn: 'High-energy pop star stage costume with vibrant aura',
    defaultCostume: 'Glittering Stage Performance Blazer'
  },
  {
    id: 'couple_duo',
    name: 'Rafi & Nila (রাফি ও নীলা)',
    nameBn: 'রাফি ও নীলা (রোমান্টিক ডুয়েট জুটি)',
    gender: 'duo',
    style: 'Romantic Sunset Duet Couple',
    avatarUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=600&auto=format&fit=crop&q=80',
    descBn: 'রোমান্টিক যুগলবন্দী, চমৎকার রসায়ন ও সুরেলা ভাব',
    descEn: 'Harmonious romantic duet couple walking side by side',
    defaultCostume: 'Color-Coordinated Autumn Casuals'
  },
  {
    id: 'arif_sufi',
    name: 'Arif (আরিফ)',
    nameBn: 'আরিফ (সুফি ও একোস্টিক শিল্পী)',
    gender: 'male',
    style: 'Spiritual Sufi & Acoustic',
    avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600&auto=format&fit=crop&q=80',
    descBn: 'সাদা পাঞ্জাবি, শান্ত দৃষ্টি ও আধ্যাত্মিক ভাবগাম্ভীর্য',
    descEn: 'Serene white Panjabi with profound acoustic ambiance',
    defaultCostume: 'Pure White Linen Panjabi'
  }
];

// Preset Locations
const PRESET_LOCATIONS: LocationPreset[] = [
  {
    id: 'coxsbazar',
    name: 'Cox\'s Bazar Sunset Beach',
    nameBn: 'কক্সবাজার সমুদ্র সৈকত (গোধূলি লগ্ন)',
    category: 'nature',
    bgUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80',
    lighting: 'Golden Hour Sunset with ocean wave mist',
    mood: 'Romantic & Serene',
    particles: 'sparkles'
  },
  {
    id: 'hatirjheel_night',
    name: 'Dhaka Hatirjheel Neon Cityscape',
    nameBn: 'ঢাকা হাতিরঝিল ও নিয়ন সিটি লাইটস',
    category: 'urban',
    bgUrl: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=800&auto=format&fit=crop&q=80',
    lighting: 'Bioluminescent Neon Violet & Cyan city reflections',
    mood: 'Energetic & Modern',
    particles: 'neon'
  },
  {
    id: 'romantic_rain',
    name: 'Monsoon Rainy Street at Night',
    nameBn: 'বৃষ্টিভেজা রোমান্টিক রাজপথ ও বাতি',
    category: 'romantic',
    bgUrl: 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?w=800&auto=format&fit=crop&q=80',
    lighting: 'Moody Street Lamp reflections on wet asphalt',
    mood: 'Deeply Emotional & Melancholic',
    particles: 'rain'
  },
  {
    id: 'paris_eiffel',
    name: 'Parisian Twilight & Seine Bridge',
    nameBn: 'প্যারিস আইফেল টাওয়ার ও সন্ধ্যা',
    category: 'romantic',
    bgUrl: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&auto=format&fit=crop&q=80',
    lighting: 'Warm architectural illumination against purple twilight',
    mood: 'Classic European Romance',
    particles: 'sparkles'
  },
  {
    id: 'tokyo_sakura',
    name: 'Tokyo Cherry Blossom Sakura Garden',
    nameBn: 'টোকিও চেরি ব্লসম বাগান ও গোধূলি',
    category: 'romantic',
    bgUrl: 'https://images.unsplash.com/photo-1522383225653-ed111181a951?w=800&auto=format&fit=crop&q=80',
    lighting: 'Soft Pink Petal diffuse morning sunlight',
    mood: 'Dreamy & Poetic',
    particles: 'petals'
  },
  {
    id: 'sajek_clouds',
    name: 'Sajek Valley Sea of Clouds',
    nameBn: 'সাজেক ভ্যালি ও মেঘের পাহাড়',
    category: 'nature',
    bgUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&auto=format&fit=crop&q=80',
    lighting: 'Pristine mountain sunrise piercing morning mist',
    mood: 'Awe-inspiring & Free',
    particles: 'sparkles'
  },
  {
    id: 'village_river',
    name: 'Bengal Mustard Field & Riverbank',
    nameBn: 'সোনালী সরিষা ক্ষেত ও কাশবনের নদী',
    category: 'nature',
    bgUrl: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&auto=format&fit=crop&q=80',
    lighting: 'Bright natural golden sunshine with emerald greens',
    mood: 'Nostalgic & Heartwarming',
    particles: 'petals'
  },
  {
    id: 'cyberpunk_stage',
    name: 'Cyberpunk 2099 Hologram Stage',
    nameBn: 'ভবিষ্যতের নিয়ন স্টেজ ও হলোগ্রাম',
    category: 'scifi',
    bgUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=800&auto=format&fit=crop&q=80',
    lighting: 'Pulsing laser arrays, smoke cannons, and 3D holograms',
    mood: 'Electrifying & Futuristic',
    particles: 'neon'
  },
  {
    id: 'mughal_palace',
    name: 'Mughal Heritage Palace Courtyard',
    nameBn: 'মুঘল লালবাগ কেল্লার ফোয়ারা চত্বর',
    category: 'heritage',
    bgUrl: 'https://images.unsplash.com/photo-1585123388867-3bfe6dd4bdbf?w=800&auto=format&fit=crop&q=80',
    lighting: 'Floating candle lanterns and moonlit marble arches',
    mood: 'Royal Grandeur & Mystical',
    particles: 'sparkles'
  }
];

// Preset Genres
const PRESET_GENRES: MusicGenrePreset[] = [
  {
    id: 'romantic_bangla',
    name: 'Romantic Bangla Melody',
    nameBn: 'হৃদয় ছোঁয়া বাংলা রোমান্টিক গান',
    bpm: 88,
    mood: 'Romantic & Emotional',
    synthStyle: 'romantic_chords',
    sampleLyricsBn: 'তোমার চোখে তাকিয়ে দেখি নীল আকাশের সীমানা,\nতুমি ছাড়া এই জীবনে আর তো কিছু চাই না।\nবাতাস ছুঁয়ে যায় মনের গোপন কোণ,\nতুমি আমার সুর, তুমিই আমার গান।',
    sampleLyricsEn: 'Gazing into your eyes I see the endless blue horizon,\nWithout you, my soul seeks nothing more.'
  },
  {
    id: 'dance_pop',
    name: 'Modern Dance & Electro Pop',
    nameBn: 'প্রাণবন্ত ড্যান্স পপ ও ক্লাব বিট',
    bpm: 126,
    mood: 'High Energy & Celebratory',
    synthStyle: 'pop_groove',
    sampleLyricsBn: 'নিয়নের আলোয় নাচো মন খুলে আজ,\nসব ভাবনা ভুলে ফেলে শুরু হোক নতুন সাজ।\nবুকের মাঝে বাজে এক মাতাল ছন্দ,\nআজকের এই রাত আমাদের আনন্দে আনন্দ!',
    sampleLyricsEn: 'Dance free under the glowing neon night,\nLeave all sorrows behind and shine so bright.'
  },
  {
    id: 'lofi_rain',
    name: 'Lo-Fi Midnight Rainy Chill',
    nameBn: 'লো-ফাই রেইন ও কফি হাউজ বিট',
    bpm: 78,
    mood: 'Peaceful & Nostalgic',
    synthStyle: 'lofi_chill',
    sampleLyricsBn: 'জানালায় বৃষ্টির ফোঁটা ঝরে একা একা,\nপুরনো স্মৃতির পাতায় তোমার ছবি আঁকা।\nচায়ের কাপের ধোঁয়ায় ভেসে যায় মন,\nতুমি আছো পাশে যেন প্রতিটা ক্ষণ।',
    sampleLyricsEn: 'Raindrops gently tapping on the windowpane,\nSketching your memory through the misty rain.'
  },
  {
    id: 'sufi_ghazal',
    name: 'Soulful Sufi & Ghazal Qawwali',
    nameBn: 'আধ্যাত্মিক সুফি ও মিষ্টি গজল',
    bpm: 72,
    mood: 'Spiritual & Transcendent',
    synthStyle: 'sufi_meditation',
    sampleLyricsBn: 'খোদার সৃষ্টিতে লুকিয়ে আছে প্রেমের মহিমা,\nঅন্তরে বাজে এক অন্তহীন সুরের সীমা।\nশান্তির খোঁজে মন হারায় অজানায়,\nচিরন্তন প্রেমের আলো ছড়িয়ে যায়।',
    sampleLyricsEn: 'Divine beauty shines in every creation of grace,\nAn endless celestial tune fills this sacred space.'
  },
  {
    id: 'acoustic',
    name: 'Acoustic Guitar Indie Jam',
    nameBn: 'একোস্টিক গিটার ও মাটির সুর',
    bpm: 96,
    mood: 'Warm & Authentic',
    synthStyle: 'acoustic_strum',
    sampleLyricsBn: 'নদীর তীরে বসে গাই মাটির গান,\nবাতাসের বাঁশিতে ভাসে উদাস প্রাণ।\nসোনালী রোদের আলোয় দিন কেটে যায়,\nজীবন যেন এক সুরের মোহনায়।',
    sampleLyricsEn: 'Sitting by the river singing songs of the earth,\nIn the flute of the wind, new melodies take birth.'
  },
  {
    id: 'hiphop',
    name: 'Bangla Hip-Hop & Street Drip',
    nameBn: 'বাংলা হিপ-হপ ও স্ট্রিট বিট',
    bpm: 138,
    mood: 'Bold & Rhythmic',
    synthStyle: 'trap_beat',
    sampleLyricsBn: 'শহরের রাস্তায় জ্বলে হাজারও আলো,\nআমরা নিজেদের নিয়মে চলি সবসময় ভালো।\nপ্রতিটি পদক্ষেপে বিশ্বাসের জোর,\nঅন্ধকার কেটে উঠবে নতুন ভোর!',
    sampleLyricsEn: 'Thousands of lights blaze down the city streets,\nLiving on our own terms, moving with the beats.'
  }
];

export const PhotoMusicVideo: React.FC<PhotoMusicVideoProps> = ({ lang }) => {
  const isBn = lang === 'bn';
  const { notifySuccess, notifyError, notifyRenderSuccess, notifyRenderError } = useToast();

  // Model State
  const [modelType, setModelType] = useState<'boy' | 'girl' | 'couple' | 'custom'>('boy');
  const [selectedModel, setSelectedModel] = useState<ModelProfile>(PRESET_MODELS[0]);
  const [customPhotoUrl, setCustomPhotoUrl] = useState<string>('');
  const [customModelName, setCustomModelName] = useState<string>('Custom Model');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Location State
  const [selectedLocation, setSelectedLocation] = useState<LocationPreset>(PRESET_LOCATIONS[0]);
  const [customLocationPrompt, setCustomLocationPrompt] = useState<string>('');
  const [vfxEffect, setVfxEffect] = useState<'rain' | 'petals' | 'sparkles' | 'neon' | 'none'>('sparkles');

  // Music & Lyrics State
  const [selectedGenre, setSelectedGenre] = useState<MusicGenrePreset>(PRESET_GENRES[0]);
  const [songTitle, setSongTitle] = useState<string>('তোমার চোখের মোহনায়');
  const [lyricsPrompt, setLyricsPrompt] = useState<string>('রোমান্টিক প্রেম ও নদীর তীরে সূর্যাস্তের গান');
  const [customAudioFile, setCustomAudioFile] = useState<File | null>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);

  // Video Config
  const [aspectRatio, setAspectRatio] = useState<'9:16' | '16:9' | '1:1'>('9:16');
  const [colorGrade, setColorGrade] = useState<'teal_orange' | 'sunset_gold' | 'neon_violet' | 'vintage_film' | 'clean'>('sunset_gold');

  // Generation & Project State
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationProgress, setGenerationProgress] = useState<number>(0);
  const [generationStep, setGenerationStep] = useState<string>('');
  const [project, setProject] = useState<MusicVideoProject | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [showYouTubeModal, setShowYouTubeModal] = useState<boolean>(false);

  // Playback & Canvas Video Engine State
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const totalDuration = 28;
  const activeSceneIndex = Math.min(3, Math.floor((currentTime / totalDuration) * 4));
  const currentTimeRef = useRef<number>(currentTime);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportProgress, setExportProgress] = useState<number>(0);

  useEffect(() => {
    currentTimeRef.current = currentTime;
  }, [currentTime]);

  // Audio Context Ref for procedural music synthesis
  const audioCtxRef = useRef<AudioContext | null>(null);
  const synthTimerRef = useRef<any>(null);

  // Active Model avatar URL
  const activeAvatarUrl = modelType === 'custom' && customPhotoUrl 
    ? customPhotoUrl 
    : selectedModel.avatarUrl;

  const activeModelName = modelType === 'custom' 
    ? (customModelName || 'My Model') 
    : (isBn ? selectedModel.nameBn : selectedModel.name);

  const activeLocationName = customLocationPrompt.trim() 
    ? customLocationPrompt 
    : (isBn ? selectedLocation.nameBn : selectedLocation.name);

  // Handle Photo File Upload
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setCustomPhotoUrl(event.target.result as string);
          setModelType('custom');
          setCustomModelName(file.name.replace(/\.[^/.]+$/, ''));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle Custom Audio File Upload
  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCustomAudioFile(file);
      setSongTitle(file.name.replace(/\.[^/.]+$/, ''));
    }
  };

  // Switch Model Type filter
  const handleModelTypeSelect = (type: 'boy' | 'girl' | 'couple' | 'custom') => {
    setModelType(type);
    if (type !== 'custom') {
      const targetGender = type === 'boy' ? 'male' : type === 'girl' ? 'female' : 'duo';
      const match = PRESET_MODELS.find(m => m.gender === targetGender);
      if (match) setSelectedModel(match);
    }
  };

  // Generate Music Video Project via Server Endpoint
  const handleGenerateMusicVideo = async () => {
    setIsGenerating(true);
    setGenerationProgress(10);
    setGenerationStep(isBn ? 'মডেলের ছবি ও ফেসিয়াল ফিচার অ্যানালাইসিস হচ্ছে...' : 'Analyzing model facial features & lighting...');

    const timer = setInterval(() => {
      setGenerationProgress(prev => {
        if (prev < 40) {
          setGenerationStep(isBn ? 'লোকেশনের পরিবেশ ও সিনেমাটিক ক্যামেরা তৈরি হচ্ছে...' : 'Synthesizing 8K location environment & camera paths...');
          return prev + 12;
        } else if (prev < 75) {
          setGenerationStep(isBn ? 'সুরেলা গান, লিরিক্স ও অডিও বিট ট্র্যাকিং হচ্ছে...' : 'Aligning musical tempo, rhyming lyrics & beat drop...');
          return prev + 15;
        } else if (prev < 90) {
          setGenerationStep(isBn ? '৪টি সিনেমাটিক দৃশ্য ও কালার গ্রেডিং ফাইনাল হচ্ছে...' : 'Rendering 4 cinematic video scenes with color grading...');
          return prev + 5;
        }
        return prev;
      });
    }, 600);

    try {
      const res = await fetch('/api/generate-music-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          modelType,
          modelName: activeModelName,
          location: activeLocationName,
          genre: selectedGenre.id,
          songTitle: songTitle.trim() || (isBn ? 'তোমার চোখের মোহনায়' : 'In the Depths of Your Eyes'),
          lyricsPrompt: lyricsPrompt.trim() || 'রোমান্টিক গান ও প্রাকৃতিক সৌন্দর্য',
          aspectRatio,
          language: lang
        })
      });

      const parsed = await safeParseResponse<any>(res);
      const data = parsed.data || {};
      clearInterval(timer);
      setGenerationProgress(100);
      setGenerationStep(isBn ? 'মিউজিক ভিডিও তৈরি সম্পন্ন!' : 'Music Video Production Complete!');

      if (parsed.success && data.project) {
        const raw = data.project;
        const newProject: MusicVideoProject = {
          id: `mv_${Date.now()}`,
          title: raw.title || songTitle,
          artist: raw.artist || activeModelName,
          model: {
            id: selectedModel.id,
            name: activeModelName,
            gender: modelType === 'custom' ? 'male' : selectedModel.gender,
            avatarUrl: activeAvatarUrl,
            isCustom: modelType === 'custom',
            style: selectedModel.style
          },
          location: {
            id: selectedLocation.id,
            name: activeLocationName,
            bgUrl: selectedLocation.bgUrl,
            mood: selectedLocation.mood,
            particles: vfxEffect,
            isCustom: !!customLocationPrompt.trim()
          },
          music: {
            genreId: selectedGenre.id,
            name: selectedGenre.name,
            bpm: raw.bpm || selectedGenre.bpm,
            synthStyle: raw.synthStyle || selectedGenre.synthStyle,
            lyricsBn: raw.fullLyricsBn || selectedGenre.sampleLyricsBn,
            lyricsEn: raw.fullLyricsEn || selectedGenre.sampleLyricsEn
          },
          aspectRatio,
          scenes: raw.scenes || [],
          status: 'ready',
          videoUrl: raw.videoUrl || (aspectRatio === '9:16' ? '/videos/shorts_9_16.mp4' : '/videos/sample2.mp4'),
          createdAt: new Date().toLocaleTimeString()
        };

        setProject(newProject);
        setIsPlaying(true);
        setCurrentTime(0);

        // Save persistent record to Firestore & local cache
        saveJobToFirestore({
          id: newProject.id,
          userId: 'user_music_creator',
          prompt: `${newProject.title} - ${newProject.artist} (${activeLocationName})`,
          style: `${selectedGenre.name} - ${activeModelName}`,
          aspectRatio: newProject.aspectRatio,
          status: 'completed',
          progress: 100,
          duration: 28,
          resolution: newProject.aspectRatio === '9:16' ? '1080x1920 (FHD)' : '1080p (FHD)',
          videoUrl: newProject.videoUrl,
          voiceoverText: newProject.music.lyricsBn,
          srtContent: `1\n00:00:01,000 --> 00:00:07,000\n${newProject.music.lyricsBn}\n\n2\n00:00:07,500 --> 00:00:15,000\n${newProject.music.lyricsEn}`,
          creditsUsed: 15,
          createdAt: new Date().toISOString(),
          ffmpegLogs: ['FFmpeg music video render completed successfully']
        });

        notifySuccess(
          'Music Video Synthesized! 🎬',
          `"${newProject.title}" by ${newProject.artist} is ready with 4 dynamic scenes.`,
          'মিউজিক ভিডিও সফলভাবে তৈরি হয়েছে! 🎬',
          `"${newProject.title}" গানটি ৪টি দৃশ্যসহ প্রস্তুত হয়েছে।`
        );
      }
    } catch (_err) {
      clearInterval(timer);
      setGenerationProgress(100);
      notifyRenderError(
        isBn 
          ? 'মিউজিক ভিডিও তৈরিতে ত্রুটি দেখা দিয়েছে। আবার চেষ্টা করুন।' 
          : 'Music video generation encountered an error. Please try again.'
      );
    } finally {
      setIsGenerating(false);
    }
  };

  // Synthesize Web Audio Chords / Beats
  const playWebAudioTone = useCallback((freq: number, type: OscillatorType = 'sine', duration = 0.4, gainLevel = 0.15) => {
    if (isMuted) return;
    try {
      if (!audioCtxRef.current) {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContextClass) {
          audioCtxRef.current = new AudioContextClass();
        }
      }
      const ctx = audioCtxRef.current;
      if (!ctx) return;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      gain.gain.setValueAtTime(gainLevel, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (_e) {
      // Audio autoplay policy
    }
  }, [isMuted]);

  // Audio loop based on selected music style
  useEffect(() => {
    if (!isPlaying) {
      if (synthTimerRef.current) clearInterval(synthTimerRef.current);
      return;
    }

    const currentGenre = project?.music?.genreId || selectedGenre.id;
    const intervalMs = currentGenre === 'dance_pop' || currentGenre === 'hiphop' ? 450 : 700;

    const chordsRomantic = [261.63, 329.63, 392.00, 440.00, 349.23, 261.63];
    const chordsPop = [220.00, 261.63, 329.63, 392.00, 493.88];
    const chordsLofi = [196.00, 246.94, 293.66, 369.99, 440.00];

    let noteIdx = 0;
    synthTimerRef.current = setInterval(() => {
      const chordList = currentGenre === 'dance_pop' ? chordsPop : currentGenre === 'lofi_rain' ? chordsLofi : chordsRomantic;
      const f = chordList[noteIdx % chordList.length];
      playWebAudioTone(f, currentGenre === 'dance_pop' ? 'sawtooth' : 'sine', 0.5, 0.08);
      noteIdx++;
    }, intervalMs);

    return () => {
      if (synthTimerRef.current) clearInterval(synthTimerRef.current);
    };
  }, [isPlaying, project, selectedGenre, playWebAudioTone]);

  // Playback Timer (0 to 30 seconds across 4 scenes)
  useEffect(() => {
    let animFrame: number;
    if (isPlaying) {
      const step = () => {
        setCurrentTime(prev => {
          const next = prev + 0.05;
          if (next >= totalDuration) {
            return 0; // loop
          }
          return next;
        });
        animFrame = requestAnimationFrame(step);
      };
      animFrame = requestAnimationFrame(step);
    }
    return () => cancelAnimationFrame(animFrame);
  }, [isPlaying]);

  // Canvas Renderer Engine (Draw Model + Location + Parallax Camera + VFX + Visualizer + Lyrics)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const bgImg = new Image();
    bgImg.crossOrigin = 'anonymous';
    bgImg.src = project?.location?.bgUrl || selectedLocation.bgUrl;

    const modelImg = new Image();
    modelImg.crossOrigin = 'anonymous';
    modelImg.src = project?.model?.avatarUrl || activeAvatarUrl;

    const render = () => {
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      const time = currentTimeRef.current;
      const progress = time / totalDuration;
      const sceneProgress = (time % 7) / 7;

      // 1. Draw Background with Ken Burns Parallax Drift
      const zoom = 1.05 + 0.08 * Math.sin(progress * Math.PI * 2);
      const panX = 15 * Math.sin(progress * Math.PI);
      
      ctx.save();
      ctx.translate(w / 2 + panX, h / 2);
      ctx.scale(zoom, zoom);
      ctx.translate(-w / 2, -h / 2);

      if (bgImg.complete && bgImg.naturalWidth > 0) {
        ctx.drawImage(bgImg, 0, 0, w, h);
      } else {
        // Gradient fallback
        const grad = ctx.createLinearGradient(0, 0, 0, h);
        grad.addColorStop(0, '#1e1b4b');
        grad.addColorStop(0.5, '#312e81');
        grad.addColorStop(1, '#0f172a');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);
      }
      ctx.restore();

      // 2. Cinematic Lighting Overlay / Color Grade
      ctx.save();
      if (colorGrade === 'teal_orange') {
        ctx.fillStyle = 'rgba(234, 88, 12, 0.15)';
        ctx.fillRect(0, 0, w, h);
      } else if (colorGrade === 'neon_violet') {
        ctx.fillStyle = 'rgba(147, 51, 234, 0.18)';
        ctx.fillRect(0, 0, w, h);
      } else if (colorGrade === 'vintage_film') {
        ctx.fillStyle = 'rgba(217, 119, 6, 0.12)';
        ctx.fillRect(0, 0, w, h);
      } else {
        // Sunset Gold
        ctx.fillStyle = 'rgba(245, 158, 11, 0.14)';
        ctx.fillRect(0, 0, w, h);
      }
      ctx.restore();

      // 3. Draw Model Character blended into the scene
      // Scene 0: Wide shot | Scene 1: Close-up | Scene 2: Medium walk | Scene 3: Climax hero
      let modelScale = 0.55;
      let modelY = h * 0.42;
      let modelX = w * 0.5;

      if (activeSceneIndex === 0) {
        modelScale = 0.42;
        modelY = h * 0.48;
      } else if (activeSceneIndex === 1) {
        modelScale = 0.78;
        modelY = h * 0.36;
      } else if (activeSceneIndex === 2) {
        modelScale = 0.52;
        modelX = w * 0.5 + Math.sin(sceneProgress * Math.PI * 2) * 20;
        modelY = h * 0.44;
      } else {
        modelScale = 0.65;
        modelY = h * 0.38;
      }

      // Subtle breathing / wind sway
      const sway = Math.sin(time * 2) * 4;
      const breath = Math.sin(time * 3) * 3;

      ctx.save();
      const mSize = Math.min(w, h) * modelScale;
      const drawX = modelX - mSize / 2 + sway;
      const drawY = modelY - mSize / 2 + breath;

      // Circular vignette mask for character integration
      ctx.beginPath();
      ctx.arc(modelX + sway, modelY + breath, mSize / 2, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();

      if (modelImg.complete && modelImg.naturalWidth > 0) {
        ctx.drawImage(modelImg, drawX, drawY, mSize, mSize);
      } else {
        ctx.fillStyle = '#6366f1';
        ctx.fill();
      }

      // Soft rim lighting around model
      ctx.restore();
      ctx.save();
      ctx.beginPath();
      ctx.arc(modelX + sway, modelY + breath, mSize / 2, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(255, 215, 0, 0.35)';
      ctx.lineWidth = 3;
      ctx.shadowColor = '#fbbf24';
      ctx.shadowBlur = 18;
      ctx.stroke();
      ctx.restore();

      // 4. VFX Environmental Particles (Rain, Sakura Petals, Sparkles, or Neon Lasers)
      const currentParticles = project?.location?.particles || vfxEffect;
      ctx.save();
      const pCount = 35;
      for (let i = 0; i < pCount; i++) {
        const seed = i * 997;
        const speed = (seed % 5 + 3) * 0.5;
        const px = ((seed * 13 + time * 40 * speed) % (w + 40)) - 20;
        const py = ((seed * 29 + time * 60 * speed) % (h + 40)) - 20;

        if (currentParticles === 'rain') {
          ctx.strokeStyle = 'rgba(186, 230, 253, 0.5)';
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.moveTo(px, py);
          ctx.lineTo(px - 4, py + 18);
          ctx.stroke();
        } else if (currentParticles === 'petals') {
          ctx.fillStyle = 'rgba(244, 114, 182, 0.65)';
          ctx.beginPath();
          ctx.ellipse(px, py, 6, 3, Math.sin(time + seed), 0, Math.PI * 2);
          ctx.fill();
        } else if (currentParticles === 'neon') {
          ctx.fillStyle = i % 2 === 0 ? 'rgba(6, 182, 212, 0.7)' : 'rgba(236, 72, 153, 0.7)';
          ctx.beginPath();
          ctx.arc(px, py, 2.5, 0, Math.PI * 2);
          ctx.fill();
        } else if (currentParticles === 'sparkles') {
          ctx.fillStyle = 'rgba(251, 191, 36, 0.75)';
          ctx.beginPath();
          ctx.arc(px, py, 2, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.restore();

      // 5. Audio Visualizer Equalizer Waves at bottom
      ctx.save();
      const barCount = 32;
      const barWidth = w / barCount;
      const bpm = project?.music?.bpm || selectedGenre.bpm;
      const beatFreq = (bpm / 60) * Math.PI * 2;

      for (let i = 0; i < barCount; i++) {
        const hFactor = Math.abs(Math.sin(time * beatFreq + i * 0.35)) * (h * 0.12);
        const barH = isPlaying ? Math.max(6, hFactor) : 4;
        const bx = i * barWidth;
        const by = h - barH;

        const grad = ctx.createLinearGradient(0, by, 0, h);
        grad.addColorStop(0, '#06b6d4');
        grad.addColorStop(1, 'rgba(99, 102, 241, 0.2)');
        ctx.fillStyle = grad;
        ctx.fillRect(bx + 1, by, barWidth - 2, barH);
      }
      ctx.restore();

      // 6. Synchronized Glowing Lyrics & Subtitles Box
      ctx.save();
      const currentScenes = project?.scenes || [];
      const activeScene = currentScenes[activeSceneIndex];
      const lyricLine = activeScene 
        ? (isBn ? activeScene.lyricsSnippetBn : activeScene.lyricsSnippetEn)
        : (isBn ? selectedGenre.sampleLyricsBn.split('\n')[activeSceneIndex] : selectedGenre.sampleLyricsEn);

      if (lyricLine) {
        // Semi-transparent backdrop bar
        ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
        ctx.roundRect 
          ? ctx.roundRect(w * 0.08, h * 0.81, w * 0.84, 46, 12)
          : ctx.fillRect(w * 0.08, h * 0.81, w * 0.84, 46);
        ctx.fill();

        // Music icon + Animated glowing text
        ctx.font = 'bold 15px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#f8fafc';
        ctx.shadowColor = '#06b6d4';
        ctx.shadowBlur = 10;
        ctx.fillText(`♪  ${lyricLine}  ♪`, w / 2, h * 0.85);

        // Shot tag indicator
        ctx.font = '10px monospace';
        ctx.fillStyle = '#94a3b8';
        ctx.shadowBlur = 0;
        const shotInfo = activeScene ? `SCENE ${activeScene.sceneNumber}: ${activeScene.shotType}` : `SCENE ${activeSceneIndex + 1}`;
        ctx.fillText(shotInfo, w / 2, h * 0.885);
      }
      ctx.restore();

      // 7. Watermark / Studio Header Badge
      ctx.save();
      ctx.font = 'bold 11px sans-serif';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.textAlign = 'left';
      ctx.fillText(`✨ ${project?.title || songTitle}`, 16, 26);

      ctx.font = '10px sans-serif';
      ctx.fillStyle = 'rgba(148, 163, 184, 0.9)';
      ctx.fillText(`Artist: ${project?.artist || activeModelName} | Loc: ${activeLocationName.slice(0, 24)}`, 16, 42);

      // Duration badge on top right
      ctx.textAlign = 'right';
      const curM = Math.floor(time / 60);
      const curS = Math.floor(time % 60);
      ctx.font = 'bold 11px monospace';
      ctx.fillStyle = '#06b6d4';
      ctx.fillText(`${String(curM).padStart(2, '0')}:${String(curS).padStart(2, '0')} / 00:28`, w - 16, 26);
      ctx.restore();

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [isPlaying, project, selectedLocation, activeAvatarUrl, activeSceneIndex, colorGrade, vfxEffect, isBn, activeModelName, activeLocationName, songTitle, selectedGenre]);

  // Export Video (Canvas MediaRecorder to WebM/MP4 download)
  const handleExportVideo = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setIsExporting(true);
    setExportProgress(10);

    try {
      const stream = canvas.captureStream(30);
      const recorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${(project?.title || songTitle).replace(/\s+/g, '_')}_music_video.webm`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setIsExporting(false);
        setExportProgress(100);
      };

      recorder.start();
      setCurrentTime(0);
      setIsPlaying(true);

      const progressInterval = setInterval(() => {
        setExportProgress(prev => {
          if (prev >= 95) {
            clearInterval(progressInterval);
            recorder.stop();
            return 100;
          }
          return prev + 10;
        });
      }, 700);

    } catch (_e) {
      setIsExporting(false);
    }
  };

  // Copy Full Lyrics
  const handleCopyLyrics = () => {
    const lyrics = project?.music?.lyricsBn || selectedGenre.sampleLyricsBn;
    navigator.clipboard.writeText(lyrics);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8">
      {/* Studio Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/50 to-slate-900 border border-slate-800 p-6 rounded-2xl relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-pink-950 text-pink-300 border border-pink-800 flex items-center gap-1.5 shadow-sm">
                <Music className="w-3.5 h-3.5 text-pink-400" />
                {isBn ? 'ছবি-টু-মিউজিক ভিডিও স্টুডিও' : 'AI Photo-to-Music Video Creator'}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-indigo-950 text-indigo-300 border border-indigo-800">
                Gemini 3.8 Flash & 4 Argon
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {isBn ? 'যেকোনো মডেলের ছবি ও লোকেশন দিয়ে পূর্ণাঙ্গ মিউজিক ভিডিও তৈরি' : 'Turn Any Model Photo & Location into a Cinematic Music Video'}
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-3xl">
              {isBn 
                ? 'ছেলে বা মেয়ে যেকোনো মডেলের ছবি আপলোড করুন, পৃথিবীর যেকোনো লোকেশন ও রোমান্টিক/পপ গান সিলেক্ট করুন—এআই নিমিষেই বানিয়ে দেবে সুর, লিরিক্স ও ৪টি সিনেমাটিক দৃশ্যের হাই-ডেফিনিশন মিউজিক ভিডিও!' 
                : 'Upload any boy or girl model photo, pick any breathtaking location in the world, and match with any song genre to generate a complete cinematic music video with synced audio & lyrics.'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-pink-600 to-indigo-600 hover:from-pink-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-pink-600/25 transition"
            >
              <Upload className="w-4 h-4" />
              {isBn ? 'মডেলের ছবি আপলোড করুন' : 'Upload Model Photo'}
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handlePhotoUpload} 
              accept="image/*" 
              className="hidden" 
            />
          </div>
        </div>
      </div>

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Left Side: Creation Controls (7 cols) */}
        <div className="lg:col-span-7 space-y-6">

          {/* 1. Model & Photo Selection */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-pink-400" />
                <h3 className="text-sm font-bold text-white">
                  {isBn ? '১. মডেল ও ছবি নির্বাচন (ছেলে / মেয়ে / কাপল / নিজস্ব ছবি)' : '1. Select or Upload Model (Boy, Girl, Couple or Custom)'}
                </h3>
              </div>
              <span className="text-[10px] text-pink-400 font-bold bg-pink-950 px-2 py-0.5 rounded border border-pink-900">
                Face & Model Engine
              </span>
            </div>

            {/* Model Gender Tabs */}
            <div className="flex items-center gap-2 p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs">
              <button
                onClick={() => handleModelTypeSelect('boy')}
                className={`flex-1 py-1.5 rounded-lg font-semibold transition ${
                  modelType === 'boy' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                👦 {isBn ? 'ছেলে মডেল' : 'Boy Model'}
              </button>
              <button
                onClick={() => handleModelTypeSelect('girl')}
                className={`flex-1 py-1.5 rounded-lg font-semibold transition ${
                  modelType === 'girl' ? 'bg-pink-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                👧 {isBn ? 'মেয়ে মডেল' : 'Girl Model'}
              </button>
              <button
                onClick={() => handleModelTypeSelect('couple')}
                className={`flex-1 py-1.5 rounded-lg font-semibold transition ${
                  modelType === 'couple' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                👫 {isBn ? 'রোমান্টিক জুটি' : 'Couple Duo'}
              </button>
              <button
                onClick={() => handleModelTypeSelect('custom')}
                className={`flex-1 py-1.5 rounded-lg font-semibold transition ${
                  modelType === 'custom' ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                📷 {isBn ? 'কাস্টম ছবি' : 'Custom Photo'}
              </button>
            </div>

            {/* If Custom Photo Selected */}
            {modelType === 'custom' ? (
              <div className="p-4 bg-slate-950/80 border border-dashed border-cyan-800/80 rounded-xl flex items-center gap-4">
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-20 h-20 rounded-xl border-2 border-cyan-500 overflow-hidden bg-slate-900 shrink-0 cursor-pointer relative group flex items-center justify-center"
                >
                  {customPhotoUrl ? (
                    <img src={customPhotoUrl} alt="Model" className="w-full h-full object-cover" />
                  ) : (
                    <Upload className="w-6 h-6 text-cyan-400 group-hover:scale-110 transition" />
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                    <span className="text-[10px] text-white font-bold">{isBn ? 'পরিবর্তন' : 'Change'}</span>
                  </div>
                </div>

                <div className="flex-1 space-y-2">
                  <div>
                    <label className="text-[11px] text-slate-400 font-semibold">{isBn ? 'মডেল / শিল্পীর নাম:' : 'Model / Artist Name:'}</label>
                    <input 
                      type="text" 
                      value={customModelName} 
                      onChange={(e) => setCustomModelName(e.target.value)}
                      placeholder={isBn ? 'মডেলের নাম লিখুন...' : 'Enter model name...'}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500 mt-0.5"
                    />
                  </div>
                  <p className="text-[11px] text-cyan-300">
                    {isBn 
                      ? '✓ ছবি আপলোড করা হয়েছে। এআই স্বয়ংক্রিয়ভাবে ফেস ও লাইটিং ডিটেক্ট করে লোকেশনের সাথে ব্লেন্ড করবে।' 
                      : '✓ Photo uploaded. AI will detect face features and blend with selected location.'}
                  </p>
                </div>
              </div>
            ) : (
              /* Preset Model Carousel */
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {PRESET_MODELS.filter(m => {
                  if (modelType === 'boy') return m.gender === 'male';
                  if (modelType === 'girl') return m.gender === 'female';
                  if (modelType === 'couple') return m.gender === 'duo';
                  return true;
                }).map((m) => (
                  <div
                    key={m.id}
                    onClick={() => setSelectedModel(m)}
                    className={`p-2.5 rounded-xl border cursor-pointer transition text-left relative overflow-hidden flex flex-col ${
                      selectedModel.id === m.id
                        ? 'bg-gradient-to-b from-pink-950/60 to-indigo-950/80 border-pink-500 shadow-md shadow-pink-950/30'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="w-full aspect-square rounded-lg overflow-hidden bg-black mb-2 relative">
                      <img src={m.avatarUrl} alt={m.name} className="w-full h-full object-cover" />
                      {selectedModel.id === m.id && (
                        <div className="absolute top-1 right-1 bg-pink-600 rounded-full p-0.5 shadow">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </div>
                    <span className="text-xs font-bold text-white truncate">{isBn ? m.nameBn : m.name}</span>
                    <span className="text-[10px] text-slate-400 truncate mt-0.5">{m.style}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 2. Location & Atmosphere (যেকোনো লোকেশন) */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-bold text-white">
                  {isBn ? '২. লোকেশন ও পরিবেশ (যেকোনো জায়গায় সেট করুন)' : '2. Location & Setting (Any Place in the World)'}
                </h3>
              </div>
              <span className="text-[10px] text-cyan-400 font-bold bg-cyan-950 px-2 py-0.5 rounded border border-cyan-900">
                8K Environment
              </span>
            </div>

            {/* Custom Location Free Prompt Input */}
            <div>
              <label className="text-xs font-semibold text-slate-300 flex items-center justify-between mb-1">
                <span>{isBn ? 'কাস্টম লোকেশন লিখুন (অপশনাল):' : 'Custom Location Free-text (Optional):'}</span>
                <span className="text-[10px] text-slate-400 font-normal">{isBn ? 'যেমন: আমাজন রেইনফরেস্ট, চাঁদের বুকে' : 'e.g., Swiss Alps, Space Station'}</span>
              </label>
              <input 
                type="text" 
                value={customLocationPrompt}
                onChange={(e) => setCustomLocationPrompt(e.target.value)}
                placeholder={isBn ? 'পৃথিবী বা কল্পনার যেকোনো স্থান লিখুন (যেমন: সিলেটের চা বাগান, দুবাই বুর্জ খলিফা)...' : 'Type any location (e.g. Dubai Marina, Himalayan peaks)...'}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>

            {/* Preset Locations Cards */}
            <div className="grid grid-cols-3 gap-2.5 max-h-48 overflow-y-auto pr-1">
              {PRESET_LOCATIONS.map((loc) => (
                <div
                  key={loc.id}
                  onClick={() => {
                    setSelectedLocation(loc);
                    setCustomLocationPrompt('');
                    setVfxEffect(loc.particles);
                  }}
                  className={`p-2 rounded-xl border cursor-pointer transition text-left flex flex-col relative group ${
                    selectedLocation.id === loc.id && !customLocationPrompt.trim()
                      ? 'bg-cyan-950/50 border-cyan-500 shadow-sm'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="w-full h-14 rounded-lg overflow-hidden bg-black mb-1.5 relative">
                    <img src={loc.bgUrl} alt={loc.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                    {selectedLocation.id === loc.id && !customLocationPrompt.trim() && (
                      <div className="absolute top-1 right-1 bg-cyan-500 rounded-full p-0.5">
                        <Check className="w-2.5 h-2.5 text-black" />
                      </div>
                    )}
                  </div>
                  <span className="text-[11px] font-bold text-white truncate">{isBn ? loc.nameBn : loc.name}</span>
                  <span className="text-[9px] text-slate-400 truncate">{loc.mood}</span>
                </div>
              ))}
            </div>

            {/* Environmental VFX Selector */}
            <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-3 text-xs">
              <span className="text-slate-400 font-semibold">{isBn ? 'পরিবেশগত স্পেশাল ইফেক্ট (VFX):' : 'Environmental VFX:'}</span>
              <div className="flex items-center gap-1.5">
                {[
                  { id: 'sparkles', label: isBn ? '✨ গোল্ডেন ডাস্ট' : '✨ Golden Dust' },
                  { id: 'rain', label: isBn ? '🌧️ বৃষ্টি ও জলবিন্দু' : '🌧️ Rain Ripples' },
                  { id: 'petals', label: isBn ? '🌸 ফুলের পাপড়ি' : '🌸 Sakura Petals' },
                  { id: 'neon', label: isBn ? '⚡ নিয়ন লেজার' : '⚡ Neon Lasers' }
                ].map((ef) => (
                  <button
                    key={ef.id}
                    onClick={() => setVfxEffect(ef.id as any)}
                    className={`px-2 py-1 rounded-lg text-[10px] font-bold transition border ${
                      vfxEffect === ef.id
                        ? 'bg-cyan-950 text-cyan-300 border-cyan-700'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                    }`}
                  >
                    {ef.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 3. Music Genre, Song & Lyrics */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Music className="w-4 h-4 text-purple-400" />
                <h3 className="text-sm font-bold text-white">
                  {isBn ? '৩. গান, সুর ও লিরিক্স (যেকোনো গান ও মিউজিক)' : '3. Song, Melody & Lyrics (Any Genre or Track)'}
                </h3>
              </div>
              <button
                onClick={() => audioInputRef.current?.click()}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold border border-slate-700 transition"
              >
                <FileAudio className="w-3.5 h-3.5 text-purple-400" />
                <span>{customAudioFile ? (isBn ? 'অডিও যুক্ত আছে' : 'Audio Loaded') : (isBn ? 'নিজস্ব গান আপলোড (MP3)' : 'Upload MP3 Song')}</span>
              </button>
              <input 
                type="file" 
                ref={audioInputRef} 
                onChange={handleAudioUpload} 
                accept="audio/*" 
                className="hidden" 
              />
            </div>

            {/* Song Title & Theme Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-slate-400 font-semibold">{isBn ? 'গানের শিরোনাম:' : 'Song Title:'}</label>
                <input 
                  type="text" 
                  value={songTitle} 
                  onChange={(e) => setSongTitle(e.target.value)}
                  placeholder={isBn ? 'যেমন: তোমার চোখের মোহনায়' : 'Song title...'}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-purple-500 mt-1"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 font-semibold">{isBn ? 'লিরিক্স / থিম নির্দেশিকা:' : 'Lyrics / Theme Directive:'}</label>
                <input 
                  type="text" 
                  value={lyricsPrompt} 
                  onChange={(e) => setLyricsPrompt(e.target.value)}
                  placeholder={isBn ? 'যেমন: রোমান্টিক প্রেমের গান ও চোখের ভাষা' : 'e.g., romantic love by sunset'}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-purple-500 mt-1"
                />
              </div>
            </div>

            {/* Preset Music Genres */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {PRESET_GENRES.map((g) => (
                <div
                  key={g.id}
                  onClick={() => {
                    setSelectedGenre(g);
                    if (!songTitle || songTitle === 'তোমার চোখের মোহনায়') {
                      setSongTitle(g.sampleLyricsBn.split('\n')[0].slice(0, 25));
                    }
                  }}
                  className={`p-2.5 rounded-xl border cursor-pointer transition text-left flex flex-col ${
                    selectedGenre.id === g.id
                      ? 'bg-purple-950/60 border-purple-500 shadow-md shadow-purple-950/30'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-white truncate">{isBn ? g.nameBn : g.name}</span>
                    <span className="text-[9px] font-mono text-purple-300">{g.bpm} BPM</span>
                  </div>
                  <span className="text-[10px] text-slate-400 truncate">{g.mood}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 4. Aspect Ratio & Color Grading */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-wrap items-center justify-between gap-4">
            {/* Aspect Ratio */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-300">{isBn ? 'ভিডিও সাইজ:' : 'Aspect Ratio:'}</span>
              <div className="flex items-center gap-1.5">
                {[
                  { id: '9:16', label: '9:16 (Shorts / Reels / TikTok)' },
                  { id: '16:9', label: '16:9 (YouTube / Cinema)' },
                  { id: '1:1', label: '1:1 (Instagram)' }
                ].map((ar) => (
                  <button
                    key={ar.id}
                    onClick={() => setAspectRatio(ar.id as any)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition border ${
                      aspectRatio === ar.id
                        ? 'bg-cyan-600 text-white border-cyan-500'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                    }`}
                  >
                    {ar.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Color Grade */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-300">{isBn ? 'সিনেমা কালার:' : 'Color Grade:'}</span>
              <select
                value={colorGrade}
                onChange={(e) => setColorGrade(e.target.value as any)}
                className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="sunset_gold">{isBn ? 'সোনালী গোধূলি (Sunset Gold)' : 'Sunset Gold'}</option>
                <option value="teal_orange">{isBn ? 'টিল ও অরেঞ্জ (Teal & Orange)' : 'Teal & Orange'}</option>
                <option value="neon_violet">{isBn ? 'নিয়ন ভায়োলেট (Cyberpunk)' : 'Neon Violet'}</option>
                <option value="vintage_film">{isBn ? 'ভিন্টেজ ফিল্ম (Classic Film)' : 'Vintage Film'}</option>
              </select>
            </div>
          </div>

          {/* Action Trigger Button */}
          <button
            onClick={handleGenerateMusicVideo}
            disabled={isGenerating}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-pink-600 via-purple-600 to-cyan-600 hover:from-pink-500 hover:via-purple-500 hover:to-cyan-500 text-white font-extrabold text-sm sm:text-base shadow-xl shadow-pink-600/30 transition transform active:scale-[0.99] flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>{generationStep || (isBn ? 'মিউজিক ভিডিও তৈরি হচ্ছে...' : 'Producing Music Video...')}</span>
              </>
            ) : (
              <>
                <Wand2 className="w-5 h-5 text-white animate-pulse" />
                <span>
                  {isBn 
                    ? `এখনই ${activeModelName}-এর মিউজিক ভিডিও তৈরি করুন` 
                    : `Generate ${activeModelName} Music Video Now`}
                </span>
              </>
            )}
          </button>

          {/* Progress bar when generating */}
          {isGenerating && (
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                <span>{generationStep}</span>
                <span className="font-mono text-cyan-400">{generationProgress}%</span>
              </div>
              <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-800">
                <div 
                  className="bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 h-full transition-all duration-300"
                  style={{ width: `${generationProgress}%` }}
                />
              </div>
            </div>
          )}

        </div>

        {/* Right Side: Live Video Canvas Player & Storyboard (5 cols) */}
        <div className="lg:col-span-5 space-y-6">

          {/* Canvas Video Viewport */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <Film className="w-4 h-4 text-pink-400" />
                <h3 className="text-sm font-bold text-white">
                  {isBn ? 'সিনেমাটিক ভিডিও ক্যানভাস প্রিভিউ' : 'Cinematic Video Viewport'}
                </h3>
              </div>

              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase bg-pink-950 text-pink-300 border border-pink-800 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-pink-400 animate-ping" />
                Live Render
              </span>
            </div>

            {/* Video Canvas Box */}
            <div className={`relative rounded-xl overflow-hidden bg-black border border-slate-800 shadow-inner mx-auto w-full transition-all duration-300 ${
              aspectRatio === '9:16' ? 'aspect-[9/16] max-h-[520px] max-w-[290px]' : aspectRatio === '1:1' ? 'aspect-square max-h-[460px]' : 'aspect-video w-full'
            }`}>
              <canvas
                ref={canvasRef}
                width={aspectRatio === '9:16' ? 576 : aspectRatio === '1:1' ? 720 : 1280}
                height={aspectRatio === '9:16' ? 1024 : aspectRatio === '1:1' ? 720 : 720}
                className="w-full h-full object-contain"
              />

              {/* Play / Pause Overlay Button */}
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="absolute bottom-4 left-4 p-2.5 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md text-white border border-white/20 transition shadow-lg group"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
              </button>

              {/* Audio Mute Button */}
              <button
                onClick={() => setIsMuted(!isMuted)}
                className="absolute bottom-4 right-4 p-2.5 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md text-white border border-white/20 transition shadow-lg"
              >
                {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
              </button>
            </div>

            {/* Timeline Scrubber */}
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                <span>00:{String(Math.floor(currentTime)).padStart(2, '0')}</span>
                <span className="text-pink-400 font-bold">
                  {isBn ? `দৃশ্য ${activeSceneIndex + 1} / ৪` : `Scene ${activeSceneIndex + 1} / 4`}
                </span>
                <span>00:28</span>
              </div>
              <input 
                type="range"
                min="0"
                max={totalDuration}
                step="0.1"
                value={currentTime}
                onChange={(e) => setCurrentTime(parseFloat(e.target.value))}
                className="w-full accent-pink-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
              />
            </div>

            {/* Download & Export Actions */}
            <div className="mt-4 pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2">
              <button
                onClick={handleExportVideo}
                disabled={isExporting}
                className="flex-1 min-w-[140px] flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-bold text-xs shadow-md shadow-pink-600/20 transition disabled:opacity-50 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{isExporting ? `${exportProgress}% Exporting...` : (isBn ? 'ভিডিও ডাউনলোড' : 'Download')}</span>
              </button>

              <button
                onClick={() => setShowYouTubeModal(true)}
                className="flex-1 min-w-[150px] flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-md shadow-red-600/20 transition cursor-pointer"
              >
                <Youtube className="w-4 h-4" />
                <span>{isBn ? 'ইউটিউবে আপলোড' : 'Publish to YouTube'}</span>
              </button>

              <button
                onClick={handleCopyLyrics}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? (isBn ? 'কপি হয়েছে' : 'Copied') : (isBn ? 'লিরিক্স' : 'Lyrics')}</span>
              </button>
            </div>
          </div>

          {/* 4-Scene Storyboard Breakdown */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-400" />
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  {isBn ? '৪টি সিনেমাটিক দৃশ্য পরিকল্পনা' : '4-Scene Music Video Storyboard'}
                </h4>
              </div>
              <span className="text-[10px] text-slate-400">28s Production</span>
            </div>

            <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
              {(project?.scenes || [
                {
                  sceneNumber: 1,
                  timestamp: '00:00 - 00:07',
                  shotType: 'Wide Establishing Drone Shot',
                  visualPrompt: `${activeLocationName} wide aerial drone intro, cinematic lighting, ${activeModelName} stands majestically.`,
                  lyricsSnippetBn: selectedGenre.sampleLyricsBn.split('\n')[0],
                  lyricsSnippetEn: selectedGenre.sampleLyricsEn.split('\n')[0]
                },
                {
                  sceneNumber: 2,
                  timestamp: '00:07 - 00:15',
                  shotType: 'Model Emotional Close-Up Portrait',
                  visualPrompt: `${activeModelName} face close-up, hair blowing in the wind, soulful eyes, bokeh background.`,
                  lyricsSnippetBn: selectedGenre.sampleLyricsBn.split('\n')[1],
                  lyricsSnippetEn: selectedGenre.sampleLyricsEn.split('\n')[1]
                },
                {
                  sceneNumber: 3,
                  timestamp: '00:15 - 00:23',
                  shotType: 'Dynamic Location Tracking Walk',
                  visualPrompt: `${activeModelName} walking rhythmically through ${activeLocationName}, reflections, dynamic camera tracking.`,
                  lyricsSnippetBn: selectedGenre.sampleLyricsBn.split('\n')[2],
                  lyricsSnippetEn: selectedGenre.sampleLyricsEn.split('\n')[2]
                },
                {
                  sceneNumber: 4,
                  timestamp: '00:23 - 00:30',
                  shotType: 'Grand Climax Finale & Chorus',
                  visualPrompt: `Epic wide sunset finale with sweeping crane pullback, majestic atmosphere.`,
                  lyricsSnippetBn: selectedGenre.sampleLyricsBn.split('\n')[3],
                  lyricsSnippetEn: selectedGenre.sampleLyricsEn.split('\n')[3]
                }
              ]).map((sc, idx) => (
                <div
                  key={idx}
                  onClick={() => setCurrentTime(idx * 7)}
                  className={`p-2.5 rounded-xl border cursor-pointer transition text-xs space-y-1 ${
                    activeSceneIndex === idx
                      ? 'bg-pink-950/50 border-pink-500 shadow-sm'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-pink-300">
                      {isBn ? `দৃশ্য ${sc.sceneNumber}` : `Scene ${sc.sceneNumber}`} ({sc.timestamp})
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">{sc.shotType}</span>
                  </div>
                  <p className="text-[11px] text-slate-200 font-medium">
                    "♪ {isBn ? sc.lyricsSnippetBn : sc.lyricsSnippetEn} ♪"
                  </p>
                  <p className="text-[10px] text-slate-400 truncate">
                    <strong>Visual:</strong> {sc.visualPrompt}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Full Song Lyrics Sheet */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Music className="w-3.5 h-3.5 text-cyan-400" />
                {isBn ? 'সম্পূর্ণ লিরিক্স ও সুরের বিন্যাস' : 'Full Lyrics & Composition'}
              </h4>
              <span className="text-[10px] text-cyan-400 font-mono">
                {project?.music?.bpm || selectedGenre.bpm} BPM
              </span>
            </div>

            <div className="p-3 bg-slate-950 border border-slate-800/80 rounded-xl font-sans text-xs text-slate-200 leading-relaxed whitespace-pre-line">
              {project?.music?.lyricsBn || selectedGenre.sampleLyricsBn}
            </div>
          </div>

        </div>

      </div>

      {/* YouTube Upload Modal */}
      {showYouTubeModal && (
        <YouTubeUploadModal
          isOpen={showYouTubeModal}
          onClose={() => setShowYouTubeModal(false)}
          lang={lang}
          initialTitle={`${songTitle} - ${activeModelName} (${selectedGenre.name} AI Music Video)`}
          initialDescription={`${project?.music?.lyricsBn || selectedGenre.sampleLyricsBn}\n\nModel: ${activeModelName}\nLocation: ${activeLocationName}\nMusic Style: ${selectedGenre.name} (${selectedGenre.bpm} BPM)\n#AIMusicVideo #BanglaSong #AIVideoStudio #Shorts`}
          initialTags={['AIMusicVideo', 'BanglaSong', 'AIVideo', selectedGenre.name.replace(/\s+/g, ''), 'Shorts']}
        />
      )}
    </div>
  );
};
