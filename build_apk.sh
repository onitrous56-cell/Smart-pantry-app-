#!/usr/bin/env bash
# ==============================================================================
# Smart Pantry & Expiry Tracker - Android APK Build Script
# ==============================================================================
# This script compiles the Vite React web app and builds the Android APK.
# Requirements on host machine:
#   1. Node.js (v18+)
#   2. Java Development Kit (JDK 17 or 21)
#   3. Android SDK (or Android Studio)
# ==============================================================================

set -e

echo "📦 1. Installing Capacitor Native Packages..."
npm install @capacitor/core
npm install -D @capacitor/cli @capacitor/android

echo "⚡ 2. Building production web assets (Vite)..."
npm run build

echo "🤖 3. Initializing / Syncing Android platform..."
if [ ! -d "android" ]; then
  npx cap add android
fi
npx cap sync android

echo "🔨 4. Compiling Android APK with Gradle..."
cd android
chmod +x ./gradlew
./gradlew assembleDebug

echo ""
echo "=============================================================================="
echo "🎉 SUCCESS: Debug APK successfully compiled!"
echo "📍 APK Location:"
echo "   android/app/build/outputs/apk/debug/app-debug.apk"
echo "=============================================================================="
