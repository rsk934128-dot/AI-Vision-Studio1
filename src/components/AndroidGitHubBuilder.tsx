import React, { useState } from 'react';
import { 
  Smartphone, 
  GitBranch, 
  Download, 
  Copy, 
  Check, 
  Terminal, 
  Play, 
  FolderGit2, 
  Cpu, 
  ShieldCheck, 
  Sparkles, 
  Settings, 
  ExternalLink, 
  FileCode, 
  CheckCircle2, 
  Layers, 
  ArrowRight,
  PackageCheck,
  KeyRound,
  QrCode,
  Share2,
  RefreshCw,
  Sliders,
  HelpCircle
} from 'lucide-react';
import { Language } from '../types';

interface AndroidGitHubBuilderProps {
  lang: Language;
}

export const AndroidGitHubBuilder: React.FC<AndroidGitHubBuilderProps> = ({ lang }) => {
  const isBn = lang === 'bn';

  const [activeMethod, setActiveMethod] = useState<'github-actions' | 'capacitor' | 'pwa-twa' | 'config-generator'>('github-actions');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Config Generator State
  const [appName, setAppName] = useState<string>('AI Video Studio');
  const [packageId, setPackageId] = useState<string>('com.aivideostudio.app');
  const [versionName, setVersionName] = useState<string>('1.0.0');
  const [versionCode, setVersionCode] = useState<number>(1);
  const [enableCamera, setEnableCamera] = useState<boolean>(true);
  const [enableMic, setEnableMic] = useState<boolean>(true);
  const [enableStorage, setEnableStorage] = useState<boolean>(true);
  const [enableNotifs, setEnableNotifs] = useState<boolean>(true);

  // Keystore Generator State
  const [keystoreAlias, setKeystoreAlias] = useState<string>('aivideostudiokey');
  const [keystoreName, setKeystoreName] = useState<string>('release-key.jks');

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const downloadTextFile = (filename: string, content: string) => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const generatedCapacitorConfig = JSON.stringify({
    appId: packageId,
    appName: appName,
    webDir: "dist",
    bundledWebRuntime: false,
    server: {
      androidScheme: "https",
      cleartext: true
    },
    android: {
      allowMixedContent: true,
      captureInput: true,
      webContentsDebuggingEnabled: true
    }
  }, null, 2);

  const generatedManifestXml = `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="${packageId}">

    <!-- Permissions customized from AI Video Studio Android Hub -->
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
${enableCamera ? '    <uses-permission android:name="android.permission.CAMERA" />\n    <uses-feature android:name="android.hardware.camera" android:required="false" />\n' : ''}${enableMic ? '    <uses-permission android:name="android.permission.RECORD_AUDIO" />\n    <uses-permission android:name="android.permission.MODIFY_AUDIO_SETTINGS" />\n' : ''}${enableStorage ? '    <uses-permission android:name="android.permission.READ_MEDIA_VIDEO" />\n    <uses-permission android:name="android.permission.READ_MEDIA_IMAGES" />\n' : ''}${enableNotifs ? '    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />\n' : ''}
    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="${appName}"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/AppTheme"
        android:usesCleartextTraffic="true">

        <activity
            android:name=".MainActivity"
            android:configChanges="orientation|keyboardHidden|keyboard|screenSize|locale|smallestScreenSize|screenLayout|uiMode"
            android:exported="true"
            android:label="${appName}"
            android:launchMode="singleTask"
            android:theme="@style/AppTheme.NoActionBarLaunch">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>`;

  const gitHubWorkflowYaml = `name: Build Android APK & AAB

on:
  push:
    branches: [ main, master ]
  workflow_dispatch:

permissions:
  contents: write

jobs:
  build-android:
    name: Build Android APK
    runs-on: ubuntu-latest

    steps:
      - name: Checkout Source Code
        uses: actions/checkout@v4

      - name: Setup Node.js 20.x
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - name: Install Web Dependencies
        run: |
          npm install --legacy-peer-deps

      - name: Build Web Application
        run: |
          npm run build

      - name: Set up Java JDK 21
        uses: actions/setup-java@v4
        with:
          java-version: '21'
          distribution: 'temurin'

      - name: Setup Android SDK
        uses: android-actions/setup-android@v3

      - name: Accept Android SDK Licenses
        run: |
          yes | sdkmanager --licenses || true

      - name: Add Android Platform & Sync
        run: |
          if [ ! -d "android" ]; then
            npx cap add android
          fi
          npx cap sync android

      - name: Set Permissions on Gradlew
        run: |
          if [ -f "android/gradlew" ]; then
            chmod +x android/gradlew
          fi

      - name: Build Android Debug APK
        run: |
          cd android
          ./gradlew assembleDebug --no-daemon --stacktrace

      - name: Upload Debug APK Artifact
        uses: actions/upload-artifact@v4
        with:
          name: ai-video-studio-debug-apk
          path: android/app/build/outputs/apk/debug/app-debug.apk
          if-no-files-found: error
          retention-days: 14`;

  const keystoreCmd = `keytool -genkey -v -keystore ${keystoreName} -alias ${keystoreAlias} -keyalg RSA -keysize 2048 -validity 10000`;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-950/70 via-slate-900 to-slate-900 border border-emerald-900/50 p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center shadow-lg shadow-emerald-500/30 text-white flex-shrink-0">
              <Smartphone className="w-9 h-9" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  {isBn ? 'গিটহাব থেকে অ্যান্ড্রয়েড অ্যাপ বিল্ডার' : 'GitHub to Android APK Builder Suite'}
                </h1>
                <span className="px-2.5 py-0.5 text-xs font-semibold bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 rounded-full">
                  Android 14+ Ready
                </span>
              </div>
              <p className="text-slate-400 text-sm mt-1 max-w-2xl">
                {isBn
                  ? 'আপনার এই প্রজেক্ট গিটহাবে পুশ করে সরাসরি অ্যান্ড্রয়েড APK এবং গুগল প্লে-স্টোরের জন্য AAB তৈরি করুন। গিটহাব অ্যাকশন্সের মাধ্যমে পিসিতে কোনো সফটওয়্যার ছাড়াই স্বয়ংক্রিয়ভাবে APK ডাউনলোড করতে পারবেন।'
                  : 'Turn this web project into a native Android APK or Play Store AAB using GitHub Actions CI/CD, Capacitor, or PWA TWA.'}
              </p>
            </div>
          </div>

          {/* Quick Badges */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300">
              <FolderGit2 className="w-4 h-4 text-emerald-400" />
              <span>CI/CD Workflow Ready</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300">
              <PackageCheck className="w-4 h-4 text-cyan-400" />
              <span>Capacitor 6</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveMethod('github-actions')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer ${
            activeMethod === 'github-actions'
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
              : 'bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-800'
          }`}
        >
          <GitBranch className="w-4 h-4" />
          <span>{isBn ? 'পদ্ধতি ১: গিটহাব অটোমেটিক APK (প্রস্তাবিত)' : 'Method 1: GitHub Actions CI/CD (Recommended)'}</span>
          <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
        </button>

        <button
          onClick={() => setActiveMethod('capacitor')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer ${
            activeMethod === 'capacitor'
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
              : 'bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-800'
          }`}
        >
          <Cpu className="w-4 h-4" />
          <span>{isBn ? 'পদ্ধতি ২: Capacitor ও Android Studio' : 'Method 2: Capacitor Native Studio'}</span>
        </button>

        <button
          onClick={() => setActiveMethod('pwa-twa')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer ${
            activeMethod === 'pwa-twa'
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
              : 'bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-800'
          }`}
        >
          <Smartphone className="w-4 h-4" />
          <span>{isBn ? 'পদ্ধতি ৩: PWA / TWA প্লে-স্টোর' : 'Method 3: PWA / TWA Instant AAB'}</span>
        </button>

        <button
          onClick={() => setActiveMethod('config-generator')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer ${
            activeMethod === 'config-generator'
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
              : 'bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-800'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>{isBn ? 'কনফিগ জেনারেটর ও কি-স্টোর' : 'App Config & Keystore'}</span>
        </button>
      </div>

      {/* METHOD 1: GITHUB ACTIONS CI/CD AUTOMATION */}
      {activeMethod === 'github-actions' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <GitBranch className="w-5 h-5 text-emerald-400" />
                  <span>{isBn ? 'গিটহাবে কোড পুশ করলেই স্বয়ংক্রিয়ভাবে APK তৈরি হওয়া' : 'Automated Android APK Build via GitHub Actions'}</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  {isBn 
                    ? 'আপনার পিসিতে Android Studio বা Java ইন্সটল করার প্রয়োজন নেই। GitHub এর ক্লাউড সার্ভার স্বয়ংক্রিয়ভাবে APK বিল্ড করবে।' 
                    : 'No need to install Android Studio or heavy SDKs locally. GitHub Cloud Runners build the APK automatically.'}
                </p>
              </div>

              <button
                onClick={() => downloadTextFile('android-build.yml', gitHubWorkflowYaml)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-lg shadow-emerald-600/20 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>{isBn ? 'Workflow ডাউনলোড করুন' : 'Download Workflow YAML'}</span>
              </button>
            </div>

            {/* 4 Simple Steps */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-bold text-xs flex items-center justify-center">
                  ১
                </div>
                <h4 className="text-sm font-bold text-white">{isBn ? 'গিটহাব রিপোজিটরি তৈরি' : 'Create GitHub Repo'}</h4>
                <p className="text-xs text-slate-400">
                  {isBn ? 'GitHub.com এ গিয়ে নতুন রিপোজিটরি তৈরি করুন এবং কোড পুশ করুন।' : 'Create a new repository on GitHub and push the code.'}
                </p>
              </div>

              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-bold text-xs flex items-center justify-center">
                  ২
                </div>
                <h4 className="text-sm font-bold text-white">{isBn ? 'ফাইল ইতোমধ্যে যুক্ত আছে!' : 'Workflow File Added!'}</h4>
                <p className="text-xs text-slate-400">
                  {isBn 
                    ? 'আপনার অ্যাপে `.github/workflows/android-build.yml` ফাইলটি ইতোমধ্যে তৈরি করে দেওয়া হয়েছে।' 
                    : 'The `.github/workflows/android-build.yml` file is already added to your project.'}
                </p>
              </div>

              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-bold text-xs flex items-center justify-center">
                  ৩
                </div>
                <h4 className="text-sm font-bold text-white">{isBn ? 'গিটহাবে পুশ করুন' : 'Push to GitHub'}</h4>
                <p className="text-xs text-slate-400">
                  {isBn ? 'টার্মিনালে git commit ও git push করলেই GitHub Actions স্বয়ংক্রিয়ভাবে শুরু হবে।' : 'Push your commit and GitHub Actions will start automatically.'}
                </p>
              </div>

              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-bold text-xs flex items-center justify-center">
                  ৪
                </div>
                <h4 className="text-sm font-bold text-white">{isBn ? 'APK ডাউনলোড ও ফোনে ইনস্টল' : 'Download APK'}</h4>
                <p className="text-xs text-slate-400">
                  {isBn ? 'GitHub এর Actions ট্যাব থেকে "Artifacts" এর নিচে থাকা APK সরাসরি ডাউনলোড করে ফোনে ইনস্টল করুন।' : 'Download app-debug.apk from GitHub Actions Artifacts and install on your phone.'}
                </p>
              </div>
            </div>

            {/* Git Terminal Commands to Copy */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5 uppercase tracking-wider">
                  <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                  {isBn ? 'গিটহাবে আপলোড করার কমান্ডসমূহ (টার্মিনালে রান করুন)' : 'Git Commands to Push to GitHub'}
                </span>
                <button
                  onClick={() => copyToClipboard(`git init\ngit add .\ngit commit -m "feat: setup automated Android APK build"\ngit branch -M main\ngit remote add origin https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git\ngit push -u origin main`, 'git-cmds')}
                  className="flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 transition"
                >
                  {copiedKey === 'git-cmds' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'git-cmds' ? (isBn ? 'কপি হয়েছে' : 'Copied') : (isBn ? 'সব কমান্ড কপি করুন' : 'Copy All')}</span>
                </button>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs text-slate-200 overflow-x-auto space-y-1">
                <p className="text-slate-500"># 1. Initialize git repository if not done</p>
                <p className="text-emerald-300">git init</p>
                <p className="text-slate-500"># 2. Add all files (including .github/workflows/android-build.yml & capacitor.config.json)</p>
                <p className="text-emerald-300">git add .</p>
                <p className="text-slate-500"># 3. Commit files</p>
                <p className="text-emerald-300">git commit -m "feat: setup automated Android APK build"</p>
                <p className="text-slate-500"># 4. Set main branch & add remote GitHub URL</p>
                <p className="text-emerald-300">git branch -M main</p>
                <p className="text-cyan-300">git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git</p>
                <p className="text-slate-500"># 5. Push to GitHub (Triggers automated APK build in Actions tab!)</p>
                <p className="text-emerald-300">git push -u origin main</p>
              </div>
            </div>

            {/* Workflow File Viewer with copy */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5 font-mono">
                  <FileCode className="w-3.5 h-3.5 text-purple-400" />
                  .github/workflows/android-build.yml
                </span>
                <button
                  onClick={() => copyToClipboard(gitHubWorkflowYaml, 'workflow-yaml')}
                  className="flex items-center gap-1 text-xs text-slate-400 hover:text-white transition"
                >
                  {copiedKey === 'workflow-yaml' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'workflow-yaml' ? (isBn ? 'কপি হয়েছে' : 'Copied') : (isBn ? 'YAML কপি করুন' : 'Copy YAML')}</span>
                </button>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-[11px] text-slate-300 overflow-x-auto max-h-64 leading-relaxed whitespace-pre">
                {gitHubWorkflowYaml}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* METHOD 2: CAPACITOR NATIVE ANDROID STUDIO */}
      {activeMethod === 'capacitor' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Cpu className="w-5 h-5 text-emerald-400" />
                  <span>{isBn ? 'লোকাল পিসিতে Capacitor ও Android Studio দিয়ে বিল্ড' : 'Local PC Build via Capacitor & Android Studio'}</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  {isBn 
                    ? 'আপনার পিসিতে যদি Android Studio থাকে, তবে ৫টি সাধারণ কমান্ডের মাধ্যমে সরাসরি অ্যান্ড্রয়েড প্রজেক্ট তৈরি করে এমুলেটর বা আসল ফোনে রান করতে পারেন।' 
                    : 'If you have Android Studio installed locally, run these 5 commands to generate a full Android Studio project.'}
                </p>
              </div>

              <button
                onClick={() => downloadTextFile('capacitor.config.json', generatedCapacitorConfig)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition cursor-pointer"
              >
                <Download className="w-4 h-4 text-cyan-400" />
                <span>{isBn ? 'capacitor.config.json ডাউনলোড' : 'Download capacitor.config.json'}</span>
              </button>
            </div>

            {/* Step-by-Step Terminal Commands */}
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-400">ধাপ ১: ক্যাপাসিটর ডিপেন্ডেন্সি ইন্সটল করুন (Install Capacitor)</span>
                  <button
                    onClick={() => copyToClipboard('npm install @capacitor/core @capacitor/android && npm install -D @capacitor/cli', 'step-1')}
                    className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
                  >
                    {copiedKey === 'step-1' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedKey === 'step-1' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <div className="bg-black/60 p-2.5 rounded-lg font-mono text-xs text-emerald-300">
                  npm install @capacitor/core @capacitor/android && npm install -D @capacitor/cli
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-400">ধাপ ২: প্রজেক্ট বিল্ড করুন (Build Vite Dist)</span>
                  <button
                    onClick={() => copyToClipboard('npm run build', 'step-2')}
                    className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
                  >
                    {copiedKey === 'step-2' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedKey === 'step-2' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <div className="bg-black/60 p-2.5 rounded-lg font-mono text-xs text-cyan-300">
                  npm run build
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-400">ধাপ ৩: অ্যান্ড্রয়েড প্ল্যাটফর্ম যুক্ত করুন (Add Android Platform)</span>
                  <button
                    onClick={() => copyToClipboard('npx cap add android', 'step-3')}
                    className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
                  >
                    {copiedKey === 'step-3' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedKey === 'step-3' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <div className="bg-black/60 p-2.5 rounded-lg font-mono text-xs text-purple-300">
                  npx cap add android
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-400">ধাপ ৪: ওয়েব ফাইল সিঙ্ক করুন (Sync Web Code to Android)</span>
                  <button
                    onClick={() => copyToClipboard('npx cap sync android', 'step-4')}
                    className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
                  >
                    {copiedKey === 'step-4' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedKey === 'step-4' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <div className="bg-black/60 p-2.5 rounded-lg font-mono text-xs text-emerald-300">
                  npx cap sync android
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-400">ধাপ ৫: Android Studio তে ওপেন করুন ও APK জেনারেট করুন</span>
                  <button
                    onClick={() => copyToClipboard('npx cap open android', 'step-5')}
                    className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
                  >
                    {copiedKey === 'step-5' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedKey === 'step-5' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <div className="bg-black/60 p-2.5 rounded-lg font-mono text-xs text-yellow-300">
                  npx cap open android
                </div>
                <p className="text-[11px] text-slate-400 mt-2">
                  {isBn 
                    ? 'অ্যান্ড্রয়েড স্টুডিও ওপেন হলে উপরের মেনু থেকে: Build -> Build Bundle(s) / APK(s) -> Build APK(s) এ ক্লিক করলেই সাথে সাথে আপনার কম্পিউটারে APK ফাইল তৈরি হয়ে যাবে।'
                    : 'Inside Android Studio: Go to Menu -> Build -> Build Bundle(s) / APK(s) -> Build APK(s) to generate app-debug.apk.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* METHOD 3: PWA / TWA (BUBBLEWRAP & PWABUILDER) */}
      {activeMethod === 'pwa-twa' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
            <div className="border-b border-slate-800 pb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-cyan-400" />
                <span>{isBn ? 'PWA / TWA দিয়ে সরাসরি প্লে-স্টোর উপযোগী AAB তৈরি' : 'Turn Web URL into Google Play Store .AAB (TWA)'}</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                {isBn 
                  ? 'গুগলের অফিশিয়াল Trusted Web Activity (TWA) টেকনোলজি ব্যবহার করে আপনার লাইভ ওয়েবসাইটকে সরাসরি Google Play Store প্যাকেজে রূপান্তর করুন।' 
                  : 'Use official Google Trusted Web Activity (TWA) to wrap your deployed website into a signed Google Play .AAB.'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Option A: PWABuilder (Online Free Tool by Microsoft) */}
              <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-5 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold">
                    A
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">PWABuilder.com (অনলাইন সমাধান)</h4>
                    <span className="text-[10px] text-cyan-400">Zero Code, 2 Minutes</span>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  {isBn 
                    ? '১. https://www.pwabuilder.com এ যান।\n২. আপনার লাইভ ওয়েবসাইটের লিংক পেস্ট করুন।\n৩. "Package for Stores" এ ক্লিক করে "Android" সিলেক্ট করুন।\n৪. গুগল প্লে-স্টোরের জন্য রেডি .AAB ফাইল তৎক্ষণাৎ ডাউনলোড হয়ে যাবে।'
                    : '1. Visit https://www.pwabuilder.com\n2. Enter your live app URL.\n3. Click "Package for Stores" and select Android.\n4. Download the ready Google Play .aab bundle!'}
                </p>

                <a
                  href="https://www.pwabuilder.com"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition"
                >
                  <span>PWABuilder ওপেন করুন</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              {/* Option B: Google Bubblewrap CLI */}
              <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-5 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                    B
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Google Bubblewrap CLI</h4>
                    <span className="text-[10px] text-emerald-400">Official Google CLI for TWA</span>
                  </div>
                </div>

                <div className="bg-black/60 p-3 rounded-lg font-mono text-xs text-emerald-300 space-y-1 overflow-x-auto">
                  <p className="text-slate-500"># Install Google Bubblewrap CLI</p>
                  <p>npm i -g @bubblewrap/cli</p>
                  <p className="text-slate-500"># Initialize from your live web manifest</p>
                  <p>bubblewrap init --manifest https://YOUR-APP-URL/manifest.json</p>
                  <p className="text-slate-500"># Build signed Android APK and AAB</p>
                  <p>bubblewrap build</p>
                </div>

                <button
                  onClick={() => copyToClipboard('npm i -g @bubblewrap/cli && bubblewrap init --manifest https://YOUR-APP-URL/manifest.json && bubblewrap build', 'bubblewrap-cmd')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 transition"
                >
                  {copiedKey === 'bubblewrap-cmd' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'bubblewrap-cmd' ? 'কপি হয়েছে' : 'কমান্ড কপি করুন'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* METHOD 4: CONFIG GENERATOR & KEYSTORE GENERATOR */}
      {activeMethod === 'config-generator' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Form: App Configuration */}
          <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
            <div className="border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-emerald-400" />
                <span>{isBn ? 'অ্যান্ড্রয়েড অ্যাপ সেটিংস ও প্যাকেজ নেম' : 'App Identity & Permissions'}</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {isBn ? 'আপনার পছন্দমতো নাম ও প্যাকেজ আইডি দিন, স্বয়ংক্রিয়ভাবে কনফিগ আপডেট হবে।' : 'Configure app metadata for Android build.'}
              </p>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  {isBn ? 'অ্যাপের নাম (App Name):' : 'Application Name:'}
                </label>
                <input
                  type="text"
                  value={appName}
                  onChange={(e) => setAppName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white font-medium focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  {isBn ? 'প্যাকেজ আইডি / Application ID (Unique ID):' : 'Package ID (e.g. com.yourname.app):'}
                </label>
                <input
                  type="text"
                  value={packageId}
                  onChange={(e) => setPackageId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-emerald-400 font-mono text-xs focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Version Name:</label>
                  <input
                    type="text"
                    value={versionName}
                    onChange={(e) => setVersionName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Version Code:</label>
                  <input
                    type="number"
                    value={versionCode}
                    onChange={(e) => setVersionCode(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Permissions Checklist */}
              <div className="pt-2 border-t border-slate-800">
                <p className="font-semibold text-slate-300 mb-2">
                  {isBn ? 'প্রয়োজনীয় অ্যান্ড্রয়েড পারমিশনসমূহ:' : 'Android Permissions Needed:'}
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <label className="flex items-center gap-2 p-2 bg-slate-950/60 rounded-lg border border-slate-800/80 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={enableCamera}
                      onChange={(e) => setEnableCamera(e.target.checked)}
                      className="accent-emerald-500 rounded"
                    />
                    <span className="text-slate-300">Camera (ক্যামেরা)</span>
                  </label>

                  <label className="flex items-center gap-2 p-2 bg-slate-950/60 rounded-lg border border-slate-800/80 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={enableMic}
                      onChange={(e) => setEnableMic(e.target.checked)}
                      className="accent-emerald-500 rounded"
                    />
                    <span className="text-slate-300">Microphone (মাইক)</span>
                  </label>

                  <label className="flex items-center gap-2 p-2 bg-slate-950/60 rounded-lg border border-slate-800/80 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={enableStorage}
                      onChange={(e) => setEnableStorage(e.target.checked)}
                      className="accent-emerald-500 rounded"
                    />
                    <span className="text-slate-300">Storage / Media</span>
                  </label>

                  <label className="flex items-center gap-2 p-2 bg-slate-950/60 rounded-lg border border-slate-800/80 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={enableNotifs}
                      onChange={(e) => setEnableNotifs(e.target.checked)}
                      className="accent-emerald-500 rounded"
                    />
                    <span className="text-slate-300">Notifications</span>
                  </label>
                </div>
              </div>

              {/* Keystore generation tool */}
              <div className="pt-3 border-t border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-yellow-400" />
                    <span>{isBn ? 'গুগল প্লে রিলিজ কি-স্টোর কমান্ড' : 'Release Keystore Signer Command'}</span>
                  </span>
                  <button
                    onClick={() => copyToClipboard(keystoreCmd, 'keystore')}
                    className="text-[11px] text-yellow-400 hover:text-yellow-300 flex items-center gap-1"
                  >
                    {copiedKey === 'keystore' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedKey === 'keystore' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <div className="bg-black/80 p-2.5 rounded-lg font-mono text-[11px] text-yellow-300 break-all">
                  {keystoreCmd}
                </div>
              </div>
            </div>
          </div>

          {/* Right Live Preview: Generated AndroidManifest.xml & capacitor.config.json */}
          <div className="lg:col-span-6 space-y-5">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="text-xs font-bold text-white flex items-center gap-1.5 font-mono">
                  <FileCode className="w-4 h-4 text-emerald-400" />
                  capacitor.config.json
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => copyToClipboard(generatedCapacitorConfig, 'cap-config')}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-300 flex items-center gap-1 transition"
                  >
                    {copiedKey === 'cap-config' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedKey === 'cap-config' ? 'Copied' : 'Copy'}</span>
                  </button>
                  <button
                    onClick={() => downloadTextFile('capacitor.config.json', generatedCapacitorConfig)}
                    className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-[11px] font-bold text-white flex items-center gap-1 transition cursor-pointer"
                  >
                    <Download className="w-3 h-3" />
                    <span>Download</span>
                  </button>
                </div>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs text-slate-300 overflow-x-auto max-h-48">
                <pre>{generatedCapacitorConfig}</pre>
              </div>

              {/* AndroidManifest.xml preview */}
              <div className="flex items-center justify-between border-b border-slate-800 pt-2 pb-2">
                <span className="text-xs font-bold text-white flex items-center gap-1.5 font-mono">
                  <FileCode className="w-4 h-4 text-cyan-400" />
                  AndroidManifest.xml
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => copyToClipboard(generatedManifestXml, 'manifest-xml')}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-300 flex items-center gap-1 transition"
                  >
                    {copiedKey === 'manifest-xml' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedKey === 'manifest-xml' ? 'Copied' : 'Copy'}</span>
                  </button>
                  <button
                    onClick={() => downloadTextFile('AndroidManifest.xml', generatedManifestXml)}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] font-bold text-cyan-400 border border-slate-700 flex items-center gap-1 transition cursor-pointer"
                  >
                    <Download className="w-3 h-3" />
                    <span>Download</span>
                  </button>
                </div>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-[11px] text-slate-300 overflow-x-auto max-h-56">
                <pre>{generatedManifestXml}</pre>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Android Device Installation & Testing Tips */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 to-emerald-950/30 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">
              {isBn ? 'ফোনে APK ইন্সটল করার টিপস' : 'Android Testing & Installation Note'}
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              {isBn
                ? 'GitHub Actions থেকে ডাউনলোড করা debug APK ফোনে পাঠানোর পর "Install Unknown Apps" অপশন অন করতে হতে পারে। এর ফলে যেকোনো শাওমি, স্যামসাং, রিয়েলমি বা পিক্সেলে অ্যাপটি সহজে চলবে।'
                : 'When installing the generated debug APK on Android, allow "Install unknown apps" from files or WhatsApp/Drive.'}
            </p>
          </div>
        </div>

        <button
          onClick={() => setActiveMethod('github-actions')}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-800/40 text-xs font-bold transition shrink-0 cursor-pointer"
        >
          <span>{isBn ? 'গিটহাব অ্যাকশন্স দেখুন' : 'View GitHub CI/CD'}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

    </div>
  );
};
