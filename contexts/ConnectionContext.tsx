import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useContext, useEffect, useRef, useState } from 'react';
import { DEFAULT_THEME, ScoreboardTheme } from '../constants/scoreboard-themes';

// ========================================
// ESP32 Configuration
// ========================================
// Default to Access Point Mode (production)
// Can be changed in Settings screen for development
const DEFAULT_ESP32_IP = '192.168.4.1';
const ESP32_IP_STORAGE_KEY = '@esp32_ip_address';
const SCOREBOARD_THEME_STORAGE_KEY = '@scoreboard_theme';
const STATUS_POLL_INTERVAL_MS = 150;
const STATUS_REQUEST_TIMEOUT_MS = 1500;
const CONNECT_REQUEST_TIMEOUT_MS = 5000;
const MAX_CONSECUTIVE_FAILURES = 3;

export interface GameState {
  balls: number[];
  strikes: number[];
  outs: number[];
  run: number;
}

export interface FullGameState {
  inning: number;
  isTopOfInning: boolean; // true = top (visitor bats), false = bottom (home bats)
  visitorScore: number;
  homeScore: number;
  currentBatterTeam: 'visitor' | 'home';
  gameStarted: boolean;
  totalOuts: number; // Total outs from start of game
  currentInningOuts: number; // Outs in current inning (0-6, resets each inning)
  visitorBatterPosition: number; // 0-8 (visitor team's batting order position)
  homeBatterPosition: number; // 0-8 (home team's batting order position)
  visitorInningScores: number[]; // Runs per inning for visitor [inning1, inning2, ...]
  homeInningScores: number[]; // Runs per inning for home [inning1, inning2, ...]
}

export interface AtBatLog {
  inning: number;
  isTop: boolean;
  team: 'visitor' | 'home';
  finalBalls: number;
  finalStrikes: number;
  result: 'out' | 'in-progress';
  timestamp: number;
}

export interface Player {
  number: string;
  name: string;
  isInLineup: boolean; // true = active lineup, false = bench/alternate
}

interface ConnectionContextType {
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  gameState: GameState | null;
  balls: number;
  strikes: number;
  outs: number;
  runs: number;
  fullGameState: FullGameState;
  esp32IpAddress: string;
  debugRunButtonState: number; // For debugging
  visitorTeamName: string;
  homeTeamName: string;
  visitorRoster: Player[];
  homeRoster: Player[];
  scoreboardTheme: ScoreboardTheme;
  gameElapsedTime: number; // Elapsed time in seconds
  connect: () => void;
  disconnect: () => void;
  beginGame: () => void;
  endGame: () => void;
  setEsp32IpAddress: (ip: string) => Promise<void>;
  setVisitorTeamName: (name: string) => Promise<void>;
  setHomeTeamName: (name: string) => Promise<void>;
  setVisitorRoster: (roster: Player[]) => void;
  setHomeRoster: (roster: Player[]) => void;
  setScoreboardTheme: (theme: ScoreboardTheme) => Promise<void>;
}

const ConnectionContext = createContext<ConnectionContextType | undefined>(undefined);

