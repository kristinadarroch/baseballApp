# ⚾ New Baseball Game Logic - Out Tracking & Auto-Advancement

## 🎯 Overview

The game now automatically tracks outs from the beginning of the game and manages innings based on cumulative out counts. The app maintains its own inning calculation independent of the umpire clicker wheel.

---

## 📊 Key Features

### **1. Cumulative Out Tracking**
- **Total Outs**: Tracks every out from the start of the game
- **Inning Outs**: Tracks outs within the current inning (0-6)
- **At-Bat Logging**: Records every at-bat with final count and result

### **2. Automatic Inning Advancement**
- **Every 3 outs**: Switch teams (top → bottom or vice versa)
- **Every 6 outs**: Advance to next inning and reset to top (visitor bats)
- **Independent Calculation**: App determines innings based on outs, not umpire wheel

### **3. At-Bat Logging**
Each out is logged with:
- Inning number
- Half (top/bottom)
- Team at bat
- Final balls and strikes count
- Result (out)
- Timestamp

---

## 🔢 How It Works

### **Inning Progression**

```
Start: Inning 1, Top, 0 total outs, 0 inning outs
↓
3 outs → Inning 1, Bottom, 3 total outs, 3 inning outs
↓
3 more outs → Inning 2, Top, 6 total outs, 0 inning outs (reset)
↓
3 more outs → Inning 2, Bottom, 9 total outs, 3 inning outs
↓
3 more outs → Inning 3, Top, 12 total outs, 0 inning outs (reset)
↓
... continues for 9 innings
```

### **Math Formula**
```
Current Inning = (Total Outs ÷ 6) + 1
Half Inning = (Total Outs mod 6) < 3 ? Top : Bottom
Inning Outs = Total Outs mod 6
```

---

## 🎮 Game Flow

### **Begin Game**
1. Tap "BEGIN GAME" button
2. Initializes:
   - Inning: 1
   - Half: Top (▲)
   - Team at bat: Visitor
   - Total outs: 0
   - Inning outs: 0
   - At-bat log: []

### **During Play**
1. **Umpire tracks balls/strikes** via rotary switches
2. **3rd out recorded**:
   - Logs at-bat (inning, team, balls, strikes, result: out)
   - Increments total outs by 1
   - Increments inning outs by 1
   - Checks progression:
     - If inning outs = 3 → Switch to bottom half
     - If inning outs = 6 → Advance inning, reset to top
3. **Counts reset** for next batter
4. **Runs accumulate** for scoring team

### **End Game**
- Logs total outs and at-bats
- Clears all game state
- Ready for new game

---

## 📈 Display Updates

### **Scoreboard Shows**:
```
┌────────────────────────────────────┐
│ INNING 3                           │
│ ▲ TOP                              │
├────────────────────────────────────┤
│ AT BAT: YANKEES                    │
├────────────────────────────────────┤
│ TOTAL OUTS: 15                     │
│ (3/6 this inning)                  │
└────────────────────────────────────┘
```

**Components**:
- **INNING**: Auto-calculated from outs
- **▲ TOP / ▼ BOTTOM**: Current half
- **AT BAT**: Current batting team
- **TOTAL OUTS**: Cumulative from game start
- **This Inning**: Outs in current inning (0-6)

---

## 🎯 Umpire Clicker Independence

### **Why App-Controlled Innings?**

**Problem**: Umpire may forget to advance inning wheel on physical clicker

**Solution**: App automatically calculates innings based on outs

**Behavior**:
- ✅ App tracks outs and advances innings automatically
- ⚠️ Umpire wheel may show different inning (ignored by app)
- ✅ App's inning calculation is always correct (based on outs)
- ℹ️ Umpire can verify app's inning matches their count

### **Verification Process**:
1. After 6 outs, app advances inning
2. Umpire checks: "Are we in the right inning?"
3. If umpire forgot to advance wheel, they can catch up
4. App continues using its calculation regardless

---

## 📝 At-Bat Log Structure

```typescript
{
  inning: 3,           // Which inning
  isTop: true,         // Top or bottom half
  team: 'visitor',     // Which team batted
  finalBalls: 2,       // Ball count when out occurred
  finalStrikes: 2,     // Strike count when out occurred
  result: 'out',       // Result of at-bat
  timestamp: 1234567890 // When it happened
}
```

### **Use Cases for Log**:
- Review game progression
- Verify inning calculations
- Debug scoring issues
- Generate game statistics
- Export game data

---

## 🔄 Example Game Progression

### **Inning 1**

