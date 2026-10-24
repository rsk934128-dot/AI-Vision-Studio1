# 🎬 AI Video Studio

[![Android CI](https://github.com/AI-Vision-Studio1/AI-Vision-Studio1/actions/workflows/android.yml/badge.svg?branch=main)](https://github.com/AI-Vision-Studio1/AI-Vision-Studio1/actions/workflows/android.yml)
[![Android SDK](https://img.shields.io/badge/Android%20SDK-API%2036%20%7C%20Min%2024-3DDC84?logo=android&logoColor=white)](https://developer.android.com)
[![Capacitor](https://img.shields.io/badge/Capacitor-Mobile%20Bridge-119EFF?logo=capacitor&logoColor=white)](https://capacitorjs.com)
[![React](https://img.shields.io/badge/React%2019-Vite%20%2B%20TypeScript-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-v4-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![Google Gemini](https://img.shields.io/badge/Google%20Gemini-4%20Argon%20%7C%203.5%20Transcribe-8E75C2?logo=google&logoColor=white)](https://ai.google.dev)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](LICENSE)

An enterprise-grade, full-stack generative AI video production platform built with **React 19**, **Vite**, **TypeScript**, **Tailwind CSS v4**, **Node.js/Express**, and **Capacitor Mobile Runtime**. It integrates Google Gemini multimodal models to turn prompts and photos into production-ready videos, complete with audio synthesis, subtitle synchronization, YouTube automation, and automated Android APK builds via GitHub Actions CI/CD.

---

## 📑 Table of Contents

- [Project Overview](#-project-overview)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [Setup Instructions for Developers](#-setup-instructions-for-developers)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Configuration](#environment-configuration)
  - [Running the Development Server](#running-the-development-server)
  - [Building for Production](#building-for-production)
- [How to Trigger the Android Build Process](#-how-to-trigger-the-android-build-process)
  - [Method 1: Automated CI/CD via GitHub Actions (Recommended)](#method-1-automated-cicd-via-github-actions-recommended)
  - [Method 2: Manual Trigger via GitHub Actions UI](#method-2-manual-trigger-via-github-actions-ui)
  - [Method 3: Local Android Build via Gradle](#method-3-local-android-build-via-gradle)
- [Getting Your APK](#-getting-your-apk)
  - [Step-by-Step: Downloading from GitHub Actions](#step-by-step-downloading-from-github-actions)
  - [Alternative: Direct Download via GitHub Releases](#alternative-direct-download-via-github-releases)
  - [Local Build Output Location](#local-build-output-location)
  - [Installing the APK on Your Android Device](#installing-the-apk-on-your-android-device)
- [Project Architecture](#-project-architecture)
- [License & Security](#-license--security)

---

## 🌟 Project Overview

**AI Video Studio** empowers content creators, marketers, and developers to generate, edit, and analyze video content natively on both the web and Android devices:

- **AI Screenplay & Storyboarding:** Generates structured scenes, visual directives, and character actions.
- **Multimodal Video Understanding:** Employs **Gemini 4 Argon** for object detection, sentiment analysis, scene kinematics, and viral retention hook recommendations.
- **Speech-to-Text & Karaoke Subtitles:** Transcribes live speech into timestamps and styled `.srt` files.
- **YouTube Creator Hub:** Directly manages channels, views analytics, and publishes finished videos via Google OAuth 2.0.
- **Native Android APK Automation:** Includes preconfigured Gradle (`compileSdk 36`, `minSdk 24`) and GitHub Actions for continuous Android APK packaging.

---

## ✨ Key Features

1. **Text-to-Video Production:**
   - Multi-scene storyboard synthesis supporting `16:9` widescreen and `9:16` vertical shorts.
   - Real-time 5-stage progress indicator with terminal FFmpeg logs.
2. **Photo-to-Music Video Studio:**
   - Model selection (preset or custom avatar photos) combined with Bangladeshi & global scenic backgrounds.
   - Dynamic Web Audio synthesis across Romantic, Pop, Sufi, and Lo-Fi genres with synchronized lyric highlighting.
3. **Gemini 4 Argon Video Understanding:**
   - Deep frame inspection, multi-object bounding detection, cinematography analysis, and viral YouTube title/tag generation.
4. **Voiceover & Audio Studio:**
   - Real-time microphone capture with instant Gemini 3.5 transcription and exportable karaoke `.srt` subtitles.
5. **YouTube Studio & OAuth 2.0 Integration:**
   - Live channel subscriber count, view metrics, video playback, and one-click cloud upload.
6. **Fintech & Automated Receipts:**
   - shurjoPay integration (bKash, Nagad, Rocket) with automatic Gmail verification receipts.
7. **Audio-Visual Toast Notification Engine:**
   - Interactive glassmorphic toast notifications with musical audio chimes (Web Audio API) for render completions and error recoveries.

---

## 💻 Tech Stack

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS v4, Lucide Icons
- **Backend:** Node.js, Express proxy routes, Server-Sent Events / Polling
- **AI Models:** Google Gemini 4 Argon (`gemini-2.5-flash` / `gemini-2.5-pro`), Gemini Speech Transcription
- **Mobile Engine:** Capacitor 6/7, Android SDK API 36, AndroidX, Gradle 8.14.3
- **CI/CD:** GitHub Actions (Ubuntu latest runner, Java 21 Temurin)

---

## 🚀 Setup Instructions for Developers

### Prerequisites

Ensure you have the following installed on your machine:
- **Node.js:** `v20.x` or `v22.x` (LTS recommended)
- **npm:** `v10.x` or higher
- **Git**

*(Optional for local Android compilation:)*
- **Java JDK:** `v21` (Eclipse Temurin or OpenJDK)
- **Android Studio** with Android SDK 35/36 & Command-line Tools

---

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git
   cd YOUR_REPOSITORY
   ```

2. **Install project dependencies:**
   ```bash
   npm install
   ```

---

### Environment Configuration

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Open `.env` and fill in your API credentials:
   ```env
   # Google Gemini API Key
   GEMINI_API_KEY=your_gemini_api_key_here

   # Server Port (Default is 3000)
   PORT=3000

   # Optional: shurjoPay Fintech Credentials
   SHURJOPAY_MERCHANT_USERNAME=your_merchant_username
   SHURJOPAY_MERCHANT_PASSWORD=your_merchant_password
   ```

---

### Running the Development Server

Start the full-stack server running Vite middlewares with Express API endpoints:

```bash
npm run dev
```

Open your browser and navigate to:
```
http://localhost:3000
```

---

### Building for Production

Compile TypeScript and build the optimized production web assets:

```bash
npm run build
```

The output bundle will be generated in the `dist/` directory.

---

## 🤖 How to Trigger the Android Build Process

### Method 1: Automated CI/CD via GitHub Actions (Recommended)

Every push to the `main` or `master` branch triggers the automated Android build pipeline:

```bash
# 1. Stage all changes
git add .

# 2. Commit your work
git commit -m "feat: new studio updates"

# 3. Push to GitHub
git push origin main
```

Once pushed, GitHub Actions immediately runs `.github/workflows/android.yml`, which:
1. Installs Node.js & dependencies.
2. Compiles the web application into `dist/`.
3. Configures Java JDK 21 (Temurin) and accepts Android SDK licenses.
4. Synchronizes Capacitor Android native files.
5. Executes `./gradlew assembleDebug --no-daemon` against Android API 36 (`minSdk 24`).
6. Packages and uploads the resulting `app-debug.apk` as a build artifact.

> 💡 **Build Status Badge:** The badge at the very top of this README dynamically displays `passing` (green) or `failing` (red) based on the latest commit on `main`. If you fork or rename the repository, update the badge URL in `README.md`:
> ```markdown
> [![Android CI](https://github.com/<YOUR_USER>/<YOUR_REPO>/actions/workflows/android.yml/badge.svg?branch=main)](https://github.com/<YOUR_USER>/<YOUR_REPO>/actions/workflows/android.yml)
> ```

---

### Method 2: Manual Trigger via GitHub Actions UI

If you want to trigger a build manually without committing code:

1. Go to your GitHub repository in your web browser.
2. Click on the **Actions** tab at the top.
3. In the left sidebar, click on **Build Android APK & AAB**.
4. Click the **Run workflow** dropdown on the right.
5. Select branch `main` and click the green **Run workflow** button.

---

### Method 3: Local Android Build via Gradle

If you have **Android Studio** or **Java 21** installed locally:

```bash
# 1. Build web assets
npm run build

# 2. Sync web assets with Capacitor Android
npx cap sync android

# 3. Change into the android directory
cd android

# 4. Make gradlew executable (Linux/macOS)
chmod +x gradlew

# 5. Compile the debug APK
./gradlew assembleDebug --no-daemon
```

---

## 📦 Getting Your APK

Follow these simple steps to retrieve the generated `.apk` installer after any commit or build:

### Step-by-Step: Downloading from GitHub Actions

1. **Navigate to the 'Actions' tab:**
   - Open your project repository on GitHub (`https://github.com/<YOUR_USER>/<YOUR_REPO>`).
   - In the top navigation bar (under the repository name), click on the **Actions** tab.

2. **Select the latest run:**
   - In the left sidebar or the main workflow list, look for the most recent workflow execution (e.g., **`Android CI`** or **`Build Android APK & AAB`**).
   - Ensure the workflow has finished with a green checkmark (**`✔`**). Click on the title of the latest run to open its summary details.

3. **Locate the Artifacts section:**
   - On the workflow run summary page, scroll down to the bottom where the **Artifacts** table is displayed.

4. **Download the 'app-debug' artifact:**
   - Click directly on the **`app-debug`** row (or click the download icon next to it).
   - GitHub will download a ZIP file named **`app-debug.zip`**.

5. **Extract the APK:**
   - Unzip or extract the downloaded `app-debug.zip` archive on your computer or mobile phone.
   - Inside you will find the ready-to-install **`app-debug.apk`** file.

```
┌────────────────────────────────────────────────────────┐
│ GitHub Repository Header                                │
│ [Code]   [Issues]   [Pull requests]   👉 [Actions] 👈  │
└────────────────────────────────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│ Workflow Runs                                          │
│  ✔ Android CI - commit "feat: update..." (Latest Run)  │ ◄── Click this
└────────────────────────────────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│ Workflow Summary (Scroll to bottom)                    │
│ ┌───────────────────────┬──────────────┬─────────────┐ │
│ │ Artifact Name         │ Size         │ Download    │ │
│ ├───────────────────────┼──────────────┼─────────────┤ │
│ │ 📦 app-debug          │ ~35 MB       │ 📥 [Click]  │ │ ◄── Download
│ └───────────────────────┴──────────────┴─────────────┘ │
└────────────────────────────────────────────────────────┘
                           │
                           ▼
                  Extract `app-debug.zip`
                           │
                           ▼
                  📱 `app-debug.apk`
```

---

### Alternative: Direct Download via GitHub Releases
*If you prefer not to unzip artifacts, our CI/CD also automatically publishes the raw `.apk` directly to GitHub Releases:*

1. On the main page of your repository, check the right sidebar for **Releases**.
2. Click on the latest release tag (**`latest-apk`**).
3. Under **Assets**, click directly on **`app-debug.apk`** to download it without needing any zip extraction.

---

### Local Build Output Location

If you compiled the Android APK locally using `./gradlew assembleDebug`, the generated APK is stored at:

```
android/app/build/outputs/apk/debug/app-debug.apk
```

---

### 📲 Installing the APK on Your Android Device

1. Transfer or download **`app-debug.apk`** to your Android phone or tablet (supports Android 7.0 / API 24 through Android 15+ / API 36).
2. Tap on the APK file in your phone's file manager or browser downloads.
3. If prompted with *"For your security, your phone is not allowed to install unknown apps from this source"*:
   - Tap **Settings**.
   - Toggle on **Allow from this source**.
4. Tap **Install** and open **AI Video Studio**!

---

## 🏛️ Project Architecture

```
ai-video-studio/
├── .github/
│   └── workflows/
│       └── android-build.yml       # GitHub Actions CI/CD automation & release publisher
├── android/                        # Native Android project
│   ├── app/
│   │   ├── build.gradle            # App-level build config (namespace, SDKs, plugins)
│   │   └── src/main/
│   │       ├── AndroidManifest.xml # Android permissions & activities
│   │       └── res/                # App launcher icons & splash screen assets
│   ├── build.gradle                # Top-level Gradle configuration
│   ├── gradle.properties           # JVM memory & AndroidX jetifier settings
│   └── variables.gradle            # compileSdk (36), minSdk (24), AndroidX versions
├── public/                         # Public assets (sample video clips, icons, PWA manifest)
├── src/
│   ├── components/                 # React UI components
│   │   ├── AndroidGitHubBuilder.tsx # In-app Android build suite & config generator
│   │   ├── GenerativeVideoPlayer.tsx # Canvas video player with timeline & scrubber
│   │   ├── Navbar.tsx              # Navigation bar, auth menu & sound toggle
│   │   ├── PhotoMusicVideo.tsx     # Photo-to-Music video generator & Web Audio chords
│   │   ├── TextToVideo.tsx         # Storyboard screenwriter & render pipeline
│   │   ├── VideoRenderProgressIndicator.tsx # 5-stage live render progress modal
│   │   ├── VideoUnderstanding.tsx  # Gemini 4 Argon video vision & object analysis
│   │   └── YouTubeStudio.tsx       # YouTube Channel analytics, watch hub & uploader
│   ├── context/
│   │   ├── ToastContext.tsx        # Toast alert system with Web Audio API chime sounds
│   │   └── YouTubeAuthContext.tsx  # Google OAuth 2.0 YouTube client state
│   ├── App.tsx                     # Main layout & studio tab switcher
│   ├── index.css                   # Tailwind CSS styling
│   ├── main.tsx                    # React DOM entry point
│   └── types.ts                    # TypeScript types & data interfaces
├── capacitor.config.json           # Capacitor application configuration
├── package.json                    # Node dependencies & project scripts
├── server.ts                       # Express backend server with Gemini API routes
├── tsconfig.json                   # TypeScript compiler configuration
├── vite.config.ts                  # Vite build configuration
└── README.md                       # Documentation
```

---

## 🔒 License & Security

- **License:** Distributed under the [Apache-2.0 License](LICENSE).
- **Security:** API keys and sensitive tokens are proxied exclusively through server-side routes (`server.ts`). Client applications never expose secret credentials.

---

Made with ❤️ by the **AI Video Studio** Team.
