# ⚾ Baseball Game Logic

A comprehensive guide to understanding baseball game mechanics and how they relate to the Baseball Scoreboard app.

## Table of Contents
- [Basic Game Structure](#basic-game-structure)
- [At-Bat Mechanics](#at-bat-mechanics)
- [Balls and Strikes](#balls-and-strikes)
- [Outs](#outs)
- [Runs (Scoring)](#runs-scoring)
- [State Transitions](#state-transitions)
- [Game Flow](#game-flow)
- [App Implementation](#app-implementation)

---

## Basic Game Structure

### Teams
- **2 Teams**: Home team and Visitor (or Away) team
- **9 Innings**: Each inning has two halves (top and bottom)
- **Objective**: Score more runs than the opposing team

### Who Starts: Visiting Team Always Bats First
In baseball, **the visiting team always bats first** while the home team pitches and fields first.[1][2][3] This is a fundamental rule that applies to every game.

### Inning Structure
- **Top of Inning**: Visiting team bats, home team plays defense (pitches and fields)[2][3]
- **Bottom of Inning**: Home team bats, visiting team plays defense (pitches and fields)[2][3]
- Each half-inning continues until the batting team makes **three outs**, then the other team comes up to bat[4][1]

### Game Duration
- **Regulation**: 9 innings
- **Winning**: The team with more runs at the end wins[13][14]
- **Tied Game**: If the score is tied after 9 innings, extra innings are played until one team finishes an inning ahead[13][14]
- **No time limit**: Game continues until a winner is determined

---

## At-Bat Mechanics

An **at-bat** is when one player from the batting team faces the pitcher. The at-bat continues until one of these outcomes:

### Outcomes
1. **Hit** - Batter reaches base safely
2. **Walk** - 4 balls, batter goes to first base
3. **Strikeout** - 3 strikes, batter is out
4. **Out** - Fielded ball results in an out
5. **Home Run** - Ball hit out of park, automatic run(s)

---

## Balls and Strikes

### The Count
The **count** refers to the number of balls and strikes on the current batter. Every at-bat starts at a **0-0 count** (0 balls, 0 strikes).[5][6]

- **Format**: Always said as **"Balls-Strikes"** (e.g., "2-1" = 2 balls, 1 strike)[11][6]
- **Full Count**: A "3-2" count means three balls and two strikes; one more ball is a walk, one more strike is an out[11][6]

### Strikes
A **strike** is called when:[7][8]
- A pitch is in the strike zone and the batter does not swing at it
- The batter swings at any pitch and misses
- The batter hits a foul ball (with some limits - see below)

**Count Range**: 0-3 strikes
- **0 strikes**: Clean count
- **1 strike**: One strike
- **2 strikes**: Batter is "in the hole" (danger zone)
- **3 strikes**: **STRIKEOUT** - Batter is out[9][1]

### Balls
A **ball** is called when a pitch is outside the strike zone and the batter does not swing at it.[8][7]

**Count Range**: 0-4 balls
- **0 balls**: Clean count
- **1 ball**: One ball
- **2 balls**: Two balls
- **3 balls**: Full count (with any strikes) or "3-0 count"
- **4 balls**: **WALK** - Batter is awarded first base[10][1]

### Important Count Scenarios

| Count | Name | Meaning |
|-------|------|---------|
| 0-0 | Clean | Fresh at-bat |
| 3-0 | Three balls | Batter's advantage |
| 0-2 | Two strikes | Pitcher's advantage |
| 3-2 | Full count | Maximum tension, next pitch decides |
| 3-1 | Hitter's count | Likely to get a good pitch |

### Foul Balls: Special Strike Rules
Foul balls have special rules regarding strikes:[12][4][1]

**Before Two Strikes:**
- A foul ball counts as a strike
- Foul on 0 strikes → Count goes to 0-1
- Foul on 1 strike → Count goes to X-2

**After Two Strikes:**
- Most foul balls do **NOT** cause a strikeout
- The at-bat continues with the same count
- Batter can foul off unlimited pitches with 2 strikes

**Exception - Foul Bunt:**
- A foul bunt with two strikes **IS** an exception
- This results in a third strike and the batter is out[1][12]

### When an At-Bat Ends
An at-bat ends in one of these ways:[9][10][1]

1. **Three strikes** → Strikeout, batter is out
2. **Four balls** → Walk, batter awarded first base
3. **Hit by pitch (HBP)** → Batter hit by ball, awarded first base
4. **Hit** → Batter reaches base safely
5. **Fielded out** → Ball is caught or thrown for an out

#### Hit By Pitch (HBP)
When a batter is hit by a pitch:
- The batter is awarded first base (like a walk)
- The at-bat ends immediately
- **The umpire resets balls and strikes to 0-0** for the next batter
- This counts as reaching base, but not as an official at-bat in statistics

### Count Reset Rules
The count **resets to 0-0** when:[5][6]
- Batter gets a hit
- Batter walks (4 balls)
- **Batter is hit by pitch**
- Batter strikes out (3 strikes)
- Batter gets out (fielded ball)
- New batter comes to the plate

**Operator Note**: Whenever the at-bat ends for any reason, release all ball and strike buttons to reset the count to 0-0 for the next batter.

---

## Outs

### How Outs Occur
1. **Strikeout**: 3 strikes on a batter
2. **Fly Out**: Fielder catches a hit ball in the air
3. **Ground Out**: Fielder throws batter out at first base
4. **Tag Out**: Runner is tagged while off base
5. **Force Out**: Runner forced to advance but arrives late

### Out Count
**Range**: 0-3 outs per half-inning

- **0 outs**: Inning just started
- **1 out**: One down, two to go
- **2 outs**: Two down, last chance
- **3 outs**: **HALF-INNING OVER** - Teams switch

### After 3 Outs
- **Top of inning**: Visiting team's turn ends, home team bats
- **Bottom of inning**: Inning complete, next inning begins
- **All counts reset**: Balls, strikes, and outs reset to 0

---

## Runs (Scoring)

### How Runs are Scored
A **run** is scored when a player safely advances around first base, second base, and third base and returns to home plate.[10][1]

The runner must touch all four bases in order:
1. First base
2. Second base
3. Third base
4. Home plate

### Ways to Score
1. **Single/Double/Triple**: Batter gets on base, other runners advance
2. **Home Run**: Batter hits ball out of park, all runners score
3. **Walk with Bases Loaded**: Forces runner from 3rd to home
4. **Sacrifice Fly**: Out, but runner tags up and scores
5. **Error**: Defensive mistake allows runner to score
6. **Stolen Base**: Runner advances and eventually scores

### Run Counting
- Runs accumulate throughout the game
- **Never decrease** (unlike balls/strikes/outs which reset)
- Each team tracks runs separately (Visitor vs Home)
- Final score = Total runs after 9+ innings

### Scoring Examples

**Scenario 1: Home Run**
- Batter hits ball over fence
- Batter + all base runners score
- If bases loaded (3 on base) = 4 runs scored (Grand Slam)

**Scenario 2: Bases Loaded Walk**
- Bases full, batter walks
- Runner on 3rd forced home = 1 run

**Scenario 3: Single with Runner on 2nd**
- Batter hits single
- Runner on 2nd advances to home = 1 run

---

## State Transitions

### At-Bat Level
```
New Batter
    ↓
Count: 0-0
    ↓
Pitch Result
    ├─→ Ball (0-3) → Count increases → Continue
    ├─→ Strike (0-2) → Count increases → Continue
    ├─→ 4th Ball → WALK → Reset count, new batter
    ├─→ 3rd Strike → STRIKEOUT → Out + Reset count
    ├─→ Hit → Reset count, new batter
    └─→ Out → Reset count, new batter
```

### Inning Level
```
Inning Start (Outs: 0)
    ↓
At-Bats Continue
    ↓
Each Out (Outs: 1, 2)
    ↓
3rd Out → HALF-INNING ENDS
    ↓
Switch Teams
    ↓
Bottom of Inning (or Next Inning)
```

### Game Level
```
Game Start (Inning: 1, Score: 0-0)
    ↓
Complete 9 Innings
    ↓
Compare Scores
    ├─→ Winner Determined → GAME OVER
    └─→ Tie → EXTRA INNINGS → Continue
```

---

## Game Flow

### Standard Game Progression

1. **Pre-Game**
   - Visitor: 0 runs, Home: 0 runs
   - Inning 1, Top (Visitor batting)

2. **Top of 1st Inning**
   - Visitor bats until 3 outs
   - Runs scored add to Visitor total

3. **Bottom of 1st Inning**
   - Home bats until 3 outs
   - Runs scored add to Home total

4. **Innings 2-9**
   - Repeat top/bottom structure
   - Runs accumulate for each team

5. **End of 9th Inning**
   - If not tied → Game ends, winner declared
   - If tied → Extra innings (10th, 11th, etc.)

### Score Tracking

| Inning | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | R |
|--------|---|---|---|---|---|---|---|---|---|----|
| VISITOR | 0 | 2 | 0 | 1 | 0 | 0 | 3 | 0 | 1 | **7** |
| HOME | 1 | 0 | 1 | 0 | 2 | 0 | 0 | 1 | 0 | **5** |

- Each box shows runs scored in that inning
- **R column** = Total runs
- Visitor wins 7-5

---

## App Implementation

### How the Scoreboard App Tracks Game State

#### 1. Balls (0-3 displayed)
**Hardware**: 3 displayed ball pins on ESP32C; ball 4 is implied as a walk.
```
Ball 1: [1,0,0] → 1 ball
Ball 2: [1,1,0] → 2 balls
Ball 3: [1,1,1] → 3 balls
Reset:  [0,0,0] → 0 balls
```

**Display**: Circles light up left-to-right
- 2 balls: ⚪⚪⚫

#### 2. Strikes (0-2 displayed)
**Hardware**: 2 displayed strike pins on ESP32C; strike 3 is implied as a strikeout.
```
Strike 1: [1,0] → 1 strike
Strike 2: [1,1] → 2 strikes
Reset:    [0,0] → 0 strikes
```

**Display**: Circles light up left-to-right
- 2 strikes: ⚪⚪

#### 3. Outs (0-2 displayed)
**Hardware**: 2 displayed out pins on ESP32C; the third out is implied when the wheel returns to zero from 2 outs.
```
Out 1: [1,0] → 1 out
Out 2: [1,1] → 2 outs
Reset: [0,0] → 0 outs / hidden third out after 2 outs
```

**Display**: Circles light up left-to-right
- 2 outs: ⚪⚪

#### 4. Runs (0-∞)
**Hardware**: 1 toggle/latch button on ESP32C (incremental counter)

The run button is a **toggle/latch** - each state change counts as 1 run:

```
Toggle 1: 0→1 (latches HIGH)  → 1 run scored
Toggle 2: 1→0 (latches LOW)   → 2 runs scored  
Toggle 3: 0→1 (latches HIGH)  → 3 runs scored
Toggle 4: 1→0 (latches LOW)   → 4 runs scored
Hold:     1→1 (stays HIGH)    → No change (still 4)
Toggle 5: 1→0 (latches LOW)   → 5 runs scored
...continues indefinitely
```

**Key Point**: Both HIGH and LOW latches count as separate runs!

**Display**: Total count displayed
- 5 runs: **5**

**Operator Tip**: You can press rapidly for multiple runs (like when a home run scores 4 runners - press the button 4 times, alternating between high and low latches).

### Typical Game Scenario

**Scenario: Batter at the Plate**

1. **Clean Count**
   - Balls: 0, Strikes: 0, Outs: 0
   - Display: ⚫⚫⚫⚫ | ⚫⚫⚫ | ⚫⚫⚫

2. **First Pitch: Ball**
   - Operator presses Ball button 1
   - Balls: 1, Strikes: 0
   - Display: ⚪⚫⚫ | ⚫⚫ | ⚫⚫

3. **Second Pitch: Strike**
   - Operator presses Strike button 1
   - Balls: 1, Strikes: 1 (Count: 1-1)
   - Display: ⚪⚫⚫ | ⚪⚫ | ⚫⚫

4. **Third Pitch: Ball**
   - Operator presses Ball button 2
   - Balls: 2, Strikes: 1 (Count: 2-1)
   - Display: ⚪⚪⚫ | ⚪⚫ | ⚫⚫

5. **Fourth Pitch: Foul Ball (Strike)**
   - Operator presses Strike button 2
   - Balls: 2, Strikes: 2 (Count: 2-2)
   - Display: ⚪⚪⚫ | ⚪⚪ | ⚫⚫

6. **Fifth Pitch: Ball**
   - Operator presses Ball button 3
   - Balls: 3, Strikes: 2 (Full Count: 3-2)
   - Display: ⚪⚪⚪ | ⚪⚪ | ⚫⚫

7. **Sixth Pitch: Home Run!**
   - Operator resets balls/strikes to 0-0
   - Operator presses Run button (runs++)
   - New batter, clean count
   - Display: ⚫⚫⚫ | ⚫⚫ | ⚫⚫ | Runs: 1

### When to Reset Counts

**Reset Balls & Strikes (to 0-0):**
- After a walk (4 balls)
- After a strikeout (3 strikes)
- After a hit
- After an out
- After any at-bat ends

**Reset Outs (to 0):**
- After 3 outs (half-inning ends)
- When teams switch (top → bottom or inning changes)

**Never Reset Runs:**
- Runs accumulate for the entire game
- Only reset at the start of a new game

---

## Quick Reference

### Count Maximums
| Stat | Max | What Happens |
|------|-----|--------------|
| Balls | 4 | Batter walks to first base |
| Strikes | 3 | Batter strikes out (out) |
| Outs | 3 | Half-inning ends, teams switch |
| Runs | ∞ | No maximum, keeps counting |

### Reset Triggers
| Event | Balls | Strikes | Outs | Runs |
|-------|-------|---------|------|------|
| Walk (4 balls) | ✅ Reset | ✅ Reset | - | - |
| **Hit by Pitch** | ✅ Reset | ✅ Reset | - | - |
| Strikeout (3 strikes) | ✅ Reset | ✅ Reset | ❌ +1 | - |
| Hit | ✅ Reset | ✅ Reset | - | Maybe +1 |
| Fielded Out | ✅ Reset | ✅ Reset | ❌ +1 | - |
| 3 Outs | ✅ Reset | ✅ Reset | ✅ Reset | - |
| Score Run | - | - | - | ❌ +1 |

### Hardware Button Mapping

| Type | Buttons | Function |
|------|---------|----------|
| Balls | 4 buttons | **Positional** (which button = count) |
| Strikes | 3 buttons | **Positional** (which button = count) |
| Outs | 3 buttons | **Positional** (which button = count) |
| Runs | 1 button | **Counter** (each press increments) |

---

## Notes for Operators

### Manual Scoreboard Operation

1. **Track the count**: Listen to umpire's calls
2. **Press corresponding button**: Based on current count
3. **Hit by pitch**: If batter is hit by pitch, immediately reset balls/strikes to 0-0
4. **Reset after at-bat**: Release all buttons when batter's turn ends
5. **Track outs**: Press out button after each out
6. **Reset after 3 outs**: Release all buttons between half-innings
7. **Count runs**: Press run button each time a player crosses home plate
8. **Never reset runs**: Runs accumulate for the entire game

### Common Mistakes to Avoid

❌ **Don't reset runs** between innings
❌ **Don't forget to reset** balls/strikes after an at-bat
❌ **Don't forget to reset** balls/strikes when batter is hit by pitch
❌ **Don't forget to reset outs** after 3 outs
✅ **Do reset** to 0-0 count for each new batter
✅ **Do reset** immediately when batter is hit by pitch
✅ **Do increment runs** for every score
✅ **Do communicate** with official scorekeeper

---

## Summary

Baseball is a game of **three states** that reset, and **one state** that accumulates:

1. **Balls (0-4)**: Reset after each at-bat
2. **Strikes (0-3)**: Reset after each at-bat
3. **Outs (0-3)**: Reset after each half-inning
4. **Runs (0-∞)**: Accumulate for entire game ✨

The scoreboard app mirrors this logic with hardware buttons that set these states and displays them in real-time for players, coaches, and fans!

⚾ **Play Ball!**

---

## References

[1] [Rules of Baseball - Wikipedia](https://en.wikipedia.org/wiki/Rules_of_baseball)  
[2] [Baseball Rules Explained - YouTube](https://www.youtube.com/watch?v=RizBmMwxH3E)  
[3] [Which Team Pitches First in Baseball](https://www.platecrate.com/blogs/baseball-101/which-team-pitches-first-in-baseball-understanding-the-dynamics-of-game-start)  
[4] [Baseball Basics - YouTube](https://www.youtube.com/watch?v=rh-GSMfwaG0)  
[5] [Understanding the Count - YouTube](https://www.youtube.com/watch?v=KGQLty_u6ok)  
[6] [Understanding Strikes and Balls - Scrappers Baseball](https://scrappersbaseball.com/2025/09/07/understanding-strikes-and-balls-in-baseball-a-beginners-guide/)  
[7] [Strikes, Balls and Strike Zone - Ducksters](https://www.ducksters.com/sports/baseball/strikes_balls_and_strike_zone.php)  
[8] [Strike Zone - Wikipedia](https://en.wikipedia.org/wiki/Strike_zone)  
[9] [Why Three Strikes and Four Balls - MLB.com](https://www.mlb.com/cut4/why-there-are-three-strikes-and-four-balls-c304273342)  
[10] [Baseball Basics - Trinitonian](https://trinitonian.com/2025/10/24/three-strikes-youre-out-baseball-basics/)  
[11] [How Do You Remember Ball/Strike Order - Reddit](https://www.reddit.com/r/baseball/comments/rwo3n9/how_do_you_remember_which_number_counts_the/)  
[12] [Foul Ball Limits Discussion - Reddit](https://www.reddit.com/r/mlb/comments/1d3kij0/how_long_before_mlb_limits_the_number_of_foul/)  
[13] [Baseball - Wikipedia](https://en.wikipedia.org/wiki/Baseball)  
[14] [Baseball 101: Rules - NBC Olympics](https://www.nbcolympics.com/news/baseball-101-rules)
