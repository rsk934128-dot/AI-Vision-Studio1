export type Language = 'bn' | 'en';

export type StudioTab = 
  | 'audio-presentation'
  | 'text-to-video'
  | 'photo-music-video'
  | 'video-understanding'
  | 'audio-transcribe'
  | 'video-to-video'
  | 'subtitles'
  | 'project-history'
  | 'shurjopay-gmail'
  | 'youtube-studio'
  | 'android-builder'
  | 'admin';

export interface ModelProfile {
  id: string;
  name: string;
  nameBn: string;
  gender: 'male' | 'female' | 'duo';
  style: string;
  avatarUrl: string;
  descBn: string;
  descEn: string;
  defaultCostume: string;
}

export interface LocationPreset {
  id: string;
  name: string;
  nameBn: string;
  category: 'nature' | 'urban' | 'romantic' | 'scifi' | 'heritage';
  bgUrl: string;
  lighting: string;
  mood: string;
  particles: 'rain' | 'petals' | 'sparkles' | 'neon' | 'none';
}

export interface MusicGenrePreset {
  id: string;
  name: string;
  nameBn: string;
  bpm: number;
  mood: string;
  synthStyle: 'romantic_chords' | 'pop_groove' | 'lofi_chill' | 'sufi_meditation' | 'acoustic_strum' | 'trap_beat';
  sampleLyricsBn: string;
  sampleLyricsEn: string;
}

export interface MusicVideoScene {
  sceneNumber: number;
  timestamp: string;
  shotType: string;
  visualPrompt: string;
  lyricsSnippetBn: string;
  lyricsSnippetEn: string;
  cameraMovement: string;
  vfx: string;
  lighting: string;
}

export interface MusicVideoProject {
  id: string;
  title: string;
  artist: string;
  model: {
    id?: string;
    name: string;
    gender: 'male' | 'female' | 'duo';
    avatarUrl: string;
    isCustom?: boolean;
    style?: string;
  };
  location: {
    id?: string;
    name: string;
    bgUrl: string;
    mood: string;
    particles: 'rain' | 'petals' | 'sparkles' | 'neon' | 'none';
    isCustom?: boolean;
  };
  music: {
    genreId?: string;
    name: string;
    bpm: number;
    synthStyle: string;
    customAudioUrl?: string;
    lyricsBn: string;
    lyricsEn: string;
  };
  aspectRatio: '9:16' | '16:9' | '1:1';
  scenes: MusicVideoScene[];
  status: 'idle' | 'generating' | 'ready';
  videoUrl?: string;
  createdAt: string;
}

export interface ShurjoPayTransaction {
  id: string;
  orderId: string;
  spCode: string;
  amount: number;
  currency: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  method: 'bKash' | 'Nagad' | 'Rocket' | 'Upay' | 'Visa/Mastercard';
  bankTxStatus: 'Successful' | 'Failed' | 'Canceled';
  emailStatus: 'sent' | 'pending' | 'failed';
  verifiedSignature: boolean;
  timestamp: string;
}

export interface VideoJob {
  id: string;
  userId: string;
  prompt: string;
  style: string;
  aspectRatio: '16:9' | '9:16' | '1:1';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  duration?: number; // duration in seconds
  resolution?: string; // e.g. '4K (2160p)', '1080p (FHD)', '720p (HD)'
  videoUrl?: string;
  voiceoverUrl?: string;
  voiceoverText?: string;
  srtContent?: string;
  scenes?: VideoScriptScene[];
  category?: string;
  musicStyle?: string;
  creditsUsed: number;
  createdAt: string;
  ffmpegLogs: string[];
}

export interface VideoScriptScene {
  sceneNumber: number;
  timestamp: string;
  visualPrompt: string;
  narration: string;
  bgmStyle: string;
  captionHighlight?: string;
}

export interface VideoScript {
  title: string;
  hook: string;
  estimatedDuration: string;
  scenes: VideoScriptScene[];
  fullVoiceoverText: string;
  recommendedTags: string[];
}

export interface DetectedObject {
  id: string;
  name: string;
  nameBn?: string;
  category: 'Object' | 'Entity' | 'Environment' | 'Vehicle' | 'Technology' | 'Nature';
  confidence: number;
  count: number;
  timestamps: string[];
}

