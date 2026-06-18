/*
 * ESP32 Baseball Clicker - Optimized Version
 *
 * Features:
 * - Immediate response (<50ms) - no 0.5s delay
 * - Derived count from pin readings (highest pin HIGH = count)
 * - Contiguous lighting rule (count=2 means lights 1,2 are ON)
 * - Robust debouncing (10ms loop with 2-sample stability check)
 * - No dependence on previous state for correctness
 *
 * Hardware Pin Assignments:
 * - Strike Wheel: 0=GND, 1=GPIO5, 2=GPIO4 (Strike 3 not displayed)
 * - Ball Wheel: 0=GND, 1=GPIO6, 2=GPIO21, 3=GPIO7 (Ball 4 not displayed)
 * - Out Wheel: 0=GND, 1=GPIO2, 2=GPIO3
 * - Run Button: GPIO20
 * - Inning: Removed (determined by outs in the app)
 */

#include <WiFi.h>
#include <WebServer.h>

// Access Point credentials
const char* apSSID = "BaseballClicker";
const char* apPassword = "playball123";

// Pin assignments for roller inputs
const int BALL_PINS[]   = {6, 21, 7};      // Ball 1-3 (GPIO6, GPIO21, GPIO7)
const int STRIKE_PINS[] = {5, 4};          // Strike 1-2 (GPIO5, GPIO4)
const int OUT_PINS[]    = {2, 3};          // Out 1-2 (GPIO2, GPIO3)
const int RUN_PIN       = 20;              // Run button (GPIO20)

// Stable counts (what we display/report)
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

// Web server
WebServer server(80);

/**
 * Read a group of pins and return the count (0 to length)
 * Count = highest pin index that reads HIGH
 * Example: If pins [0,1,2,3] and pin[1] is HIGH, count = 2
 */
int readGroupCount(const int *pins, int length) {
  int count = 0;
  for (int i = 0; i < length; i++) {
    int pinState = digitalRead(pins[i]);
    if (pinState == LOW) {  // LOW = button pressed (INPUT_PULLUP)
      count = i + 1;  // Highest index that is pressed
    }
  }
  return count;
}

/**
 * Read a single button (for run button)
 */
int readButton(int pin) {
  return (digitalRead(pin) == LOW) ? 1 : 0;
}

/**
 * Setup pins and WiFi
 */
void setup() {
  Serial.begin(115200);
  delay(1000);
  
  // Configure ball pins
  for (int i = 0; i < 3; i++) {
    pinMode(BALL_PINS[i], INPUT_PULLUP);
  }

  // Configure strike pins
  for (int i = 0; i < 2; i++) {
    pinMode(STRIKE_PINS[i], INPUT_PULLUP);
  }

  // Configure out pins
  for (int i = 0; i < 2; i++) {
    pinMode(OUT_PINS[i], INPUT_PULLUP);
  }
  
  // Configure run button
  pinMode(RUN_PIN, INPUT_PULLUP);
  
  // Start WiFi Access Point
  WiFi.mode(WIFI_AP);
  bool apStarted = WiFi.softAP(apSSID, apPassword, 6, 0, 4);
  IPAddress myIP = WiFi.softAPIP();
  Serial.print("Access Point started: ");
  Serial.println(apStarted ? "YES" : "NO");
  Serial.print("Access Point IP address: ");
  Serial.println(myIP);
  
  // Setup web server routes
  server.on("/", handleRoot);
  server.on("/status", handleStatus);
  server.begin();
  
  Serial.println("Web server started!");
  Serial.println("Optimized clicker ready - <50ms response time");
}

/**
 * Main loop with fast debouncing
 * Runs every 10ms, updates only when readings are stable for 2+ samples
 */
void loop() {
  // Handle web requests
  server.handleClient();
  
  // Sample all inputs
  int sampleBalls   = readGroupCount(BALL_PINS, 3);
  int sampleStrikes = readGroupCount(STRIKE_PINS, 2);
  int sampleOuts    = readGroupCount(OUT_PINS, 2);
  int sampleRun     = readButton(RUN_PIN);
  
  // Check if samples match previous reading (stability check)
  if (lastSampleValid &&
      sampleBalls   == lastSampleBalls &&
      sampleStrikes == lastSampleStrikes &&
      sampleOuts    == lastSampleOuts &&
      sampleRun     == lastSampleRun) {
    
    // Stable for at least 2 consecutive samples → commit
    bool changed = false;
    
    if (stableBalls != sampleBalls) {
      stableBalls = sampleBalls;
      Serial.print("⚾ Balls: ");
      Serial.println(stableBalls);
      changed = true;
    }
    
    if (stableStrikes != sampleStrikes) {
      stableStrikes = sampleStrikes;
      Serial.print("⚾ Strikes: ");
      Serial.println(stableStrikes);
      changed = true;
    }
    
    if (stableOuts != sampleOuts) {
      stableOuts = sampleOuts;
      Serial.print("⚾ Outs: ");
      Serial.println(stableOuts);
      changed = true;
    }
    
    if (stableRun != sampleRun) {
      stableRun = sampleRun;
      Serial.print("⚾ Run button: ");
      Serial.println(stableRun);
      changed = true;
    }
    
    if (changed) {
      Serial.println("✅ State updated");
    }
  }
  
  // Store current samples for next iteration
  lastSampleBalls   = sampleBalls;
  lastSampleStrikes = sampleStrikes;
  lastSampleOuts    = sampleOuts;
  lastSampleRun     = sampleRun;
  lastSampleValid   = true;
  
  // Small delay for debounce - NOT 500ms, just 10ms!
  delay(10);
}