**Top of 1st (Visitor bats)**:
- Batter 1: 2-2 count → Out #1 (Total: 1, Inning: 1)
- Batter 2: 3-1 count → Out #2 (Total: 2, Inning: 2)  
- Batter 3: 1-2 count → Out #3 (Total: 3, Inning: 3)
- **→ Switch to Bottom of 1st**

**Bottom of 1st (Home bats)**:
- Batter 1: 0-0 count → Out #4 (Total: 4, Inning: 4)
- Batter 2: 2-0 count → Out #5 (Total: 5, Inning: 5)
- Batter 3: 1-1 count → Out #6 (Total: 6, Inning: 6)
- **→ Advance to Inning 2, Top (reset inning outs to 0)**

### **Inning 2**

**Top of 2nd (Visitor bats)**:
- Batter 1: 3-2 count → Out #7 (Total: 7, Inning: 1)
- Batter 2: 0-1 count → Out #8 (Total: 8, Inning: 2)
- Batter 3: 2-2 count → Out #9 (Total: 9, Inning: 3)
- **→ Switch to Bottom of 2nd**

...and so on through 9 innings

---

## 🧪 Testing Scenarios

### **Scenario 1: Standard Half-Inning**
```
Start: Inning 1 Top, 0 total outs, 0 inning outs
Record 3 outs
Expected: Inning 1 Bottom, 3 total outs, 3 inning outs
```

### **Scenario 2: Full Inning**
```
Start: Inning 1 Bottom, 3 total outs, 3 inning outs
Record 3 outs
Expected: Inning 2 Top, 6 total outs, 0 inning outs
```

### **Scenario 3: Umpire Wheel Mismatch**
```
App shows: Inning 3
Umpire wheel shows: Inning 2 (forgot to advance)
App behavior: Continues using Inning 3 (correct)
Umpire action: Advances wheel to catch up
```

### **Scenario 4: Mid-Game Verification**
```
Total outs: 15
Calculation: 15 ÷ 6 = 2 remainder 3
Expected: Inning 3, Bottom (2 complete innings + 3 outs)
Display: "TOTAL OUTS: 15 (3/6 this inning)"
```

---

## 💡 Benefits

### **For Umpires**:
- ✅ Always know true inning based on outs
- ✅ Can verify against physical wheel
- ✅ Forgiving if they forget to advance wheel
- ✅ Clear visual feedback (total outs + inning outs)

### **For Scorekeepers**:
- ✅ Accurate inning tracking
- ✅ Detailed at-bat history
- ✅ No manual inning management
- ✅ Automatic team switching

### **For Players/Coaches**:
- ✅ Always see correct inning
- ✅ Know exactly how many outs
- ✅ Clear team at bat indicator
- ✅ Reliable game state

---

## 🎓 Key Concepts

### **Total Outs vs Inning Outs**

**Total Outs**:
- Never resets (except new game)
- Counts every out from game start
- Used to calculate inning number
- Displayed prominently on scoreboard

**Inning Outs**:
- Resets every 6 outs (new inning)
- Shows progress within current inning (0-6)
- Used to determine when to switch teams
- Displayed as "(X/6 this inning)"

### **Independent Calculation**

The app **does not** rely on the umpire clicker wheel for innings. It:
- Calculates innings mathematically from outs
- Advances automatically every 6 outs
- Maintains its own authoritative state
- Provides visual verification for umpire

---

## 📋 Console Logging

During gameplay, the console shows:

```
Game started. Tracking outs from beginning. Auto-advancing innings every 6 outs.
Out recorded: Total outs: 1, Inning outs: 1
At-bat logged: Inning 1 Top, visitor, Result: out
Out recorded: Total outs: 2, Inning outs: 2
At-bat logged: Inning 1 Top, visitor, Result: out
Out recorded: Total outs: 3, Inning outs: 3
At-bat logged: Inning 1 Top, visitor, Result: out
Top of inning 1 complete (3 outs). Home team now batting.
Out recorded: Total outs: 4, Inning outs: 4
At-bat logged: Inning 1 Bottom, home, Result: out
...
Out recorded: Total outs: 6, Inning outs: 6
At-bat logged: Inning 1 Bottom, home, Result: out
Inning 1 complete (6 outs). Moving to inning 2. Visitor team now batting.
```

---

## ✅ Summary

The new game logic:
1. ⚾ **Tracks all outs** from game start
2. 📊 **Auto-advances** innings every 6 outs
3. 📝 **Logs every at-bat** with details
4. 🎯 **Independent** of umpire clicker wheel
5. ✨ **Reliable** and mathematically accurate
6. 👁️ **Transparent** with clear display

This ensures the app always knows the correct inning and teams, even if the umpire forgets to advance their physical indicator!

