# 📡 ESP32 WiFi Station Mode

Convert your ESP32 from Access Point mode to Station mode so both your tablet and ESP32 can be on the same WiFi network.

## Problem

**Current Setup (Access Point Mode):**
- ESP32 creates "BaseballClicker" WiFi network
- Tablet connects to "BaseballClicker"
- ❌ Tablet loses internet connection
- ❌ Can't run Expo dev server
- ❌ Single device must choose one network

## Solution: Station Mode

**New Setup (Station Mode):**
- ESP32 joins YOUR existing WiFi network
- Tablet stays on YOUR WiFi network
- ✅ Both devices on same network
- ✅ Tablet has internet
- ✅ Can run Expo dev server
- ✅ ESP32 still accessible

## ESP32 Code Changes

### Modified Arduino Code

Replace your current ESP32 code with this:

```cpp
#include <WiFi.h>
#include <WebServer.h>

// Station mode - Connect to YOUR WiFi
const char* ssid = "YOUR_WIFI_NAME";        // Change this!
const char* password = "YOUR_WIFI_PASSWORD"; // Change this!

// Pin assignments (same as before)
const int ballPins[4]   = {20, 8, 9, 10};
const int strikePins[3] = {5, 6, 7};
const int outPins[3]    = {2, 3, 4};
const int runPin        = 21;

WebServer server(80);

void handleRoot() {
  String html = "<h1>Baseball Clicker</h1>";
  html += "<p>Balls:</p>";
  for (int i = 0; i < 4; i++) {
    html += "Ball " + String(i+1) + ": " + String(digitalRead(ballPins[i]) == LOW ? "Pressed" : "Unpressed") + "<br>";
  }
  html += "<p>Strikes:</p>";
  for (int i = 0; i < 3; i++) {
    html += "Strike " + String(i+1) + ": " + String(digitalRead(strikePins[i]) == LOW ? "Pressed" : "Unpressed") + "<br>";
  }
  html += "<p>Outs:</p>";
  for (int i = 0; i < 3; i++) {
    html += "Out " + String(i+1) + ": " + String(digitalRead(outPins[i]) == LOW ? "Pressed" : "Unpressed") + "<br>";
  }
  html += "<p>Runs:</p>";
  html += "Run: " + String(digitalRead(runPin) == LOW ? "Pressed" : "Unpressed") + "<br>";
  server.send(200, "text/html", html);
}

void handleStatus() {
  Serial.println("Status endpoint accessed");
  String json = "{\"balls\":[";
  for (int i = 0; i < 4; i++) {
    json += String(digitalRead(ballPins[i]) == LOW ? 1 : 0);
    if (i < 3) json += ",";
  }
  json += "],\"strikes\":[";
  for (int i = 0; i < 3; i++) {
    json += String(digitalRead(strikePins[i]) == LOW ? 1 : 0);
    if (i < 2) json += ",";
  }
  json += "],\"outs\":[";
  for (int i = 0; i < 3; i++) {
    json += String(digitalRead(outPins[i]) == LOW ? 1 : 0);
    if (i < 2) json += ",";
  }
  json += "],\"run\":" + String(digitalRead(runPin) == LOW ? 1 : 0);
  json += "}";
  
  // Add CORS headers for web access
  server.sendHeader("Access-Control-Allow-Origin", "*");
  server.sendHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  server.sendHeader("Access-Control-Allow-Headers", "Content-Type");
  server.send(200, "application/json", json);
}

void handleOptions() {
  // Handle CORS preflight
  server.sendHeader("Access-Control-Allow-Origin", "*");
  server.sendHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  server.sendHeader("Access-Control-Allow-Headers", "Content-Type");
  server.send(204);
}

void setup() {
  Serial.begin(115200);
  
  // Connect to existing WiFi network (Station mode)
  Serial.print("Connecting to WiFi: ");
  Serial.println(ssid);
  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);
  
  // Wait for connection
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    Serial.print(".");
    attempts++;
  }
  
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("");
    Serial.println("WiFi connected!");
    Serial.print("IP address: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println("");
    Serial.println("WiFi connection failed!");
  }

  server.on("/", handleRoot);
  server.on("/status", HTTP_GET, handleStatus);
  server.on("/status", HTTP_OPTIONS, handleOptions);
  server.begin();
  Serial.println("Web server started!");

  for (int i = 0; i < 4; i++) pinMode(ballPins[i], INPUT_PULLUP);
  for (int i = 0; i < 3; i++) pinMode(strikePins[i], INPUT_PULLUP);
  for (int i = 0; i < 3; i++) pinMode(outPins[i], INPUT_PULLUP);
  pinMode(runPin, INPUT_PULLUP);

  Serial.println("Baseball clicker ready!");
}

void loop() {
  server.handleClient();
}
```