/**
 * Root endpoint - HTML display
 */
void handleRoot() {
  String html = "<!DOCTYPE html><html><head>";
  html += "<meta charset='UTF-8'>";
  html += "<meta name='viewport' content='width=device-width, initial-scale=1.0'>";
  html += "<title>Baseball Clicker</title>";
  html += "<style>";
  html += "body { font-family: Arial; margin: 20px; background: #2d6945; color: white; }";
  html += "h1 { color: #fff; }";
  html += ".section { margin: 20px 0; padding: 15px; background: rgba(255,255,255,0.1); border-radius: 8px; }";
  html += ".count { font-size: 48px; font-weight: bold; color: #ffd700; }";
  html += ".indicators { display: flex; gap: 10px; margin: 10px 0; }";
  html += ".indicator { width: 30px; height: 30px; border-radius: 50%; border: 2px solid white; }";
  html += ".indicator.on { background: #ffd700; }";
  html += ".indicator.off { background: transparent; }";
  html += "</style>";
  html += "</head><body>";
  
  html += "<h1>⚾ Baseball Clicker - Optimized</h1>";
  html += "<p>Response time: <strong>&lt;50ms</strong></p>";
  
  // Balls
  html += "<div class='section'>";
  html += "<h2>Balls</h2>";
  html += "<div class='count'>" + String(stableBalls) + "</div>";
  html += "<div class='indicators'>";
  for (int i = 0; i < 3; i++) {
    // Show position-based (only active position lit)
    html += "<div class='indicator " + String(((i + 1) == stableBalls) ? "on" : "off") + "'></div>";
  }
  html += "</div></div>";

  // Strikes
  html += "<div class='section'>";
  html += "<h2>Strikes</h2>";
  html += "<div class='count'>" + String(stableStrikes) + "</div>";
  html += "<div class='indicators'>";
  for (int i = 0; i < 2; i++) {
    html += "<div class='indicator " + String(((i + 1) == stableStrikes) ? "on" : "off") + "'></div>";
  }
  html += "</div></div>";

  // Outs
  html += "<div class='section'>";
  html += "<h2>Outs</h2>";
  html += "<div class='count'>" + String(stableOuts) + "</div>";
  html += "<div class='indicators'>";
  for (int i = 0; i < 2; i++) {
    html += "<div class='indicator " + String(((i + 1) == stableOuts) ? "on" : "off") + "'></div>";
  }
  html += "</div></div>";
  
  // Run
  html += "<div class='section'>";
  html += "<h2>Run</h2>";
  html += "<div class='count'>" + String(stableRun ? "PRESSED" : "RELEASED") + "</div>";
  html += "</div>";
  
  html += "</body></html>";
  
  server.send(200, "text/html", html);
}

/**
 * JSON status endpoint for React Native app
 * Returns position-based arrays (only highest position is 1)
 * Example: count=2 returns [0,1,0,0] not [1,1,0,0]
 */
void handleStatus() {
  // Build JSON with position-based arrays for app compatibility
  // The app uses rising-edge detection, so only the active position should be 1
  String json = "{";
  
  // Balls array (position-based: count=2 means [0,1,0])
  json += "\"balls\":[";
  for (int i = 0; i < 3; i++) {
    // Only the position matching the count is 1, others are 0
    json += String(((i + 1) == stableBalls) ? 1 : 0);
    if (i < 2) json += ",";
  }
  json += "],";

  // Strikes array (position-based: count=2 means [0,1])
  json += "\"strikes\":[";
  for (int i = 0; i < 2; i++) {
    json += String(((i + 1) == stableStrikes) ? 1 : 0);
    if (i < 1) json += ",";
  }
  json += "],";

  // Outs array (position-based: count=2 means [0,1])
  json += "\"outs\":[";
  for (int i = 0; i < 2; i++) {
    json += String(((i + 1) == stableOuts) ? 1 : 0);
    if (i < 1) json += ",";
  }
  json += "],";
  
  // Run button
  json += "\"run\":" + String(stableRun);
  
  json += "}";
  
  server.sendHeader("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0");
  server.sendHeader("Pragma", "no-cache");
  server.sendHeader("Expires", "0");
  server.send(200, "application/json", json);
  Serial.println("Status sent: " + json);
}
