import React, { useState, useEffect, useMemo } from 'react';
import { 
  Play, 
  Pause, 
  Search, 
  ExternalLink, 
  Maximize2, 
  Minimize2, 
  Sparkles, 
  Music, 
  Video, 
  Film, 
  Smartphone, 
  Tv, 
  X,
  Youtube,
  Radio,
  Clock,
  ListMusic,
  Plus,
  Check,
  Share2,
  Lock,
  Volume2,
  Moon,
  Sun,
  Loader2,
  Layers,
  ChevronRight,
  Headphones,
  CheckCircle2
} from 'lucide-react';
import { Language, YouTubeUploadedVideo, YouTubeTrack } from '../types';
import { useMusicPlayer } from '../context/MusicPlayerContext';
import { useToast } from '../context/ToastContext';

interface YouTubeInAppPlayerProps {
  lang: Language;
  onNavigateTab?: (tab: any) => void;
  initialVideoId?: string;
  channelVideos?: YouTubeUploadedVideo[];
}

const PRESET_QUERIES = [
  { id: 'romantic_bangla', labelBn: '💖 বাংলা রোমান্টিক গান', labelEn: '💖 Bangla Romantic', query: 'Bangla romantic songs' },
  { id: 'lofi_chill', labelBn: '🎧 লো-ফাই ও স্লিপ মিউজিক', labelEn: '🎧 Lofi & Sleep Chill', query: 'lofi chill beats study sleep' },
  { id: 'arijit_singh', labelBn: '🌟 অরিজিৎ সিং সেরা গান', labelEn: '🌟 Arijit Singh Hits', query: 'Arijit Singh Bengali songs' },
  { id: 'coke_studio', labelBn: '☕ কোক স্টুডিও বাংলা', labelEn: '☕ Coke Studio Bangla', query: 'Coke Studio Bangla songs' },
  { id: 'band_rock', labelBn: '🎸 বাংলা ব্যান্ড ও রক', labelEn: '🎸 Bangla Rock & Band', query: 'Bangla band songs' },
  { id: 'rabindra', labelBn: '🌸 রবীন্দ্র সংগীত কালেকশন', labelEn: '🌸 Rabindra Sangeet', query: 'Rabindra Sangeet top songs' },
  { id: 'bappa', labelBn: '🎵 বাপ্পা মজুমদার ও হাবিব', labelEn: '🎵 Bappa Mazumder & Habib', query: 'Bappa Mazumder Habib Wahid songs' },
  { id: 'bollywood', labelBn: '🎬 বলিউড মেলোডি', labelEn: '🎬 Bollywood Melodies', query: 'Bollywood hits songs' },
];

