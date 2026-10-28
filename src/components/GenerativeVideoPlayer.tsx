import React, { useRef, useEffect, useState, useCallback } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  Download, 
  Sparkles, 
  Layers, 
  Film, 
  Music, 
  Maximize2,
  CheckCircle2,
  Sliders,
  Eye,
  Stamp
} from 'lucide-react';
import { VideoJob, VideoScript, VideoScriptScene, Language } from '../types';
import { useWatermark } from '../context/WatermarkContext';
import { VideoExportProgressIndicator } from './VideoExportProgressIndicator';

interface GenerativeVideoPlayerProps {
  job: VideoJob | null;
  script: VideoScript | null;
  aspectRatio: '16:9' | '9:16' | '1:1';
  lang: Language;
}

const DEFAULT_SCENES: VideoScriptScene[] = [
  {
    sceneNumber: 1,
    timestamp: '00:00 - 00:07',
    visualPrompt: 'Opening scene',
    narration: 'ভিডিওর প্রথম দৃশ্যে ফুটে উঠছে গল্পের মূল আকর্ষণ।',
    bgmStyle: 'Cinematic Ambient',
    captionHighlight: 'প্রথম দৃশ্য'
  },
  {
    sceneNumber: 2,
    timestamp: '00:07 - 00:15',
    visualPrompt: 'Dynamic interaction scene',
    narration: 'কাছ থেকে লক্ষ্য করলে প্রতিটি সূক্ষ্ম ডিটেইল স্পষ্ট হয়ে ওঠে।',
    bgmStyle: 'Emotional Melody',
    captionHighlight: 'মূল আকর্ষণ'
  },
  {
    sceneNumber: 3,
    timestamp: '00:15 - 00:23',
    visualPrompt: 'Wide panoramic perspective',
    narration: 'দৃশ্যটি যখন পূর্ণরূপে প্রকাশিত হয়, তখন কল্পনা বাস্তবে রূপ নেয়।',
    bgmStyle: 'Inspiring Symphony',
    captionHighlight: 'চোখ ধাঁধানো'
  },
  {
    sceneNumber: 4,
    timestamp: '00:23 - 00:30',
    visualPrompt: 'Climactic outro',
    narration: 'এমন আরও আকর্ষণীয় ক্রিয়েশনের জন্য আমাদের সাথে থাকুন!',
    bgmStyle: 'Warm Outro',
    captionHighlight: 'সাথে থাকুন'
  }
];

