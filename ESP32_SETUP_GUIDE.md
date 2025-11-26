# 📡 ESP32 WiFi Manager Setup Guide

## Overview

The WiFi Manager version (`ESP32_WIFI_MANAGER.ino`) is the **best solution for production** because it's completely dynamic - no hardcoded WiFi credentials needed!

---

## 🎯 How It Works

### **Smart Auto-Detection:**

```
Power On ESP32
    ↓
Has saved WiFi credentials?
    ↓
    ├─→ YES → Try to connect
    │         ↓
    │   Connected? 
    │   ├─→ YES → Station Mode (Use WiFi)
    │   └─→ NO  → AP Mode (Create BaseballClicker)
    │
    └─→ NO → AP Mode (Create BaseballClicker)
```

### **Three Operating Modes:**

1. **Station Mode** - Connected to your WiFi (automatic)
2. **AP Mode** - Creates BaseballClicker network (fallback)
3. **Config Mode** - Special mode to set WiFi credentials

---

## 🚀 Quick Start

### Step 1: Upload WiFi Manager Code

1. Open Arduino IDE
2. Load **`ESP32_WIFI_MANAGER.ino`**
3. Click **Upload** (no editing needed!)

### Step 2: First Time Setup

After uploading, ESP32 will start in **AP Mode** (no WiFi saved yet):

1. **Connect your phone/tablet to:**
   - Network: `BaseballClicker`
   - Password: `playball123`

2. **Open browser and go to:**
   ```
   http://192.168.4.1
   ```

3. **Click "Configure WiFi" button**

4. **Enter your WiFi credentials:**
   - WiFi Network Name (SSID)
   - WiFi Password
   - Click "Save & Connect"

5. **ESP32 reboots automatically**

### Step 3: Find ESP32's IP

After reboot, check Serial Monitor (115200 baud):

```
Attempting to connect to saved WiFi...
Connecting to: YourWiFi
.....
✓ Connected to saved WiFi
✓ IP address: 192.168.1.156    ← Copy this!
✓ Web server started!
✓ Baseball clicker ready!

Current Configuration:
Mode: Station (Connected to WiFi)
Connected to: YourWiFi
IP: 192.168.1.156
```

### Step 4: Configure App

1. Open Baseball Scoreboard app
2. Go to **Settings** tab
3. Enter the IP address (e.g., `192.168.1.156`)
4. Tap **Save**
5. Connect!

---

## ⚙️ Configuration Methods

### Method 1: Web Interface (Easy)

