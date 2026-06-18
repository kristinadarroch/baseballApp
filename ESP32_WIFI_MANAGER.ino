// Baseball Clicker - WiFi Manager Version
// Automatically switches between AP and Station modes
// Configure WiFi via web interface

#include <WiFi.h>
#include <WebServer.h>
#include <Preferences.h>

// Pin assignments
const int ballPins[4]   = {20, 8, 9, 10};
const int strikePins[3] = {5, 6, 7};
const int outPins[3]    = {3, 2, 4};
const int runPin        = 21;
const int configButton  = 0; // BOOT button for config mode

// Access Point credentials (fallback mode)
const char* apSSID = "BaseballClicker";
const char* apPassword = "playball123";

// Storage for WiFi credentials
Preferences preferences;
String savedSSID = "";
String savedPassword = "";

WebServer server(80);

// WiFi mode flags
bool isAPMode = false;
bool isConfigMode = false;

// Stable counts (debounced - what we report)
int stableBalls   = 0;
int stableStrikes = 0;
int stableOuts    = 0;
int stableRun     = 0;

// Previous sample for debouncing
int lastSampleBalls   = -1;
int lastSampleStrikes = -1;
int lastSampleOuts    = -1;
int lastSampleRun     = -1;
bool lastSampleValid  = false;

void setup() {
  Serial.begin(115200);
  
  // Setup pins
  for (int i = 0; i < 4; i++) pinMode(ballPins[i], INPUT_PULLUP);
  for (int i = 0; i < 3; i++) pinMode(strikePins[i], INPUT_PULLUP);
  for (int i = 0; i < 3; i++) pinMode(outPins[i], INPUT_PULLUP);
  pinMode(runPin, INPUT_PULLUP);
  pinMode(configButton, INPUT_PULLUP);
  
  // Load saved WiFi credentials
  preferences.begin("wifi", false);
  savedSSID = preferences.getString("ssid", "");
  savedPassword = preferences.getString("password", "");
  preferences.end();
  
  // Check if config button is pressed at startup
  if (digitalRead(configButton) == LOW) {
    Serial.println("Config button pressed - entering config mode");
    startConfigMode();
  } else if (savedSSID.length() > 0) {
    // Try to connect to saved WiFi
    Serial.println("Attempting to connect to saved WiFi...");
    if (connectToWiFi(savedSSID.c_str(), savedPassword.c_str())) {
      Serial.println("✓ Connected to saved WiFi");
      isAPMode = false;
    } else {
      Serial.println("✗ Failed to connect, starting AP mode");
      startAPMode();
    }
  } else {
    // No saved credentials, start in AP mode
    Serial.println("No saved WiFi, starting AP mode");
    startAPMode();
  }
  
  // Setup web server routes
  server.on("/", handleRoot);
  server.on("/status", HTTP_GET, handleStatus);
  server.on("/status", HTTP_OPTIONS, handleOptions);
  server.on("/config", HTTP_GET, handleConfigPage);
  server.on("/save", HTTP_POST, handleSaveConfig);
  server.on("/reset", HTTP_GET, handleReset);
  server.begin();
  
  Serial.println("✓ Web server started!");
  Serial.println("✓ Baseball clicker ready!");
  Serial.println("====================================");
  printCurrentMode();
}

bool connectToWiFi(const char* ssid, const char* password) {
  Serial.print("Connecting to: ");
  Serial.println(ssid);
  
  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);
  
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 30) {
    delay(500);
    Serial.print(".");
    attempts++;
  }
  Serial.println();
  
  if (WiFi.status() == WL_CONNECTED) {
    Serial.print("✓ IP address: ");
    Serial.println(WiFi.localIP());
    return true;
  }
  return false;
}

void startAPMode() {
  WiFi.mode(WIFI_AP);
  WiFi.softAP(apSSID, apPassword);
  isAPMode = true;
  Serial.println("✓ Access Point started");
  Serial.print("✓ AP IP address: ");
  Serial.println(WiFi.softAPIP());
  Serial.println("✓ SSID: BaseballClicker");
}

void startConfigMode() {
  WiFi.mode(WIFI_AP);
  WiFi.softAP("BaseballClicker-Config", "config123");
  isConfigMode = true;
  isAPMode = true;
  Serial.println("====================================");
  Serial.println("⚙️  CONFIG MODE ACTIVE");
  Serial.println("====================================");
  Serial.println("1. Connect to WiFi: BaseballClicker-Config");
  Serial.println("2. Password: config123");
  Serial.println("3. Go to: http://192.168.4.1/config");
  Serial.println("4. Enter your WiFi credentials");
  Serial.println("====================================");
}

void printCurrentMode() {
  Serial.println("\nCurrent Configuration:");
  if (isConfigMode) {
    Serial.println("Mode: CONFIG MODE");
    Serial.println("Connect to: BaseballClicker-Config");
    Serial.println("Configure at: http://192.168.4.1/config");
  } else if (isAPMode) {
    Serial.println("Mode: Access Point");
    Serial.println("SSID: BaseballClicker");
    Serial.print("IP: ");
    Serial.println(WiFi.softAPIP());
  } else {
    Serial.println("Mode: Station (Connected to WiFi)");
    Serial.print("Connected to: ");
    Serial.println(WiFi.SSID());
    Serial.print("IP: ");
    Serial.println(WiFi.localIP());
  }
  Serial.println();
}

