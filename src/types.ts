export type Language = 'bn' | 'en';

export type StudioTab = 
  | 'text-to-video'
  | 'video-understanding'
  | 'audio-transcribe'
  | 'video-to-video'
  | 'subtitles'
  | 'shurjopay-gmail'
  | 'admin';

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
  videoUrl?: string;
  voiceoverUrl?: string;
  srtContent?: string;
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

export interface SubtitleStyle {
  fontSize: number;
  primaryColor: string;
  outlineColor: string;
  hasShadow: boolean;
  alignment: 'bottom' | 'top' | 'middle';
  highlightKeywords: boolean;
}