export function ConnectionProvider({ children }: { children: ReactNode }) {
  const [esp32IpAddress, setEsp32IpAddressState] = useState<string>(DEFAULT_ESP32_IP);
  const esp32IpAddressRef = useRef<string>(DEFAULT_ESP32_IP);
  const [visitorTeamName, setVisitorTeamNameState] = useState<string>('VISITOR');
  const [homeTeamName, setHomeTeamNameState] = useState<string>('HOME');
  const [visitorRoster, setVisitorRosterState] = useState<Player[]>([]);
  const [homeRoster, setHomeRosterState] = useState<Player[]>([]);
  const [scoreboardTheme, setScoreboardThemeState] = useState<ScoreboardTheme>(DEFAULT_THEME);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [balls, setBalls] = useState<number>(0);
  const [strikes, setStrikes] = useState<number>(0);
  const [outs, setOuts] = useState<number>(0);
  const [runs, setRuns] = useState<number>(0);
  const [debugRunButtonState, setDebugRunButtonState] = useState<number>(0);

  // Full game state tracking
  const [fullGameState, setFullGameState] = useState<FullGameState>({
    inning: 1,
    isTopOfInning: true, // Visitor always bats first (top of 1st)
    visitorScore: 0,
    homeScore: 0,
    currentBatterTeam: 'visitor',
    gameStarted: false,
    totalOuts: 0,
    currentInningOuts: 0,
    visitorBatterPosition: 0, // Start with first batter
    homeBatterPosition: 0, // Start with first batter
    visitorInningScores: [], // Runs per inning
    homeInningScores: [], // Runs per inning
  });

  // At-bat logging
  const [atBatLog, setAtBatLog] = useState<AtBatLog[]>([]);

  // Track previous button states to detect press events (rising edge 0->1)
  const [prevBallState, setPrevBallState] = useState<number[]>([0, 0, 0, 0]);
  const [prevStrikeState, setPrevStrikeState] = useState<number[]>([0, 0, 0]);
  const [prevOutState, setPrevOutState] = useState<number[]>([0, 0, 0]);
  
  // Use ref for run state to avoid async state update issues
  const prevRunStateRef = useRef<number>(0);
  
  // Track if we've initialized the run button (to handle startup state)
  const runButtonInitializedRef = useRef<boolean>(false);
  
  // Track runs scored in current half-inning (before it's committed to inning scores)
  const currentHalfInningRunsRef = useRef<number>(0);
  
  // Track previous out/run counts to detect increments (for batter advancement)
  const prevOutCountRef = useRef<number>(0);
  const prevRunCountRef = useRef<number>(0);
  
  // Flag to prevent concurrent fetches
  const isFetchingRef = useRef<boolean>(false);
  const consecutiveFailureCountRef = useRef<number>(0);
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isConnectedRef = useRef<boolean>(false);
  
  // Timers to debounce reset (prevent reset during rotary switch transitions)
  const ballResetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const strikeResetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const outResetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Game timer state
  const [gameElapsedTime, setGameElapsedTime] = useState<number>(0); // in seconds
  const gameStartTimeRef = useRef<number | null>(null);
  const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const setConnectionStatus = (connected: boolean) => {
    isConnectedRef.current = connected;
    setIsConnected(connected);
  };

  const updateEsp32IpAddress = (ip: string) => {
    esp32IpAddressRef.current = ip;
    setEsp32IpAddressState(ip);
  };

  // Load saved IP address on mount
  useEffect(() => {
    loadSavedIpAddress();
    loadSavedTheme();
  }, []);

  const loadSavedIpAddress = async () => {
    try {
      const savedIp = await AsyncStorage.getItem(ESP32_IP_STORAGE_KEY);
      if (savedIp) {
        console.log(`Loaded saved IP address: ${savedIp}`);
        updateEsp32IpAddress(savedIp);
      } else {
        console.log(`Using default IP address: ${DEFAULT_ESP32_IP}`);
      }
    } catch (error) {
      console.error('Error loading IP address:', error);
    }
  };

  const loadSavedTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem(SCOREBOARD_THEME_STORAGE_KEY);
      if (savedTheme && (savedTheme as ScoreboardTheme)) {
        console.log(`Loaded saved scoreboard theme: ${savedTheme}`);
        setScoreboardThemeState(savedTheme as ScoreboardTheme);
      } else {
        console.log(`Using default theme: ${DEFAULT_THEME}`);
      }
    } catch (error) {
      console.error('Error loading scoreboard theme:', error);
    }
  };

  const setEsp32IpAddress = async (ip: string) => {
    try {
      await AsyncStorage.setItem(ESP32_IP_STORAGE_KEY, ip);
      updateEsp32IpAddress(ip);
      console.log(`Saved new IP address: ${ip}`);
      
      // If connected, disconnect and let user reconnect with new IP
      if (isConnected) {
        disconnect();
      }
    } catch (error) {
      console.error('Error saving IP address:', error);
      throw error;
    }
  };

  const setVisitorTeamName = async (name: string) => {
    const trimmedName = name.trim().toUpperCase();
    setVisitorTeamNameState(trimmedName);
    console.log(`Set visitor team name: ${trimmedName}`);
  };

  const setHomeTeamName = async (name: string) => {
    const trimmedName = name.trim().toUpperCase();
    setHomeTeamNameState(trimmedName);
    console.log(`Set home team name: ${trimmedName}`);
  };

  const setVisitorRoster = (roster: Player[]) => {
    setVisitorRosterState(roster);
    console.log(`Visitor roster updated: ${roster.length} players`);
  };

  const setHomeRoster = (roster: Player[]) => {
    setHomeRosterState(roster);
    console.log(`Home roster updated: ${roster.length} players`);
  };

  const setScoreboardTheme = async (theme: ScoreboardTheme) => {
    try {
      await AsyncStorage.setItem(SCOREBOARD_THEME_STORAGE_KEY, theme);
      setScoreboardThemeState(theme);
      console.log(`Saved scoreboard theme: ${theme}`);
    } catch (error) {
      console.error('Error saving scoreboard theme:', error);
      throw error;
    }
  };

  const fetchGameState = async (
    requestTimeoutMs = STATUS_REQUEST_TIMEOUT_MS,
    ipAddress = esp32IpAddressRef.current
  ): Promise<boolean> => {
    // Prevent concurrent fetches
    if (isFetchingRef.current) {
      return false;
    }
    
    isFetchingRef.current = true;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    let didTimeout = false;
    const statusEndpoint = `http://${ipAddress}/status?t=${Date.now()}`;
    
    try {
      console.log(`Fetching ESP32 status: ${statusEndpoint}`);
      const controller = new AbortController();
      timeoutId = setTimeout(() => {
        didTimeout = true;
        controller.abort();
      }, requestTimeoutMs);

      const response = await fetch(statusEndpoint, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
        },
        cache: 'no-store',
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: GameState = await response.json();
      setGameState(data);
      
      // Detect button press events (rising edge: 0 -> 1)
      // it will go high and latch, that is a run, then you will press again and it will latch low, that is a run

      
      // Check balls for button press or reset (with debounce for rotary switches)
      const allBallsZero = data.balls.every(b => b === 0);
      if (allBallsZero) {
        // All switches off - but wait 200ms before resetting (debounce for rotary switch transitions)
        if (!ballResetTimerRef.current) {
          ballResetTimerRef.current = setTimeout(() => {
            setBalls(prev => {
              if (prev !== 0) {
                console.log(`All ball buttons released (sustained), resetting count to 0`);
                return 0;
              }
              return prev;
            });
            ballResetTimerRef.current = null;
          }, 500);
        }
      } else {
        // Cancel any pending reset
        if (ballResetTimerRef.current) {
          clearTimeout(ballResetTimerRef.current);
          ballResetTimerRef.current = null;
        }
        
        // Check for button presses
        data.balls.forEach((current, index) => {
          if (current === 1 && prevBallState[index] === 0) {
            // Button pressed (rising edge detected)
            const newCount = index + 1; // Button 0 = 1 ball, Button 1 = 2 balls, etc.
            console.log(`Ball button ${index + 1} pressed, setting count to ${newCount}`);
            setBalls(newCount);
          }
        });
      }
      setPrevBallState(data.balls);
      
      // Check strikes for button press or reset (with debounce for rotary switches)
      const allStrikesZero = data.strikes.every(s => s === 0);
      if (allStrikesZero) {
        // All switches off - but wait 200ms before resetting (debounce for rotary switch transitions)
        if (!strikeResetTimerRef.current) {
          strikeResetTimerRef.current = setTimeout(() => {
            setStrikes(prev => {
              if (prev !== 0) {
                console.log(`All strike buttons released (sustained), resetting count to 0`);
                return 0;
              }
              return prev;
            });
            strikeResetTimerRef.current = null;
          }, 500);
        }
      } else {
        // Cancel any pending reset
        if (strikeResetTimerRef.current) {
          clearTimeout(strikeResetTimerRef.current);
          strikeResetTimerRef.current = null;
        }
        
        data.strikes.forEach((current, index) => {
          if (current === 1 && prevStrikeState[index] === 0) {
            const newCount = index + 1;
            console.log(`Strike button ${index + 1} pressed, setting count to ${newCount}`);
            setStrikes(newCount);
          }
        });
      }
      setPrevStrikeState(data.strikes);
      
      // Check outs for button press or reset (SIMPLIFIED)
      const allOutsZero = data.outs.every(o => o === 0);
      if (allOutsZero) {
        // All switches off - debounce before resetting
        if (!outResetTimerRef.current) {
          outResetTimerRef.current = setTimeout(() => {
            setOuts(prev => {
              const wasThreeOuts = prev === 3;
              if (prev !== 0) {
                console.log(`Outs resetting from ${prev} to 0`);
                
                // SIMPLE RULE: If outs was 3, now going to 0 → change inning
                if (wasThreeOuts) {
                  console.log(`⚾⚾⚾ INNING CHANGE: Outs went 3→0 ⚾⚾⚾`);
                  // Advance inning after state update completes
                  setTimeout(() => advanceInning(), 50);
                }
                
                return 0;
              }
              return prev;
            });
            outResetTimerRef.current = null;
          }, 500);
        }
      } else {
        // Cancel any pending reset
        if (outResetTimerRef.current) {
          clearTimeout(outResetTimerRef.current);
          outResetTimerRef.current = null;
        }
        
        // Check for button presses - record the out count and advance batter if increased
        data.outs.forEach((current, index) => {
          if (current === 1 && prevOutState[index] === 0) {
            const newCount = index + 1;
            console.log(`⚾ Out ${newCount} recorded`);
            setOuts(newCount);

            // Check if this is a NEW out (count increased from previous) and advance batter
            // Use functional update to access current gameStarted state (avoids stale closure)
            if (newCount > prevOutCountRef.current) {
              setFullGameState(prevState => {
                if (!prevState.gameStarted) {
                  return prevState; // No change if game not started
                }

                console.log(`Out count increased: ${prevOutCountRef.current} → ${newCount}. Advancing batter.`);
                prevOutCountRef.current = newCount; // Update BEFORE advancing to prevent duplicates

                // Advance batter immediately
                const isVisitor = prevState.currentBatterTeam === 'visitor';
                const currentPos = isVisitor ? prevState.visitorBatterPosition : prevState.homeBatterPosition;
                const nextPos = (currentPos + 1) % 9;

                console.log(`   Batter #${currentPos + 1} → Batter #${nextPos + 1} (OUT)`);

                return isVisitor
                  ? { ...prevState, visitorBatterPosition: nextPos }
                  : { ...prevState, homeBatterPosition: nextPos };
              });
            }
          }
        });
      }
      setPrevOutState(data.outs);
      
      // Check run button for toggle (latch)
      // Run button toggles: high→low OR low→high both count as 1 run
      // IMPORTANT: On game startup, button might be high or low - we need to capture
      // the initial state WITHOUT counting it as a run, then count only CHANGES
      const currentRunState = data.run;
      const previousRunState = prevRunStateRef.current;
      
      // Update debug display
      setDebugRunButtonState(currentRunState);
      
      // Check if this is first read after game start
      if (!runButtonInitializedRef.current) {
        // First read - just capture the current state, don't count as a run
        prevRunStateRef.current = currentRunState;
        runButtonInitializedRef.current = true;
        console.log(`🎮 Run button initialized at startup: state = ${currentRunState} (${currentRunState === 1 ? 'HIGH' : 'LOW'})`);
      } else if (currentRunState !== previousRunState) {
        // State changed (either 0→1 or 1→0) - this is a real run!
        // Update ref IMMEDIATELY to prevent duplicate detections
        prevRunStateRef.current = currentRunState;

        // Track run for current half-inning
        currentHalfInningRunsRef.current += 1;
        console.log(`⚾ Run scored! Half-inning runs: ${currentHalfInningRunsRef.current}`);

        // Use functional update to avoid stale closure issues
        setRuns(prevRuns => {
          const newRunCount = prevRuns + 1;

          // Check if run count increased and advance batter (using ref for gameStarted check)
          setFullGameState(prevState => {
            if (!prevState.gameStarted) {
              // Just add the run to score without advancing batter
              return {
                ...prevState,
                visitorScore: prevState.currentBatterTeam === 'visitor'
                  ? prevState.visitorScore + 1
                  : prevState.visitorScore,
                homeScore: prevState.currentBatterTeam === 'home'
                  ? prevState.homeScore + 1
                  : prevState.homeScore,
              };
            }

            if (newRunCount > prevRunCountRef.current) {
              console.log(`   Run count increased: ${prevRunCountRef.current} → ${newRunCount}. Advancing batter.`);
              prevRunCountRef.current = newRunCount; // Update BEFORE advancing to prevent duplicates

              // Add run to score AND advance batter
              const isVisitor = prevState.currentBatterTeam === 'visitor';
              const currentPos = isVisitor ? prevState.visitorBatterPosition : prevState.homeBatterPosition;
              const nextPos = (currentPos + 1) % 9;

              console.log(`   Batter #${currentPos + 1} → Batter #${nextPos + 1} (RUN)`);

              return {
                ...prevState,
                visitorScore: prevState.currentBatterTeam === 'visitor'
                  ? prevState.visitorScore + 1
                  : prevState.visitorScore,
                homeScore: prevState.currentBatterTeam === 'home'
                  ? prevState.homeScore + 1
                  : prevState.homeScore,
                visitorBatterPosition: isVisitor ? nextPos : prevState.visitorBatterPosition,
                homeBatterPosition: isVisitor ? prevState.homeBatterPosition : nextPos,
              };
            }

            // Just add the run to score without advancing batter
            return {
              ...prevState,
              visitorScore: prevState.currentBatterTeam === 'visitor'
                ? prevState.visitorScore + 1
                : prevState.visitorScore,
              homeScore: prevState.currentBatterTeam === 'home'
                ? prevState.homeScore + 1
                : prevState.homeScore,
            };
          });

          return newRunCount;
        });
      }
      
      consecutiveFailureCountRef.current = 0;
      setConnectionStatus(true);
      setError(null);
      return true;
    } catch (err) {
      const message = didTimeout
        ? `Timeout after ${requestTimeoutMs}ms trying ${ipAddress}`
        : err instanceof Error
          ? err.message
          : 'Failed to connect';

      console.error(`ESP32 status request failed: ${message}`);
      consecutiveFailureCountRef.current += 1;
      setError(message);

      if (!isConnectedRef.current || consecutiveFailureCountRef.current >= MAX_CONSECUTIVE_FAILURES) {
        setConnectionStatus(false);
      }
      return false;
    } finally {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      // Always release the fetching flag
      isFetchingRef.current = false;
    }
  };

  const connect = () => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }

    consecutiveFailureCountRef.current = 0;
    setIsLoading(true);
    // Initial fetch. If a stale station-mode IP was saved, fall back to the
    // production clicker AP address.
    const initialIpAddress = esp32IpAddressRef.current;
    fetchGameState(CONNECT_REQUEST_TIMEOUT_MS, initialIpAddress)
      .then(async connected => {
        if (!connected && initialIpAddress !== DEFAULT_ESP32_IP) {
          console.log(`Retrying ESP32 connection with default IP: ${DEFAULT_ESP32_IP}`);
          const defaultConnected = await fetchGameState(CONNECT_REQUEST_TIMEOUT_MS, DEFAULT_ESP32_IP);
          if (defaultConnected) {
            await AsyncStorage.setItem(ESP32_IP_STORAGE_KEY, DEFAULT_ESP32_IP);
            updateEsp32IpAddress(DEFAULT_ESP32_IP);
          }
        }
      })
      .finally(() => setIsLoading(false));
    
    // Set up fast polling for near-real-time updates from the ESP32.
    const interval = setInterval(() => {
      fetchGameState();
    }, STATUS_POLL_INTERVAL_MS);
    
    pollIntervalRef.current = interval;
  };

  // SIMPLIFIED: Advance inning when umpire resets from 3 outs to 0
  const advanceInning = () => {
    const runsThisHalfInning = currentHalfInningRunsRef.current;
    
    setFullGameState(prevState => {
      const inningOutCount = prevState.currentInningOuts + 3; // Add the 3 outs we just completed
      
      // Top half complete (visitor done batting)
      if (prevState.isTopOfInning) {
        console.log(`✅ Top of inning ${prevState.inning} complete. Visitor scored ${runsThisHalfInning} runs.`);
        
        // Update visitor inning scores
        const updatedVisitorScores = [...prevState.visitorInningScores];
        updatedVisitorScores[prevState.inning - 1] = runsThisHalfInning;
        
        // Reset runs counter for home team
        currentHalfInningRunsRef.current = 0;
        
        // Switch to bottom of inning (home team bats)
        return {
          ...prevState,
          totalOuts: prevState.totalOuts + 3,
          currentInningOuts: inningOutCount,
          isTopOfInning: false,
          currentBatterTeam: 'home',
          visitorInningScores: updatedVisitorScores,
        };
      }
      // Bottom half complete (home done batting)
      else {
        console.log(`✅ Bottom of inning ${prevState.inning} complete. Home scored ${runsThisHalfInning} runs.`);
        
        // Update home inning scores
        const updatedHomeScores = [...prevState.homeInningScores];
        updatedHomeScores[prevState.inning - 1] = runsThisHalfInning;
        
        // Reset runs counter for next inning
        currentHalfInningRunsRef.current = 0;
        
        // Move to next inning (visitor bats)
        return {
          ...prevState,
          totalOuts: prevState.totalOuts + 3,
          currentInningOuts: 0, // Reset for new inning
          inning: prevState.inning + 1,
          isTopOfInning: true,
          currentBatterTeam: 'visitor',
          homeInningScores: updatedHomeScores,
        };
      }
    });
    
    // Reset per-at-bat counts and refs
    setTimeout(() => {
      setBalls(0);
      setStrikes(0);
      setOuts(0);
      setRuns(0);
      prevOutCountRef.current = 0;  // Reset so 0 doesn't trigger advancement
      prevRunCountRef.current = 0;  // Reset so 0 doesn't trigger advancement
    }, 100);
  };

  // OLD COMPLEX FUNCTION - keeping for now but will be replaced
  const handleThreeOuts = (finalBalls: number, finalStrikes: number) => {
    setFullGameState(prevState => {
      const newTotalOuts = prevState.totalOuts + 1;
      const newInningOuts = prevState.currentInningOuts + 1;
      
      console.log(`Out recorded: Total outs: ${newTotalOuts}, Inning outs: ${newInningOuts}`);
      
      // Log the at-bat
      const atBatEntry: AtBatLog = {
        inning: prevState.inning,
        isTop: prevState.isTopOfInning,
        team: prevState.currentBatterTeam,
        finalBalls,
        finalStrikes,
        result: 'out',
        timestamp: Date.now(),
      };
      setAtBatLog(prev => [...prev, atBatEntry]);
      console.log(`At-bat logged: Inning ${atBatEntry.inning} ${atBatEntry.isTop ? 'Top' : 'Bottom'}, ${atBatEntry.team}, Result: out`);
      
      // Advance batter for the team that made the out
      const isVisitorBatting = prevState.currentBatterTeam === 'visitor';
      const currentPosition = isVisitorBatting ? prevState.visitorBatterPosition : prevState.homeBatterPosition;
      const nextBatterPosition = (currentPosition + 1) % 9;
      
      console.log(`${prevState.currentBatterTeam} batter completed at-bat. Advancing from position ${currentPosition + 1} to ${nextBatterPosition + 1}`);
      
      // Update the correct team's batting position
      const updatedState = isVisitorBatting
        ? { ...prevState, visitorBatterPosition: nextBatterPosition }
        : { ...prevState, homeBatterPosition: nextBatterPosition };

      // Check if we need to advance half-inning or full inning
      // Every 3 outs = switch teams (half inning)
      // Every 6 outs = next inning
      if (newInningOuts === 3) {
        // 3 outs in this inning - switch to bottom half
        // Commit visitor's runs for this inning
        const runsThisHalfInning = currentHalfInningRunsRef.current;
        console.log(`Top of inning ${prevState.inning} complete (3 outs). Visitor scored ${runsThisHalfInning} runs.`);
        console.log(`Home team now batting at position ${updatedState.homeBatterPosition + 1}.`);
        
        // Update visitor inning scores
        const updatedVisitorScores = [...prevState.visitorInningScores];
        updatedVisitorScores[prevState.inning - 1] = runsThisHalfInning;
        
        // Reset half-inning runs counter for home team
        currentHalfInningRunsRef.current = 0;
        
        return {
          ...updatedState,
          totalOuts: newTotalOuts,
          currentInningOuts: newInningOuts,
          isTopOfInning: false,
          currentBatterTeam: 'home',
          visitorInningScores: updatedVisitorScores,
        };
      } else if (newInningOuts === 6) {
        // 6 outs in this inning - advance to next inning
        // Commit home's runs for this inning
        const runsThisHalfInning = currentHalfInningRunsRef.current;
        const nextInning = prevState.inning + 1;
        console.log(`Inning ${prevState.inning} complete (6 outs). Home scored ${runsThisHalfInning} runs.`);
        console.log(`Moving to inning ${nextInning}. Visitor team now batting at position ${updatedState.visitorBatterPosition + 1}.`);
        
        // Update home inning scores
        const updatedHomeScores = [...prevState.homeInningScores];
        updatedHomeScores[prevState.inning - 1] = runsThisHalfInning;
        
        // Reset half-inning runs counter for next inning
        currentHalfInningRunsRef.current = 0;
        
        return {
          ...updatedState,
          totalOuts: newTotalOuts,
          currentInningOuts: 0, // Reset inning outs
          inning: nextInning,
          isTopOfInning: true,
          currentBatterTeam: 'visitor',
          homeInningScores: updatedHomeScores,
        };
      } else {
        // Still in same half-inning
        return {
          ...updatedState,
          totalOuts: newTotalOuts,
          currentInningOuts: newInningOuts,
        };
      }
    });
    
    // Reset per-at-bat counts after out
    setTimeout(() => {
      setBalls(0);
      setStrikes(0);
      setOuts(0);
      // Runs stay (accumulate throughout half-inning)
    }, 100);
  };

  // Begin a new game
  const beginGame = () => {
    console.log('Beginning new game - Visitor team bats first (top of 1st inning)');
    setFullGameState({
      inning: 1,
      isTopOfInning: true,
      visitorScore: 0,
      homeScore: 0,
      currentBatterTeam: 'visitor',
      gameStarted: true,
      totalOuts: 0,
      currentInningOuts: 0,
      visitorBatterPosition: 0,
      homeBatterPosition: 0,
      visitorInningScores: [],
      homeInningScores: [],
    });
    setAtBatLog([]); // Clear at-bat log
    setBalls(0);
    setStrikes(0);
    setOuts(0);
    setRuns(0);
    setPrevBallState([0, 0, 0, 0]);
    setPrevStrikeState([0, 0, 0]);
    setPrevOutState([0, 0, 0]);
    prevRunStateRef.current = gameState?.run ?? prevRunStateRef.current;
    runButtonInitializedRef.current = true;  // Begin from the latest connected reading.
    currentHalfInningRunsRef.current = 0;  // Reset half-inning runs
    prevOutCountRef.current = 0;  // Reset out count tracking
    prevRunCountRef.current = 0;  // Reset run count tracking

    // Start game timer
    gameStartTimeRef.current = Date.now();
    setGameElapsedTime(0);

    // Update timer every second
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }
    timerIntervalRef.current = setInterval(() => {
      if (gameStartTimeRef.current) {
        const elapsed = Math.floor((Date.now() - gameStartTimeRef.current) / 1000);
        setGameElapsedTime(elapsed);
      }
    }, 1000);

    console.log('Game started. Batter advances on OUT or RUN. Timer started.');
  };

  // End the current game
  const endGame = () => {
    console.log(`Ending game. Total outs recorded: ${fullGameState.totalOuts}, At-bats logged: ${atBatLog.length}`);

    // Stop game timer
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    gameStartTimeRef.current = null;

    setFullGameState({
      inning: 1,
      isTopOfInning: true,
      visitorScore: 0,
      homeScore: 0,
      currentBatterTeam: 'visitor',
      gameStarted: false,
      totalOuts: 0,
      currentInningOuts: 0,
      visitorBatterPosition: 0,
      homeBatterPosition: 0,
      visitorInningScores: [],
      homeInningScores: [],
    });
    setAtBatLog([]); // Clear at-bat log
    setBalls(0);
    setStrikes(0);
    setOuts(0);
    setRuns(0);
    runButtonInitializedRef.current = false;  // Reset run button initialization
    currentHalfInningRunsRef.current = 0;  // Reset half-inning runs
    prevOutCountRef.current = 0;  // Reset out count tracking
    prevRunCountRef.current = 0;  // Reset run count tracking

    console.log('Game ended. Timer stopped.');
  };

  const disconnect = () => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
    
    // Clear any pending reset timers
    if (ballResetTimerRef.current) {
      clearTimeout(ballResetTimerRef.current);
      ballResetTimerRef.current = null;
    }
    if (strikeResetTimerRef.current) {
      clearTimeout(strikeResetTimerRef.current);
      strikeResetTimerRef.current = null;
    }
    if (outResetTimerRef.current) {
      clearTimeout(outResetTimerRef.current);
      outResetTimerRef.current = null;
    }
    
    consecutiveFailureCountRef.current = 0;
    setConnectionStatus(false);
    setGameState(null);
    // Reset counts and previous states
    setBalls(0);
    setStrikes(0);
    setOuts(0);
    setRuns(0);
    setPrevBallState([0, 0, 0, 0]);
    setPrevStrikeState([0, 0, 0]);
    setPrevOutState([0, 0, 0]);
    prevRunStateRef.current = 0;
    runButtonInitializedRef.current = false;
  };

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
      // Clear any pending reset timers
      if (ballResetTimerRef.current) {
        clearTimeout(ballResetTimerRef.current);
      }
      if (strikeResetTimerRef.current) {
        clearTimeout(strikeResetTimerRef.current);
      }
      if (outResetTimerRef.current) {
        clearTimeout(outResetTimerRef.current);
      }
      // Clear game timer
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, []);

  return (
    <ConnectionContext.Provider
      value={{
        isConnected,
        isLoading,
        error,
        gameState,
        balls,
        strikes,
        outs,
        runs,
        fullGameState,
        esp32IpAddress,
        debugRunButtonState,
        visitorTeamName,
        homeTeamName,
        visitorRoster,
        homeRoster,
        scoreboardTheme,
        gameElapsedTime,
        connect,
        disconnect,
        beginGame,
        endGame,
        setEsp32IpAddress,
        setVisitorTeamName,
        setHomeTeamName,
        setVisitorRoster,
        setHomeRoster,
        setScoreboardTheme,
      }}
    >
      {children}
    </ConnectionContext.Provider>
  );
}

export function useConnection() {
  const context = useContext(ConnectionContext);
  if (context === undefined) {
    throw new Error('useConnection must be used within a ConnectionProvider');
  }
  return context;
}