export const GenerativeVideoPlayer: React.FC<GenerativeVideoPlayerProps> = ({
  job,
  script,
  aspectRatio,
  lang,
}) => {
  const isBn = lang === 'bn';
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { config: watermarkConfig, openModal: openWatermarkModal, drawWatermarkOnCanvas } = useWatermark();

  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [audioEnabled, setAudioEnabled] = useState<boolean>(true);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportProgress, setExportProgress] = useState<number>(0);
  const [playerMode, setPlayerMode] = useState<'generative' | 'stock'>('generative');

  // Active scenes from script or job (stable reference)
  const scenes: VideoScriptScene[] = 
    job?.scenes && job.scenes.length > 0 
      ? job.scenes 
      : script?.scenes && script.scenes.length > 0 
        ? script.scenes 
        : DEFAULT_SCENES;

  const totalDuration = 28; // Total seconds for 4 scenes (7s each)

  // Derived current scene index (NO setState inside effect needed)
  const sceneDuration = totalDuration / Math.max(1, scenes.length);
  const currentSceneIndex = Math.min(scenes.length - 1, Math.floor(currentTime / sceneDuration));
  const prevSceneIndexRef = useRef<number>(-1);
  const currentTimeRef = useRef<number>(currentTime);

  useEffect(() => {
    currentTimeRef.current = currentTime;
  }, [currentTime]);

  // Determine category theme
  const promptText = ((job?.prompt || '') + ' ' + (script?.title || '')).toLowerCase();
  let theme: 'animals' | 'food' | 'nature' | 'cars' | 'islamic' | 'tech' | 'space' | 'general' = 'general';
  if (promptText.includes('cat') || promptText.includes('kitten') || promptText.includes('dog') || promptText.includes('pet') || promptText.includes('বিড়াল') || promptText.includes('কুকুর')) {
    theme = 'animals';
  } else if (promptText.includes('cook') || promptText.includes('food') || promptText.includes('recipe') || promptText.includes('biryani') || promptText.includes('রান্না') || promptText.includes('রেসিপি')) {
    theme = 'food';
  } else if (promptText.includes('nature') || promptText.includes('river') || promptText.includes('mountain') || promptText.includes('rain') || promptText.includes('প্রকৃতি') || promptText.includes('নদী') || promptText.includes('পাহাড়')) {
    theme = 'nature';
  } else if (promptText.includes('car') || promptText.includes('racing') || promptText.includes('drift') || promptText.includes('speed') || promptText.includes('গাড়ি')) {
    theme = 'cars';
  } else if (promptText.includes('islam') || promptText.includes('mosque') || promptText.includes('মসজিদ') || promptText.includes('কোরআন') || promptText.includes('নামাজ')) {
    theme = 'islamic';
  } else if (promptText.includes('ai') || promptText.includes('code') || promptText.includes('tech') || promptText.includes('রোবট') || promptText.includes('প্রযুক্তি')) {
    theme = 'tech';
  } else if (promptText.includes('space') || promptText.includes('mars') || promptText.includes('galaxy') || promptText.includes('মহাকাশ') || promptText.includes('মঙ্গল')) {
    theme = 'space';
  }

  // Web Audio Synthesizer for Background Music
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  const startBgm = useCallback(() => {
    if (isMuted || !audioEnabled) return;
    try {
      if (!audioContextRef.current) {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
          audioContextRef.current = new AudioCtx();
        }
      }
      if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume();
      }
    } catch (_e) {
      // Audio autoplay policy handled
    }
  }, [isMuted, audioEnabled]);

  // Read voiceover narration using SpeechSynthesis when scene changes
  const speakSceneNarration = useCallback((text: string) => {
    if (isMuted || !audioEnabled || typeof window === 'undefined' || !window.speechSynthesis) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.lang = isBn ? 'bn-BD' : 'en-US';
      window.speechSynthesis.speak(utterance);
    } catch (_err) {
      // Ignore speech error
    }
  }, [isMuted, audioEnabled, isBn]);

  // Main playback timer
  useEffect(() => {
    let interval: any = null;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime((prev) => {
          const next = prev + 0.1;
          if (next >= totalDuration) {
            return 0; // Loop playback
          }
          return next;
        });
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isPlaying, totalDuration]);

  // Trigger voiceover narration when current scene index changes without extra setState
  useEffect(() => {
    if (isPlaying && prevSceneIndexRef.current !== currentSceneIndex) {
      prevSceneIndexRef.current = currentSceneIndex;
      speakSceneNarration(scenes[currentSceneIndex]?.narration || '');
    }
  }, [currentSceneIndex, isPlaying, scenes, speakSceneNarration]);

  // Canvas Drawing Engine
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let particleOffset = 0;

    const renderFrame = () => {
      particleOffset += 0.02;
      const width = canvas.width;
      const height = canvas.height;
      const activeScene = scenes[currentSceneIndex] || scenes[0];
      const time = currentTimeRef.current;
      const sceneProgress = (time % (totalDuration / scenes.length)) / (totalDuration / scenes.length);

      // Clear Canvas
      ctx.clearRect(0, 0, width, height);

      // 1. Draw Background Gradient based on Theme
      const bgGrad = ctx.createLinearGradient(0, 0, width, height);
      if (theme === 'animals') {
        bgGrad.addColorStop(0, '#2D1B2D');
        bgGrad.addColorStop(0.5, '#4A2545');
        bgGrad.addColorStop(1, '#1A0F1A');
      } else if (theme === 'food') {
        bgGrad.addColorStop(0, '#331A00');
        bgGrad.addColorStop(0.5, '#663300');
        bgGrad.addColorStop(1, '#1A0D00');
      } else if (theme === 'nature') {
        bgGrad.addColorStop(0, '#0D2B1D');
        bgGrad.addColorStop(0.5, '#1B4D3E');
        bgGrad.addColorStop(1, '#051A10');
      } else if (theme === 'cars') {
        bgGrad.addColorStop(0, '#0F0C29');
        bgGrad.addColorStop(0.5, '#302B63');
        bgGrad.addColorStop(1, '#24243E');
      } else if (theme === 'islamic') {
        bgGrad.addColorStop(0, '#1A2A3A');
        bgGrad.addColorStop(0.5, '#2D4A60');
        bgGrad.addColorStop(1, '#0D1520');
      } else if (theme === 'tech') {
        bgGrad.addColorStop(0, '#0A0E1A');
        bgGrad.addColorStop(0.5, '#101B33');
        bgGrad.addColorStop(1, '#05070D');
      } else if (theme === 'space') {
        bgGrad.addColorStop(0, '#0B001A');
        bgGrad.addColorStop(0.5, '#1A0033');
        bgGrad.addColorStop(1, '#000000');
      } else {
        bgGrad.addColorStop(0, '#111827');
        bgGrad.addColorStop(0.5, '#1F2937');
        bgGrad.addColorStop(1, '#030712');
      }
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // 2. Camera Motion (Ken Burns effect)
      ctx.save();
      const zoom = 1 + Math.sin(sceneProgress * Math.PI) * 0.08;
      const panX = Math.sin(time * 0.5) * 15;
      const panY = Math.cos(time * 0.5) * 8;
      ctx.translate(width / 2 + panX, height / 2 + panY);
      ctx.scale(zoom, zoom);
      ctx.translate(-width / 2, -height / 2);

      // 3. Thematic Scene Visuals
      if (theme === 'animals') {
        // Soft warm window light
        const lightGrad = ctx.createRadialGradient(width * 0.3, height * 0.3, 20, width * 0.3, height * 0.3, width * 0.6);
        lightGrad.addColorStop(0, 'rgba(255, 230, 180, 0.35)');
        lightGrad.addColorStop(1, 'rgba(255, 230, 180, 0)');
        ctx.fillStyle = lightGrad;
        ctx.fillRect(0, 0, width, height);

        // Cozy room floor & rug
        ctx.fillStyle = '#3D1C38';
        ctx.beginPath();
        ctx.ellipse(width * 0.5, height * 0.78, width * 0.45, height * 0.18, 0, 0, Math.PI * 2);
        ctx.fill();

        // Charming Ceramic Milk Bowl
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.ellipse(width * 0.35, height * 0.75, 45, 18, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#FFF8E7';
        ctx.beginPath();
        ctx.ellipse(width * 0.35, height * 0.74, 38, 14, 0, 0, Math.PI * 2);
        ctx.fill();

        // Cute Cat Silhouette / Figure
        ctx.fillStyle = '#F3E5AB';
        // Cat Body
        ctx.beginPath();
        ctx.ellipse(width * 0.55, height * 0.68, 65, 48, -0.2, 0, Math.PI * 2);
        ctx.fill();
        // Cat Head
        ctx.beginPath();
        ctx.arc(width * 0.46, height * 0.58, 36, 0, Math.PI * 2);
        ctx.fill();
        // Cat Ears
        ctx.beginPath();
        ctx.moveTo(width * 0.43, height * 0.52);
        ctx.lineTo(width * 0.41, height * 0.44);
        ctx.lineTo(width * 0.47, height * 0.49);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(width * 0.48, height * 0.49);
        ctx.lineTo(width * 0.53, height * 0.45);
        ctx.lineTo(width * 0.51, height * 0.53);
        ctx.fill();
        // Cat Eyes
        ctx.fillStyle = '#2E7D32';
        ctx.beginPath();
        ctx.arc(width * 0.44, height * 0.58, 4, 0, Math.PI * 2);
        ctx.arc(width * 0.48, height * 0.58, 4, 0, Math.PI * 2);
        ctx.fill();
        // Whiskers
        ctx.strokeStyle = '#D7CCC8';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(width * 0.42, height * 0.61);
        ctx.lineTo(width * 0.36, height * 0.59);
        ctx.moveTo(width * 0.42, height * 0.63);
        ctx.lineTo(width * 0.35, height * 0.64);
        ctx.stroke();

        // Floating Purr Hearts
        for (let i = 0; i < 6; i++) {
          const hX = width * 0.4 + Math.sin(particleOffset + i * 2) * 80;
          const hY = height * 0.45 - ((particleOffset * 30 + i * 45) % (height * 0.35));
          ctx.fillStyle = 'rgba(255, 150, 180, 0.45)';
          ctx.beginPath();
          ctx.arc(hX - 4, hY, 4, 0, Math.PI * 2);
          ctx.arc(hX + 4, hY, 4, 0, Math.PI * 2);
          ctx.lineTo(hX, hY + 8);
          ctx.fill();
        }

      } else if (theme === 'food') {
        // Warm cooking glow
        const warmGlow = ctx.createRadialGradient(width * 0.5, height * 0.6, 30, width * 0.5, height * 0.6, width * 0.5);
        warmGlow.addColorStop(0, 'rgba(255, 140, 0, 0.4)');
        warmGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = warmGlow;
        ctx.fillRect(0, 0, width, height);

        // Cooking Sizzling Pan
        ctx.fillStyle = '#222222';
        ctx.beginPath();
        ctx.ellipse(width * 0.5, height * 0.68, width * 0.35, height * 0.16, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#444444';
        ctx.lineWidth = 6;
        ctx.stroke();

        // Sizzling Golden Food / Gravy
        const foodGrad = ctx.createRadialGradient(width * 0.5, height * 0.68, 10, width * 0.5, height * 0.68, width * 0.3);
        foodGrad.addColorStop(0, '#FFB300');
        foodGrad.addColorStop(0.6, '#D84315');
        foodGrad.addColorStop(1, '#8D2600');
        ctx.fillStyle = foodGrad;
        ctx.beginPath();
        ctx.ellipse(width * 0.5, height * 0.68, width * 0.31, height * 0.13, 0, 0, Math.PI * 2);
        ctx.fill();

        // Rising Steam Particles
        for (let i = 0; i < 8; i++) {
          const sX = width * 0.4 + (i * 25) + Math.sin(particleOffset + i) * 15;
          const sY = height * 0.6 - ((particleOffset * 40 + i * 35) % (height * 0.4));
          ctx.fillStyle = `rgba(255, 255, 255, ${0.35 - (height * 0.6 - sY) / (height * 0.4) * 0.3})`;
          ctx.beginPath();
          ctx.arc(sX, sY, 12 + i * 2, 0, Math.PI * 2);
          ctx.fill();
        }

      } else if (theme === 'nature') {
        // Mountain Silhouettes
        ctx.fillStyle = '#0F3826';
        ctx.beginPath();
        ctx.moveTo(0, height * 0.7);
        ctx.lineTo(width * 0.25, height * 0.45);
        ctx.lineTo(width * 0.55, height * 0.72);
        ctx.lineTo(width * 0.85, height * 0.4);
        ctx.lineTo(width, height * 0.65);
        ctx.lineTo(width, height);
        ctx.lineTo(0, height);
        ctx.fill();

        // Sun & Rays
        const sunGlow = ctx.createRadialGradient(width * 0.8, height * 0.35, 10, width * 0.8, height * 0.35, 120);
        sunGlow.addColorStop(0, '#FFE082');
        sunGlow.addColorStop(0.5, 'rgba(255, 183, 77, 0.4)');
        sunGlow.addColorStop(1, 'rgba(255, 183, 77, 0)');
        ctx.fillStyle = sunGlow;
        ctx.beginPath();
        ctx.arc(width * 0.8, height * 0.35, 120, 0, Math.PI * 2);
        ctx.fill();

        // Winding River Stream
        ctx.fillStyle = '#4DD0E1';
        ctx.beginPath();
        ctx.moveTo(width * 0.4, height * 0.7);
        ctx.bezierCurveTo(width * 0.5, height * 0.75, width * 0.3, height * 0.88, width * 0.45, height);
        ctx.lineTo(width * 0.65, height);
        ctx.bezierCurveTo(width * 0.48, height * 0.88, width * 0.65, height * 0.75, width * 0.5, height * 0.7);
        ctx.fill();

        // Floating Nature Leaves
        for (let i = 0; i < 7; i++) {
          const lX = (width * 0.1 + (i * 90) + particleOffset * 30) % width;
          const lY = height * 0.3 + Math.sin(particleOffset + i) * 60;
          ctx.fillStyle = '#81C784';
          ctx.beginPath();
          ctx.ellipse(lX, lY, 8, 4, particleOffset + i, 0, Math.PI * 2);
          ctx.fill();
        }

      } else if (theme === 'cars') {
        // High Speed Highway Perspective Lines
        ctx.strokeStyle = '#00F0FF';
        ctx.lineWidth = 2;
        const horizonY = height * 0.55;
        for (let i = -6; i <= 6; i++) {
          ctx.beginPath();
          ctx.moveTo(width / 2, horizonY);
          ctx.lineTo(width / 2 + i * 160, height);
          ctx.stroke();
        }

        // Road surface
        ctx.fillStyle = '#111122';
        ctx.beginPath();
        ctx.moveTo(0, horizonY);
        ctx.lineTo(width, horizonY);
        ctx.lineTo(width, height);
        ctx.lineTo(0, height);
        ctx.fill();

        // Supercar Silhouette
        ctx.fillStyle = '#FF0055';
        ctx.beginPath();
        ctx.moveTo(width * 0.42, height * 0.72);
        ctx.lineTo(width * 0.46, height * 0.62);
        ctx.lineTo(width * 0.54, height * 0.62);
        ctx.lineTo(width * 0.58, height * 0.72);
        ctx.lineTo(width * 0.62, height * 0.75);
        ctx.lineTo(width * 0.38, height * 0.75);
        ctx.closePath();
        ctx.fill();

        // Headlights / Taillights Glow
        ctx.fillStyle = '#FF1744';
        ctx.beginPath();
        ctx.arc(width * 0.42, height * 0.74, 8, 0, Math.PI * 2);
        ctx.arc(width * 0.58, height * 0.74, 8, 0, Math.PI * 2);
        ctx.fill();

        // Speed Lines
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        for (let i = 0; i < 10; i++) {
          const sX = (particleOffset * 800 + i * 90) % width;
          const sY = horizonY + (i * 25);
          ctx.beginPath();
          ctx.moveTo(sX, sY);
          ctx.lineTo(sX + 60, sY);
          ctx.stroke();
        }

      } else if (theme === 'islamic') {
        // Mosque Dome & Minarets Silhouette
        ctx.fillStyle = '#0D1B2A';
        // Main Central Dome
        ctx.beginPath();
        ctx.arc(width * 0.5, height * 0.65, 90, Math.PI, 0);
        ctx.fill();
        // Pointed Arch Tip
        ctx.beginPath();
        ctx.moveTo(width * 0.48, height * 0.55);
        ctx.lineTo(width * 0.5, height * 0.50);
        ctx.lineTo(width * 0.52, height * 0.55);
        ctx.fill();

        // Crescent Moon
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.arc(width * 0.75, height * 0.3, 24, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#1A2A3A';
        ctx.beginPath();
        ctx.arc(width * 0.72, height * 0.28, 20, 0, Math.PI * 2);
        ctx.fill();

        // Soft Golden Floating Light Orbs
        for (let i = 0; i < 8; i++) {
          const pX = (width * 0.2 + i * 75 + Math.sin(particleOffset + i) * 30) % width;
          const pY = height * 0.3 + (i * 25);
          ctx.fillStyle = 'rgba(255, 215, 0, 0.5)';
          ctx.beginPath();
          ctx.arc(pX, pY, 3.5, 0, Math.PI * 2);
          ctx.fill();
        }

      } else if (theme === 'tech') {
        // Digital Grid & Neural Nodes
        ctx.strokeStyle = 'rgba(0, 240, 255, 0.25)';
        ctx.lineWidth = 1;
        const gridSize = 40;
        for (let x = 0; x < width; x += gridSize) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, height);
          ctx.stroke();
        }

        // Connecting Neural Nodes
        const nodes = [
          { x: width * 0.3, y: height * 0.4 },
          { x: width * 0.5, y: height * 0.35 },
          { x: width * 0.7, y: height * 0.42 },
          { x: width * 0.4, y: height * 0.6 },
          { x: width * 0.6, y: height * 0.62 },
        ];
        ctx.strokeStyle = '#00F0FF';
        ctx.lineWidth = 2;
        ctx.beginPath();
        nodes.forEach((n, idx) => {
          if (idx === 0) ctx.moveTo(n.x, n.y);
          else ctx.lineTo(n.x, n.y);
        });
        ctx.stroke();

        nodes.forEach((n) => {
          ctx.fillStyle = '#00F0FF';
          ctx.beginPath();
          ctx.arc(n.x, n.y, 6, 0, Math.PI * 2);
          ctx.fill();
        });

      } else {
        // Space / General Theme: Stars & Cosmic Aura
        for (let i = 0; i < 40; i++) {
          const sX = (i * 37 + particleOffset * 10) % width;
          const sY = (i * 29) % height;
          ctx.fillStyle = `rgba(255, 255, 255, ${0.4 + Math.sin(particleOffset * 2 + i) * 0.4})`;
          ctx.beginPath();
          ctx.arc(sX, sY, (i % 3) + 1, 0, Math.PI * 2);
          ctx.fill();
        }
        // Glowing Planetary Ring
        ctx.strokeStyle = '#7928CA';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.ellipse(width * 0.5, height * 0.55, width * 0.28, 35, -0.2, 0, Math.PI * 2);
        ctx.stroke();
      }

      ctx.restore();

      // 4. Overlays: Cinematic Vignette
      const vignette = ctx.createRadialGradient(width / 2, height / 2, width * 0.3, width / 2, height / 2, width * 0.7);
      vignette.addColorStop(0, 'rgba(0,0,0,0)');
      vignette.addColorStop(1, 'rgba(0,0,0,0.65)');
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, width, height);

      // 5. Scene Watermark / Chapter Pill
      ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
      ctx.roundRect ? ctx.roundRect(24, 24, 180, 36, 10) : ctx.fillRect(24, 24, 180, 36);
      ctx.fill();
      ctx.fillStyle = '#00FFFF';
      ctx.font = 'bold 13px sans-serif';
      ctx.fillText(`Scene ${activeScene.sceneNumber}: ${activeScene.timestamp}`, 36, 47);

      // 6. Pro Subtitle Rendered On Canvas
      const subtitleText = activeScene.narration || '';
      if (subtitleText) {
        ctx.save();
        ctx.font = 'bold 22px sans-serif';
        ctx.textAlign = 'center';
        
        // Background banner for high legibility
        const subWidth = Math.min(width * 0.88, ctx.measureText(subtitleText).width + 36);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
        const subY = height - 55;
        if (ctx.roundRect) {
          ctx.beginPath();
          ctx.roundRect(width / 2 - subWidth / 2, subY - 26, subWidth, 42, 12);
          ctx.fill();
        } else {
          ctx.fillRect(width / 2 - subWidth / 2, subY - 26, subWidth, 42);
        }

        // Subtitle Text with Cyan Highlight
        ctx.fillStyle = '#00FFFF';
        ctx.shadowColor = '#000000';
        ctx.shadowBlur = 8;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
        ctx.fillText(subtitleText.length > 55 ? subtitleText.slice(0, 52) + '...' : subtitleText, width / 2, subY);
        ctx.restore();
      }

      // Apply customizable watermark before frame completes and during video export recording
      drawWatermarkOnCanvas(ctx, width, height);

      animationFrameId = requestAnimationFrame(renderFrame);
    };

    renderFrame();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [theme, scenes, currentSceneIndex, totalDuration, drawWatermarkOnCanvas]);

  // Export & Download synthesized video via MediaRecorder
  const handleExportCustomVideo = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setIsExporting(true);
    setExportProgress(10);

    try {
      // 30 fps stream from generative canvas
      const stream = canvas.captureStream(30);
      const recordedChunks: Blob[] = [];

      let mimeType = 'video/webm;codecs=vp9';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'video/webm';
      }

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType,
        videoBitsPerSecond: 4000000,
      });

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunks.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(recordedChunks, { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        const sanitizedTitle = (job?.prompt || 'ai_custom_video').slice(0, 25).replace(/\s+/g, '_');
        a.download = `${sanitizedTitle}_ai_synthesized.webm`;
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
          setIsExporting(false);
          setExportProgress(100);
        }, 100);
      };

      mediaRecorder.start();

      // Record for 6 seconds of rich scene animation
      let prog = 10;
      const progTimer = setInterval(() => {
        prog += 15;
        if (prog <= 95) setExportProgress(prog);
      }, 1000);

      setTimeout(() => {
        clearInterval(progTimer);
        mediaRecorder.stop();
      }, 6000);

    } catch (err) {
      console.error('Video export error:', err);
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-4">
      
      {/* Player Mode Switcher */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-white flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            {isBn ? 'এআই সিনথেসাইজড ভিডিও প্রিভিউ' : 'Prompt-Matched AI Video Synthesizer'}
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800 font-bold uppercase">
            {theme} Engine
          </span>
        </div>

        {/* Mode Toggle: Generative vs Stock Video */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setPlayerMode('generative')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition flex items-center gap-1 ${
              playerMode === 'generative'
                ? 'bg-cyan-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3 h-3" />
            <span>{isBn ? 'কাস্টম এআই দৃশ্য' : 'Generative Scenes'}</span>
          </button>

          {job?.videoUrl && (
            <button
              onClick={() => setPlayerMode('stock')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition flex items-center gap-1 ${
                playerMode === 'stock'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Film className="w-3 h-3" />
              <span>{isBn ? 'স্টক ফুটেজ' : 'Stock Clip'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Video Viewport */}
      <div
        ref={containerRef}
        className={`relative rounded-2xl overflow-hidden bg-black border border-slate-800 shadow-2xl flex items-center justify-center transition-all ${
          aspectRatio === '9:16'
            ? 'aspect-[9/16] max-h-[480px] mx-auto w-full max-w-[280px]'
            : aspectRatio === '1:1'
            ? 'aspect-square max-h-[440px] mx-auto'
            : 'aspect-video w-full'
        }`}
      >
        {playerMode === 'generative' ? (
          <canvas
            ref={canvasRef}
            width={aspectRatio === '9:16' ? 1080 : 1920}
            height={aspectRatio === '9:16' ? 1920 : 1080}
            className="w-full h-full object-cover"
          />
        ) : (
          <video
            src={job?.videoUrl || '/videos/sample1.mp4'}
            controls
            autoPlay
            loop
            className="w-full h-full object-cover"
          />
        )}
      </div>

      {/* Scene Progress Bar & Interactive Timeline */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
          <span>
            {Math.floor(currentTime / 60)}:{Math.floor(currentTime % 60).toString().padStart(2, '0')} / 00:28
          </span>
          <span className="text-cyan-400 font-bold">
            Scene {currentSceneIndex + 1} of {scenes.length}
          </span>
        </div>

        {/* 4-Scene Segmented Progress Bar */}
        <div className="grid grid-cols-4 gap-1.5 h-2 rounded-full overflow-hidden bg-slate-800/80 p-0.5">
          {scenes.map((sc, idx) => {
            const isCompleted = currentSceneIndex > idx;
            const isCurrent = currentSceneIndex === idx;
            const segmentProgress = isCurrent
              ? ((currentTime % (totalDuration / scenes.length)) / (totalDuration / scenes.length)) * 100
              : isCompleted
              ? 100
              : 0;

            return (
              <div
                key={idx}
                onClick={() => {
                  setCurrentTime(idx * (totalDuration / scenes.length));
                }}
                className="relative bg-slate-900 rounded cursor-pointer overflow-hidden h-full"
                title={`Scene ${sc.sceneNumber}: ${sc.timestamp}`}
              >
                <div
                  className="bg-gradient-to-r from-cyan-400 to-indigo-500 h-full transition-all duration-100"
                  style={{ width: `${segmentProgress}%` }}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Media Controls Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-950/70 border border-slate-800 rounded-xl text-xs">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setIsPlaying(!isPlaying);
              startBgm();
            }}
            className="p-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold transition shadow-md shadow-cyan-600/30"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
          </button>

          <button
            onClick={() => {
              setCurrentTime(0);
            }}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
            title="Restart from beginning"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              const newMuted = !isMuted;
              setIsMuted(newMuted);
              if (newMuted && typeof window !== 'undefined' && window.speechSynthesis) {
                window.speechSynthesis.cancel();
              }
            }}
            className={`p-2 rounded-lg border transition ${
              isMuted
                ? 'bg-slate-800 border-slate-700 text-slate-400'
                : 'bg-indigo-950 border-indigo-700 text-indigo-300'
            }`}
            title={isMuted ? 'Unmute Audio & Voiceover' : 'Mute Audio & Voiceover'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>

        {/* Scene Narration Snippet */}
        <div className="flex-1 min-w-[200px] text-center px-2">
          <p className="text-[11px] text-slate-300 truncate italic">
            "{scenes[currentSceneIndex]?.narration || 'AI Scene synthesis...'}"
          </p>
        </div>

        {/* Watermark Settings Button */}
        <button
          onClick={openWatermarkModal}
          className={`px-3 py-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
            watermarkConfig.enabled
              ? 'bg-cyan-950/70 border-cyan-500/50 text-cyan-300'
              : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
          }`}
          title={isBn ? 'ভিডিও ওয়াটারমার্ক সেটিংস' : 'Watermark Settings'}
        >
          <Stamp className="w-3.5 h-3.5 text-cyan-400" />
          <span className="hidden sm:inline">{isBn ? 'ওয়াটারমার্ক' : 'Watermark'}</span>
        </button>

        {/* Export / Download Custom Synthesized Video Button */}
        <button
          onClick={handleExportCustomVideo}
          disabled={isExporting}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/20 flex items-center gap-1.5 transition disabled:opacity-50 cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          <span>
            {isExporting 
              ? `${exportProgress}% (রেন্ডার হচ্ছে...)` 
              : (isBn ? 'কাস্টম ভিডিও ডাউনলোড' : 'Download Video')}
          </span>
        </button>
      </div>

      {/* Real-Time Video Rendering & Export Pipeline Progress Indicator */}
      <VideoExportProgressIndicator
        isExporting={isExporting}
        progress={exportProgress}
        title={(job?.prompt || 'AI Generative Scene').slice(0, 45)}
        duration={totalDuration || 15}
        fps={30}
        resolution={aspectRatio === '16:9' ? '1280x720' : aspectRatio === '9:16' ? '720x1280' : '1080x1080'}
        format="WebM (VP9)"
        hasWatermark={watermarkConfig.enabled}
        onCancel={() => {
          setIsExporting(false);
          setExportProgress(0);
        }}
        lang={lang}
        allowFloatingMinimize={true}
      />

    </div>
  );
};
