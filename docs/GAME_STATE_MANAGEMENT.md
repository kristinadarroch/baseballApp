# 🎮 Game State Management

This document explains how the Baseball Scoreboard app automatically tracks and manages game state according to official baseball rules.

## Overview

The app now includes **automatic game state management** that tracks:
- Current inning (1-9+)
- Top or bottom of inning
- Which team is batting (Visitor or Home)
- Team scores (Visitor and Home)
- Automatic team switching after 3 outs

## Features

### ⚾ Begin Game
- **"BEGIN GAME" button** starts a new game
- Automatically sets:
  - Inning 1
  - Top of inning (visitor bats first - **per baseball rules**)
  - Visitor team at bat
  - Scores reset to 0-0

### 📊 Automatic State Tracking

#### Inning Display
- Shows current inning number
- Shows half-inning with arrows:
  - **▲ TOP**: Visitor batting
  - **▼ BOTTOM**: Home batting

#### Team At Bat
- Displays which team is currently batting
- Updates automatically when teams switch

#### Score Tracking
- **Visitor Score**: Total runs for visiting team
- **Home Score**: Total runs for home team
- Runs automatically added to correct team
- Displayed in the "R" column of scoreboard

### 🔄 Automatic Team Switching

#### After 3 Outs
When the 3rd out is recorded:

**Top of Inning (Visitor batting) → Bottom of Same Inning (Home batting)**
```
Inning 1 ▲ TOP (Visitor)
  → 3 outs recorded
  → Inning 1 ▼ BOTTOM (Home)
```

**Bottom of Inning (Home batting) → Top of Next Inning (Visitor batting)**
```
Inning 1 ▼ BOTTOM (Home)
  → 3 outs recorded
  → Inning 2 ▲ TOP (Visitor)
```

#### Automatic Resets
When 3 outs occur, the app automatically resets:
- ✅ Balls → 0
- ✅ Strikes → 0
- ✅ Outs → 0
- ✅ Per-inning runs → 0

### 🏃 Run Scoring (Toggle/Latch Button)

The run button is a **toggle/latch** - each state change counts as 1 run:

**How It Works:**
- Press button → Goes HIGH (1) → **1 run scored**
- Press button → Goes LOW (0) → **1 run scored** 
- Press button → Goes HIGH (1) → **1 run scored**
- Press button → Goes LOW (0) → **1 run scored**

**Each toggle (high→low OR low→high) = 1 run**

**Practical Example - Home Run with 2 Runners On Base:**
```
Runner scores from 3rd: Toggle 0→1 (HIGH) = 1 run
Runner scores from 2nd: Toggle 1→0 (LOW)  = 2 runs
Batter rounds bases:    Toggle 0→1 (HIGH) = 3 runs
Total: 3 runs scored in one play
```
Operator rapidly toggles button 3 times to record all 3 runs.

When a run is scored:
1. Run counter increments
2. Run is added to the **current batting team's score**
3. Visitor batting → Visitor score increases
4. Home batting → Home score increases
5. Total displayed in "R" column

### 🛑 End Game

**"END GAME" button** (visible when game is active):
- Ends the current game
- Resets all game state
- Ready to start a new game

## Game Flow Example

### Starting the Game
```
User taps "BEGIN GAME"
  ↓
Inning: 1
Half: ▲ TOP
At Bat: VISITOR
Score: 0-0
```

### First Half-Inning
```
Visitor batting (top of 1st)
  ↓
Ball, strike, ball, strike, ball...
  ↓
Hit! Runner scores
  ↓
Run button pressed → Visitor: 1, Home: 0
  ↓
Continue batting...
  ↓
3 outs recorded (out wheel returns to zero after 2 displayed outs)
```

### Automatic Switch
```
System detects 3 outs
  ↓
Automatically switches to:
Inning: 1
Half: ▼ BOTTOM
At Bat: HOME
Resets: Balls, Strikes, Outs to 0
Score: Visitor: 1, Home: 0
```

### Second Half-Inning
```
Home batting (bottom of 1st)
  ↓
Batting continues...
  ↓
2 runs scored (Run button pressed twice)
  ↓
Score: Visitor: 1, Home: 2
  ↓
3 outs recorded
```

### Next Inning
```
System detects 3 outs in bottom of inning
  ↓
Automatically switches to:
Inning: 2
Half: ▲ TOP
At Bat: VISITOR
Resets: Balls, Strikes, Outs to 0
Score: Visitor: 1, Home: 2
```

## Implementation Details

### Game State Structure

```typescript
interface FullGameState {
  inning: number;                      // 1-9+
  isTopOfInning: boolean;             // true = top, false = bottom
  visitorScore: number;               // Total runs for visitor
  homeScore: number;                  // Total runs for home
  currentBatterTeam: 'visitor' | 'home'; // Who's batting
  gameStarted: boolean;               // Game active?
}
```

### Context API

```typescript
const {
  fullGameState,  // Complete game state
  beginGame,      // Start new game
  endGame,        // End current game
  // ... other properties
} = useConnection();
```

### Functions

#### `beginGame()`
Initializes a new game:
- Sets inning to 1
- Sets to top of inning
- Visitor team bats first
- Resets all counts and scores

#### `endGame()`
Ends the current game:
- Sets gameStarted to false
- Resets all game state
- Ready for new game

#### `handleThreeOuts()` (automatic)
Called when 3rd out is recorded:
- If top of inning → switch to bottom
- If bottom of inning → advance to next inning, switch to top
- Resets balls, strikes, outs
- Logs state changes to console

