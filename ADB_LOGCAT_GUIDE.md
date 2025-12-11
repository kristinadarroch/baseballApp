# 📱 ADB Logcat Debugging Guide

Useful commands for debugging crashes and issues with your Android app.

## Quick Crash Detection

### See only crashes and fatal errors:
```bash
adb logcat *:E
```

### See crashes with stack traces:
```bash
adb logcat | grep -i "fatal\|exception\|crash\|error"
```

### Filter by your app's package name:
```bash
adb logcat | grep "com.krdarroch.baseballscoreboard"
```

## React Native / Expo Specific Filters

### See React Native errors:
```bash
adb logcat | grep -i "react\|jsengine\|hermes"
```

### See JavaScript errors:
```bash
adb logcat | grep -i "jsengine\|console\|error"
```

### See Metro bundler logs:
```bash
adb logcat | grep -i "metro\|bundler"
```

## Most Useful Commands

### 1. **Clear logcat and watch for new errors:**
```bash
adb logcat -c && adb logcat *:E
```
This clears old logs and shows only errors as they happen.

### 2. **Watch for crashes with context:**
```bash
adb logcat -v time | grep -E "FATAL|AndroidRuntime|Exception"
```
Shows timestamps and focuses on fatal errors.

### 3. **See everything from your app:**
```bash
adb logcat | grep "BaseballScoreboard\|baseballscoreboard"
```

### 4. **Save logs to file for analysis:**
```bash
adb logcat > crash_log.txt
```
Then press Ctrl+C when done, and analyze the file.

### 5. **Filter by log level (most verbose to least):**
```bash
# Verbose (everything)
adb logcat *:V

# Debug
adb logcat *:D

# Info
adb logcat *:I

# Warning
adb logcat *:W

# Error
adb logcat *:E

# Fatal
adb logcat *:F
```

## Common Crash Patterns to Look For

### 1. **Network/Connection Errors:**
```bash
adb logcat | grep -i "network\|connection\|http\|socket"
```

### 2. **Null Pointer Exceptions:**
```bash
adb logcat | grep -i "nullpointer\|npe"
```

### 3. **Out of Memory:**
```bash
adb logcat | grep -i "outofmemory\|oom"
```

### 4. **Permission Errors:**
```bash
adb logcat | grep -i "permission\|denied"
```

## Recommended Workflow

1. **Clear old logs:**
   ```bash
   adb logcat -c
   ```

2. **Start watching for errors:**
   ```bash
   adb logcat -v time *:E AndroidRuntime:E
   ```

3. **Reproduce the crash** on your device

4. **Look for:**
   - `FATAL EXCEPTION` - The main crash
   - Stack traces showing file names and line numbers
   - `Caused by:` - The root cause
   - Your app's package name in the stack trace

## Example Output to Look For

```
FATAL EXCEPTION: main
Process: com.krdarroch.baseballscoreboard, PID: 12345
java.lang.NullPointerException: Attempt to invoke virtual method...
    at com.krdarroch.baseballscoreboard.MainActivity.onCreate(MainActivity.java:42)
    ...
```

## Advanced: Filter Multiple Tags

```bash
# See errors AND warnings from specific components
adb logcat ReactNativeJS:E ReactNative:W AndroidRuntime:E *:S
```

The `*:S` at the end suppresses all other logs.

## Save Crash Log with Timestamp

```bash
adb logcat -v time > crash_$(date +%Y%m%d_%H%M%S).txt
```

## Tips

- **Use `-v time`** to see timestamps (helps correlate with user actions)
- **Use `-c`** to clear logs before reproducing the issue
- **Save logs to file** if the crash happens quickly
- **Look for patterns** - if the same error appears multiple times, that's likely the cause
- **Check React Native logs** - JavaScript errors might not show as "FATAL" but still cause crashes

## React Native Console Logs

If you're using `console.log()` in your app, you can see those too:

```bash
adb logcat | grep "ReactNativeJS"
```

Or if using Expo:
```bash
adb logcat | grep "ExpoModules"
```