void handleRoot() {
  String html = "<html><head>";
  html += "<meta name='viewport' content='width=device-width, initial-scale=1'>";
  html += "<style>body{font-family:Arial;margin:20px;background:#2d6945;color:white;}";
  html += "h1{border-bottom:3px solid white;padding-bottom:10px;}";
  html += ".info{background:#1a4029;padding:15px;margin:10px 0;border-radius:5px;}";
  html += ".button{background:white;color:#2d6945;padding:10px 20px;border:none;";
  html += "border-radius:5px;cursor:pointer;font-weight:bold;margin:5px;}";
  html += ".button:hover{background:#eee;}</style></head><body>";
  
  html += "<h1>⚾ Baseball Clicker</h1>";
  
  // Show current mode
  html += "<div class='info'><h3>📡 Current Mode</h3>";
  if (isConfigMode) {
    html += "<p><strong>CONFIG MODE</strong></p>";
    html += "<p>Ready to configure WiFi credentials</p>";
  } else if (isAPMode) {
    html += "<p><strong>Access Point Mode</strong></p>";
    html += "<p>IP: " + WiFi.softAPIP().toString() + "</p>";
  } else {
    html += "<p><strong>Station Mode</strong></p>";
    html += "<p>Connected to: " + WiFi.SSID() + "</p>";
    html += "<p>IP: " + WiFi.localIP().toString() + "</p>";
  }
  html += "</div>";
  
  // Show button states
  html += "<div class='info'><h3>🎮 Button States</h3>";
  html += "<p><strong>Balls:</strong> ";
  for (int i = 0; i < 4; i++) {
    html += String(i+1) + "=" + (digitalRead(ballPins[i]) == LOW ? "ON" : "OFF") + " ";
  }
  html += "</p><p><strong>Strikes:</strong> ";
  for (int i = 0; i < 3; i++) {
    html += String(i+1) + "=" + (digitalRead(strikePins[i]) == LOW ? "ON" : "OFF") + " ";
  }
  html += "</p><p><strong>Outs:</strong> ";
  for (int i = 0; i < 3; i++) {
    html += String(i+1) + "=" + (digitalRead(outPins[i]) == LOW ? "ON" : "OFF") + " ";
  }
  html += "</p><p><strong>Run:</strong> ";
  html += String(digitalRead(runPin) == LOW ? "ON" : "OFF");
  html += "</p></div>";
  
  // Configuration buttons
  html += "<div class='info'><h3>⚙️ Configuration</h3>";
  html += "<button class='button' onclick=\"location.href='/config'\">Configure WiFi</button>";
  html += "<button class='button' onclick=\"if(confirm('Reset WiFi config?'))location.href='/reset'\">Reset WiFi</button>";
  html += "</div>";
  
  html += "<p style='text-align:center;opacity:0.7;'>Press BOOT button at startup for config mode</p>";
  html += "</body></html>";
  
  server.send(200, "text/html", html);
}

void handleConfigPage() {
  String html = "<html><head>";
  html += "<meta name='viewport' content='width=device-width, initial-scale=1'>";
  html += "<style>body{font-family:Arial;margin:20px;background:#2d6945;color:white;}";
  html += "input,button{padding:10px;margin:10px 0;width:100%;max-width:300px;font-size:16px;}";
  html += "button{background:white;color:#2d6945;border:none;font-weight:bold;cursor:pointer;}";
  html += "button:hover{background:#eee;}</style></head><body>";
  
  html += "<h1>⚙️ WiFi Configuration</h1>";
  
  if (savedSSID.length() > 0) {
    html += "<p>Current: <strong>" + savedSSID + "</strong></p>";
  }
  
  html += "<form action='/save' method='POST'>";
  html += "<p><label>WiFi Network Name (SSID):</label><br>";
  html += "<input type='text' name='ssid' value='" + savedSSID + "' required></p>";
  html += "<p><label>WiFi Password:</label><br>";
  html += "<input type='password' name='password' value='" + savedPassword + "'></p>";
  html += "<button type='submit'>Save & Connect</button>";
  html += "</form>";
  
  html += "<p><a href='/' style='color:white;'>Back to Home</a></p>";
  html += "<p style='opacity:0.7;'><small>Note: ESP32 will reboot after saving</small></p>";
  html += "</body></html>";
  
  server.send(200, "text/html", html);
}

