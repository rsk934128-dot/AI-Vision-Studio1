#!/bin/bash
# ========================================================
# AI Video Studio - Automated Android APK Build Script
# ========================================================

set -e

echo "🚀 [1/5] Building Web Production Assets with Vite..."
npm run build

echo "📦 [2/5] Ensuring Capacitor Dependencies are Installed..."
npm install @capacitor/core @capacitor/android
npm install -D @capacitor/cli

echo "📱 [3/5] Checking Android Platform Folder..."
if [ ! -d "android" ]; then
  echo "Adding Android platform..."
  npx cap add android
fi

echo "🔄 [4/5] Syncing Web Assets to Android Platform..."
npx cap sync android

echo "🛠️ [5/5] Building Android Debug APK using Gradle..."
cd android
chmod +x gradlew
./gradlew assembleDebug --no-daemon

echo ""
echo "🎉 SUCCESS! Your Android APK is ready at:"
echo "👉 android/app/build/outputs/apk/debug/app-debug.apk"
echo ""
echo "You can transfer this APK to your phone and install it immediately!"
