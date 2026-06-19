# ⚾ Baseball Scoreboard App

A React Native app built with Expo that connects to an ESP32C microcontroller to display real-time baseball game statistics with a **classic green outfield scoreboard** design, optimized for tablets.

## Features

- 🟢 **Classic Green Scoreboard** - Authentic outfield wall scoreboard style
- 🎮 **Automatic Game Management** - Begin/End Game with automatic state tracking
- 📱 **Tablet Optimized** - Designed for landscape and portrait orientations
- 📊 **Inning-by-Inning Display** - Traditional 9-inning grid with runs column
- 🔄 **Auto Team Switching** - Automatically switches teams after 3 outs
- ⚾ **Smart Score Tracking** - Runs automatically added to correct team (Visitor/Home)
- 🔘 **Indicator Lights** - Circle indicators for balls, strikes, and outs
- 📡 **Live Updates** - Real-time connection to ESP32C hardware (2x per second)
- 📍 **Game State Display** - Shows current inning, half-inning, and team at bat
- 🎨 **Authentic Design** - Green background with white text, just like the ballpark

## Hardware Requirements

- **ESP32C microcontroller** running the Baseball Clicker firmware
- Physical buttons connected to GPIO pins (balls, strikes, outs, run)
- Device configured as WiFi Access Point:
  - SSID: `BaseballClicker`
  - Password: `playball123`
  - Default IP: `192.168.4.1`

## ESP32C Setup

Your ESP32C should be running code that:
1. Creates a WiFi access point named "BaseballClicker"
2. Exposes a `/status` endpoint at `http://192.168.4.1/status`
3. Returns JSON data in this format:
```json
{
  "balls": [0,0,0],
  "strikes": [0,0],
  "outs": [0,0],
  "run": 0
}
```

## Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npx expo start
   ```

3. Run on your device:
   - **iOS**: Press `i` or scan QR code with Camera app
   - **Android**: Press `a` or scan QR code with Expo Go app

## Visual Design

The app recreates the iconic **green outfield wall scoreboard** found in classic baseball stadiums:

### 🟢 Scoreboard Aesthetic
- **Green Background**: Classic outfield wall green (`#2d6945`)
- **White Text & Borders**: High-contrast white on green
- **Authentic Layout**: Matches traditional manual scoreboards

### 📊 Score Grid
- **VISITOR/HOME Rows**: Two-team scoring display
- **9 Innings**: Individual boxes for each inning (1-9)
- **R Column**: Total runs display
- **Dark Green Boxes**: Inning score cells with white borders

### ⚾ Bottom Section
- **AT BAT**: Square display box for current batter
- **BALL**: Circle indicators (3 total) - fill white when active
- **STRIKE**: Circle indicators (2 total) - fill white when active
- **OUT**: Circle indicators (2 total) - fill white when active

