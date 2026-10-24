/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { StudioTab, Language, VideoJob } from './types';
import { Navbar } from './components/Navbar';
import { TextToVideo } from './components/TextToVideo';
import { PhotoMusicVideo } from './components/PhotoMusicVideo';
import { VideoUnderstanding } from './components/VideoUnderstanding';
import { AudioStudio } from './components/AudioStudio';
import { VideoToVideo } from './components/VideoToVideo';
import { SubtitleEngine } from './components/SubtitleEngine';
import { AdminDashboard } from './components/AdminDashboard';
import { ShurjoPayHub } from './components/ShurjoPayHub';
import { YouTubeStudio } from './components/YouTubeStudio';
import { AndroidGitHubBuilder } from './components/AndroidGitHubBuilder';
import { ProjectHistory } from './components/ProjectHistory';
import { saveJobToFirestore } from './services/firebase';
import { YouTubeAuthProvider } from './context/YouTubeAuthContext';
import { ToastProvider } from './context/ToastContext';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { Sparkles, Video, Search, Mic, Layers, Subtitles, ShieldCheck, Youtube, History } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<StudioTab>('photo-music-video');
  const [lang, setLang] = useState<Language>('bn');
  const [credits, setCredits] = useState<number>(120);
  const [sharedSrt, setSharedSrt] = useState<string>('');

  const isBn = lang === 'bn';

  const handleSendToSubtitles = (srt: string) => {
    setSharedSrt(srt);
    setActiveTab('subtitles');
  };

  const handleJobCreated = (job: VideoJob) => {
    setCredits((prev) => Math.max(0, prev - (job.creditsUsed || 10)));
    saveJobToFirestore(job);
  };

  return (
    <YouTubeAuthProvider>
      <ToastProvider lang={lang}>
        <SpeedInsights />
        <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
        {/* Top Navigation */}
        <Navbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          lang={lang}
          setLang={setLang}
          credits={credits}
        />

        {/* Main Content Container */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {activeTab === 'photo-music-video' && (
            <PhotoMusicVideo
              lang={lang}
            />
          )}

          {activeTab === 'text-to-video' && (
            <TextToVideo
              lang={lang}
              onJobCreated={handleJobCreated}
              presetSrt={sharedSrt}
              onNavigateTab={setActiveTab}
            />
          )}

          {activeTab === 'youtube-studio' && (
            <YouTubeStudio
              lang={lang}
              onNavigateTab={setActiveTab}
            />
          )}

          {activeTab === 'project-history' && (
            <ProjectHistory
              lang={lang}
              onNavigateTab={setActiveTab}
              onSendToSubtitles={handleSendToSubtitles}
            />
          )}

          {activeTab === 'video-understanding' && (
            <VideoUnderstanding lang={lang} />
          )}

          {activeTab === 'audio-transcribe' && (
            <AudioStudio
              lang={lang}
              onSendToSubtitles={handleSendToSubtitles}
            />
          )}

          {activeTab === 'video-to-video' && (
            <VideoToVideo lang={lang} />
          )}

          {activeTab === 'subtitles' && (
            <SubtitleEngine
              lang={lang}
              initialSrt={sharedSrt}
            />
          )}

          {activeTab === 'shurjopay-gmail' && (
            <ShurjoPayHub lang={lang} />
          )}

          {activeTab === 'android-builder' && (
            <AndroidGitHubBuilder lang={lang} />
          )}

          {activeTab === 'admin' && (
            <AdminDashboard lang={lang} />
          )}
        </main>

        {/* Studio Footer */}
        <footer className="border-t border-slate-800/80 bg-[#0b0f19] py-8 text-xs text-slate-400">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="font-bold text-white">AI Video Studio</span>
              <span className="text-slate-500">|</span>
              <span>{isBn ? 'ইউটিউব ও শর্টসের সম্পূর্ণ এআই ভিডিও প্রোডাকশন সল্যুশন' : 'Next-Generation AI Video Production Suite'}</span>
            </div>

            <div className="flex items-center gap-4 text-slate-400">
              <span className="flex items-center gap-1.5 text-red-400 font-semibold">
                <Youtube className="w-3.5 h-3.5" />
                YouTube OAuth 2.0
              </span>
              <span className="flex items-center gap-1.5 text-cyan-400 font-semibold">
                <Search className="w-3 h-3" />
                Gemini 4 Argon
              </span>
              <span className="flex items-center gap-1.5 text-purple-400 font-semibold">
                <Mic className="w-3 h-3" />
                Gemini 3.5 Transcribe
              </span>
            </div>
          </div>
        </footer>
      </div>
      </ToastProvider>
    </YouTubeAuthProvider>
  );
}
