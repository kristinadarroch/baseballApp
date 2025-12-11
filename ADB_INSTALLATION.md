# 📱 Installing via ADB (Android Debug Bridge)

This guide shows you how to build and install the app directly on your Android device using ADB.

## Prerequisites

1. **ADB installed** - Usually comes with Android Studio, or install via:
   ```bash
   # macOS (using Homebrew)
   brew install android-platform-tools
   
   # Or download from: https://developer.android.com/studio/releases/platform-tools
   ```

2. **Device connected** - Connect your Android device via USB and enable USB debugging:
   - Go to Settings → About Phone
   - Tap "Build Number" 7 times to enable Developer Options
   - Go to Settings → Developer Options
   - Enable "USB Debugging"

3. **Verify connection**:
   ```bash
   adb devices
   ```
   You should see your device listed.

## Quick Install (Recommended)

### Debug Build (Faster, for testing)
```bash
npm run build:install:android:debug
```

### Release Build (Optimized, for production)
```bash
npm run build:install:android
```

## Step-by-Step Process

### Option 1: Build and Install in One Command

**Debug build:**
```bash
npm run build:install:android:debug
```

**Release build:**
```bash
npm run build:install:android
```

### Option 2: Build and Install Separately

**Step 1: Build the APK**

For debug build:
```bash
npm run build:android:local:debug
```

For release build:
```bash
npm run build:android:local
```

**Step 2: Install via ADB**

For debug APK:
```bash
npm run install:android:debug
```

For release APK:
```bash
npm run install:android
```

### Option 3: Manual Gradle Commands

If you prefer to run Gradle directly:

**Build debug APK:**
```bash
cd android
./gradlew assembleDebug
```

**Build release APK:**
```bash
cd android
./gradlew assembleRelease
```

**Install debug APK:**
```bash
adb install -r android/app/build/outputs/apk/debug/app-debug.apk
```

**Install release APK:**
```bash
adb install -r android/app/build/outputs/apk/release/app-release.apk
```

## APK Locations

After building, APKs are located at:
- **Debug:** `android/app/build/outputs/apk/debug/app-debug.apk`
- **Release:** `android/app/build/outputs/apk/release/app-release.apk`

## Troubleshooting

### "adb: command not found"
- Install Android Platform Tools (see Prerequisites above)
- Or add Android SDK platform-tools to your PATH

### "device not found" or "no devices/emulators found"
1. Check USB connection
2. Verify USB debugging is enabled on device
3. Run `adb devices` to see connected devices
4. On some devices, you may need to authorize the computer (check your device screen)

### "INSTALL_FAILED_UPDATE_INCOMPATIBLE"
- Uninstall the existing app first:
  ```bash
  adb uninstall com.krdarroch.baseballscoreboard
  ```
- Then install again

### "INSTALL_FAILED_INSUFFICIENT_STORAGE"
- Free up space on your device
- Or uninstall the existing app first

### Build fails with Gradle errors
- Make sure you have Java JDK installed
- Try cleaning the build:
  ```bash
  cd android
  ./gradlew clean
  ```

### "Permission denied" on gradlew
- Make gradlew executable:
  ```bash
  chmod +x android/gradlew
  ```

## Wireless ADB (Optional)

You can also install over WiFi:

1. **Connect via USB first:**
   ```bash
   adb tcpip 5555
   ```

2. **Find your device IP:**
   - Settings → About Phone → Status → IP Address
   - Or: `adb shell ip addr show wlan0`

3. **Connect wirelessly:**
   ```bash
   adb connect <device-ip>:5555
   ```

4. **Verify:**
   ```bash
   adb devices
   ```

5. **Now you can disconnect USB and install wirelessly:**
   ```bash
   npm run install:android
   ```

## Available Scripts

- `npm run build:android:local` - Build release APK locally
- `npm run build:android:local:debug` - Build debug APK locally
- `npm run install:android` - Install release APK via ADB
- `npm run install:android:debug` - Install debug APK via ADB
- `npm run build:install:android` - Build release APK and install
- `npm run build:install:android:debug` - Build debug APK and install

## Notes

- **Debug builds** are faster to build but larger and not optimized
- **Release builds** are optimized, smaller, and production-ready
- The `-r` flag in `adb install` replaces existing installations
- First installation may take longer as the app is being installed
- Subsequent installations are faster (updates)