### 📱 Tablet Optimization
- **Landscape Lock**: Scoreboard automatically locks to landscape orientation for optimal viewing
- **Responsive Design**: Scales up text and elements on tablets (7" and larger)
- **Full Grid Display**: All 9 innings visible without horizontal scrolling
- **Touch-Friendly**: Large, clear sections easy to read from distance

## How to Use

1. **Power on your ESP32C device**
   - Ensure it's running the Baseball Clicker firmware

2. **Connect to the WiFi network**
   - On your phone, go to Settings → WiFi
   - Connect to network: `BaseballClicker`
   - Enter password: `playball123`

3. **Open the app**
   - Launch the Baseball Scoreboard app
   - Tap "CONNECT" on the green connection screen

4. **Monitor the game**
   - Watch the classic green scoreboard update in real-time
   - See white indicator circles fill as buttons are pressed
   - View the traditional inning-by-inning scoring grid
   - Use on tablet in landscape mode for best experience!

## App Structure

```
app/
├── (tabs)/
│   ├── index.tsx      # Main scoreboard screen
│   └── explore.tsx    # About/help screen
├── _layout.tsx        # Root layout
└── modal.tsx          # Modal component

components/            # Reusable UI components
constants/            # Theme and styling
```

## 🎯 Unified Development & Production Solution

### **NEW: Works for Both Development and Production!**

The app now includes a **Settings screen** where you can configure the ESP32 IP address. No code changes needed!

#### **Quick Setup:**

**For Development (with Expo):**
1. Upload Station Mode code to ESP32 ([see guide](ESP32_QUICK_STATION_MODE.ino))
2. Get ESP32's IP from Serial Monitor (e.g., 192.168.1.156)
3. Open app → **Settings** tab
4. Enter ESP32's IP and tap **Save**
5. Stay on your regular WiFi
6. Develop with `npm start` ✅

**For Production (standalone):**
1. Keep default IP: `192.168.4.1` (pre-configured)
2. Connect to "BaseballClicker" WiFi
3. Launch app and tap Connect ✅

#### **Benefits:**
- ✅ One app for all scenarios
- ✅ No code changes between modes
- ✅ Settings persist across restarts
- ✅ Easy team collaboration
- ✅ Clear in-app instructions

📖 **Complete Guide**: [UNIFIED_SOLUTION.md](UNIFIED_SOLUTION.md)

### Alternative Solutions

If you prefer other approaches:

1. **📱 Build Standalone App**
   - See: [STANDALONE_BUILD.md](BUILD_INSTRUCTIONS.md)

2. **📡 Station Mode Details**
   - See: [ESP32_WIFI_STATION_MODE.md](docs/ESP32_WIFI_STATION_MODE.md)

3. **🌐 All WiFi Options**
   - See: [WIFI_SOLUTIONS.md](WIFI_SOLUTIONS.md)

## Troubleshooting

### Cannot connect to device
- Verify ESP32C is powered on and running
- Confirm you're connected to "BaseballClicker" WiFi
- Try disconnecting and reconnecting to WiFi
- Restart the ESP32C device
- **If using Station mode**: Make sure ESP32 and tablet are on same WiFi

### Connection keeps dropping
- Stay within WiFi range (30-50 feet indoors)
- Check ESP32C power supply is stable
- Tap "Connect to Device" again to reconnect

### Data not updating
- Check physical button connections to ESP32C
- Verify ESP32C firmware is running correctly
- Look for error messages in the app

### App won't run while connected to ESP32
- This is expected in development mode
- **Solution 1**: Build standalone app (see [STANDALONE_BUILD.md](docs/STANDALONE_BUILD.md))
- **Solution 2**: Switch ESP32 to Station mode (see [ESP32_WIFI_STATION_MODE.md](docs/ESP32_WIFI_STATION_MODE.md))

## Testing

### Run Unit Tests

The app includes comprehensive unit tests for the ConnectionContext:

```bash
# Run all tests
npm test

# Run tests in watch mode (for development)
npm run test:watch

# Run with coverage report
npm run test:coverage
```

**Test Coverage:**
- ✅ 17 tests covering all ConnectionContext functionality
- ✅ Button press detection (rising edge)
- ✅ Run counter (incremental counting)
- ✅ State persistence
- ✅ Independent tracking of balls/strikes/outs/runs
- ✅ Reset logic
- ✅ Connection/disconnection
- ✅ Polling behavior

See `contexts/__tests__/README.md` for detailed test documentation.

## Baseball Game Logic

New to baseball or need a refresher on how the game works? Check out our comprehensive guides:

📖 **[Baseball Game Logic Documentation](docs/BASEBALL_GAME_LOGIC.md)**

This guide covers:
- How balls, strikes, and outs work
- When counts reset
- How runs are scored
- Complete game flow
- How the hardware buttons map to game states
- Typical game scenarios

🎮 **[Game State Management](docs/GAME_STATE_MANAGEMENT.md)**

Learn about automatic game tracking:
- Begin/End Game functionality
- Automatic team switching after 3 outs
- Inning progression (top → bottom → next inning)
- Real-time score tracking (Visitor vs Home)
- Who's at bat display
- Console logging for debugging

Perfect for operators, developers, or anyone wanting to understand how the scoreboard tracks the game!

## Development

#### Tablet Display
For best results on tablets:
- **Landscape Lock**: The scoreboard automatically rotates and locks to landscape mode
- The app automatically scales up text and elements on larger screens (7" and up)
- All 9 innings are visible without scrolling horizontally
- Indicator circles and score boxes increase in size for better visibility
- Perfect for wall mounting or placing on a table near the field

### Modify the ESP32 IP Address
If your ESP32 uses a different IP, update the constant in `app/(tabs)/index.tsx`:
```typescript
const ESP32_IP = '192.168.4.1'; // Change this
```

### Adjust Polling Rate
To change how often the app checks for updates (default: 500ms):
```typescript
const interval = setInterval(() => {
  fetchGameState();
}, 500); // Change this value (in milliseconds)
```

### Customize Colors
To match your stadium's scoreboard colors, edit these constants:
```typescript
const SCOREBOARD_GREEN = '#2d6945';      // Main green
const SCOREBOARD_DARK_GREEN = '#1a4029'; // Darker shade for boxes
```

## Tech Stack

- **React Native** - Mobile framework
- **Expo** - Development platform
- **TypeScript** - Type safety
- **ESP32C** - Microcontroller hardware

## License

MIT

## Support

For issues or questions:
- Check the "About" tab in the app for detailed instructions
- Verify your ESP32C hardware and firmware setup
- Ensure WiFi connection is stable
