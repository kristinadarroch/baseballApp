import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useContext, useEffect, useRef, useState } from 'react';

// ========================================
// ESP32 Configuration
// ========================================
// Default to Access Point Mode (production)
// Can be changed in Settings screen for development
const DEFAULT_ESP32_IP = '192.168.4.1';
const ESP32_IP_STORAGE_KEY = '@esp32_ip_address';

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
  connect: () => void;
  disconnect: () => void;
  beginGame: () => void;
  endGame: () => void;
  setEsp32IpAddress: (ip: string) => Promise<void>;
}

const ConnectionContext = createContext<ConnectionContextType | undefined>(undefined);

export function ConnectionProvider({ children }: { children: ReactNode }) {
  const [esp32IpAddress, setEsp32IpAddressState] = useState<string>(DEFAULT_ESP32_IP);
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
  });

  // Track previous button states to detect press events (rising edge 0->1)
  const [prevBallState, setPrevBallState] = useState<number[]>([0, 0, 0, 0]);
  const [prevStrikeState, setPrevStrikeState] = useState<number[]>([0, 0, 0]);
  const [prevOutState, setPrevOutState] = useState<number[]>([0, 0, 0]);
  
  // Use ref for run state to avoid async state update issues
  const prevRunStateRef = useRef<number>(0);
  
  // Flag to prevent concurrent fetches
  const isFetchingRef = useRef<boolean>(false);
  
  // Timers to debounce reset (prevent reset during rotary switch transitions)
  const ballResetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const strikeResetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const outResetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pollInterval, setPollInterval] = useState<ReturnType<typeof setInterval> | null>(null);

  // Load saved IP address on mount
  useEffect(() => {
    loadSavedIpAddress();
  }, []);

  const loadSavedIpAddress = async () => {
    try {
      const savedIp = await AsyncStorage.getItem(ESP32_IP_STORAGE_KEY);
      if (savedIp) {
        console.log(`Loaded saved IP address: ${savedIp}`);
        setEsp32IpAddressState(savedIp);
      } else {
        console.log(`Using default IP address: ${DEFAULT_ESP32_IP}`);
      }
    } catch (error) {
      console.error('Error loading IP address:', error);
    }
  };

  const setEsp32IpAddress = async (ip: string) => {
    try {
      await AsyncStorage.setItem(ESP32_IP_STORAGE_KEY, ip);
      setEsp32IpAddressState(ip);
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

  const fetchGameState = async () => {
    // Prevent concurrent fetches
    if (isFetchingRef.current) {
      return;
    }
    
    isFetchingRef.current = true;
    
    try {
      const STATUS_ENDPOINT = `http://${esp32IpAddress}/status`;
      const response = await fetch(STATUS_ENDPOINT, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
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
      
      // Check outs for button press or reset (with debounce for rotary switches)
      const allOutsZero = data.outs.every(o => o === 0);
      if (allOutsZero) {
        // All switches off - but wait 200ms before resetting (debounce for rotary switch transitions)
        if (!outResetTimerRef.current) {
          outResetTimerRef.current = setTimeout(() => {
            setOuts(prev => {
              if (prev !== 0) {
                console.log(`All out buttons released (sustained), resetting count to 0`);
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
        
        data.outs.forEach((current, index) => {
          if (current === 1 && prevOutState[index] === 0) {
            const newCount = index + 1;
            console.log(`Out button ${index + 1} pressed, setting count to ${newCount}`);
            setOuts(newCount);
            
            // Check if this is the 3rd out - switch teams/innings
            if (newCount === 3) {
              console.log(`3 outs - switching teams`);
              handleThreeOuts();
            }
          }
        });
      }
      setPrevOutState(data.outs);
      
      // Check run button for toggle (latch)
      // Run button toggles: high→low OR low→high both count as 1 run
      // Press once → goes high (1) = 1 run
      // Press again → goes low (0) = 1 run
      // Use ref for immediate tracking to prevent double-counting
      const currentRunState = data.run;
      const previousRunState = prevRunStateRef.current;
      
      // Update debug display
      setDebugRunButtonState(currentRunState);
      
      if (currentRunState !== previousRunState) {
        // Update ref IMMEDIATELY to prevent duplicate detections
        prevRunStateRef.current = currentRunState;
        
        // State changed (either 0→1 or 1→0)
        setRuns(prevRuns => prevRuns + 1);
        
        // Add run to appropriate team's score
        setFullGameState(prevState => ({
          ...prevState,
          visitorScore: prevState.currentBatterTeam === 'visitor' 
            ? prevState.visitorScore + 1 
            : prevState.visitorScore,
          homeScore: prevState.currentBatterTeam === 'home' 
            ? prevState.homeScore + 1 
            : prevState.homeScore,
        }));
      }
      
      setIsConnected(true);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect');
      setIsConnected(false);
    } finally {
      // Always release the fetching flag
      isFetchingRef.current = false;
    }
  };

  const connect = () => {
    setIsLoading(true);
    // Initial fetch
    fetchGameState().finally(() => setIsLoading(false));
    
    // Set up polling every 500ms
    const interval = setInterval(() => {
      fetchGameState();
    }, 500);
    
    setPollInterval(interval);
  };

  // Handle 3 outs - switch teams or innings
  const handleThreeOuts = () => {
    setFullGameState(prevState => {
      if (prevState.isTopOfInning) {
        // Top of inning complete, switch to bottom (home team bats)
        console.log(`Top of inning ${prevState.inning} complete. Home team now batting.`);
        return {
          ...prevState,
          isTopOfInning: false,
          currentBatterTeam: 'home',
        };
      } else {
        // Bottom of inning complete, move to next inning
        const nextInning = prevState.inning + 1;
        console.log(`Inning ${prevState.inning} complete. Moving to inning ${nextInning}. Visitor team now batting.`);
        return {
          ...prevState,
          inning: nextInning,
          isTopOfInning: true,
          currentBatterTeam: 'visitor',
        };
      }
    });
    
    // Reset per-half-inning counts after 3 outs
    // Note: Operator should release buttons, but we help by resetting
    setTimeout(() => {
      setBalls(0);
      setStrikes(0);
      setOuts(0);
      setRuns(0); // Runs reset per half-inning
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
    });
    setBalls(0);
    setStrikes(0);
    setOuts(0);
    setRuns(0);
    setPrevBallState([0, 0, 0, 0]);
    setPrevStrikeState([0, 0, 0]);
    setPrevOutState([0, 0, 0]);
    prevRunStateRef.current = 0;
  };

  // End the current game
  const endGame = () => {
    console.log('Ending game');
    setFullGameState({
      inning: 1,
      isTopOfInning: true,
      visitorScore: 0,
      homeScore: 0,
      currentBatterTeam: 'visitor',
      gameStarted: false,
    });
    setBalls(0);
    setStrikes(0);
    setOuts(0);
    setRuns(0);
  };

  const disconnect = () => {
    if (pollInterval) {
      clearInterval(pollInterval);
      setPollInterval(null);
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
    
    setIsConnected(false);
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
  };

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      if (pollInterval) {
        clearInterval(pollInterval);
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
    };
  }, [pollInterval]);

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
        connect, 
        disconnect,
        beginGame,
        endGame,
        setEsp32IpAddress,
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