### Run Scoring Logic (Toggle Detection)

```typescript
// When run button state changes (toggle/latch)
if (data.run !== prevRunState) {
  // Any state change = 1 run
  // Both 0→1 AND 1→0 count as runs
  runs++;
  
  // Add to current batting team
  if (currentBatterTeam === 'visitor') {
    visitorScore++;
  } else {
    homeScore++;
  }
}
```

### Three Out Detection

```typescript
// When out button pressed
if (newOutCount === 3) {
  handleThreeOuts(); // Automatic switch
}
```

## UI Components

### Status Bar
- Connection status (LIVE/OFFLINE)
- "END GAME" button (when game active)
- "DISCONNECT" button

### Game Control Panel (before game starts)
- "BEGIN GAME" button
- Instructions about visitor batting first

### Game Status Panel (during game)
- **Inning Display**: "INNING 2", "▲ TOP" or "▼ BOTTOM"
- **At Bat Display**: "VISITOR" or "HOME"

### Scoreboard Grid
- Inning boxes (1-9)
- **R column**: Shows live visitor and home scores

## Baseball Rules Implemented

### ✅ Visitor Bats First
Per official baseball rules, the **visiting team always bats first** in the top of the first inning.[1][2][3]

### ✅ Three Outs Switch Teams
After 3 outs, the batting team switches:
- Top → Bottom (same inning)
- Bottom → Top (next inning)

### ✅ Half-Inning Structure
Each inning has two halves:
- **Top**: Visitor bats, home fields
- **Bottom**: Home bats, visitor fields

### ✅ Counts Reset
After 3 outs:
- Balls, strikes, outs reset to 0
- New batting team starts fresh

### ✅ Runs Accumulate
- Team scores never decrease
- Each team's runs tracked separately
- Runs accumulate throughout entire game

## Operator Workflow

### Starting a Game
1. Connect to ESP32C device
2. Tap **"BEGIN GAME"**
3. See "INNING 1 ▲ TOP" and "AT BAT: VISITOR"
4. Begin tracking the game

### During Play
1. Track balls, strikes, outs normally
2. Press run button when runner scores
3. **System automatically:**
   - Adds run to correct team
   - Updates displayed scores
   - Switches teams after 3 outs
   - Advances innings

### Between Half-Innings
After 3 outs:
1. System automatically switches teams
2. Display updates to show new team at bat
3. Counts reset automatically
4. Continue tracking new half-inning

### Ending a Game
1. Tap **"END GAME"** button
2. Game state resets
3. Ready to begin new game

## Console Logging

The app logs all game state changes:

```
"Beginning new game - Visitor team bats first (top of 1st inning)"
"Run button pressed, incrementing count to 1"
"Out count set from pins to 2"
"INNING CHANGE: Final out reset to 0"
"Top of inning 1 complete. Home team now batting."
"Inning 1 complete. Moving to inning 2. Visitor team now batting."
```

Monitor console for debugging and verification.

## Benefits

### For Operators
- ✅ Less manual tracking needed
- ✅ Automatic team switching
- ✅ No confusion about who's batting
- ✅ Accurate score tracking

### For Accuracy
- ✅ Follows official baseball rules
- ✅ Automatic state management
- ✅ Prevents operator errors
- ✅ Real-time score updates

### For Spectators
- ✅ Always see current inning
- ✅ Know which team is batting
- ✅ See live team scores
- ✅ Professional scoreboard display

## Future Enhancements

Potential future features:
- Inning-by-inning run tracking (not just totals)
- Team names (customizable)
- Game history/stats
- Export game data
- Multiple game support
- Pitch count tracking
- Player at-bat tracking

## Troubleshooting

### Game won't start
- Ensure device is connected
- Check "BEGIN GAME" button is visible
- Try reconnecting to ESP32C

### Teams not switching after 3 outs
- Verify 3rd out button was pressed
- Check console logs for "3 outs" message
- Ensure game was started with "BEGIN GAME"

### Scores not updating
- Verify game is started (gameStarted = true)
- Check run button is working
- See console logs for run button presses
- Confirm correct team is batting

### Wrong team getting runs
- Verify "AT BAT" display shows correct team
- Check game state in console logs
- Ensure game started properly (visitor first)

## Technical Notes

### State Persistence
- Game state maintained in React context
- Persists across component re-renders
- Lost on app close/refresh
- Use "BEGIN GAME" to start fresh

### Timing
- 100ms delay after 3 outs before reset
- Allows operator to see final out count
- Then automatically resets for new half-inning

### Thread Safety
- State updates are batched
- React handles concurrent updates
- No race conditions in state management

---

## Summary

The game state management system:
1. **Starts** games with visitor batting first
2. **Tracks** innings, half-innings, and batting team
3. **Scores** runs to correct team automatically
4. **Switches** teams after 3 outs
5. **Advances** innings correctly
6. **Displays** real-time game information

All according to official baseball rules! ⚾

## References

[1] [Rules of Baseball - Wikipedia](https://en.wikipedia.org/wiki/Rules_of_baseball)  
[2] [Baseball Rules Explained - YouTube](https://www.youtube.com/watch?v=RizBmMwxH3E)  
[3] [Which Team Pitches First](https://www.platecrate.com/blogs/baseball-101/which-team-pitches-first-in-baseball-understanding-the-dynamics-of-game-start)

See also: [BASEBALL_GAME_LOGIC.md](./BASEBALL_GAME_LOGIC.md) for complete baseball rules explanation.