### Key Changes

1. **Changed from AP mode to Station mode:**
   ```cpp
   // OLD: WiFi.softAP(apSSID, apPassword);
   // NEW: WiFi.begin(ssid, password);
   ```

2. **Added CORS headers** (important for web requests from app)

3. **Added connection status checking**

4. **IP address is now assigned by your router** (not fixed 192.168.4.1)

## Update Your App

After changing ESP32 to Station mode, you need to update the app to use the new IP address.

### Step 1: Find ESP32 IP Address

Upload the new code to ESP32 and check Serial Monitor. It will show something like:
```
WiFi connected!
IP address: 192.168.1.156
```

### Step 2: Update App Configuration

Edit `contexts/ConnectionContext.tsx`:

```typescript
// OLD:
const ESP32_IP = '192.168.4.1';

// NEW (use YOUR ESP32's IP):
const ESP32_IP = '192.168.1.156'; // ← Your ESP32's actual IP
```

**Or make it configurable:**

Create a settings screen where users can enter the ESP32 IP address instead of hardcoding it.

## Quick Config Script

Create a `.env` file (not committed to git) to store the IP:

```bash
# .env
ESP32_IP=192.168.1.156
```

Then update the code to read from environment:

```typescript
const ESP32_IP = process.env.ESP32_IP || '192.168.1.156';
```

## Benefits of Station Mode

✅ **Tablet keeps internet** - Development server works  
✅ **Both on same network** - No switching needed  
✅ **Better range** - Uses your WiFi router  
✅ **Multiple devices** - Multiple tablets can connect  
✅ **Simpler workflow** - No WiFi switching for operators  

## Drawbacks

❌ **Requires WiFi router** - Can't use in field without WiFi  
❌ **IP may change** - If ESP32 reboots, might get new IP (solution: static IP)  
❌ **Network dependent** - Relies on existing WiFi  

## Hybrid Solution: mDNS

Use mDNS so you can access ESP32 by name instead of IP:

```cpp
#include <ESPmDNS.h>

// In setup() after WiFi connects:
if (MDNS.begin("baseballclicker")) {
  Serial.println("mDNS responder started");
  Serial.println("Access at: http://baseballclicker.local");
}
```

Then in your app:
```typescript
const ESP32_IP = 'baseballclicker.local';
```

No more IP address management!

## Static IP for ESP32

To prevent IP from changing, set a static IP in ESP32 code:

```cpp
// After WiFi.begin():
IPAddress local_IP(192, 168, 1, 100);  // Choose an IP
IPAddress gateway(192, 168, 1, 1);     // Your router
IPAddress subnet(255, 255, 255, 0);
IPAddress primaryDNS(8, 8, 8, 8);
IPAddress secondaryDNS(8, 8, 4, 4);

if (!WiFi.config(local_IP, gateway, subnet, primaryDNS, secondaryDNS)) {
  Serial.println("STA Failed to configure");
}
```

## Recommendation

**For Field Use (No WiFi Available):**
- Keep Access Point mode
- Build standalone app (see STANDALONE_BUILD.md)
- Install APK on tablet

**For Facility/Field with WiFi:**
- Switch to Station mode
- Use mDNS for easy access
- Can still develop with Expo

**Best of Both Worlds:**
Make ESP32 code have a **config mode** that lets you choose AP or Station mode with a button press or config file.

