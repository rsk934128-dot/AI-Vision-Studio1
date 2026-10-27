import React, { useRef } from 'react';
import { 
  X, 
  Stamp, 
  Sparkles, 
  Upload, 
  RotateCcw, 
  Check, 
  Eye, 
  Layers, 
  Type, 
  Image as ImageIcon, 
  Sliders, 
  Palette, 
  CheckCircle2 
} from 'lucide-react';
import { useWatermark, WatermarkPosition, WatermarkType } from '../context/WatermarkContext';
import { Language } from '../types';

interface WatermarkModalProps {
  lang: Language;
}

const PRESET_COLORS = [
  { name: 'White', hex: '#FFFFFF' },
  { name: 'Cyan Neon', hex: '#06B6D4' },
  { name: 'Amber Gold', hex: '#F59E0B' },
  { name: 'Rose Pink', hex: '#F43F5E' },
  { name: 'Emerald', hex: '#10B981' },
  { name: 'Purple', hex: '#A855F7' },
];

export const WatermarkModal: React.FC<WatermarkModalProps> = ({ lang }) => {
  const isBn = lang === 'bn';
  const { config, updateConfig, resetConfig, isModalOpen, closeModal } = useWatermark();
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isModalOpen) return null;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          updateConfig({ imageUrl: reader.result });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const positions: { id: WatermarkPosition; labelBn: string; labelEn: string }[] = [
    { id: 'top-left', labelBn: 'উপরে বাঁয়ে', labelEn: 'Top-Left' },
    { id: 'top-right', labelBn: 'উপরে ডানে', labelEn: 'Top-Right' },
    { id: 'bottom-left', labelBn: 'নিচে বাঁয়ে', labelEn: 'Bottom-Left' },
    { id: 'bottom-right', labelBn: 'নিচে ডানে', labelEn: 'Bottom-Right' },
    { id: 'bottom-center', labelBn: 'নিচে মাঝে', labelEn: 'Bottom-Center' },
    { id: 'center', labelBn: 'একদম মাঝে', labelEn: 'Center' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div 
        className="relative w-full max-w-2xl rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow ambient background */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="relative px-6 py-4 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20">
              <Stamp className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white">
                  {isBn ? 'ভিডিও ওয়াটারমার্ক কাস্টমাইজেশন' : 'Custom Video Watermark'}
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
                  {config.enabled ? (isBn ? 'সক্রিয়' : 'Active') : (isBn ? 'নিষ্ক্রিয়' : 'Disabled')}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                {isBn 
                  ? 'সব এক্সপোর্ট করা ভিডিওতে স্বয়ংক্রিয়ভাবে আপনার কাস্টম ব্র্যান্ড লোগো বা টেক্সট যোগ করুন' 
                  : 'Brand all exported videos with your custom logo, channel handle, or text'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={resetConfig}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              title={isBn ? 'ডিফল্ট রিসেট' : 'Reset to default'}
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={closeModal}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body (Scrollable) */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-140px)] scrollbar-thin">
          
          {/* 1. Main Enable/Disable Toggle */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
            <div>
              <h4 className="text-sm font-bold text-white">
                {isBn ? 'ভিডিওতে ওয়াটারমার্ক যুক্ত করুন' : 'Apply Watermark to All Video Exports'}
              </h4>
              <p className="text-xs text-slate-400">
                {isBn 
                  ? 'চালু থাকলে টেক্সট-টু-ভিডিও, ভিডিও-টু-ভিডিও ও অডিও প্রেজেন্টেশন এক্সপোর্টে ওয়াটারমার্ক থাকবে' 
                  : 'Burns watermark into Text-to-Video, Video-to-Video and Audio Presentation exports'}
              </p>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={config.enabled}
                onChange={(e) => updateConfig({ enabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
            </label>
          </div>

          {/* 2. Real-Time Live Preview Frame */}
          <div>
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="font-bold text-slate-300 flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-cyan-400" />
                {isBn ? 'লাইভ ওয়াটারমার্ক প্রিভিউ:' : 'Real-time Live Preview:'}
              </span>
              <span className="text-[11px] text-slate-400 font-mono">
                Position: {config.position} | Opacity: {Math.round(config.opacity * 100)}%
              </span>
            </div>

            <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 shadow-inner flex items-center justify-center">
              {/* Sample Background Video / Visual */}
              <img
                src="https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200&auto=format&fit=crop&q=80"
                alt="Video Preview"
                className="w-full h-full object-cover opacity-80"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 pointer-events-none" />

              {/* Simulated Center Content */}
              <div className="absolute text-center pointer-events-none select-none">
                <span className="text-xs font-bold text-white/50 tracking-widest uppercase">
                  Sample Video Output Frame
                </span>
              </div>

              {/* The Live Rendered Watermark on top of the sample */}
              {config.enabled && (
                <div 
                  className={`absolute flex items-center transition-all ${
                    config.position === 'top-left' ? 'top-4 left-4' :
                    config.position === 'top-right' ? 'top-4 right-4' :
                    config.position === 'bottom-left' ? 'bottom-4 left-4' :
                    config.position === 'bottom-right' ? 'bottom-4 right-4' :
                    config.position === 'bottom-center' ? 'bottom-4 left-1/2 -translate-x-1/2' :
                    'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'
                  }`}
                  style={{
                    opacity: config.opacity,
                  }}
                >
                  <div className={`flex items-center gap-2.5 ${
                    config.showBackgroundBadge 
                      ? 'px-3 py-1.5 rounded-xl bg-slate-950/80 border border-cyan-500/40 shadow-xl backdrop-blur-sm' 
                      : ''
                  }`}>
                    {(config.type === 'image' || config.type === 'both') && config.imageUrl && (
                      <div 
                        className="rounded-lg overflow-hidden shrink-0 shadow-sm"
                        style={{
                          width: `${Math.max(18, Math.min(60, config.imageSize * 0.7))}px`,
                          height: `${Math.max(18, Math.min(60, config.imageSize * 0.7))}px`,
                        }}
                      >
                        <img 
                          src={config.imageUrl} 
                          alt="Watermark" 
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    )}

                    {(config.type === 'text' || config.type === 'both') && config.text && (
                      <span 
                        className="font-bold tracking-tight drop-shadow-md select-none"
                        style={{
                          color: config.textColor,
                          fontSize: `${Math.max(11, Math.min(28, config.fontSize * 0.75))}px`,
                        }}
                      >
                        {config.text}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 3. Watermark Type Selector (Text / Image / Both) */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-2">
              {isBn ? 'ওয়াটারমার্কের ধরন:' : 'Watermark Type:'}
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => updateConfig({ type: 'both' })}
                className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition cursor-pointer ${
                  config.type === 'both'
                    ? 'bg-cyan-950/60 border-cyan-500 text-white shadow-md shadow-cyan-500/20'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-1">
                  <ImageIcon className="w-4 h-4 text-cyan-400" />
                  <Type className="w-4 h-4 text-purple-400" />
                </div>
                <span className="text-xs font-bold">{isBn ? 'লোগো + টেক্সট' : 'Logo + Text'}</span>
              </button>

              <button
                onClick={() => updateConfig({ type: 'text' })}
                className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition cursor-pointer ${
                  config.type === 'text'
                    ? 'bg-cyan-950/60 border-cyan-500 text-white shadow-md shadow-cyan-500/20'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800'
                }`}
              >
                <Type className="w-4 h-4 text-purple-400" />
                <span className="text-xs font-bold">{isBn ? 'শুধুমাত্র টেক্সট' : 'Text Only'}</span>
              </button>

              <button
                onClick={() => updateConfig({ type: 'image' })}
                className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition cursor-pointer ${
                  config.type === 'image'
                    ? 'bg-cyan-950/60 border-cyan-500 text-white shadow-md shadow-cyan-500/20'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800'
                }`}
              >
                <ImageIcon className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-bold">{isBn ? 'শুধুমাত্র লোগো' : 'Logo Only'}</span>
              </button>
            </div>
          </div>

          {/* 4. Text Configuration (If text or both) */}
          {(config.type === 'text' || config.type === 'both') && (
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-4">
              <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                <Type className="w-3.5 h-3.5 text-purple-400" />
                <span>{isBn ? 'টেক্সট ওয়াটারমার্ক কনফিগারেশন' : 'Text Settings'}</span>
              </h4>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  {isBn ? 'কাস্টম টেক্সট (নাম, হ্যান্ডেল বা ব্র্যান্ড):' : 'Custom Text / Channel Handle:'}
                </label>
                <input
                  type="text"
                  value={config.text}
                  onChange={(e) => updateConfig({ text: e.target.value })}
                  placeholder="e.g. @MyChannel or AI Video Studio"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              {/* Color Presets */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1.5">
                  {isBn ? 'টেক্সটের রঙ:' : 'Text Color:'}
                </label>
                <div className="flex items-center gap-2">
                  {PRESET_COLORS.map((c) => (
                    <button
                      key={c.hex}
                      onClick={() => updateConfig({ textColor: c.hex })}
                      className={`w-7 h-7 rounded-full transition flex items-center justify-center cursor-pointer border-2 ${
                        config.textColor === c.hex ? 'border-white scale-110 shadow-lg' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: c.hex }}
                      title={c.name}
                    >
                      {config.textColor === c.hex && (
                        <Check className="w-3.5 h-3.5 text-black" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Font Size Slider */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-slate-400">{isBn ? 'ফন্ট সাইজ:' : 'Font Size:'}</span>
                  <span className="font-mono text-cyan-400 font-bold">{config.fontSize}px</span>
                </div>
                <input
                  type="range"
                  min="14"
                  max="44"
                  step="2"
                  value={config.fontSize}
                  onChange={(e) => updateConfig({ fontSize: parseInt(e.target.value, 10) })}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>
            </div>
          )}

          {/* 5. Image/Logo Configuration (If image or both) */}
          {(config.type === 'image' || config.type === 'both') && (
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-4">
              <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-cyan-400" />
                <span>{isBn ? 'লোগো ইমেজ কনফিগারেশন' : 'Logo Settings'}</span>
              </h4>

              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl overflow-hidden ring-1 ring-cyan-500/40 bg-slate-900 shrink-0">
                  <img
                    src={config.imageUrl}
                    alt="Logo"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>

                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white border border-slate-700 flex items-center gap-1.5 cursor-pointer transition"
                    >
                      <Upload className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{isBn ? 'নতুন লোগো আপলোড' : 'Upload Logo'}</span>
                    </button>
                    <button
                      onClick={() => updateConfig({ imageUrl: '/logo.jpg' })}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 border border-slate-700 cursor-pointer transition"
                    >
                      {isBn ? 'অ্যাপের লোগো ব্যবহার' : 'Use App Logo'}
                    </button>
                  </div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  <p className="text-[11px] text-slate-500">
                    {isBn ? 'PNG, JPG, WebP বা SVG ফাইল সাপোর্ট করে' : 'Supports transparent PNG, JPG, WebP'}
                  </p>
                </div>
              </div>

              {/* Logo Size Slider */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-slate-400">{isBn ? 'লোগোর আকার:' : 'Logo Size:'}</span>
                  <span className="font-mono text-cyan-400 font-bold">{config.imageSize}px</span>
                </div>
                <input
                  type="range"
                  min="24"
                  max="96"
                  step="2"
                  value={config.imageSize}
                  onChange={(e) => updateConfig({ imageSize: parseInt(e.target.value, 10) })}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>
            </div>
          )}

          {/* 6. Position Selector Grid */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-2">
              {isBn ? 'স্ক্রিনে অবস্থান (Position):' : 'Position on Screen:'}
            </label>
            <div className="grid grid-cols-3 gap-2">
              {positions.map((p) => {
                const isSelected = config.position === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => updateConfig({ position: p.id })}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold border text-center transition cursor-pointer ${
                      isSelected
                        ? 'bg-cyan-950/70 border-cyan-500 text-cyan-300 font-bold shadow-sm'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    {isBn ? p.labelBn : p.labelEn}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 7. Opacity & Margin Sliders */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Opacity */}
            <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-slate-300 font-semibold">{isBn ? 'স্বচ্ছতা (Opacity):' : 'Opacity:'}</span>
                <span className="font-mono text-cyan-400 font-bold">{Math.round(config.opacity * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.15"
                max="1.0"
                step="0.05"
                value={config.opacity}
                onChange={(e) => updateConfig({ opacity: parseFloat(e.target.value) })}
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>

            {/* Margin from Border */}
            <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-slate-300 font-semibold">{isBn ? 'সীমানা দূরত্ব (Margin):' : 'Border Margin:'}</span>
                <span className="font-mono text-cyan-400 font-bold">{config.margin}px</span>
              </div>
              <input
                type="range"
                min="12"
                max="64"
                step="4"
                value={config.margin}
                onChange={(e) => updateConfig({ margin: parseInt(e.target.value, 10) })}
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>
          </div>

          {/* 8. Background Badge Option */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800">
            <div>
              <span className="text-xs font-bold text-white block">
                {isBn ? 'ডার্ক ব্যাকগ্রাউন্ড ব্যাজ (Glass Badge)' : 'Dark Glass Background Badge'}
              </span>
              <span className="text-[11px] text-slate-400">
                {isBn ? 'যেকোনো উজ্জ্বল বা অন্ধকার ভিডিও ব্যাকগ্রাউন্ডে টেক্সট স্পষ্ট রাখে' : 'Ensures high contrast readability over bright scenes'}
              </span>
            </div>
            <input
              type="checkbox"
              checked={config.showBackgroundBadge}
              onChange={(e) => updateConfig({ showBackgroundBadge: e.target.checked })}
              className="w-4 h-4 accent-cyan-500 cursor-pointer rounded"
            />
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between">
          <button
            onClick={resetConfig}
            className="text-xs text-slate-400 hover:text-white font-medium cursor-pointer"
          >
            {isBn ? 'ডিফল্টে ফিরে যান' : 'Reset to Default'}
          </button>

          <button
            onClick={closeModal}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-cyan-600/25 transition cursor-pointer flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{isBn ? 'সেটিংস প্রয়োগ করুন' : 'Save & Apply'}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
