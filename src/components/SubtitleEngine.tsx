import React, { useState } from 'react';
import { 
  Subtitles, 
  Terminal, 
  Sliders, 
  Palette, 
  Copy, 
  Check, 
  Play, 
  Download, 
  Code, 
  Cpu, 
  FileCode
} from 'lucide-react';
import { Language, SubtitleStyle } from '../types';

interface SubtitleEngineProps {
  lang: Language;
  initialSrt?: string;
}

export const SubtitleEngine: React.FC<SubtitleEngineProps> = ({ lang, initialSrt }) => {
  const isBn = lang === 'bn';

  const [activeTab, setActiveTab] = useState<'preview' | 'python' | 'bash'>('preview');
  const [copied, setCopied] = useState<boolean>(false);

  // Subtitle styling matching prompt's ProSubtitleEngine
  const [style, setStyle] = useState<SubtitleStyle>({
    fontSize: 24,
    primaryColor: '#00ffff', // Cyan as recommended in user prompt
    outlineColor: '#000000',
    hasShadow: true,
    alignment: 'bottom',
    highlightKeywords: true,
  });

  const [srtText, setSrtText] = useState<string>(
    initialSrt || 
`1
00:00:00,500 --> 00:00:03,200
এআই ভিডিও মেকিংয়ে স্বাগতম!

2
00:00:03,500 --> 00:00:06,800
স্বয়ংক্রিয় রঙিন সাবটাইটেল এবং সাউন্ড মিক্সিং।`
  );

  const sampleVideoUrl = '/videos/sample1.mp4';

  // Generated Python code matching user prompt's pro_subtitle_engine.py
  const generatedPythonCode = `import subprocess
import os

class ProSubtitleEngine:
    def burn_stylish_subtitles(self, video_path, srt_path, output_path):
        """
        ভিডিওতে ড্রপ-শ্যাডোসহ প্রফেশনাল সাবটাইটেল বসানো।
        """
        # PrimaryColour: ${style.primaryColor === '#00ffff' ? '&H00FFFF& (Cyan)' : '&H00FFFFFF& (White)'}
        style_cmd = (
            "force_style='Fontname=Arial,FontSize=${style.fontSize},"
            "PrimaryColour=${style.primaryColor === '#00ffff' ? '&H00FFFF&' : '&H00FFFFFF&'},"
            "OutlineColour=&H000000&,BorderStyle=1,Outline=2,"
            "Shadow=${style.hasShadow ? '2' : '0'},Alignment=${style.alignment === 'bottom' ? '2' : '10'}'"
        )
        
        cmd = [
            "ffmpeg", "-y", "-i", video_path,
            "-vf", f"subtitles='{srt_path}':{style_cmd}",
            "-c:a", "copy",
            "-preset", "veryfast",
            output_path
        ]
        
        subprocess.run(cmd, check=True)
        print(f"✨ স্টাইলিশ ভিডিও প্রস্তুত: {output_path}")

# Run
engine = ProSubtitleEngine()
engine.burn_stylish_subtitles("raw_video.mp4", "captions.srt", "final_subtitled.mp4")`;

  const generatedBashCommand = `ffmpeg -y -i input.mp4 \\
  -vf "subtitles='captions.srt':force_style='Fontname=Arial,FontSize=${style.fontSize},PrimaryColour=${style.primaryColor === '#00ffff' ? '&H00FFFF&' : '&H00FFFFFF&'},OutlineColour=&H000000&,Shadow=${style.hasShadow ? '2' : '0'},Alignment=2'" \\
  -c:a copy \\
  -preset veryfast \\
  output_with_captions.mp4`;

  const handleCopyCode = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8">
      {/* Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 p-6 rounded-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
                FFmpeg Subtitle & Audio Automation
              </span>
              <span className="text-xs text-slate-400">
                {isBn ? 'হাই-কনট্রাস্ট রঙিন সাবটাইটেল ইঞ্জিন' : 'High-Contrast Styled Subtitle Burning'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {isBn ? 'ডাইনামিক সাবটাইটেল ও FFmpeg অটোমেশন ইঞ্জিন' : 'Dynamic Subtitle & FFmpeg Automation Engine'}
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl">
              {isBn 
                ? 'ইউটিউব শর্টস ও রিলসের জন্য উজ্জ্বল Cyan/Yellow টেক্সট, ব্ল্যাক আউটলাইন এবং ড্রপ-শ্যাডোযুক্ত সাবটাইটেল কাস্টমাইজ করুন এবং সরাসরি FFmpeg স্ক্রিপ্ট জেনারেট করুন।' 
                : 'Customize YouTube Shorts styled captions with high contrast drop-shadows, alignment controls, and generate production-ready FFmpeg commands.'}
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid: Left = Style Controls & SRT Editor, Right = Live Video Preview & Generated Code */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Style Controls (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-5">
            
            <h3 className="text-xs font-bold text-slate-300 flex items-center gap-1.5 uppercase tracking-wider">
              <Palette className="w-3.5 h-3.5 text-cyan-400" />
              {isBn ? 'সাবটাইটেল স্টাইলিং প্যানেল' : 'Subtitle Visual Styling'}
            </h3>

            {/* Color Palette */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-2">
                {isBn ? 'মূল টেক্সট কালার (Primary Color):' : 'Text Primary Color:'}
              </label>
              <div className="flex items-center gap-3">
                {[
                  { id: '#00ffff', label: 'Cyan (&H00FFFF&)', color: '#00ffff' },
                  { id: '#facc15', label: 'Yellow', color: '#facc15' },
                  { id: '#ffffff', label: 'White', color: '#ffffff' },
                  { id: '#22c55e', label: 'Neon Green', color: '#22c55e' }
                ].map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setStyle({ ...style, primaryColor: c.id })}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition ${
                      style.primaryColor === c.id
                        ? 'border-cyan-400 bg-slate-800 text-white ring-1 ring-cyan-400'
                        : 'border-slate-700 bg-slate-950 text-slate-400'
                    }`}
                  >
                    <span className="w-3.5 h-3.5 rounded-full border border-black/40" style={{ backgroundColor: c.color }} />
                    <span>{c.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Font Size */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-slate-400">{isBn ? 'ফন্ট সাইজ (Font Size):' : 'Font Size:'}</span>
                <span className="font-mono text-cyan-400 font-bold">{style.fontSize}px</span>
              </div>
              <input
                type="range"
                min="16"
                max="36"
                step="2"
                value={style.fontSize}
                onChange={(e) => setStyle({ ...style, fontSize: parseInt(e.target.value, 10) })}
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>

            {/* Alignment & Shadow */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                  {isBn ? 'পজিশন (Alignment):' : 'Position:'}
                </label>
                <select
                  value={style.alignment}
                  onChange={(e: any) => setStyle({ ...style, alignment: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2 text-xs text-white focus:outline-none"
                >
                  <option value="bottom">Bottom Center (Alignment=2)</option>
                  <option value="middle">Middle Center (Alignment=10)</option>
                  <option value="top">Top Center (Alignment=6)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                  {isBn ? 'ড্রপ-শ্যাডো (Drop Shadow):' : 'Drop Shadow:'}
                </label>
                <button
                  type="button"
                  onClick={() => setStyle({ ...style, hasShadow: !style.hasShadow })}
                  className={`w-full py-2 px-3 rounded-xl border text-xs font-semibold transition ${
                    style.hasShadow 
                      ? 'bg-cyan-950 border-cyan-500 text-cyan-300' 
                      : 'bg-slate-950 border-slate-700 text-slate-400'
                  }`}
                >
                  {style.hasShadow ? '✓ Enabled (Shadow=1)' : 'Disabled'}
                </button>
              </div>
            </div>

            {/* SRT Text Editor */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                {isBn ? 'এসআরটি সাবটাইটেল টেক্সট (.SRT):' : 'SRT Caption File Contents:'}
              </label>
              <textarea
                value={srtText}
                onChange={(e) => setSrtText(e.target.value)}
                rows={5}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-500 resize-none leading-relaxed"
              />
            </div>

          </div>
        </div>

        {/* Right Column: Live Subtitle Overlay & Generated Code (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            
            {/* Tab Nav for View Mode */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveTab('preview')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    activeTab === 'preview'
                      ? 'bg-cyan-600 text-white'
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  {isBn ? 'লাইভ প্রিভিউ' : 'Live Preview'}
                </button>
                <button
                  onClick={() => setActiveTab('python')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
                    activeTab === 'python'
                      ? 'bg-cyan-600 text-white'
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  <FileCode className="w-3.5 h-3.5" />
                  <span>Python Engine</span>
                </button>
                <button
                  onClick={() => setActiveTab('bash')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
                    activeTab === 'bash'
                      ? 'bg-cyan-600 text-white'
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  <Terminal className="w-3.5 h-3.5" />
                  <span>FFmpeg CLI</span>
                </button>
              </div>

              {activeTab !== 'preview' && (
                <button
                  onClick={() => handleCopyCode(activeTab === 'python' ? generatedPythonCode : generatedBashCommand)}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 transition"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? (isBn ? 'কপি হয়েছে' : 'Copied') : (isBn ? 'কোড কপি' : 'Copy Code')}</span>
                </button>
              )}
            </div>

            {/* Display based on Active Tab */}
            {activeTab === 'preview' ? (
              <div className="relative rounded-xl overflow-hidden bg-black aspect-video border border-slate-800 shadow-inner group">
                <video
                  src={sampleVideoUrl}
                  controls
                  loop
                  autoPlay
                  muted
                  className="w-full h-full object-cover"
                />

                {/* Styled Subtitle Overlay */}
                <div className={`absolute inset-x-6 text-center pointer-events-none transition-all duration-200 ${
                  style.alignment === 'bottom' ? 'bottom-8' : style.alignment === 'top' ? 'top-8' : 'top-1/2 -translate-y-1/2'
                }`}>
                  <span
                    style={{
                      color: style.primaryColor,
                      fontSize: `${style.fontSize}px`,
                      fontWeight: 800,
                      textShadow: style.hasShadow 
                        ? '3px 3px 6px #000000, -2px -2px 4px #000000, 2px -2px 4px #000000, -2px 2px 4px #000000' 
                        : '1px 1px 2px #000000',
                      letterSpacing: '0.5px'
                    }}
                    className="inline-block px-4 py-1.5 rounded-lg bg-black/40 backdrop-blur-sm"
                  >
                    {srtText.split('\n')[2] || 'এআই সাবটাইটেল প্রিভিউ'}
                  </span>
                </div>
              </div>
            ) : activeTab === 'python' ? (
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 overflow-x-auto">
                <pre className="font-mono text-xs text-cyan-300 leading-relaxed whitespace-pre">
                  {generatedPythonCode}
                </pre>
              </div>
            ) : (
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 overflow-x-auto">
                <pre className="font-mono text-xs text-emerald-400 leading-relaxed whitespace-pre">
                  {generatedBashCommand}
                </pre>
              </div>
            )}

            {/* Info Footer */}
            <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                {isBn ? 'রেন্ডারিং স্পিড: জিরো কোয়ালিটি লস (VeryFast Preset)' : 'FFmpeg Preset: veryfast with zero quality loss'}
              </span>
              <span className="font-mono text-[11px] text-cyan-400">libx264 + aac</span>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
