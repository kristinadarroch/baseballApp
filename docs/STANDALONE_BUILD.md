# 📱 Building Standalone App for Production

This guide explains how to build a standalone version of the Baseball Scoreboard app that works without the Expo development server.

## Why Build Standalone?

When using the ESP32C in Access Point mode (BaseballClicker WiFi), your device:
- ❌ Disconnects from regular WiFi
- ❌ Loses connection to Expo dev server
- ❌ Can't run the app in development mode

**Solution**: Build a standalone app that runs independently!

## Quick Build with EAS

### 1. Install EAS CLI
```bash
npm install -g eas-cli
```

### 2. Login to Expo
```bash
eas login
```

### 3. Configure Project
```bash
eas build:configure
```

### 4. Build for Android (Tablet)
```bash
# Development build (for testing)
eas build --platform android --profile development

# Production build (for final use)
eas build --platform android --profile production
```

### 5. Build for iOS (iPad)
```bash
# Development build
eas build --platform ios --profile development

# Production build
eas build --platform ios --profile production
```

### 6. Install on Device
- Download the APK/IPA from the EAS build page
- Transfer to your device and install
- Now it runs without the dev server!

## Alternative: Local Build

### Android APK (Local)
```bash
# Build APK locally
npx expo run:android --variant release

# Or use Expo Application Services
npx expo build:android
```

The APK will be generated and can be installed directly on your Android tablet.

### iOS IPA (Local - requires Mac + Xcode)
```bash
# Build for iOS
npx expo run:ios --configuration Release
```

## Development Workflow

### During Development
1. Connect device to **regular WiFi** (not BaseballClicker)
2. Run `npm start` and use Expo Go
3. Develop and test features

### For Testing with ESP32C
1. Build standalone app
2. Install on device
3. Connect to BaseballClicker WiFi
4. Use app with hardware

## Alternative: Development Build with Custom Dev Client

Create a development build that includes all native modules but still allows over-the-air updates:

```bash
# Install expo-dev-client
npx expo install expo-dev-client

# Build development version
eas build --profile development --platform android

# After installing, you can update JS without rebuilding
npx expo start --dev-client
```

This gives you the best of both worlds: native app performance with development flexibility.

## Configuration Files

The project needs `eas.json` for EAS builds. Create it:

```json
{
  "cli": {
    "version": ">= 13.2.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "android": {
        "gradleCommand": ":app:assembleDebug"
      },
      "ios": {
        "buildConfiguration": "Debug"
      }
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "android": {
        "buildType": "apk"
      }
    }
  },
  "submit": {
    "production": {}
  }
}
```

## Troubleshooting

### Build fails
- Make sure you're logged in: `eas login`
- Check your Expo account has proper permissions
- Verify project is properly configured

### Can't install APK
- Enable "Install from Unknown Sources" on Android
- Transfer APK via USB, email, or cloud storage

### App crashes on launch
- Check all dependencies are compatible
- Verify native modules are properly linked
- Test in development build first

## Summary

**Development**: Use regular WiFi + Expo Go  
**Production**: Build standalone app → Install → Connect to BaseballClicker WiFi ✅

The standalone app will work perfectly with your ESP32C without needing internet!

