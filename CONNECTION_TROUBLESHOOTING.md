# 🔧 Connection Troubleshooting Guide

## "CONNECTION FAILED" Error

If you see "CONNECTION FAILED - Check WiFi: BaseballClicker", follow these steps:

---

## ✅ Step-by-Step Checklist

### 1. **Check ESP32 is Powered On**

- [ ] ESP32 device is plugged in and has power
- [ ] Look for LED lights on ESP32 (should be on)
- [ ] If using USB power, try a different cable/power source

**Fix:** Power on the ESP32

---

### 2. **Verify WiFi Connection**

#### On iOS:
```
Settings → WiFi → Look for "BaseballClicker"
```

#### On Android:
```
Settings → Network & Internet → WiFi → Look for "BaseballClicker"
```

**What you should see:**
- ✅ "BaseballClicker" network listed
- ✅ Connected with checkmark/indicator
- ✅ No internet icon (this is expected)

**If BaseballClicker WiFi is not listed:**
- ESP32 might not be in Access Point mode
- ESP32 might not be running
- ESP32 code might not be uploaded
- Check Serial Monitor (see Step 5)

---

### 3. **Check IP Address Configuration**

The app shows "Connecting to: X.X.X.X" on the connection screen.

#### **For Access Point Mode (Production):**
Should show: `192.168.4.1`

**If it shows something else:**
1. Open the app
2. Go to **Settings** tab (gear icon)
3. Tap **"Reset to Default"**
4. Tap **"Save"**
5. Go back to connection screen
6. Try connecting again

#### **For Station Mode (Development):**
Should show your ESP32's actual IP (e.g., `192.168.1.156`)

**To verify:**
1. Open Arduino IDE
2. Connect ESP32 via USB
3. Open Serial Monitor (Tools → Serial Monitor, 115200 baud)
4. Look for: `✓ IP address: 192.168.1.156`
5. Make sure this matches the app's Settings

---

### 4. **Test ESP32 Directly**

#### Using a Web Browser:

