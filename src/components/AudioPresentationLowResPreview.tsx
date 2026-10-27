import React, { useRef, useEffect, useState } from 'react';
import { 
  Sparkles, 
  Activity, 
  Cpu, 
  Layers, 
  Tv, 
  Eye, 
  RefreshCw,
  Film,
  Music,
  Radio,
  Scan
} from 'lucide-react';
import { Language } from '../types';

interface AudioPresentationLowResPreviewProps {
  isGenerating: boolean;
  currentStageIndex: number;
  generationProgress: number;
  elapsedSeconds: number;
  visualStyle: string;
  aspectRatio: '16:9' | '9:16';
  songTitle: string;
  artistName: string;
  lang: Language;
}

export const AudioPresentationLowResPreview: React.FC<AudioPresentationLowResPreviewProps> = ({
  isGenerating,
  currentStageIndex,
  generationProgress,
  elapsedSeconds,
  visualStyle,
  aspectRatio,
  songTitle,
  artistName,
  lang,
}) => {
  const isBn = lang === 'bn';
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const [previewMode, setPreviewMode] = useState<'generative' | 'spectral' | 'wireframe'>('generative');
  const [pixelScale, setPixelScale] = useState<number>(3); // Low-res pixelation factor (3 = 1/3 resolution)
  const [fps, setFps] = useState<number>(30);

  // Internal low-res procedural generation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let tick = 0;
    let lastTime = performance.now();
    let frameCount = 0;

    // Dimensions for low-resolution draft buffer
    const baseW = aspectRatio === '16:9' ? 320 : 180;
    const baseH = aspectRatio === '16:9' ? 180 : 320;
    
    // Virtual low-res resolution
    const virtualW = Math.max(80, Math.floor(baseW / pixelScale));
    const virtualH = Math.max(45, Math.floor(baseH / pixelScale));

    // Off-screen canvas for authentic pixelated / low-res scaling
    const offscreen = document.createElement('canvas');
    offscreen.width = virtualW;
    offscreen.height = virtualH;
    const offCtx = offscreen.getContext('2d');

    const render = (time: number) => {
      tick++;
      frameCount++;
      if (time - lastTime >= 1000) {
        setFps(frameCount);
        frameCount = 0;
        lastTime = time;
      }

      if (offCtx && ctx) {
        // Clear buffer
        offCtx.fillStyle = '#0a0d18';
        offCtx.fillRect(0, 0, virtualW, virtualH);

        // Palette selector based on visualStyle & currentStageIndex
        let primaryColor = '#9333ea'; // purple
        let secondaryColor = '#ec4899'; // pink
        let accentColor = '#38bdf8'; // sky blue
        let bgGradTop = '#0f172a';
        let bgGradBot = '#05070e';

        if (visualStyle === 'romantic_rain') {
          primaryColor = '#38bdf8';
          secondaryColor = '#60a5fa';
          accentColor = '#e2e8f0';
          bgGradTop = '#0c192c';
          bgGradBot = '#020617';
        } else if (visualStyle === 'vintage_baul') {
          primaryColor = '#d97706';
          secondaryColor = '#b45309';
          accentColor = '#fef08a';
          bgGradTop = '#291b0b';
          bgGradBot = '#0f0a04';
        } else if (visualStyle === 'neon_night') {
          primaryColor = '#ec4899';
          secondaryColor = '#06b6d4';
          accentColor = '#a855f7';
          bgGradTop = '#180728';
          bgGradBot = '#030712';
        } else if (visualStyle === 'spiritual_nature') {
          primaryColor = '#10b981';
          secondaryColor = '#059669';
          accentColor = '#fbbf24';
          bgGradTop = '#062016';
          bgGradBot = '#020a06';
        } else if (visualStyle === 'starry_cosmic') {
          primaryColor = '#818cf8';
          secondaryColor = '#c084fc';
          accentColor = '#38bdf8';
          bgGradTop = '#0f0c29';
          bgGradBot = '#02020a';
        }

        // 1. Draw atmospheric background gradient
        const bgGrad = offCtx.createLinearGradient(0, 0, 0, virtualH);
        bgGrad.addColorStop(0, bgGradTop);
        bgGrad.addColorStop(1, bgGradBot);
        offCtx.fillStyle = bgGrad;
        offCtx.fillRect(0, 0, virtualW, virtualH);

        // 2. Render based on active previewMode
        if (previewMode === 'generative') {
          // --- Generative Latent Scenery Draft ---
          // Distant celestial body (Sun / Moon / Neural Orb)
          const orbX = virtualW * 0.7;
          const orbY = virtualH * 0.35 + Math.sin(tick * 0.03) * 3;
          const orbRadius = Math.max(6, virtualW * 0.12);
          const orbGrad = offCtx.createRadialGradient(orbX, orbY, 1, orbX, orbY, orbRadius);
          orbGrad.addColorStop(0, accentColor);
          orbGrad.addColorStop(0.5, secondaryColor);
          orbGrad.addColorStop(1, 'transparent');
          offCtx.fillStyle = orbGrad;
          offCtx.beginPath();
          offCtx.arc(orbX, orbY, orbRadius, 0, Math.PI * 2);
          offCtx.fill();

          // Starfield / Latent Sparkles
          offCtx.fillStyle = accentColor;
          for (let i = 0; i < 18; i++) {
            const sx = (Math.sin(i * 99 + tick * 0.01) * 0.5 + 0.5) * virtualW;
            const sy = (Math.cos(i * 33 + tick * 0.01) * 0.5 + 0.5) * (virtualH * 0.65);
            const size = (i % 3 === 0) ? 1.5 : 1;
            offCtx.globalAlpha = 0.3 + 0.7 * Math.sin(tick * 0.08 + i);
            offCtx.fillRect(Math.floor(sx), Math.floor(sy), size, size);
          }
          offCtx.globalAlpha = 1.0;

          // Horizon mountain / skyline silhouette layers
          // Layer 1: Far mountains
          offCtx.fillStyle = primaryColor + '44';
          offCtx.beginPath();
          offCtx.moveTo(0, virtualH);
          for (let x = 0; x <= virtualW; x += 4) {
            const my = virtualH * 0.55 + Math.sin(x * 0.04 + 1.2) * 12 + Math.cos(x * 0.09) * 6;
            offCtx.lineTo(x, my);
          }
          offCtx.lineTo(virtualW, virtualH);
          offCtx.closePath();
          offCtx.fill();

          // Layer 2: Near landscape & rhythmic motion
          offCtx.fillStyle = bgGradBot;
          offCtx.beginPath();
          offCtx.moveTo(0, virtualH);
          for (let x = 0; x <= virtualW; x += 3) {
            const ny = virtualH * 0.72 + Math.sin(x * 0.06 + tick * 0.04) * 5 + Math.cos(x * 0.12) * 3;
            offCtx.lineTo(x, ny);
          }
          offCtx.lineTo(virtualW, virtualH);
          offCtx.closePath();
          offCtx.fill();

          // Rain streaks or emotional light trails if romantic or cinematic
          if (visualStyle === 'romantic_rain' || currentStageIndex >= 2) {
            offCtx.strokeStyle = accentColor + '66';
            offCtx.lineWidth = 1;
            for (let r = 0; r < 14; r++) {
              const rx = (r * 17 + tick * 2.5) % virtualW;
              const ry = (r * 29 + tick * 4) % virtualH;
              offCtx.beginPath();
              offCtx.moveTo(rx, ry);
              offCtx.lineTo(rx - 2, ry + 6);
              offCtx.stroke();
            }
          }

          // Camera focal reticle (indicates scene framing generation)
          offCtx.strokeStyle = secondaryColor + '99';
          offCtx.lineWidth = 1;
          const reticleSize = 12;
          const cx = virtualW / 2;
          const cy = virtualH / 2 + Math.sin(tick * 0.05) * 4;
          // Reticle corners
          offCtx.strokeRect(cx - reticleSize, cy - reticleSize, reticleSize * 2, reticleSize * 2);
          offCtx.fillStyle = accentColor;
          offCtx.fillRect(cx - 1, cy - 1, 2, 2);

        } else if (previewMode === 'spectral') {
          // --- Audio Latent Spectral Waveform ---
          const barCount = 28;
          const barW = Math.max(2, Math.floor(virtualW / barCount) - 1);
          for (let b = 0; b < barCount; b++) {
            const freq = Math.sin(tick * 0.08 + b * 0.35) * 0.5 + 0.5;
            const noise = Math.cos(tick * 0.12 + b * 0.7) * 0.3;
            const hRatio = Math.min(0.95, Math.max(0.08, freq + noise));
            const barH = Math.floor(virtualH * 0.7 * hRatio);
            const bx = b * (barW + 1) + 2;
            const by = virtualH * 0.85 - barH;

            const barGrad = offCtx.createLinearGradient(0, by, 0, by + barH);
            barGrad.addColorStop(0, accentColor);
            barGrad.addColorStop(0.5, secondaryColor);
            barGrad.addColorStop(1, primaryColor);
            offCtx.fillStyle = barGrad;
            offCtx.fillRect(bx, by, barW, barH);

            // Peak dot
            offCtx.fillStyle = '#ffffff';
            offCtx.fillRect(bx, Math.max(2, by - 2), barW, 1);
          }

          // Center baseline
          offCtx.strokeStyle = primaryColor + '88';
          offCtx.lineWidth = 1;
          offCtx.beginPath();
          offCtx.moveTo(0, virtualH * 0.86);
          offCtx.lineTo(virtualW, virtualH * 0.86);
          offCtx.stroke();

        } else if (previewMode === 'wireframe') {
          // --- 3D Latent Wireframe Matrix Grid ---
          offCtx.strokeStyle = primaryColor + '77';
          offCtx.lineWidth = 1;
          const horizonY = virtualH * 0.45;
          const vanishingX = virtualW / 2;

          // Perspective radial lines
          for (let p = -virtualW; p <= virtualW * 2; p += 16) {
            offCtx.beginPath();
            offCtx.moveTo(vanishingX, horizonY);
            offCtx.lineTo(p, virtualH);
            offCtx.stroke();
          }

          // Horizontal grid lines flowing towards camera
          for (let g = 0; g < 8; g++) {
            const progress = (g / 8 + (tick * 0.02)) % 1;
            const gy = horizonY + Math.pow(progress, 2.2) * (virtualH - horizonY);
            offCtx.beginPath();
            offCtx.moveTo(0, gy);
            offCtx.lineTo(virtualW, gy);
            offCtx.stroke();
          }

          // Pulsing neural node network
          offCtx.fillStyle = accentColor;
          for (let n = 0; n < 8; n++) {
            const nx = (Math.sin(tick * 0.04 + n * 1.5) * 0.4 + 0.5) * virtualW;
            const ny = (Math.cos(tick * 0.03 + n * 2.1) * 0.2 + 0.25) * virtualH;
            offCtx.fillRect(Math.floor(nx), Math.floor(ny), 2, 2);
          }
        }

        // 3. Low-res Scanlines & CRT simulation overlay on offscreen
        offCtx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        for (let y = 0; y < virtualH; y += 2) {
          offCtx.fillRect(0, y, virtualW, 1);
        }

        // 4. Upscale offscreen canvas to main canvas with crisp pixelated rendering
        ctx.imageSmoothingEnabled = false; // Essential for crisp low-res look
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(offscreen, 0, 0, canvas.width, canvas.height);

        // 5. Draw high-tech HUD overlay on main canvas (sharp text over pixelated background)
        ctx.imageSmoothingEnabled = true;

        // Subtly darken vignette edges
        const vignette = ctx.createRadialGradient(
          canvas.width / 2,
          canvas.height / 2,
          canvas.width * 0.35,
          canvas.width / 2,
          canvas.height / 2,
          canvas.width * 0.7
        );
        vignette.addColorStop(0, 'rgba(0,0,0,0)');
        vignette.addColorStop(1, 'rgba(0,0,0,0.6)');
        ctx.fillStyle = vignette;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [aspectRatio, pixelScale, previewMode, visualStyle, currentStageIndex]);

  // Stage names in Bengali and English
  const stageBadges = [
    { en: 'Stage 1: Spectrogram & Beat Alignment', bn: 'ধাপ ১: অডিও বর্ণালী ও বিট বিশ্লেষণ' },
    { en: 'Stage 2: Semantic Emotion Latents', bn: 'ধাপ ২: গানের আবেগ ও লিরিক্স ম্যাপিং' },
    { en: 'Stage 3: Cinematic Storyboard Drafting', bn: 'ধাপ ৩: সিনেমাটিক ফ্রেম কম্পোজিশন' },
    { en: 'Stage 4: Color Mood & Particle Choreography', bn: 'ধাপ ৪: কালার ও লাইটিং পরিবেশ সৃষ্টি' },
    { en: 'Stage 5: Final HD Presentation Synthesis', bn: 'ধাপ ৫: ফুল ভিডিও প্রেজেন্টেশন রেন্ডার' },
  ];

  const currentStageText = stageBadges[Math.min(currentStageIndex, 4)];

  return (
    <div className="rounded-2xl bg-slate-950 border border-purple-500/30 overflow-hidden shadow-2xl space-y-0">
      
      {/* Top Header Bar */}
      <div className="bg-slate-900/90 border-b border-slate-800/80 px-4 py-3 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <span className="flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-pink-500" />
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white tracking-wide uppercase flex items-center gap-1.5">
                <Tv className="w-3.5 h-3.5 text-purple-400" />
                {isBn ? 'এআই লো-রেজোলিউশন ড্রাফট প্রিভিউ' : 'AI Low-Res Draft Preview'}
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-purple-950/80 border border-purple-500/40 text-purple-300">
                {Math.round(320 / pixelScale)}×{Math.round(180 / pixelScale)} px
              </span>
            </div>
            <div className="text-[11px] text-slate-400 truncate max-w-[240px] sm:max-w-xs mt-0.5">
              {songTitle} • {artistName}
            </div>
          </div>
        </div>

        {/* View mode switcher & controls */}
        <div className="flex items-center gap-1.5 bg-slate-950/80 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setPreviewMode('generative')}
            title="Generative Scene"
            className={`px-2.5 py-1 rounded-lg transition flex items-center gap-1 text-[11px] font-medium ${
              previewMode === 'generative'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3 h-3" />
            <span className="hidden sm:inline">{isBn ? 'দৃশ্য ড্রাফট' : 'Generative'}</span>
          </button>
          <button
            onClick={() => setPreviewMode('spectral')}
            title="Audio Frequency Waveform"
            className={`px-2.5 py-1 rounded-lg transition flex items-center gap-1 text-[11px] font-medium ${
              previewMode === 'spectral'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Activity className="w-3 h-3" />
            <span className="hidden sm:inline">{isBn ? 'স্পেকট্রাম' : 'Spectral'}</span>
          </button>
          <button
            onClick={() => setPreviewMode('wireframe')}
            title="Neural 3D Matrix"
            className={`px-2.5 py-1 rounded-lg transition flex items-center gap-1 text-[11px] font-medium ${
              previewMode === 'wireframe'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3 h-3" />
            <span className="hidden sm:inline">{isBn ? 'ম্যাট্রিক্স' : 'Matrix'}</span>
          </button>
        </div>
      </div>

      {/* Interactive Low-Res Animation Canvas Container */}
      <div className="relative bg-black flex items-center justify-center overflow-hidden group select-none">
        
        {/* Main Low-Res Canvas */}
        <div className={`w-full flex items-center justify-center p-2 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 ${
          aspectRatio === '16:9' ? 'aspect-video max-h-[340px]' : 'aspect-[9/16] max-h-[460px]'
        }`}>
          <canvas
            ref={canvasRef}
            width={aspectRatio === '16:9' ? 640 : 360}
            height={aspectRatio === '16:9' ? 360 : 640}
            className="w-full h-full object-contain rounded-lg border border-purple-500/20 shadow-inner"
            style={{ imageRendering: 'pixelated' }}
          />
        </div>

        {/* Overlay Telemetry HUD: Top Left */}
        <div className="absolute top-4 left-4 pointer-events-none flex flex-col gap-1.5 z-10">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-black/75 backdrop-blur-md border border-white/10 text-white text-[11px] font-mono shadow-lg">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>AI LATENT BUFFER: RUNNING</span>
          </div>
          <div className="text-[10px] font-mono text-purple-300/80 px-1 drop-shadow">
            SEED: 0x{((elapsedSeconds * 47) % 9999).toString(16).toUpperCase().padStart(4, '0')} • FPS: {fps} • RATIO: {aspectRatio}
          </div>
        </div>

        {/* Overlay Telemetry HUD: Top Right */}
        <div className="absolute top-4 right-4 pointer-events-none z-10">
          <div className="px-2.5 py-1 rounded-md bg-purple-950/80 backdrop-blur-md border border-purple-500/40 text-purple-200 text-[11px] font-mono font-semibold shadow-lg">
            {generationProgress}%
          </div>
        </div>

        {/* Overlay Center Stage Announcement Pill */}
        <div className="absolute bottom-4 left-4 right-4 pointer-events-none z-10 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="px-3 py-1.5 rounded-lg bg-black/80 backdrop-blur-md border border-purple-500/30 text-slate-200 text-xs flex items-center gap-2 shadow-lg">
            <Sparkles className="w-3.5 h-3.5 text-yellow-300 animate-spin" />
            <span className="font-semibold text-purple-300">
              {isBn ? currentStageText.bn : currentStageText.en}
            </span>
          </div>

          <div className="flex items-center gap-2 pointer-events-auto">
            {/* Pixel Scale Adjuster */}
            <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-black/75 backdrop-blur-md border border-white/10 text-[10px] text-slate-300 font-mono">
              <Scan className="w-3 h-3 text-purple-400" />
              <span>Res:</span>
              <button
                onClick={() => setPixelScale(4)}
                className={`px-1.5 py-0.5 rounded transition ${pixelScale === 4 ? 'bg-purple-600 text-white' : 'hover:text-white'}`}
                title="Ultra Low-Res (80×45)"
              >
                1/4
              </button>
              <button
                onClick={() => setPixelScale(3)}
                className={`px-1.5 py-0.5 rounded transition ${pixelScale === 3 ? 'bg-purple-600 text-white' : 'hover:text-white'}`}
                title="Low-Res (106×60)"
              >
                1/3
              </button>
              <button
                onClick={() => setPixelScale(2)}
                className={`px-1.5 py-0.5 rounded transition ${pixelScale === 2 ? 'bg-purple-600 text-white' : 'hover:text-white'}`}
                title="Medium-Res (160×90)"
              >
                1/2
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* Bottom Status Ticker */}
      <div className="bg-slate-900/90 border-t border-slate-800 px-4 py-2 text-xs flex items-center justify-between text-slate-400">
        <div className="flex items-center gap-2 text-[11px] truncate">
          <Cpu className="w-3.5 h-3.5 text-purple-400 shrink-0" />
          <span className="text-purple-300 font-medium">
            {isBn ? 'রিয়েলটাইম লো-রেজ ড্রাফট ফ্রেম জেনারেশন চালু রয়েছে' : 'Live low-res draft animation streaming active'}
          </span>
          <span className="text-slate-500">•</span>
          <span className="hidden md:inline text-slate-400">
            {isBn ? 'চূড়ান্ত HD প্রেজেন্টেশন সম্পন্ন হলে অটো প্লে হবে' : 'Full HD presentation will auto-play upon completion'}
          </span>
        </div>
        <div className="text-[11px] font-mono text-slate-400 shrink-0">
          {elapsedSeconds}s
        </div>
      </div>

    </div>
  );
};
