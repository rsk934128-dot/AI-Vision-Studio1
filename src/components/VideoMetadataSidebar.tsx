import React, { useState } from 'react';
import { 
  Cpu, 
  Clock, 
  Layers, 
  Eye, 
  Sparkles, 
  ChevronRight, 
  Play, 
  Tag, 
  Sliders, 
  CheckCircle2, 
  Camera, 
  Volume2, 
  Compass, 
  Maximize2,
  RefreshCw,
  Film
} from 'lucide-react';
import { VideoUnderstandingMetadata, Language, DetectedObject, SceneAnalysisItem } from '../types';

interface VideoMetadataSidebarProps {
  metadata: VideoUnderstandingMetadata | null;
  loading: boolean;
  lang: Language;
  currentTime: number;
  onSeek: (seconds: number) => void;
  onScanWithGeminiArgon: () => void;
  isOpen: boolean;
  onToggle: () => void;
  isUploaded?: boolean;
  fileSize?: string;
}

export const VideoMetadataSidebar: React.FC<VideoMetadataSidebarProps> = ({
  metadata,
  loading,
  lang,
  currentTime,
  onSeek,
  onScanWithGeminiArgon,
  isOpen,
  onToggle,
  isUploaded = false,
  fileSize
}) => {
  const isBn = lang === 'bn';
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'scenes' | 'objects' | 'specs'>('scenes');
  const [copiedJson, setCopiedJson] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const handleCopyJson = () => {
    if (!metadata) return;
    navigator.clipboard.writeText(JSON.stringify(metadata, null, 2));
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  const categories = [
    { id: 'all', labelBn: 'সকল', labelEn: 'All' },
    { id: 'Entity', labelBn: 'প্রাণী/চরিত্র', labelEn: 'Entity' },
    { id: 'Vehicle', labelBn: 'যানবাহন', labelEn: 'Vehicle' },
    { id: 'Environment', labelBn: 'পরিবেশ', labelEn: 'Environment' },
    { id: 'Technology', labelBn: 'প্রযুক্তি', labelEn: 'Technology' },
    { id: 'Nature', labelBn: 'প্রকৃতি', labelEn: 'Nature' },
  ];

  const filteredObjects = (metadata?.detectedObjects || []).filter((obj) => {
    const matchesCat = activeCategory === 'all' || obj.category === activeCategory;
    const matchesSearch = !searchQuery || 
      obj.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (obj.nameBn && obj.nameBn.includes(searchQuery));
    return matchesCat && matchesSearch;
  });

  const parseTimestampToSeconds = (ts: string): number => {
    const parts = ts.split(':').map(Number);
    if (parts.length === 2) {
      return parts[0] * 60 + parts[1];
    }
    return 0;
  };

  return (
    <div
      className={`transition-all duration-300 flex flex-col bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden ${
        isOpen ? 'w-full lg:w-96' : 'w-full lg:w-14'
      }`}
    >
      {/* Sidebar Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/80 backdrop-blur-sm">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400 shrink-0 shadow-lg shadow-purple-500/20">
            <Cpu className="w-4 h-4 animate-pulse" />
          </div>
          {isOpen && (
            <div className="truncate">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-extrabold text-white tracking-wide">
                  Gemini 4 Argon
                </span>
                <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-purple-950 text-purple-300 border border-purple-800 uppercase">
                  Metadata AI
                </span>
              </div>
              <p className="text-[10px] text-slate-400 truncate">
                {isBn ? 'কম্পিউটার ভিশন ও সিন অ্যানালাইসিস' : 'Computer Vision & Scene Analytics'}
              </p>
            </div>
          )}
        </div>

        <button
          onClick={onToggle}
          title={isOpen ? 'Collapse Sidebar' : 'Expand Sidebar'}
          className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition shrink-0"
        >
          <Sliders className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* When Collapsed on Large Screens */}
      {!isOpen && (
        <div className="hidden lg:flex flex-col items-center py-6 gap-6 text-slate-400">
          <button
            onClick={onToggle}
            className="p-2 rounded-xl hover:bg-slate-800 text-purple-400 hover:text-purple-300 transition"
            title="Expand Metadata Sidebar"
          >
            <Layers className="w-5 h-5" />
          </button>
          <div className="writing-mode-vertical text-[11px] font-bold tracking-widest text-slate-400 uppercase rotate-180">
            Gemini 4 Argon Metadata
          </div>
        </div>
      )}

      {/* Main Content when Open */}
      {isOpen && (
        <div className="flex-1 flex flex-col overflow-hidden">
          
          {/* Active Video File Info Bar */}
          <div className="px-3 py-2 bg-slate-950/70 border-b border-slate-800/80 flex items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-1.5 truncate">
              <div className={`w-2 h-2 rounded-full shrink-0 ${isUploaded ? 'bg-emerald-400 animate-pulse' : 'bg-cyan-400'}`} />
              <span className="text-[11px] font-bold text-slate-200 truncate" title={metadata?.videoTitle}>
                {metadata?.videoTitle || (isBn ? 'ভিডিও ফাইল' : 'Active Video')}
              </span>
              {isUploaded && (
                <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800 shrink-0">
                  {isBn ? 'আপলোডকৃত' : 'Uploaded'}
                </span>
              )}
            </div>

            <button
              onClick={handleCopyJson}
              className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[10px] text-slate-300 border border-slate-700 transition shrink-0 cursor-pointer"
              title="Copy Gemini 4 Argon Metadata JSON"
            >
              <CheckCircle2 className={`w-3 h-3 ${copiedJson ? 'text-emerald-400' : 'text-slate-400'}`} />
              <span>{copiedJson ? (isBn ? 'কপি হয়েছে' : 'Copied') : 'JSON'}</span>
            </button>
          </div>

          {/* Quick Rescan / Trigger Button */}
          <div className="p-3 bg-slate-950/40 border-b border-slate-800/60 flex items-center justify-between gap-2">
            <div className="flex items-center gap-1 text-[11px] text-slate-400">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              <span>{isBn ? 'আনুমানিক দৈর্ঘ্য:' : 'Est. Duration:'}</span>
              <strong className="text-white font-mono">{metadata?.estimatedLength || '00:15'}</strong>
            </div>

            <button
              onClick={onScanWithGeminiArgon}
              disabled={loading}
              className="px-2.5 py-1 rounded-lg bg-purple-950/80 hover:bg-purple-900 border border-purple-700/80 text-[10px] font-bold text-purple-200 flex items-center gap-1.5 transition disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin text-purple-300' : ''}`} />
              <span>{loading ? (isBn ? 'স্ক্যান হচ্ছে...' : 'Scanning...') : (isBn ? 'জেমিনি ৪ স্ক্যান' : 'Rescan Argon')}</span>
            </button>
          </div>

          {/* Sub Navigation Tabs */}
          <div className="grid grid-cols-3 border-b border-slate-800 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('scenes')}
              className={`py-2.5 text-center transition flex items-center justify-center gap-1.5 ${
                activeTab === 'scenes'
                  ? 'border-b-2 border-purple-500 text-purple-300 bg-purple-950/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Film className="w-3 h-3" />
              <span>{isBn ? 'দৃশ্যসমূহ' : 'Scenes'}</span>
              <span className="text-[10px] px-1 py-0.2 rounded-full bg-slate-800 text-slate-300">
                {metadata?.sceneAnalysis?.length || 3}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('objects')}
              className={`py-2.5 text-center transition flex items-center justify-center gap-1.5 ${
                activeTab === 'objects'
                  ? 'border-b-2 border-purple-500 text-purple-300 bg-purple-950/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Eye className="w-3 h-3" />
              <span>{isBn ? 'অবজেক্ট' : 'Objects'}</span>
              <span className="text-[10px] px-1 py-0.2 rounded-full bg-slate-800 text-slate-300">
                {metadata?.detectedObjects?.length || 6}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('specs')}
              className={`py-2.5 text-center transition flex items-center justify-center gap-1.5 ${
                activeTab === 'specs'
                  ? 'border-b-2 border-purple-500 text-purple-300 bg-purple-950/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sliders className="w-3 h-3" />
              <span>{isBn ? 'স্পেক্স' : 'Specs'}</span>
            </button>
          </div>

          {/* Tab 1: Scene-by-Scene Analysis */}
          {activeTab === 'scenes' && (
            <div className="flex-1 overflow-y-auto p-3 space-y-3 max-h-[560px]">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1">
                  <Film className="w-3 h-3 text-purple-400" />
                  {isBn ? 'দৃশ্যভিত্তিক গভীর বিশ্লেষণ' : 'Scene Timeline Breakdown'}
                </span>
                <span className="text-[10px] text-purple-400 font-mono">
                  Gemini 4 Argon
                </span>
              </div>

              {metadata?.sceneAnalysis?.map((scene: SceneAnalysisItem) => {
                const isCurrentScene =
                  currentTime >= scene.startSeconds && currentTime <= scene.endSeconds;

                return (
                  <div
                    key={scene.sceneNumber}
                    className={`p-3 rounded-xl border transition ${
                      isCurrentScene
                        ? 'bg-purple-950/40 border-purple-500/80 shadow-md shadow-purple-950/40 ring-1 ring-purple-500/30'
                        : 'bg-slate-950/70 border-slate-800/80 hover:border-slate-700'
                    }`}
                  >
                    {/* Scene header */}
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-1.5">
                        <span className="px-1.5 py-0.5 rounded bg-purple-900/60 border border-purple-700/60 text-[10px] font-bold text-purple-300">
                          Scene {scene.sceneNumber}
                        </span>
                        <span className="text-[11px] font-mono text-cyan-400 font-bold">
                          {scene.timeRange}
                        </span>
                      </div>

                      <button
                        onClick={() => onSeek(scene.startSeconds)}
                        className="px-2 py-0.5 rounded-lg bg-slate-800 hover:bg-purple-600 text-[10px] font-bold text-white flex items-center gap-1 transition"
                      >
                        <Play className="w-2.5 h-2.5 fill-current" />
                        <span>{isBn ? 'প্লে করুন' : 'Seek'}</span>
                      </button>
                    </div>

                    {/* Scene Title */}
                    <p className="text-xs font-bold text-white mb-1">
                      {isBn && scene.titleBn ? scene.titleBn : scene.title}
                    </p>

                    {/* Visual Description */}
                    <p className="text-[11px] text-slate-300 leading-relaxed mb-2">
                      {scene.visualDescription}
                    </p>

                    {/* Camera dynamics & Mood */}
                    <div className="grid grid-cols-2 gap-1.5 text-[10px] mb-2">
                      <div className="bg-slate-900 p-1.5 rounded border border-slate-800">
                        <span className="text-slate-400 flex items-center gap-1">
                          <Camera className="w-2.5 h-2.5 text-cyan-400" />
                          {isBn ? 'ক্যামেরা:' : 'Camera:'}
                        </span>
                        <p className="text-slate-200 font-medium truncate mt-0.5">
                          {scene.cameraMovement}
                        </p>
                      </div>

                      <div className="bg-slate-900 p-1.5 rounded border border-slate-800">
                        <span className="text-slate-400 flex items-center gap-1">
                          <Compass className="w-2.5 h-2.5 text-indigo-400" />
                          {isBn ? 'মেজাজ/মুড:' : 'Mood:'}
                        </span>
                        <p className="text-slate-200 font-medium truncate mt-0.5">
                          {scene.mood}
                        </p>
                      </div>
                    </div>

                    {/* Color Palette Swatches */}
                    {scene.colorPalette && scene.colorPalette.length > 0 && (
                      <div className="flex items-center gap-1.5 mt-1 pt-1.5 border-t border-slate-900">
                        <span className="text-[9px] text-slate-400">Palette:</span>
                        <div className="flex items-center gap-1">
                          {scene.colorPalette.map((color, cIdx) => (
                            <div
                              key={cIdx}
                              title={color}
                              style={{ backgroundColor: color }}
                              className="w-3.5 h-3.5 rounded-full border border-slate-700 shadow-sm"
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Tab 2: Detected Objects */}
          {activeTab === 'objects' && (
            <div className="flex-1 overflow-y-auto p-3 space-y-3 max-h-[560px]">
              {/* Category Filter Chips */}
              <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`px-2 py-1 rounded-lg text-[10px] font-semibold whitespace-nowrap transition cursor-pointer ${
                      activeCategory === cat.id
                        ? 'bg-purple-600 text-white'
                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                    }`}
                  >
                    {isBn ? cat.labelBn : cat.labelEn}
                  </button>
                ))}
              </div>

              {/* Object Quick Search */}
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={isBn ? 'শনাক্তকৃত অবজেক্ট খুঁজুন...' : 'Search detected objects...'}
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                />
              </div>

              {/* Objects List */}
              <div className="space-y-2">
                {filteredObjects.map((obj: DetectedObject) => (
                  <div
                    key={obj.id}
                    className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 transition"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 truncate">
                        <Tag className="w-3 h-3 text-cyan-400 shrink-0" />
                        <span className="text-xs font-bold text-white truncate">
                          {isBn && obj.nameBn ? obj.nameBn : obj.name}
                        </span>
                      </div>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-purple-300 border border-slate-700 font-mono">
                        {(obj.confidence * 100).toFixed(1)}%
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
                      <span className="text-slate-400">
                        Category: <strong className="text-slate-200">{obj.category}</strong>
                      </span>
                      <span>
                        Count: <strong className="text-cyan-400">{obj.count}x</strong>
                      </span>
                    </div>

                    {/* Timestamps Pills */}
                    <div className="flex items-center gap-1 mt-2 flex-wrap">
                      <span className="text-[9px] text-slate-500">Appears at:</span>
                      {obj.timestamps.map((ts, tsIdx) => (
                        <button
                          key={tsIdx}
                          onClick={() => onSeek(parseTimestampToSeconds(ts))}
                          className="px-1.5 py-0.5 rounded bg-slate-900 hover:bg-cyan-950 hover:text-cyan-300 text-slate-300 border border-slate-800 text-[10px] font-mono transition flex items-center gap-0.5"
                        >
                          <Play className="w-2 h-2 fill-current" />
                          <span>{ts}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 3: Estimated Video Length & Specs */}
          {activeTab === 'specs' && (
            <div className="flex-1 overflow-y-auto p-3 space-y-3 max-h-[560px]">
              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2.5">
                <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Sliders className="w-3 h-3 text-purple-400" />
                  {isBn ? 'ভিডিও কারিগরি বৈশিষ্ট্য (Technical Specs)' : 'Technical Specifications'}
                </span>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-slate-900 p-2 rounded-lg border border-slate-800/80">
                    <p className="text-[10px] text-slate-400">{isBn ? 'আনুমানিক দৈর্ঘ্য' : 'Estimated Length'}</p>
                    <p className="font-bold text-white font-mono mt-0.5">
                      {metadata?.estimatedLength || '00:15'} ({metadata?.durationSeconds || 15}s)
                    </p>
                  </div>

                  <div className="bg-slate-900 p-2 rounded-lg border border-slate-800/80">
                    <p className="text-[10px] text-slate-400">{isBn ? 'রেজোলিউশন' : 'Resolution'}</p>
                    <p className="font-bold text-cyan-400 font-mono mt-0.5">
                      {metadata?.resolution || '1080p Full HD'}
                    </p>
                  </div>

                  <div className="bg-slate-900 p-2 rounded-lg border border-slate-800/80">
                    <p className="text-[10px] text-slate-400">{isBn ? 'ফ্রেম রেট' : 'Frame Rate'}</p>
                    <p className="font-bold text-emerald-400 font-mono mt-0.5">
                      {metadata?.fps || 30} FPS
                    </p>
                  </div>

                  <div className="bg-slate-900 p-2 rounded-lg border border-slate-800/80">
                    <p className="text-[10px] text-slate-400">{isBn ? 'অ্যাসপেক্ট রেশিও' : 'Aspect Ratio'}</p>
                    <p className="font-bold text-indigo-400 font-mono mt-0.5">
                      {metadata?.aspectRatio || '16:9'}
                    </p>
                  </div>
                </div>

                <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800/80 text-[11px]">
                  <p className="text-slate-400">{isBn ? 'ভিডিও বিটরেট / কোডেক' : 'Video Bitrate & Codec'}</p>
                  <p className="text-white font-mono font-semibold mt-0.5">
                    {metadata?.bitrate || '14.8 Mbps H.264 / AVC'}
                  </p>
                </div>
              </div>

              {/* Audio Profile */}
              {metadata?.audioProfile && (
                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
                  <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Volume2 className="w-3 h-3 text-cyan-400" />
                    {isBn ? 'অডিও ও সাউন্ডট্র্যাক প্রোফাইল' : 'Audio Profile & Acoustics'}
                  </span>

                  <div className="space-y-1.5 text-[11px]">
                    <div className="bg-slate-900 p-2 rounded border border-slate-800">
                      <p className="text-slate-400 text-[10px]">Speech Clarity</p>
                      <p className="text-slate-200">{metadata.audioProfile.speechClarity}</p>
                    </div>
                    <div className="bg-slate-900 p-2 rounded border border-slate-800">
                      <p className="text-slate-400 text-[10px]">BGM Tempo</p>
                      <p className="text-purple-300 font-mono">{metadata.audioProfile.musicTempo}</p>
                    </div>
                    <div className="bg-slate-900 p-2 rounded border border-slate-800">
                      <p className="text-slate-400 text-[10px]">Ambient Sound</p>
                      <p className="text-slate-300">{metadata.audioProfile.ambientSound}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Footer info badge */}
          <div className="p-2.5 border-t border-slate-800 bg-slate-950/90 text-center">
            <span className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-purple-400" />
              <span>Extracted via Flagship Gemini 4 Argon Engine</span>
            </span>
          </div>

        </div>
      )}
    </div>
  );
};