void handleSaveConfig() {
  if (server.hasArg("ssid") && server.hasArg("password")) {
    String newSSID = server.arg("ssid");
    String newPassword = server.arg("password");
    
    // Save to preferences
    preferences.begin("wifi", false);
    preferences.putString("ssid", newSSID);
    preferences.putString("password", newPassword);
    preferences.end();
    
    String html = "<html><head><meta name='viewport' content='width=device-width, initial-scale=1'>";
    html += "<style>body{font-family:Arial;margin:20px;background:#2d6945;color:white;text-align:center;}</style></head><body>";
    html += "<h1>✓ Saved!</h1>";
    html += "<p>WiFi credentials saved.</p>";
    html += "<p>Rebooting in 3 seconds...</p>";
    html += "<script>setTimeout(function(){window.location.href='/';},3000);</script>";
    html += "</body></html>";
    
    server.send(200, "text/html", html);
    
    Serial.println("✓ WiFi credentials saved");
    Serial.println("✓ Rebooting...");
    delay(3000);
    ESP.restart();
  } else {
    server.send(400, "text/plain", "Missing parameters");
  }
}

void handleReset() {
  preferences.begin("wifi", false);
  preferences.clear();
  preferences.end();
  
  String html = "<html><head><meta name='viewport' content='width=device-width, initial-scale=1'>";
  html += "<style>body{font-family:Arial;margin:20px;background:#2d6945;color:white;text-align:center;}</style></head><body>";
  html += "<h1>✓ Reset Complete</h1>";
  html += "<p>WiFi credentials cleared.</p>";
  html += "<p>Will start in AP mode on reboot.</p>";
  html += "<p>Rebooting in 3 seconds...</p>";
  html += "</body></html>";
  
  server.send(200, "text/html", html);
  
  Serial.println("✓ WiFi credentials cleared");
  Serial.println("✓ Rebooting...");
  delay(3000);
  ESP.restart();
}

// Read a group of pins and return count (highest pressed index + 1)
int readGroupCount(const int *pins, int length) {
  int count = 0;
  for (int i = 0; i < length; i++) {
    if (digitalRead(pins[i]) == LOW) {  // LOW = pressed (INPUT_PULLUP)
      count = i + 1;
    }
  }
  return count;
}

void handleStatus() {
  // Position-based arrays: count=2 means [0,1,0,0] (only active position is 1)
  String json = "{\"balls\":[";
  for (int i = 0; i < 4; i++) {
    json += String(((i + 1) == stableBalls) ? 1 : 0);
    if (i < 3) json += ",";
  }
  json += "],\"strikes\":[";
  for (int i = 0; i < 3; i++) {
    json += String(((i + 1) == stableStrikes) ? 1 : 0);
    if (i < 2) json += ",";
  }
  json += "],\"outs\":[";
  for (int i = 0; i < 3; i++) {
    json += String(((i + 1) == stableOuts) ? 1 : 0);
    if (i < 2) json += ",";
  }
  json += "],\"run\":" + String(stableRun);
  json += "}";
  
  server.sendHeader("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0");
  server.sendHeader("Pragma", "no-cache");
  server.sendHeader("Expires", "0");
  server.sendHeader("Access-Control-Allow-Origin", "*");
  server.sendHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  server.sendHeader("Access-Control-Allow-Headers", "Content-Type");
  server.send(200, "application/json", json);
}

void handleOptions() {
  server.sendHeader("Access-Control-Allow-Origin", "*");
  server.sendHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  server.sendHeader("Access-Control-Allow-Headers", "Content-Type");
  server.send(204);
}

void loop() {
  server.handleClient();
  
  // Check for config button press during operation
  static unsigned long lastPress = 0;
  if (digitalRead(configButton) == LOW) {
    if (millis() - lastPress > 3000) { // Hold for 3 seconds
      Serial.println("Config button held - entering config mode");
      startConfigMode();
      lastPress = millis();
    }
  } else {
    lastPress = millis();
  }
  
  // Debounced input sampling (2-sample stability check)
  int sampleBalls   = readGroupCount(ballPins, 4);
  int sampleStrikes = readGroupCount(strikePins, 3);
  int sampleOuts    = readGroupCount(outPins, 3);
  int sampleRun     = (digitalRead(runPin) == LOW) ? 1 : 0;
  
  if (lastSampleValid &&
      sampleBalls   == lastSampleBalls &&
      sampleStrikes == lastSampleStrikes &&
      sampleOuts    == lastSampleOuts &&
      sampleRun     == lastSampleRun) {
    
    if (stableBalls != sampleBalls) {
      stableBalls = sampleBalls;
      Serial.print("⚾ Balls: "); Serial.println(stableBalls);
    }
    if (stableStrikes != sampleStrikes) {
      stableStrikes = sampleStrikes;
      Serial.print("⚾ Strikes: "); Serial.println(stableStrikes);
    }
    if (stableOuts != sampleOuts) {
      stableOuts = sampleOuts;
      Serial.print("⚾ Outs: "); Serial.println(stableOuts);
    }
    if (stableRun != sampleRun) {
      stableRun = sampleRun;
      Serial.print("⚾ Run: "); Serial.println(stableRun);
    }
  }
  
  lastSampleBalls   = sampleBalls;
  lastSampleStrikes = sampleStrikes;
  lastSampleOuts    = sampleOuts;
  lastSampleRun     = sampleRun;
  lastSampleValid   = true;
  
  delay(10); // 10ms loop for fast response
}