1. **Connect to BaseballClicker WiFi** (or your WiFi if Station Mode)
2. **Open browser** (Safari, Chrome, etc.)
3. **Go to:** `http://192.168.4.1` (or your ESP32's IP)
4. **You should see:**
   ```
   Baseball Clicker
   
   Balls:
   Ball 1: Unpressed
   Ball 2: Unpressed
   ...
   ```

**If the browser works but the app doesn't:**
- IP address might be wrong in app
- Check Settings and update IP
- Try restarting the app

**If the browser doesn't work either:**
- ESP32 web server not running
- Check Serial Monitor for errors
- Verify ESP32 code is uploaded
- Try re-uploading ESP32 code

---

### 5. **Check ESP32 Serial Monitor**

Connect ESP32 to computer via USB:

1. **Open Arduino IDE**
2. **Tools → Serial Monitor**
3. **Set baud rate to: 115200**

#### **What you should see (Access Point Mode):**
```
Access Point IP address: 192.168.4.1
Web server started!
Baseball clicker ready!
```

#### **What you should see (Station Mode):**
```
Connecting to: YourWiFi
...
✓ WiFi connected!
✓ IP address: 192.168.1.156
✓ Web server started!
✓ Baseball clicker ready!
```

#### **If you see errors:**
```
✗ WiFi connection failed!
```
**Fix for Station Mode:**
- Check WiFi name and password in ESP32 code
- Make sure WiFi is 2.4GHz (ESP32 doesn't support 5GHz)
- WiFi password might be incorrect

---

### 6. **Network Diagnostics**

#### **Check if ESP32 is reachable:**

On Mac/Linux:
```bash
ping 192.168.4.1
```

On Windows:
```bash
ping 192.168.4.1
```

**Expected result:**
```
64 bytes from 192.168.4.1: icmp_seq=0 ttl=255 time=5.123 ms
64 bytes from 192.168.4.1: icmp_seq=1 ttl=255 time=3.456 ms
```

**If "Request timeout" or "Destination unreachable":**
- Not connected to correct WiFi
- ESP32 not powered on
- IP address is incorrect
- ESP32 is in different mode than expected

---

### 7. **Check App Configuration**

1. **Open Baseball Scoreboard app**
2. **Go to Settings tab** (gear icon)
3. **Verify IP address:**
   - Production/AP Mode: `192.168.4.1`
   - Development/Station Mode: Your ESP32's actual IP

4. **If wrong, update it:**
   - Enter correct IP
   - Tap "Save"
   - Go back to connection screen
   - Try again

---

## 🔄 Common Scenarios

### Scenario 1: "Worked yesterday, not working today"

**Possible causes:**
- ESP32 not powered on
- Forgot to connect to BaseballClicker WiFi
- ESP32 IP changed (Station Mode only)

**Quick fix:**
1. Power on ESP32
2. Connect to BaseballClicker WiFi
3. Open app and tap Connect

---

### Scenario 2: "Using Station Mode for development"

**If connection fails:**
1. Check Serial Monitor for ESP32's current IP
2. Update IP in app Settings
3. Make sure tablet is on same WiFi as ESP32
4. Try connecting again

**If ESP32 IP keeps changing:**
- Set static IP in your router
- Or set static IP in ESP32 code (see docs)
- Or use mDNS (baseballclicker.local)

---

### Scenario 3: "Switching between modes"

**Going from Development → Production:**
1. Upload Access Point code to ESP32
2. Reset IP to 192.168.4.1 in app Settings
3. Connect to BaseballClicker WiFi
4. Connect in app

**Going from Production → Development:**
1. Upload Station Mode code to ESP32
2. Check Serial Monitor for new IP
3. Update IP in app Settings
4. Stay on your regular WiFi
5. Connect in app

---

## 🛠️ Advanced Troubleshooting

### ESP32 Not Creating Access Point

**Check ESP32 code:**
```cpp
// Should have:
WiFi.softAP("BaseballClicker", "playball123");

// NOT:
WiFi.begin(ssid, password);  // This is Station Mode!
```

**Solution:**
- Upload correct code (Access Point or Station)
- Check which mode you need

---

### Can't Upload Code to ESP32

**Try:**
1. Hold BOOT button while uploading
2. Select correct COM port (Tools → Port)
3. Select correct board (ESP32C3 Dev Module)
4. Try different USB cable
5. Try different USB port

---

### App Shows Wrong IP

**Fix:**
1. Go to Settings in app
2. Correct the IP address
3. Tap Save
4. Connection should work now

---

### Browser Works, App Doesn't

**Possible cause:** CORS or fetch issue

**Check:**
1. ESP32 code has CORS headers (if Station Mode)
2. Try restarting the app
3. Check if IP in Settings matches browser IP
4. Try disconnecting and reconnecting

---

## 📱 Platform-Specific Issues

### iOS

**"No Internet" warning:**
- This is NORMAL when connected to BaseballClicker
- iOS will warn you, but the app will work
- Tap "Use Without Internet" or ignore warning

**Keeps switching back to regular WiFi:**
- Go to Settings → WiFi
- Tap (i) next to BaseballClicker
- Turn OFF "Auto-Join"
- Manually join when needed

### Android

**"Connected without internet":**
- This is NORMAL for BaseballClicker
- Android might ask to keep connection
- Tap "Yes" or "Keep connection"

**WiFi keeps disconnecting:**
- Disable "Switch to mobile data" in WiFi settings
- Some Androids aggressively switch networks

---

## 🎯 Quick Diagnostic

Run through this **1-minute check:**

1. ✅ ESP32 powered on?
2. ✅ Connected to BaseballClicker WiFi?
3. ✅ Can open `http://192.168.4.1` in browser?
4. ✅ App Settings shows correct IP?
5. ✅ Serial Monitor shows "ready"?

**All yes?** → Connection should work!

**Any no?** → Fix that step first!

---

## 💡 Still Not Working?

### Last Resort Checklist:

1. **Restart ESP32** (unplug and replug)
2. **Restart tablet/phone** (power off and on)
3. **Forget and rejoin BaseballClicker WiFi**
4. **Close and reopen app**
5. **Reset IP to default in Settings**
6. **Re-upload ESP32 code**
7. **Try browser test first**

---

## 📞 Getting Help

### Information to provide:

1. **What IP address does the app show?**
   - Check connection screen: "Connecting to: X.X.X.X"

2. **What mode is ESP32 in?**
   - Access Point (creates BaseballClicker WiFi)
   - Station Mode (joins your WiFi)

3. **What does Serial Monitor show?**
   - Copy/paste the output

4. **Can you access ESP32 in a browser?**
   - Yes/No
   - If yes, what IP did you use?

5. **What device are you using?**
   - iPhone/iPad, Android phone/tablet
   - iOS version or Android version

6. **Are you connected to BaseballClicker WiFi?**
   - Check WiFi settings

---

## ✅ Success!

Once connected, you should see:
- ✅ Connection screen disappears
- ✅ Scoreboard screen appears
- ✅ Green classic scoreboard UI
- ✅ Real-time updates when buttons pressed

**Enjoy tracking your game!** ⚾🎯

---

## 📚 Related Documentation

- [Unified Solution Guide](UNIFIED_SOLUTION.md) - Development & production setup
- [Settings Screen Guide](UNIFIED_SOLUTION.md#-using-the-settings-screen) - How to configure IP
- [ESP32 Station Mode](ESP32_QUICK_STATION_MODE.ino) - Development code
- [WiFi Solutions](WIFI_SOLUTIONS.md) - All connectivity options

