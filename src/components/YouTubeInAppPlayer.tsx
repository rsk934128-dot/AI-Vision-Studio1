import React, { useState, useEffect, useMemo } from 'react';
import { 
  Play, 
  Pause, 
  Search, 
  ExternalLink, 
  Maximize2, 
  Minimize2, 
  Sparkles, 
  Subtitles, 
  SearchCode, 
  Share2, 
  Check, 
  Copy, 
  Layers, 
  TrendingUp, 
  Music, 
  Film, 
  Smartphone, 
  Tv, 
  X,
  Youtube,
  Radio,
  Bookmark,
  ChevronRight
} from 'lucide-react';
import { Language, YouTubeUploadedVideo } from '../types';

interface YouTubeInAppPlayerProps {
  lang: Language;
  onNavigateTab?: (tab: any) => void;
  initialVideoId?: string;
  channelVideos?: YouTubeUploadedVideo[];
}

interface CuratedVideo {
  id: string;
  titleBn: string;
  titleEn: string;
  channel: string;
  category: 'music' | 'ai' | 'shorts' | 'cinematic';
  categoryLabelBn: string;
  categoryLabelEn: string;
  thumbnail: string;
  duration: string;
  views: string;
}

const CURATED_VIDEOS: CuratedVideo[] = [
  {
    id: 'fJ9rUzIMcZQ',
    titleBn: 'কুইন - বোহেমিয়ান র‍্যাপসোডি (অফিসিয়াল ভিডিও)',
    titleEn: 'Queen – Bohemian Rhapsody (Official Video Remastered)',
    channel: 'Queen Official',
    category: 'music',
    categoryLabelBn: 'মিউজিক ও গান',
    categoryLabelEn: 'Music & Songs',
    thumbnail: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80',
    duration: '05:55',
    views: '1.7B'
  },
  {
    id: 'aircAruvnKk',
    titleBn: 'লরেন – এআই ও সিন্থেটিক মিউজিক বিট (লো-ফাই)',
    titleEn: 'Lofi Girl – Synthwave Chill Radio & Beats to Relax',
    channel: 'Lofi Girl',
    category: 'music',
    categoryLabelBn: 'মিউজিক ও গান',
    categoryLabelEn: 'Music & Songs',
    thumbnail: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=600&auto=format&fit=crop&q=80',
    duration: 'LIVE',
    views: '85M'
  },
  {
    id: 'ScMzIvxBSi4',
    titleBn: 'সোরা ও জেনারেটিভ এআই ভিডিওর ভবিষ্যৎ বিশ্লেষণ',
    titleEn: 'OpenAI Sora & Next-Gen Generative AI Video Breakdown',
    channel: 'AI Technology Hub',
    category: 'ai',
    categoryLabelBn: 'এআই ও প্রযুক্তি',
    categoryLabelEn: 'AI & Tutorials',
    thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80',
    duration: '10:24',
    views: '2.4M'
  },
  {
    id: 'dQw4w9WgXcQ',
    titleBn: 'রিক অ্যাস্টলি - নেভার গনা গিভ ইউ আপ (ক্লাসিক্যাল রিমাষ্টার্ড)',
    titleEn: 'Rick Astley – Never Gonna Give You Up (Official Music Video)',
    channel: 'Rick Astley',
    category: 'music',
    categoryLabelBn: 'মিউজিক ও গান',
    categoryLabelEn: 'Music & Songs',
    thumbnail: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80',
    duration: '03:32',
    views: '1.5B'
  },
  {
    id: 'LXb3EKWsInQ',
    titleBn: '৪কে কস্তা রিকা সিনেমাটিক নেচার ও বন্যপ্রাণী আল্ট্রা-এইচডি',
    titleEn: 'Costa Rica 4K Ultra HD 60fps – Cinematic Nature & Wildlife',
    channel: 'Nature Relaxation',
    category: 'cinematic',
    categoryLabelBn: 'সিনেমাটিক ৪কে',
    categoryLabelEn: 'Cinematic 4K',
    thumbnail: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=600&auto=format&fit=crop&q=80',
    duration: '05:08',
    views: '42M'
  },
  {
    id: 'kJQP7kiw5Fk',
    titleBn: 'লুইস ফনসি - দেসপাসিতো (বিশ্বসেরা মিউজিক ভিডিও)',
    titleEn: 'Luis Fonsi – Despacito ft. Daddy Yankee',
    channel: 'Luis Fonsi',
    category: 'music',
    categoryLabelBn: 'মিউজিক ও গান',
    categoryLabelEn: 'Music & Songs',
    thumbnail: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600&auto=format&fit=crop&q=80',
    duration: '04:41',
    views: '8.4B'
  },
  {
    id: 'ysz5S6PUM-U',
    titleBn: 'ইউটিউব শর্টস ট্রেন্ডিং ভিডিও ফরম্যাট (ভার্টিকাল ৯:১৬)',
    titleEn: 'Trending YouTube Shorts AI Visual Compilation (9:16)',
    channel: 'Shorts Studio',
    category: 'shorts',
    categoryLabelBn: 'শর্টস ভিডিও',
    categoryLabelEn: 'Shorts (9:16)',
    thumbnail: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=80',
    duration: '00:58',
    views: '18M'
  }
];