1. Connect to ESP32 (BaseballClicker WiFi or on same WiFi)
2. Browser → `http://192.168.4.1` (or ESP32's IP)
3. Click "Configure WiFi"
4. Enter credentials
5. Save & reboot

### Method 2: Config Mode (BOOT Button)

**How to enter Config Mode:**

1. **Power off ESP32**
2. **Hold BOOT button**
3. **Power on ESP32** (keep holding)
4. **Release BOOT button after 2 seconds**

Serial Monitor will show:
```
Config button pressed - entering config mode
====================================
⚙️  CONFIG MODE ACTIVE
====================================
1. Connect to WiFi: BaseballClicker-Config
2. Password: config123
3. Go to: http://192.168.4.1/config
4. Enter your WiFi credentials
====================================
```

Then follow the prompts!

---

## 🔄 Usage Scenarios

### Scenario 1: Development at Home/Office

**Setup once:**
1. Configure ESP32 with your WiFi
2. ESP32 gets IP (e.g., 192.168.1.156)
3. Set IP in app Settings
4. Develop normally with `npm start`

**Benefits:**
- ✅ Both devices on same WiFi
- ✅ Internet works
- ✅ Expo dev server works
- ✅ No network switching

---

### Scenario 2: Game at Different Fields

**Field A (has WiFi):**
1. Configure ESP32 with Field A WiFi
2. ESP32 connects automatically
3. Update IP in app Settings if needed
4. Done!

**Field B (no WiFi):**
1. ESP32 tries to connect, fails
2. Automatically switches to AP mode
3. Creates "BaseballClicker" network
4. App uses 192.168.4.1 (default)
5. Done!

**Benefits:**
- ✅ Works everywhere
- ✅ Automatic fallback
- ✅ One firmware

---

### Scenario 3: Multiple Operators

**Give to different users:**
1. Each configures for their WiFi
2. ESP32 remembers last setting
3. Automatically uses AP mode if WiFi not available

**Benefits:**
- ✅ No code changes
- ✅ User-configurable
- ✅ Portable

---

## 🎮 Operation Modes Explained

### 🔵 Station Mode (WiFi Connected)

**When:** ESP32 successfully connects to configured WiFi

**Access at:**
- IP assigned by router (e.g., 192.168.1.156)
- Check Serial Monitor for IP

**Best for:**
- Development
- Facilities with WiFi
- Internet access needed

**App Setup:**
- Configure IP in Settings
- Both on same WiFi

---

### 🟢 AP Mode (Access Point)

**When:** 
- No WiFi configured
- Failed to connect to configured WiFi

**Access at:**
- Fixed IP: `192.168.4.1`
- Network: `BaseballClicker`
- Password: `playball123`

**Best for:**
- Outdoor fields
- No WiFi available
- Standalone operation

**App Setup:**
- Use default IP (192.168.4.1)
- Connect to BaseballClicker

---

### 🟡 Config Mode

**When:** BOOT button pressed at startup

**Access at:**
- IP: `192.168.4.1`
- Network: `BaseballClicker-Config`
- Password: `config123`

**Purpose:**
- Configure WiFi credentials
- Change saved WiFi
- Reset settings

---

## 🔧 Management

### View Current Configuration

**Via Web:**
1. Connect to ESP32
2. Go to `http://192.168.4.1` (or ESP32's IP)
3. See current mode and settings

**Via Serial Monitor:**
- Shows mode on startup
- Shows IP address
- Shows connection status

---

### Change WiFi Settings

**Option 1: Via Web (Easiest)**
1. Access ESP32 web interface
2. Click "Configure WiFi"
3. Enter new credentials
4. Save & reboot

**Option 2: BOOT Button**
1. Enter Config Mode (hold BOOT at startup)
2. Follow on-screen instructions

---

### Reset WiFi Settings

**Via Web:**
1. Go to `http://192.168.4.1`
2. Click "Reset WiFi" button
3. Confirm
4. ESP32 reboots to AP mode

**Via BOOT Button:**
- Access Config Mode
- Navigate to config page
- Reset from there

---

## 📱 App Configuration

### Dynamic IP Setup

1. **Open app → Settings tab**
2. **See "ESP32 Configuration" section**
3. **Two presets available:**
   - Production: 192.168.4.1 (AP mode)
   - Development: Custom IP (Station mode)

4. **Enter ESP32's IP:**
   - Check Serial Monitor for current IP
   - Or check web interface home page
   - Update in app Settings

5. **Save and connect!**

---

## 🎓 Best Practices

### For Development:

1. **Configure ESP32 once with your WiFi**
2. **Set static IP in router** (optional but recommended)
3. **Save IP in app Settings**
4. **Develop freely - no reconfiguration needed**

### For Production:

1. **Use WiFi Manager firmware**
2. **Configure on-site if WiFi available**
3. **Automatic AP fallback for no-WiFi situations**
4. **Each user can configure for their environment**

### For Multiple Locations:

1. **One firmware works everywhere**
2. **Reconfigure on-site when needed**
3. **AP mode fallback ensures it always works**
4. **Update app Settings with new IP**

---

## 🆘 Troubleshooting

### ESP32 Won't Connect to WiFi

**Check:**
- [ ] WiFi name is exactly correct (case-sensitive)
- [ ] WiFi password is correct
- [ ] WiFi is 2.4GHz (not 5GHz)
- [ ] WiFi is in range
- [ ] WiFi is not hidden network

**Solution:**
- Access config mode
- Re-enter credentials
- Try different WiFi if available

---

### Can't Access ESP32

**If in AP mode:**
- Connect to "BaseballClicker" WiFi first
- Then go to 192.168.4.1

**If in Station mode:**
- Check Serial Monitor for current IP
- Make sure you're on same WiFi
- Try pinging the IP first

---

### ESP32 Keeps Switching Modes

**Cause:** WiFi connection is unstable

**Fix:**
- Check WiFi signal strength
- Move ESP32 closer to router
- Use AP mode instead
- Set static IP in router

---

### Forgot WiFi Settings

**Solution:**
- Enter Config Mode (BOOT button)
- Access config page
- Reset WiFi settings
- Reconfigure

---

## 📊 Comparison

| Feature | WiFi Manager | AP Only | Station Only |
|---------|-------------|---------|--------------|
| **No Code Changes** | ✅ | ✅ | ❌ |
| **Works Everywhere** | ✅ | ✅ | ❌ |
| **Internet Access** | ✅ (Station) | ❌ | ✅ |
| **Expo Development** | ✅ | ❌ | ✅ |
| **User Configurable** | ✅ | ❌ | ❌ |
| **Production Ready** | ✅ | ✅ | ❌ |
| **Setup Complexity** | Medium | Easy | Hard |

**Winner for Production:** WiFi Manager ⭐

---

## ✅ Quick Reference

### Default Credentials:

**AP Mode:**
- Network: `BaseballClicker`
- Password: `playball123`
- IP: `192.168.4.1`

**Config Mode:**
- Network: `BaseballClicker-Config`
- Password: `config123`
- IP: `192.168.4.1`

**Station Mode:**
- IP: Check Serial Monitor
- Assigned by your router

---

## 🚀 You're All Set!

With WiFi Manager, you have:
- ✅ One firmware for all scenarios
- ✅ User-configurable via web
- ✅ Automatic mode selection
- ✅ Fallback to AP mode
- ✅ Production-ready solution

Upload the WiFi Manager firmware and you'll never need to change ESP32 code again!