export interface SceneAnalysisItem {
  sceneNumber: number;
  timeRange: string;
  startSeconds: number;
  endSeconds: number;
  title: string;
  titleBn?: string;
  visualDescription: string;
  detectedObjects: string[];
  cameraMovement: string;
  mood: string;
  colorPalette: string[];
  keyMoment?: string;
}

export interface VideoUnderstandingMetadata {
  videoTitle: string;
  estimatedLength: string;
  durationSeconds: number;
  resolution: string;
  aspectRatio: string;
  fps: number;
  bitrate?: string;
  detectedObjects: DetectedObject[];
  sceneAnalysis: SceneAnalysisItem[];
  modelUsed: string;
  audioProfile?: {
    speechClarity: string;
    musicTempo: string;
    ambientSound: string;
  };
}

export interface SubtitleStyle {
  fontSize: number;
  primaryColor: string;
  outlineColor: string;
  hasShadow: boolean;
  alignment: 'bottom' | 'top' | 'middle';
  highlightKeywords: boolean;
}

export interface YouTubeChannelProfile {
  id: string;
  title: string;
  description: string;
  customUrl?: string;
  publishedAt?: string;
  thumbnails: {
    default?: { url: string; width?: number; height?: number };
    medium?: { url: string; width?: number; height?: number };
    high?: { url: string; width?: number; height?: number };
  };
  statistics: {
    viewCount: string;
    subscriberCount: string;
    hiddenSubscriberCount: boolean;
    videoCount: string;
  };
  brandingSettings?: {
    channel?: {
      title?: string;
      description?: string;
      keywords?: string;
    };
    image?: {
      bannerExternalUrl?: string;
    };
  };
  uploadsPlaylistId?: string;
}

export interface YouTubeUploadedVideo {
  id: string;
  title: string;
  description: string;
  thumbnailUrl?: string;
  publishedAt: string;
  privacyStatus: 'public' | 'unlisted' | 'private';
  viewCount?: string;
  likeCount?: string;
  videoUrl?: string;
}

export interface YouTubeTrack {
  id: string;
  title: string;
  channel: string;
  duration: string;
  views?: string;
  thumbnail: string;
  category?: string;
}

export type ToastType = 'success' | 'error' | 'warning' | 'info' | 'render';

export interface ToastAction {
  label: string;
  labelBn?: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
}

export interface ToastNotification {
  id: string;
  type: ToastType;
  title: string;
  titleBn?: string;
  message: string;
  messageBn?: string;
  duration?: number; // ms, default 5000, 0 = persistent
  videoJob?: VideoJob;
  actions?: ToastAction[];
  timestamp: number;
}

export interface PresentationScene {
  sceneNumber: number;
  timeStart: number; // in seconds
  timeEnd: number; // in seconds
  timestampLabel: string; // e.g. "00:00 - 00:15"
  lyricsLine: string; // spoken or sung words
  emotionalTone: string; // e.g. "গভীর প্রেম ও রোমান্টিক বিষাদ"
  sceneTitle: string; // e.g. "কুয়াশাচ্ছন্ন রেলস্টেশনের স্মৃতি"
  visualPrompt: string; // image prompt
  imageUrl: string; // high res image url
  cameraMotion: 'ken-burns-in' | 'ken-burns-out' | 'pan-left' | 'pan-right' | 'tilt-up' | 'slow-drift';
  particleOverlay: 'rain' | 'bokeh' | 'embers' | 'fog' | 'stardust' | 'leaves' | 'none';
  colorMood: string;
}

export interface AudioPresentationProject {
  id: string;
  userId?: string;
  title: string;
  artist: string;
  audioUrl: string;
  duration: number;
  aspectRatio: '16:9' | '9:16' | '1:1';
  primaryEmotion: string;
  emotionCategory: string;
  lyricTranscript: string;
  musicalAttributes: {
    tempo: string;
    mood: string;
    vibe: string;
    recommendedLighting: string;
  };
  scenes: PresentationScene[];
  createdAt: string;
  status: 'ready' | 'rendering' | 'completed';
  videoExportUrl?: string;
}



