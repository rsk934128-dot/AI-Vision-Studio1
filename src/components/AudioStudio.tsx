import React, { useState, useRef, useEffect } from 'react';
import { 
  Mic, 
  Square, 
  Play, 
  Pause, 
  RotateCcw, 
  Sparkles, 
  Copy, 
  Check, 
  Upload, 
  Volume2, 
  FileText, 
  Subtitles, 
  ArrowRight,
  AlertCircle,
  Radio
} from 'lucide-react';
import { Language } from '../types';

interface AudioStudioProps {
  lang: Language;
  onSendToSubtitles?: (srt: string, voiceoverText: string) => void;
}

export const AudioStudio: React.FC<AudioStudioProps> = ({ lang, onSendToSubtitles }) => {
  const isBn = lang === 'bn';

  // Recording State
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingTime, setRecordingTime] = useState<number>(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);

  // Transcription State
  const [isTranscribing, setIsTranscribing] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string>('');
  const [srtSubtitles, setSrtSubtitles] = useState<string>('');
  const [copiedTranscript, setCopiedTranscript] = useState<boolean>(false);
  const [copiedSrt, setCopiedSrt] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // TTS State
  const [ttsInput, setTtsInput] = useState<string>('Welcome to AI Video Studio. Create stunning YouTube videos with automated subtitles and voiceover.');
  const [selectedVoice, setSelectedVoice] = useState<string>('Kore');
  const [isGeneratingTts, setIsGeneratingTts] = useState<boolean>(false);
  const [ttsAudioUrl, setTtsAudioUrl] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<any>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Timer loop for mic recording
  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isRecording]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  // Start Mic Recording
  const startRecording = async () => {
    setErrorMsg(null);
    setAudioBlob(null);
    setAudioUrl(null);
    setRecordingTime(0);
    audioChunksRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const recordedBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(recordedBlob);
        setAudioUrl(URL.createObjectURL(recordedBlob));
        // Stop stream tracks
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(
        isBn 
          ? 'মাইক্রোফোন অ্যাক্সেস করতে সমস্যা হয়েছে। অনুগ্রহ করে ব্রাউজার পারমিশন চেক করুন।' 
          : 'Could not access microphone. Please check browser permissions.'
      );
    }
  };

  // Stop Mic Recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // Handle uploaded audio
  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('audio/')) {
      setErrorMsg(isBn ? 'অনুগ্রহ করে সঠিক অডিও ফাইল আপলোড করুন।' : 'Please upload an audio file.');
      return;
    }

    setAudioBlob(file);
    setAudioUrl(URL.createObjectURL(file));
    setErrorMsg(null);
  };

  // Transcribe with Gemini 3.5 Transcribe
  const handleTranscribe = async () => {
    if (!audioBlob) {
      setErrorMsg(isBn ? 'অনুগ্রহ করে প্রথমে মাইক দিয়ে রেকর্ড করুন বা অডিও আপলোড করুন।' : 'Please record or upload audio first.');
      return;
    }

    setIsTranscribing(true);
    setErrorMsg(null);

    try {
      // Convert Blob to base64
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      reader.onloadend = async () => {
        const base64Data = (reader.result as string).split(',')[1];
        const mimeType = audioBlob.type || 'audio/webm';

        const res = await fetch('/api/transcribe-audio', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            audioData: base64Data,
            mimeType: mimeType,
            language: isBn ? 'Bangla and English' : 'English',
          }),
        });

        const data = await res.json();
        if (data.transcript) {
          setTranscript(data.transcript);
          setSrtSubtitles(data.srt || '');
        } else if (!res.ok || !data.success) {
          setErrorMsg(data.error || 'Failed to transcribe with Gemini 3.5 Transcribe');
        }
      };
    } catch (_err: any) {
      setErrorMsg('Error communicating with Gemini 3.5 Transcribe. Please try again.');
    } finally {
      setIsTranscribing(false);
    }
  };

  // Generate TTS Voiceover using Gemini TTS
  const handleGenerateTts = async () => {
    if (!ttsInput.trim()) return;
    setIsGeneratingTts(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/generate-speech', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: ttsInput,
          voice: selectedVoice,
        }),
      });

      const data = await res.json();
      if (data.audioUrl) {
        setTtsAudioUrl(data.audioUrl);
      } else if (!res.ok || !data.success) {
        setErrorMsg(data.error || 'Failed to generate speech with Gemini TTS');
      }
    } catch (_err: any) {
      setErrorMsg('Error generating TTS voiceover. Please try again.');
    } finally {
      setIsGeneratingTts(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 p-6 rounded-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-950 text-purple-300 border border-purple-800">
                Gemini 3.5 Transcribe Engine
              </span>
              <span className="text-xs text-slate-400">
                {isBn ? 'লাইভ মাইক্রোফোন স্পিচ-টু-টেক্সট ও এআই ভয়েসওভার' : 'Live Microphone Speech-to-Text & Subtitle Generator'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {isBn ? 'মাইক্রোফোন অডিও ও স্বয়ংক্রিয় সাবটাইটেল স্টুডিও' : 'Microphone Audio Studio & Gemini 3.5 Transcribe'}
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl">
              {isBn 
                ? 'আপনার মাইক দিয়ে কথা বলুন এবং জেমিনি ৩.৫ ট্রান্সক্রাইব মডেলের মাধ্যমে তাৎক্ষণিক বাংলা ও ইংরেজি নিখুঁত টেক্সট ও এসআরটি (SRT) সাবটাইটেল তৈরি করুন।' 
                : 'Record your voice via microphone and generate highly accurate transcripts and timestamped SRT subtitles using Gemini 3.5 Transcribe.'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 text-xs font-semibold transition"
            >
              <Upload className="w-4 h-4 text-purple-400" />
              {isBn ? 'অডিও ফাইল আপলোড' : 'Upload Audio File'}
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleAudioUpload} 
              accept="audio/*" 
              className="hidden" 
            />
          </div>
        </div>
      </div>

      {/* Main Grid: Left = Mic Recording & Audio Player, Right = Transcription & Subtitles */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Mic Recorder & Audio Controls (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          
          {/* Live Mic Recording Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
            <div className="flex items-center justify-between mb-6">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5 uppercase tracking-wider">
                <Radio className={`w-3.5 h-3.5 ${isRecording ? 'text-red-500 animate-ping' : 'text-purple-400'}`} />
                {isBn ? 'লাইভ মাইক্রোফোন ইনপুট' : 'Live Microphone Input'}
              </span>
              <span className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded-full ${
                isRecording ? 'bg-red-950 text-red-400 border border-red-800' : 'bg-slate-800 text-slate-400'
              }`}>
                {isRecording ? formatTimer(recordingTime) : 'Ready'}
              </span>
            </div>

            {/* Central Animated Mic Button */}
            <div className="flex flex-col items-center justify-center py-6">
              <div className="relative">
                {isRecording && (
                  <div className="absolute inset-0 rounded-full bg-red-500/20 animate-ping scale-150" />
                )}
                <button
                  onClick={isRecording ? stopRecording : startRecording}
                  className={`relative z-10 w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 shadow-2xl ${
                    isRecording
                      ? 'bg-red-600 hover:bg-red-700 text-white scale-105 shadow-red-500/40'
                      : 'bg-gradient-to-tr from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white shadow-purple-500/30'
                  }`}
                >
                  {isRecording ? (
                    <Square className="w-8 h-8 fill-current" />
                  ) : (
                    <Mic className="w-10 h-10" />
                  )}
                </button>
              </div>

              <p className="mt-5 text-sm font-bold text-white">
                {isRecording 
                  ? (isBn ? 'রেকর্ডিং চলছে... কথা বলুন' : 'Recording in progress... Speak clearly') 
                  : (isBn ? 'রেকর্ড করতে মাইক বাটনে ক্লিক করুন' : 'Click to start microphone recording')}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                {isBn 
                  ? 'স্বাভাবিকভাবে বাংলা বা ইংরেজিতে আপনার ভিডিওর বর্ণনা বা ভয়েসওভার দিন' 
                  : 'Speak naturally in English or Bengali for automated transcription'}
              </p>
            </div>

            {/* Playback Box if Audio is Recorded or Uploaded */}
            {audioUrl && (
              <div className="mt-4 pt-4 border-t border-slate-800 space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-300">
                  <span className="font-semibold flex items-center gap-1.5">
                    <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
                    {isBn ? 'রেকর্ডকৃত অডিও প্রিভিউ' : 'Recorded Audio Preview'}
                  </span>
                  <button 
                    onClick={() => {
                      setAudioBlob(null);
                      setAudioUrl(null);
                    }}
                    className="text-slate-400 hover:text-red-400 text-[11px] flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" />
                    {isBn ? 'রিসেট' : 'Reset'}
                  </button>
                </div>
                
                <audio 
                  ref={audioElementRef} 
                  src={audioUrl} 
                  controls 
                  className="w-full h-10 rounded-lg" 
                />

                <button
                  onClick={handleTranscribe}
                  disabled={isTranscribing}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white font-bold text-xs shadow-lg shadow-purple-500/20 flex items-center justify-center gap-2 transition disabled:opacity-50"
                >
                  {isTranscribing ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>{isBn ? 'জেমিনি ৩.৫ ট্রান্সক্রাইব প্রসেস করছে...' : 'Gemini 3.5 Transcribing...'}</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>{isBn ? 'জেমিনি ৩.৫ দিয়ে ট্রান্সক্রাইব করুন' : 'Transcribe with Gemini 3.5 Transcribe'}</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {errorMsg && (
              <div className="mt-4 p-3 bg-red-950/50 border border-red-800/80 rounded-xl text-xs text-red-200 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}
          </div>

          {/* Bonus Feature: AI Voiceover Generator (Gemini TTS) */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-300 flex items-center gap-1.5 uppercase tracking-wider">
                <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
                {isBn ? 'এআই ভয়েসওভার জেনারেটর (Gemini TTS)' : 'AI Voiceover Generator (Gemini TTS)'}
              </h3>
              <span className="text-[10px] bg-cyan-950 text-cyan-300 border border-cyan-800 px-2 py-0.5 rounded">
                gemini-3.8-flash-lite-tts
              </span>
            </div>

            <textarea
              value={ttsInput}
              onChange={(e) => setTtsInput(e.target.value)}
              rows={2}
              placeholder={isBn ? 'ভয়েসওভারের টেক্সট লিখুন...' : 'Enter voiceover script to synthesize into audio...'}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-purple-500 resize-none"
            />

            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] text-slate-400">{isBn ? 'কণ্ঠ:' : 'Voice:'}</span>
                <select
                  value={selectedVoice}
                  onChange={(e) => setSelectedVoice(e.target.value)}
                  className="bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white focus:outline-none"
                >
                  <option value="Kore">Kore (Clear / Professional)</option>
                  <option value="Puck">Puck (Energetic / Modern)</option>
                  <option value="Fenrir">Fenrir (Deep / Cinematic)</option>
                  <option value="Zephyr">Zephyr (Warm / Natural)</option>
                </select>
              </div>

              <button
                onClick={handleGenerateTts}
                disabled={isGeneratingTts || !ttsInput.trim()}
                className="px-3.5 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs transition disabled:opacity-50 flex items-center gap-1.5"
              >
                {isGeneratingTts ? (
                  <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5" />
                )}
                <span>{isBn ? 'ভয়েস তৈরি' : 'Generate Audio'}</span>
              </button>
            </div>

            {ttsAudioUrl && (
              <div className="pt-2">
                <audio src={ttsAudioUrl} controls className="w-full h-8 rounded" />
              </div>
            )}
          </div>

        </div>

        {/* Right Column: Dual View (Verbatim Transcript & Subtitles SRT) (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl min-h-[460px] flex flex-col">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-purple-400" />
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <FileText className="w-4 h-4 text-purple-400" />
                  {isBn ? 'জেমিনি ৩.৫ ট্রান্সক্রিপশন ও সাবটাইটেল (SRT)' : 'Gemini 3.5 Transcription & SRT Captions'}
                </h3>
              </div>

              {srtSubtitles && onSendToSubtitles && (
                <button
                  onClick={() => onSendToSubtitles(srtSubtitles, transcript)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-md shadow-cyan-600/20 transition"
                >
                  <span>{isBn ? 'ভিডিওতে সাবটাইটেল যুক্ত করুন' : 'Apply to Video Subtitles'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {isTranscribing ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 animate-pulse">
                  <Mic className="w-6 h-6" />
                </div>
                <p className="text-sm font-semibold text-white">
                  {isBn ? 'জেমিনি ৩.৫ অডিও শব্দের নির্ভুল টেক্সট বের করছে...' : 'Gemini 3.5 Transcribe analyzing acoustic phonetics...'}
                </p>
                <p className="text-xs text-slate-400 max-w-sm">
                  {isBn 
                    ? 'বাংলা ও ইংরেজির মিশ্র উচ্চারণ শনাক্ত করে সাবটাইটেল ও টাইমস্ট্যাম্প কোড সাজানো হচ্ছে।' 
                    : 'Transcribing speech with millisecond timestamps and word-level fidelity.'}
                </p>
              </div>
            ) : transcript ? (
              <div className="flex-1 space-y-5">
                
                {/* 1. Verbatim Transcript */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-300">
                      {isBn ? '১. হুবহু টেক্সট ট্রান্সক্রিপ্ট:' : '1. Verbatim Text Transcript:'}
                    </span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(transcript);
                        setCopiedTranscript(true);
                        setTimeout(() => setCopiedTranscript(false), 2000);
                      }}
                      className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white"
                    >
                      {copiedTranscript ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedTranscript ? (isBn ? 'কপি হয়েছে' : 'Copied') : (isBn ? 'টেক্সট কপি' : 'Copy Text')}</span>
                    </button>
                  </div>
                  <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-200 leading-relaxed font-sans">
                    {transcript}
                  </div>
                </div>

                {/* 2. SRT Subtitle Format with Timestamps */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                      <Subtitles className="w-3.5 h-3.5 text-cyan-400" />
                      {isBn ? '২. স্ট্যান্ডার্ড সাবটাইটেল ফরম্যাট (.SRT):' : '2. Formatted Subtitles (.SRT):'}
                    </span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(srtSubtitles);
                        setCopiedSrt(true);
                        setTimeout(() => setCopiedSrt(false), 2000);
                      }}
                      className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white"
                    >
                      {copiedSrt ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedSrt ? (isBn ? 'কপি হয়েছে' : 'Copied') : (isBn ? 'SRT কপি' : 'Copy SRT')}</span>
                    </button>
                  </div>
                  <pre className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-cyan-300 font-mono leading-relaxed overflow-x-auto max-h-56">
                    {srtSubtitles}
                  </pre>
                </div>

              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-500 space-y-2">
                <Mic className="w-10 h-10 opacity-30 text-purple-400" />
                <p className="text-xs font-medium text-slate-400">
                  {isBn ? 'বামপাশের মাইক দিয়ে কথা বলুন বা অডিও ফাইল আপলোড করুন।' : 'Record audio with the microphone on the left or upload an audio file.'}
                </p>
                <p className="text-[11px] text-slate-500">
                  {isBn ? 'Gemini 3.5 Transcribe মডেল স্বয়ংক্রিয়ভাবে টেক্সট এবং SRT সাবটাইটেল তৈরি করবে।' : 'Gemini 3.5 Transcribe will generate verbatim text and sync-ready SRT subtitles.'}
                </p>
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
};