export const YouTubeInAppPlayer: React.FC<YouTubeInAppPlayerProps> = ({
  lang,
  onNavigateTab,
  initialVideoId = 'fJ9rUzIMcZQ',
  channelVideos = []
}) => {
  const isBn = lang === 'bn';
  const { notifySuccess, notifyInfo } = useToast();
  const {
    currentTrack,
    isPlaying,
    playMode,
    isWakeLockActive,
    playTrack,
    togglePlay,
    setPlayMode,
    addToQueue,
    toggleWakeLock,
    openFullModal,
    sleepTimerMinutes,
    setSleepTimer
  } = useMusicPlayer();

  const [searchInput, setSearchInput] = useState<string>('Bangla romantic songs');
  const [activeQuery, setActiveQuery] = useState<string>('Bangla romantic songs');
  const [searchResults, setSearchResults] = useState<YouTubeTrack[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [addedTrackId, setAddedTrackId] = useState<string | null>(null);
  const [activeVideoId, setActiveVideoId] = useState<string>(initialVideoId);
  const [showSleepMenu, setShowSleepMenu] = useState<boolean>(false);

  // Search YouTube API function
  const executeSearch = async (queryToSearch: string) => {
    const q = queryToSearch.trim();
    if (!q) return;

    setIsSearching(true);
    setActiveQuery(q);

    // Direct YouTube URL or 11-char ID check
    const ytIdMatch = q.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|shorts\/))([\w-]{11})/) || (q.length === 11 && !q.includes(' ') ? [null, q] : null);
    if (ytIdMatch && ytIdMatch[1]) {
      const directId = ytIdMatch[1];
      const directTrack: YouTubeTrack = {
        id: directId,
        title: `YouTube Video (${directId})`,
        channel: 'YouTube Video',
        duration: 'Playing',
        thumbnail: `https://i.ytimg.com/vi/${directId}/hqdefault.jpg`
      };
      playTrack(directTrack, playMode);
      setActiveVideoId(directId);
      setIsSearching(false);
      return;
    }

    try {
      const res = await fetch(`/api/youtube/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.results) && data.results.length > 0) {
        setSearchResults(data.results);
      }
    } catch (err) {
      console.warn('YouTube search client notice:', err);
    } finally {
      setIsSearching(false);
    }
  };

  // Perform initial search on load
  useEffect(() => {
    executeSearch('Bangla romantic songs');
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeSearch(searchInput);
  };

  const handleSelectPreset = (preset: typeof PRESET_QUERIES[0]) => {
    setSearchInput(preset.query);
    executeSearch(preset.query);
  };

  const handlePlaySong = (track: YouTubeTrack, mode: 'video' | 'audio') => {
    setActiveVideoId(track.id);
    playTrack(track, mode, searchResults);
    notifySuccess(
      mode === 'audio' ? 'Audio & Screen-Off Mode 🎧' : 'Playing Video 🎬',
      `"${track.title.slice(0, 45)}..." ${mode === 'audio' ? 'keeps playing with screen off' : 'is playing in HD'}`,
      mode === 'audio' ? 'অডিও ও ব্যাকগ্রাউন্ড মোড 🎧' : 'ভিডিও প্লে হচ্ছে 🎬',
      `"${track.title.slice(0, 40)}..." ${mode === 'audio' ? 'ডিসপ্লে বন্ধ করলেও চলবে' : 'প্লে হচ্ছে'}`
    );
  };

  const handleAddToQueue = (track: YouTubeTrack) => {
    addToQueue(track);
    setAddedTrackId(track.id);
    notifyInfo('Added to Queue', `"${track.title.slice(0, 35)}..." added to up next`, 'কিউতে যুক্ত হয়েছে', `"${track.title.slice(0, 30)}..." তালিকায় যোগ হয়েছে।`);
    setTimeout(() => setAddedTrackId(null), 2000);
  };

  const activeTrackObj = currentTrack || {
    id: activeVideoId,
    title: 'Lofi Girl – Synthwave Chill Radio & Beats to Relax',
    channel: 'Lofi Girl',
    duration: 'LIVE',
    thumbnail: `https://i.ytimg.com/vi/${activeVideoId}/hqdefault.jpg`
  };

  const embedUrl = `https://www.youtube.com/embed/${activeTrackObj.id}?autoplay=1&playsinline=1&controls=1&rel=0`;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Search Header Banner */}
      <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 p-5 sm:p-7 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-600/20 text-red-400 border border-red-500/30 flex items-center gap-1.5">
                  <Youtube className="w-3.5 h-3.5 text-red-500" />
                  {isBn ? 'ইউটিউব সার্চ ও প্লেয়ার' : 'YouTube Song Search & Player'}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <Lock className="w-3 h-3" />
                  {isBn ? 'ডিসপ্লে বন্ধেও অবিরাম চলবে' : 'Screen-Off Audio Ready'}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                {isBn ? 'যে কোনো গান সার্চ করে ভিডিও বা ব্যাকগ্রাউন্ড অডিও শুনুন' : 'Search Any YouTube Song & Stream Background Audio'}
              </h1>
            </div>

            {/* Mode Switcher Pill */}
            <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-950 border border-slate-800 self-start md:self-auto">
              <button
                onClick={() => setPlayMode('audio')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  playMode === 'audio'
                    ? 'bg-gradient-to-r from-cyan-600 to-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Headphones className="w-3.5 h-3.5 text-cyan-300" />
                <span>{isBn ? 'অডিও মোড (ডিসপ্লে অফ)' : 'Audio & Screen-Off'}</span>
              </button>
              <button
                onClick={() => setPlayMode('video')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  playMode === 'video'
                    ? 'bg-red-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Video className="w-3.5 h-3.5" />
                <span>{isBn ? 'ভিডিও মোড' : 'Video Mode'}</span>
              </button>
            </div>
          </div>

          {/* Search Input Box */}
          <form onSubmit={handleSearchSubmit} className="relative flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder={isBn ? 'ইউটিউবের যেকোনো গান, শিল্পী বা মিউজিক ভিডিও সার্চ করুন (যেমন: Arijit Singh, বাপ্পা মজুমদার)...' : 'Search any YouTube song, artist or video...'}
                className="w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-950/90 border border-slate-700/80 text-slate-100 placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-cyan-500 shadow-inner"
              />
            </div>
            <button
              type="submit"
              disabled={isSearching}
              className="px-5 py-3 rounded-2xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-cyan-600/30 transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              <span>{isBn ? 'খুঁজুন' : 'Search'}</span>
            </button>
          </form>

          {/* Quick Preset Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar pt-1">
            {PRESET_QUERIES.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleSelectPreset(preset)}
                className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer border ${
                  activeQuery === preset.query
                    ? 'bg-cyan-950/80 text-cyan-300 border-cyan-700/80 shadow-sm'
                    : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                {isBn ? preset.labelBn : preset.labelEn}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Playing Station: Video Mode or Audio & Screen-Off Mode */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Active Player Display (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="rounded-3xl bg-slate-900 border border-slate-800 overflow-hidden shadow-2xl p-4 sm:p-5 space-y-4">
            
            {/* Player Viewport */}
            {playMode === 'video' ? (
              /* Video Embed Player */
              <div className="relative aspect-video rounded-2xl overflow-hidden bg-black shadow-inner border border-slate-800">
                <iframe
                  src={embedUrl}
                  title={activeTrackObj.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className="w-full h-full"
                />
              </div>
            ) : (
              /* Audio & Screen-Off Mode View */
              <div className="relative rounded-2xl bg-gradient-to-b from-slate-950 to-slate-900 border border-slate-800 p-6 sm:p-8 flex flex-col items-center justify-center text-center space-y-5">
                {/* Vinyl Spin Artwork */}
                <div className="relative">
                  <div className={`w-40 h-40 sm:w-48 sm:h-48 rounded-full p-2 bg-gradient-to-tr from-cyan-500 via-indigo-600 to-pink-500 shadow-2xl transition duration-700 ${isPlaying ? 'ring-4 ring-cyan-500/30' : ''}`}>
                    <div className="w-full h-full rounded-full overflow-hidden bg-slate-950 relative border-4 border-slate-900">
                      <img 
                        src={activeTrackObj.thumbnail} 
                        alt={activeTrackObj.title}
                        className={`w-full h-full object-cover ${isPlaying ? 'animate-spin-slow' : 'grayscale'}`}
                        style={{ animationDuration: '16s' }}
                      />
                      <div className="absolute inset-0 m-auto w-8 h-8 rounded-full bg-slate-900 border-2 border-slate-700 flex items-center justify-center">
                        <div className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Song Details */}
                <div className="space-y-1 max-w-md">
                  <h3 className="text-base sm:text-lg font-bold text-white line-clamp-2">
                    {activeTrackObj.title}
                  </h3>
                  <p className="text-xs text-slate-400 font-medium">
                    {activeTrackObj.channel}
                  </p>
                </div>

                {/* Equalizer Visualizer */}
                <div className="flex items-end justify-center gap-1 h-7">
                  {[10, 20, 14, 26, 18, 28, 16, 22, 12, 24, 18, 14].map((h, i) => (
                    <span 
                      key={i} 
                      className={`w-1 rounded-full transition-all duration-300 ${
                        isPlaying 
                          ? 'bg-gradient-to-t from-cyan-400 to-indigo-400 animate-pulse' 
                          : 'bg-slate-700 h-2'
                      }`}
                      style={{ 
                        height: isPlaying ? `${h}px` : '4px',
                        animationDelay: `${i * 90}ms`
                      }}
                    />
                  ))}
                </div>

                {/* Lock Screen Background Notification */}
                <div className="p-3.5 rounded-2xl bg-slate-950/90 border border-emerald-500/30 w-full max-w-md text-left flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <div className="text-[11px] text-slate-300 space-y-0.5">
                    <p className="font-bold text-emerald-300">
                      {isBn ? 'ডিসপ্লে বন্ধেও গান অবিরাম চলবে' : 'Screen-Off Background Playback Enabled'}
                    </p>
                    <p className="text-slate-400 leading-relaxed">
                      {isBn
                        ? 'আপনার মোবাইল বা পিসির স্ক্রিন লক অথবা বন্ধ করলেও গানটি ব্যাকগ্রাউন্ডে চলতে থাকবে। লক স্ক্রিন বা নোটিফিকেশন বার থেকে পজ ও নেক্সট গান কন্ট্রোল করতে পারবেন।'
                        : 'Audio continues seamlessly when screen is turned off or locked. Control playback directly from the lock screen.'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Player Control Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePlaySong(activeTrackObj, playMode === 'video' ? 'audio' : 'video')}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition cursor-pointer flex items-center gap-1.5"
                >
                  {playMode === 'video' ? (
                    <>
                      <Headphones className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{isBn ? 'অডিও মোডে শুনুন (ডিসপ্লে বন্ধেও চলবে)' : 'Switch to Screen-Off Audio'}</span>
                    </>
                  ) : (
                    <>
                      <Video className="w-3.5 h-3.5 text-red-400" />
                      <span>{isBn ? 'ভিডিও মোডে দেখুন' : 'Switch to Full Video'}</span>
                    </>
                  )}
                </button>

                <button
                  onClick={toggleWakeLock}
                  title={isWakeLockActive ? (isBn ? 'স্ক্রিন স্লিপ চালু করুন' : 'Screen WakeLock Off') : (isBn ? 'স্ক্রিন স্লিপ বন্ধ রাখুন (ডিসপ্লে চালু)' : 'Keep Screen Awake')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                    isWakeLockActive 
                      ? 'bg-amber-950/60 text-amber-300 border-amber-600' 
                      : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                  }`}
                >
                  {isWakeLockActive ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5" />}
                  <span>{isWakeLockActive ? (isBn ? 'স্ক্রিন অন' : 'Awake') : (isBn ? 'স্লিপ বন্ধ রাখুন' : 'WakeLock')}</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={openFullModal}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition cursor-pointer"
                  title={isBn ? 'বড় প্লেয়ার খুলুন' : 'Expand Full Player'}
                >
                  <Maximize2 className="w-4 h-4" />
                </button>

                <a
                  href={`https://www.youtube.com/watch?v=${activeTrackObj.id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 transition cursor-pointer"
                  title={isBn ? 'ইউটিউবে দেখুন' : 'Open in YouTube'}
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>

          </div>
        </div>

        {/* Right Column: Search Results List (5 Cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                {isBn ? `সার্চ রেজাল্ট (${searchResults.length})` : `YouTube Songs (${searchResults.length})`}
              </h3>
            </div>
            <span className="text-[11px] text-slate-400 truncate max-w-[150px]">
              {activeQuery}
            </span>
          </div>

          {isSearching ? (
            <div className="py-20 text-center space-y-3">
              <Loader2 className="w-8 h-8 text-cyan-400 animate-spin mx-auto" />
              <p className="text-xs text-slate-400 font-medium">
                {isBn ? 'ইউটিউব থেকে গান খোঁজা হচ্ছে...' : 'Searching YouTube for songs...'}
              </p>
            </div>
          ) : searchResults.length === 0 ? (
            <div className="py-16 text-center text-slate-500 rounded-2xl bg-slate-900/60 border border-slate-800 p-6 space-y-2">
              <Music className="w-8 h-8 mx-auto text-slate-600" />
              <p className="text-xs">
                {isBn ? 'কোনো গান পাওয়া যায়নি। অন্য কিছু সার্চ করুন।' : 'No songs found. Try a different search query.'}
              </p>
            </div>
          ) : (
            <div className="space-y-2.5 max-h-[580px] overflow-y-auto pr-1">
              {searchResults.map((song) => {
                const isSelected = activeTrackObj.id === song.id;
                const isThisPlaying = isSelected && isPlaying;
                const isAdded = addedTrackId === song.id;

                return (
                  <div
                    key={song.id}
                    className={`p-3 rounded-2xl border transition flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 group ${
                      isSelected
                        ? 'bg-gradient-to-r from-cyan-950/40 via-indigo-950/30 to-slate-900 border-cyan-500/60 shadow-lg'
                        : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {/* Thumbnail & Meta */}
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="relative w-16 h-12 rounded-xl overflow-hidden bg-slate-950 flex-shrink-0 shadow-md">
                        <img src={song.thumbnail} alt={song.title} className="w-full h-full object-cover" />
                        <span className="absolute bottom-1 right-1 px-1 py-0.2 rounded bg-black/80 font-mono text-[9px] text-white">
                          {song.duration}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-xs font-bold text-slate-100 line-clamp-2 leading-tight group-hover:text-cyan-300 transition">
                          {song.title}
                        </h4>
                        <p className="text-[10px] text-slate-400 truncate mt-0.5">
                          {song.channel} {song.views ? `• ${song.views}` : ''}
                        </p>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-1.5 self-end sm:self-auto flex-shrink-0">
                      {/* Audio Button (Screen-Off background mode) */}
                      <button
                        onClick={() => handlePlaySong(song, 'audio')}
                        title={isBn ? 'অডিও শুনুন (ডিসপ্লে বন্ধেও চলবে)' : 'Play Audio (Screen-Off Mode)'}
                        className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer border ${
                          isThisPlaying && playMode === 'audio'
                            ? 'bg-cyan-600 text-white border-cyan-500 shadow-sm'
                            : 'bg-slate-800 text-cyan-300 hover:bg-slate-700 border-slate-700'
                        }`}
                      >
                        <Headphones className="w-3.5 h-3.5" />
                        <span>{isBn ? 'অডিও' : 'Audio'}</span>
                      </button>

                      {/* Video Button */}
                      <button
                        onClick={() => handlePlaySong(song, 'video')}
                        title={isBn ? 'ভিডিও মোডে দেখুন' : 'Watch Video'}
                        className={`p-1.5 rounded-xl text-xs font-bold transition cursor-pointer border ${
                          isThisPlaying && playMode === 'video'
                            ? 'bg-red-600 text-white border-red-500'
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border-slate-700'
                        }`}
                      >
                        <Video className="w-3.5 h-3.5" />
                      </button>

                      {/* Add to Queue */}
                      <button
                        onClick={() => handleAddToQueue(song)}
                        title={isBn ? 'কিউতে যোগ করুন' : 'Add to Queue'}
                        className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 border border-slate-700 transition cursor-pointer"
                      >
                        {isAdded ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Plus className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
