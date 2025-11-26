# 🏗️ Building Production APK - Quick Start

## Step 1: Configure EAS Project (One-Time Setup)

Open a new terminal in this directory and run:

```bash
eas build:configure
```

When prompted:
- ✅ "Would you like to automatically create an EAS project?" → **Yes**
- ✅ Accept the default configuration

This creates your project on Expo's servers.

## Step 2: Build Production APK

Once configured, run:

```bash
eas build --platform android --profile production
```

This will:
- ✅ Build your app on Expo's cloud servers
- ✅ Create a production-ready APK
- ✅ Take about 10-15 minutes

## Step 3: Download & Install

After the build completes:

1. **Get the APK:**
   - EAS will show you a download link
   - Or visit: https://expo.dev/accounts/krdarroch/projects/BaseballApp/builds

2. **Transfer to your tablet:**
   - Email the APK to yourself
   - Or use Google Drive / Dropbox
   - Or connect via USB and transfer directly

3. **Install on tablet:**
   - Open the APK file on your tablet
   - Android will ask "Install unknown app?"
   - Tap "Settings" → Enable "Allow from this source"
   - Tap "Install"

## Step 4: Use Your App!

1. **Connect to ESP32 WiFi:**
   - Settings → WiFi → "BaseballClicker"
   - Password: `playball123`

2. **Launch the app:**
   - Tap the Baseball Scoreboard icon
   - Tap "CONNECT" button
   - Start tracking your game! ⚾

## Quick Commands Reference

```bash
# See build status
eas build:list

# Build production APK
eas build --platform android --profile production

# Build preview APK (faster, for testing)
eas build --platform android --profile preview

# Check who you're logged in as
eas whoami

# View project details
eas project:info
```

## Troubleshooting

### "EAS project not configured"
Run `eas build:configure` first

### "Input is required, but stdin is not readable"
Run the command in a regular terminal (not in the IDE terminal)

### Build fails with "No Android credentials"
- EAS will automatically generate credentials
- Just follow the prompts, accept defaults

### Can't install APK on tablet
1. Go to Settings → Security
2. Enable "Unknown sources" or "Install unknown apps"
3. Allow installation from your file manager/browser

## What Gets Built?

Your production APK includes:
- ✅ All app code bundled
- ✅ No dev server needed
- ✅ Works offline with ESP32
- ✅ Optimized and minified
- ✅ Signed and ready to install
- ✅ Landscape orientation lock
- ✅ Full game state management
- ✅ Classic green scoreboard UI

## Cost

- **EAS Build is FREE** for open source projects
- You get 15 builds per month on the free tier
- More than enough for your needs!

## Need Help?

- Build logs: https://expo.dev/accounts/krdarroch/projects/BaseballApp/builds
- EAS Docs: https://docs.expo.dev/build/introduction/
- Support: https://forums.expo.dev/

---

## Alternative: Local Build (If you prefer)

If you want to build locally instead of using cloud builds:

```bash
# Install dependencies
npm install -g turtle-cli

# Build locally (takes longer, needs Java/Android SDK)
npx expo run:android --variant release
```

But **EAS Build is recommended** - it's faster and handles all the complexity!