export const YouTubeInAppPlayer: React.FC<YouTubeInAppPlayerProps> = ({
  lang,
  onNavigateTab,
  initialVideoId = 'aircAruvnKk',
  channelVideos = []
}) => {
  const isBn = lang === 'bn';

  const [activeVideoId, setActiveVideoId] = useState<string>(initialVideoId);
  const [urlInput, setUrlInput] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isTheaterMode, setIsTheaterMode] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isMiniPlayer, setIsMiniPlayer] = useState<boolean>(false);

  // When initialVideoId changes externally
  useEffect(() => {
    if (initialVideoId) {
      setActiveVideoId(initialVideoId);
    }
  }, [initialVideoId]);

  // Extract YouTube ID helper function
  const extractYouTubeId = (urlOrId: string): string | null => {
    const trimmed = urlOrId.trim();
    if (!trimmed) return null;

    // Direct ID (11 chars typically)
    if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
      return trimmed;
    }

    // Handles:
    // youtube.com/watch?v=ID
    // youtu.be/ID
    // youtube.com/embed/ID
    // youtube.com/shorts/ID
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|shorts\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = trimmed.match(regExp);

    if (match && match[2].length === 11) {
      return match[2];
    }

    return null;
  };

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const id = extractYouTubeId(urlInput);
    if (id) {
      setActiveVideoId(id);
      setUrlInput('');
    }
  };

  const currentVideoObj = useMemo(() => {
    const foundCurated = CURATED_VIDEOS.find((v) => v.id === activeVideoId);
    if (foundCurated) {
      return {
        id: foundCurated.id,
        title: isBn ? foundCurated.titleBn : foundCurated.titleEn,
        channel: foundCurated.channel,
        views: foundCurated.views
      };
    }

    const foundChannel = channelVideos.find((v) => v.id === activeVideoId);
    if (foundChannel) {
      return {
        id: foundChannel.id,
        title: foundChannel.title,
        channel: 'Your Channel',
        views: foundChannel.viewCount || 'Channel Video'
      };
    }

    return {
      id: activeVideoId,
      title: 'YouTube Video (' + activeVideoId + ')',
      channel: 'YouTube Creator',
      views: 'Online'
    };
  }, [activeVideoId, isBn, channelVideos]);

  const filteredVideos = useMemo(() => {
    return CURATED_VIDEOS.filter((v) => {
      const matchCat = selectedCategory === 'all' || v.category === selectedCategory;
      const q = searchQuery.toLowerCase();
      const matchQuery = !q || v.titleBn.toLowerCase().includes(q) || v.titleEn.toLowerCase().includes(q) || v.channel.toLowerCase().includes(q);
      return matchCat && matchQuery;
    });
  }, [selectedCategory, searchQuery]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`https://www.youtube.com/watch?v=${activeVideoId}`);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Search & URL Input Bar */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 p-4 sm:p-5 shadow-xl">
        <form onSubmit={handleUrlSubmit} className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-red-500">
              <Youtube className="w-5 h-5" />
            </div>
            <input
              type="text"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder={
                isBn
                  ? 'যেকোনো ইউটিউব লিংক বা আইডি পেস্ট করুন (যেমন: https://www.youtube.com/watch?v=...)'
                  : 'Paste any YouTube URL or Video ID (e.g., https://youtu.be/...)'
              }
              className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
            />
          </div>

          <button
            type="submit"
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-red-600/25 flex items-center justify-center gap-2 transition cursor-pointer flex-shrink-0"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>{isBn ? 'ভিডিও চালান' : 'Play Video'}</span>
          </button>
        </form>

        {/* Quick Suggestion Pills */}
        <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-slate-800/80 text-xs text-slate-400">
          <span className="font-semibold text-slate-300">{isBn ? 'জনপ্রিয়:' : 'Quick Try:'}</span>
          {[
            { label: 'Lofi Beats', id: 'aircAruvnKk' },
            { label: 'Queen Bohemian', id: 'fJ9rUzIMcZQ' },
            { label: 'Sora AI Video', id: 'ScMzIvxBSi4' },
            { label: '4K Costa Rica', id: 'LXb3EKWsInQ' }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveVideoId(item.id)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border transition cursor-pointer ${
                activeVideoId === item.id
                  ? 'bg-red-950/80 border-red-500/80 text-red-200'
                  : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Theater & Video Player Grid */}
      <div className={`grid gap-6 transition-all duration-300 ${isTheaterMode ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-3'}`}>
        
        {/* Left Column: The Embedded YouTube Player */}
        <div className={isTheaterMode ? 'w-full' : 'lg:col-span-2'}>
          <div className="rounded-2xl bg-black border border-slate-800 overflow-hidden shadow-2xl relative">
            
            {/* The 16:9 Iframe Container */}
            <div className="relative aspect-video w-full bg-black">
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${activeVideoId}?autoplay=1&rel=0&modestbranding=1&enablejsapi=1`}
                title={currentVideoObj.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="absolute inset-0 w-full h-full border-0"
              />
            </div>

            {/* In-App Player Control Ribbon & Meta */}
            <div className="p-4 sm:p-5 bg-slate-900/95 border-t border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full bg-red-600/20 text-red-400 border border-red-500/30 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                    <Radio className="w-2.5 h-2.5 animate-pulse text-red-400" />
                    Now Playing
                  </span>
                  <span className="text-xs text-slate-400 font-medium">
                    {currentVideoObj.channel}
                  </span>
                </div>
                <h2 className="text-base sm:text-lg font-bold text-white mt-1 line-clamp-1">
                  {currentVideoObj.title}
                </h2>
              </div>

              {/* Action Buttons: Theater mode, Copy link, External link */}
              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  onClick={() => setIsTheaterMode(!isTheaterMode)}
                  title={isTheaterMode ? 'Standard View' : 'Theater Mode'}
                  className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition cursor-pointer"
                >
                  {isTheaterMode ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>

                <button
                  onClick={handleCopyLink}
                  title={isBn ? 'ইউটিউব লিংক কপি করুন' : 'Copy YouTube URL'}
                  className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition cursor-pointer"
                >
                  {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>

                <a
                  href={`https://www.youtube.com/watch?v=${activeVideoId}`}
                  target="_blank"
                  rel="noreferrer"
                  title={isBn ? 'ইউটিউবে ওপেন করুন' : 'Open on YouTube'}
                  className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* AI Integration Action Bar for the Playing Video */}
            <div className="px-4 py-3 bg-slate-950 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
              <span className="text-slate-400 font-medium flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                {isBn ? 'এই ভিডিও নিয়ে এআই অ্যাকশন:' : 'AI Studio Integrations:'}
              </span>

              <div className="flex items-center gap-2">
                {onNavigateTab && (
                  <>
                    <button
                      onClick={() => onNavigateTab('video-understanding')}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-950/80 hover:bg-cyan-900 text-cyan-300 border border-cyan-800/60 font-semibold transition cursor-pointer"
                    >
                      <SearchCode className="w-3.5 h-3.5" />
                      <span>{isBn ? 'Gemini 4 Argon দিয়ে বিশ্লেষণ' : 'Analyze with Gemini'}</span>
                    </button>

                    <button
                      onClick={() => onNavigateTab('subtitles')}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-950/80 hover:bg-indigo-900 text-indigo-300 border border-indigo-800/60 font-semibold transition cursor-pointer"
                    >
                      <Subtitles className="w-3.5 h-3.5" />
                      <span>{isBn ? 'সাবটাইটেল বানান' : 'Create Subtitles'}</span>
                    </button>

                    <button
                      onClick={() => onNavigateTab('photo-music-video')}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-pink-950/80 hover:bg-pink-900 text-pink-300 border border-pink-800/60 font-semibold transition cursor-pointer"
                    >
                      <Music className="w-3.5 h-3.5" />
                      <span>{isBn ? 'মিউজিক ভিডিও রিমেক' : 'Remake MV'}</span>
                    </button>
                  </>
                )}
              </div>
            </div>

          </div>
        </div>

        {/* Right Column: Playlist & Video Selector */}
        <div className="space-y-4">
          <div className="rounded-2xl bg-slate-900 border border-slate-800 p-4 shadow-xl space-y-4">
            
            {/* Header & Tabs */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-red-500" />
                <h3 className="font-bold text-white text-sm">
                  {isBn ? 'ভিডিও তালিকা ও রেকমেন্ডেশন' : 'Curated Playlists'}
                </h3>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">
                {filteredVideos.length} {isBn ? 'টি ভিডিও' : 'videos'}
              </span>
            </div>

            {/* Category Filter Chips */}
            <div className="flex flex-wrap gap-1.5">
              {[
                { id: 'all', labelBn: 'সকল', labelEn: 'All', icon: <Tv className="w-3 h-3" /> },
                { id: 'music', labelBn: 'গান ও মিউজিক', labelEn: 'Music', icon: <Music className="w-3 h-3 text-pink-400" /> },
                { id: 'ai', labelBn: 'এআই ও টেক', labelEn: 'AI & Tech', icon: <Sparkles className="w-3 h-3 text-cyan-400" /> },
                { id: 'shorts', labelBn: 'শর্টস (৯:১৬)', labelEn: 'Shorts', icon: <Smartphone className="w-3 h-3 text-amber-400" /> },
                { id: 'cinematic', labelBn: 'সিনেমাটিক ৪কে', labelEn: 'Cinematic', icon: <Film className="w-3 h-3 text-emerald-400" /> }
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold border transition cursor-pointer ${
                    selectedCategory === cat.id
                      ? 'bg-red-600 text-white border-red-500 shadow-md shadow-red-600/20'
                      : 'bg-slate-800/80 text-slate-400 hover:text-white border-slate-700/80'
                  }`}
                >
                  {cat.icon}
                  <span>{isBn ? cat.labelBn : cat.labelEn}</span>
                </button>
              ))}
            </div>

            {/* Search within playlist */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isBn ? 'তালিকায় সার্চ করুন...' : 'Filter videos...'}
                className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-red-500"
              />
            </div>

            {/* Video List */}
            <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
              
              {/* Channel Videos section if user has uploaded videos */}
              {channelVideos.length > 0 && (
                <div className="pb-2 border-b border-slate-800">
                  <div className="text-[11px] font-bold text-red-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Youtube className="w-3.5 h-3.5" />
                    <span>{isBn ? 'আপনার ইউটিউব চ্যানেলের ভিডিও' : 'From Your Channel'}</span>
                  </div>
                  <div className="space-y-1.5">
                    {channelVideos.map((vid) => {
                      const isPlaying = activeVideoId === vid.id;
                      return (
                        <div
                          key={vid.id}
                          onClick={() => setActiveVideoId(vid.id)}
                          className={`flex items-center gap-3 p-2 rounded-xl border cursor-pointer transition ${
                            isPlaying
                              ? 'bg-red-950/60 border-red-500 text-white shadow-md'
                              : 'bg-slate-950/40 border-slate-800/80 hover:bg-slate-800/60 text-slate-300'
                          }`}
                        >
                          <div className="relative w-16 h-10 rounded-lg overflow-hidden bg-slate-800 flex-shrink-0">
                            <img
                              src={vid.thumbnailUrl || 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=200&auto=format&fit=crop&q=80'}
                              alt={vid.title}
                              className="w-full h-full object-cover"
                            />
                            {isPlaying && (
                              <div className="absolute inset-0 bg-red-600/40 flex items-center justify-center">
                                <Play className="w-3 h-3 fill-white text-white" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-xs font-bold truncate">{vid.title}</h4>
                            <p className="text-[10px] text-slate-400 font-mono mt-0.5">Your Channel</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Curated list */}
              {filteredVideos.map((vid) => {
                const isPlaying = activeVideoId === vid.id;
                return (
                  <div
                    key={vid.id}
                    onClick={() => setActiveVideoId(vid.id)}
                    className={`flex items-center gap-3 p-2 rounded-xl border cursor-pointer transition ${
                      isPlaying
                        ? 'bg-red-950/70 border-red-500 text-white shadow-md shadow-red-900/20'
                        : 'bg-slate-950/40 border-slate-800/80 hover:bg-slate-800/60 text-slate-300 hover:text-white'
                    }`}
                  >
                    {/* Thumbnail */}
                    <div className="relative w-20 h-12 rounded-lg overflow-hidden bg-slate-800 flex-shrink-0">
                      <img
                        src={vid.thumbnail}
                        alt={isBn ? vid.titleBn : vid.titleEn}
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute bottom-1 right-1 bg-black/80 text-[9px] font-mono font-bold px-1 rounded text-white">
                        {vid.duration}
                      </span>
                      {isPlaying && (
                        <div className="absolute inset-0 bg-red-600/50 flex items-center justify-center">
                          <Play className="w-4 h-4 fill-white text-white animate-pulse" />
                        </div>
                      )}
                    </div>

                    {/* Metadata */}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold line-clamp-1">
                        {isBn ? vid.titleBn : vid.titleEn}
                      </h4>
                      <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
                        <span className="truncate max-w-[100px]">{vid.channel}</span>
                        <span className="font-mono text-cyan-400 font-semibold">{vid.views}</span>
                      </div>
                    </div>
                  </div>
                );
              })}

            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
