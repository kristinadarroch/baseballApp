import BlueDigitalScoreboardLayout from '@/components/scoreboard/BlueDigitalScoreboardLayout';
import ClassicScoreboardLayout from '@/components/scoreboard/ClassicScoreboardLayout';
import DarkModernScoreboardLayout from '@/components/scoreboard/DarkModernScoreboardLayout';
import RedLEDScoreboardLayout from '@/components/scoreboard/RedLEDScoreboardLayout';
import { SCOREBOARD_THEMES } from '@/constants/scoreboard-themes';
import { useConnection } from '@/contexts/ConnectionContext';
import * as ScreenOrientation from 'expo-screen-orientation';
import { useEffect, useMemo } from 'react';
import { Dimensions, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width, height } = Dimensions.get('window');
const isTablet = Math.min(width, height) >= 600;

export default function HomeScreen() {
  const { isConnected, disconnect, balls, strikes, outs, runs, fullGameState, beginGame, endGame, visitorTeamName, homeTeamName, visitorRoster, homeRoster, scoreboardTheme, gameElapsedTime } = useConnection();

  // Get theme colors
  const themeColors = SCOREBOARD_THEMES[scoreboardTheme].colors;

  // Get current batter
  const getCurrentBatter = () => {
    if (!fullGameState.gameStarted) return null;
    
    const currentRoster = fullGameState.currentBatterTeam === 'visitor' ? visitorRoster : homeRoster;
    const lineupPlayers = currentRoster.filter(p => p.isInLineup !== false); // Include players without isInLineup property
    
    if (lineupPlayers.length === 0) return null;
    
    // Get the correct batting position based on which team is batting
    const batterPosition = fullGameState.currentBatterTeam === 'visitor' 
      ? fullGameState.visitorBatterPosition 
      : fullGameState.homeBatterPosition;
    
    const batterIndex = batterPosition % lineupPlayers.length;
    return lineupPlayers[batterIndex];
  };

  const currentBatter = getCurrentBatter();

  // Get inning score with real-time runs for active inning
  const getInningScore = (team: 'visitor' | 'home', inningIndex: number) => {
    const currentInningIndex = fullGameState.inning - 1;
    const isActiveInning = inningIndex === currentInningIndex;
    const isTeamBatting = fullGameState.currentBatterTeam === team;
    const isCorrectHalf = team === 'visitor' ? fullGameState.isTopOfInning : !fullGameState.isTopOfInning;
    
    // Show real-time runs if this is the active team's current inning
    if (fullGameState.gameStarted && isActiveInning && isTeamBatting && isCorrectHalf) {
      return runs; // Show current runs in real-time
    }
    
    // Otherwise show the committed score
    const committedScores = team === 'visitor' ? fullGameState.visitorInningScores : fullGameState.homeInningScores;
    return committedScores[inningIndex] !== undefined ? committedScores[inningIndex] : '-';
  };

  // Lock to landscape orientation for scoreboard
  useEffect(() => {
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
    
    return () => {
      // Unlock when leaving screen
      ScreenOrientation.unlockAsync();
    };
  }, []);

  // Create dynamic styles based on theme
  const styles = useMemo(() => createStyles(themeColors), [themeColors]);

  // Format elapsed time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Render the appropriate scoreboard layout based on theme
  const renderScoreboardLayout = () => {
    const currentBatterNumber = currentBatter ? currentBatter.number : '-';
    
    const layoutProps = {
      themeColors,
      visitorTeamName,
      homeTeamName,
      fullGameState,
      balls,
      strikes,
      outs,
      runs,
      currentBatterNumber,
      isTablet,
      getInningScore,
    };

    // Use custom layout for blue-digital theme
    if (scoreboardTheme === 'blue-digital') {
      return <BlueDigitalScoreboardLayout {...layoutProps} />;
    }
    
    // Use custom layout for red-led theme
    if (scoreboardTheme === 'red-led') {
      return <RedLEDScoreboardLayout {...layoutProps} />;
    }
    
    // Use custom layout for dark-modern theme
    if (scoreboardTheme === 'dark-modern') {
      return <DarkModernScoreboardLayout {...layoutProps} />;
    }
    
    // Use classic layout for all other themes
    return <ClassicScoreboardLayout {...layoutProps} />;
  };

  return (
    <View style={styles.container}>
      {/* Main Scoreboard */}
      <View style={styles.scoreboard}>
        {/* Status Bar */}
        <View style={styles.statusBar}>
          <View style={[styles.statusDot, isConnected ? styles.statusConnected : styles.statusDisconnected]} />
          <Text style={styles.statusText}>{isConnected ? 'LIVE' : 'OFFLINE'}</Text>

          {/* Game Timer */}
          {fullGameState.gameStarted && (
            <View style={styles.timerDisplay}>
              <Text style={styles.timerLabel}>TIME:</Text>
              <Text style={styles.timerValue}>{formatTime(gameElapsedTime)}</Text>
            </View>
          )}

          <View style={styles.statusBarRight}>
            {fullGameState.gameStarted && (
              <TouchableOpacity style={styles.endGameBtn} onPress={endGame}>
                <Text style={styles.endGameText}>END GAME</Text>
              </TouchableOpacity>
            )}
            {isConnected && (
              <TouchableOpacity style={styles.disconnectBtn} onPress={disconnect}>
                <Text style={styles.disconnectText}>DISCONNECT</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Game Control - Begin Game Button */}
          {!fullGameState.gameStarted && (
            <View style={styles.gameControlPanel}>
              <Text style={styles.gameControlTitle}>Ready to Start</Text>
              <TouchableOpacity style={styles.beginGameButton} onPress={beginGame}>
                <Text style={styles.beginGameText}>⚾ BEGIN GAME</Text>
              </TouchableOpacity>
              <Text style={styles.gameControlHint}>Visitor team will bat first (top of 1st inning)</Text>
            </View>
          )}

          {/* Render the appropriate scoreboard layout based on theme */}
          {fullGameState.gameStarted && renderScoreboardLayout()}
        </ScrollView>
      </View>
    </View>
  );
}

// Create styles function that uses theme colors
const createStyles = (themeColors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  
  // Main Scoreboard
  scoreboard: {
    flex: 1,
    backgroundColor: themeColors.background,
  },
  
  // Status Bar
  statusBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: themeColors.headerBackground,
    paddingHorizontal: 20,
    paddingVertical: 12,
    paddingTop: Platform.OS === 'ios' ? 50 : 12,
    borderBottomWidth: 3,
    borderBottomColor: themeColors.secondaryText,
  },
  statusDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 10,
    borderWidth: 2,
    borderColor: themeColors.secondaryText,
  },
  statusConnected: {
    backgroundColor: '#00ff00',
  },
  statusDisconnected: {
    backgroundColor: '#ff0000',
  },
  statusText: {
    color: themeColors.secondaryText,
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 2,
    flex: 1,
  },
  statusBarRight: {
    flexDirection: 'row',
    gap: 10,
  },
  endGameBtn: {
    backgroundColor: 'rgba(255, 165, 0, 0.3)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#FFA500',
  },
  endGameText: {
    color: '#FFA500',
    fontSize: 12,
    fontWeight: 'bold',
  },
  disconnectBtn: {
    backgroundColor: 'rgba(255, 0, 0, 0.3)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: themeColors.secondaryText,
  },
  disconnectText: {
    color: themeColors.secondaryText,
    fontSize: 12,
    fontWeight: 'bold',
  },
  
  // Timer Display
  timerDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 20,
    padding: 8,
    backgroundColor: 'rgba(0, 100, 200, 0.3)',
    borderRadius: 4,
    borderWidth: 2,
    borderColor: themeColors.secondaryText,
    marginRight: 20,
  },
  timerLabel: {
    color: themeColors.secondaryText,
    fontSize: 12,
    fontWeight: 'bold',
    marginRight: 8,
    opacity: 0.8,
  },
  timerValue: {
    color: themeColors.secondaryText,
    fontSize: 16,
    fontWeight: '900',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 3,
  },

  scrollContent: {
    paddingVertical: isTablet ? 30 : 16,
    paddingBottom: 40,
  },

  // Game Control Panel
  gameControlPanel: {
    backgroundColor: themeColors.headerBackground,
    padding: 30,
    marginHorizontal: isTablet ? 30 : 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 30,
    borderWidth: 3,
    borderColor: themeColors.secondaryText,
  },
  gameControlTitle: {
    color: themeColors.secondaryText,
    fontSize: 24,
    fontWeight: '900',
    marginBottom: 20,
    letterSpacing: 2,
  },
  beginGameButton: {
    backgroundColor: themeColors.secondaryText,
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 8,
    marginBottom: 15,
  },
  beginGameText: {
    color: themeColors.background,
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 2,
  },
  gameControlHint: {
    color: themeColors.secondaryText,
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.8,
  },

  // Game Status Panel
  gameStatusPanel: {
    backgroundColor: themeColors.headerBackground,
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 3,
    borderColor: themeColors.secondaryText,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  inningDisplay: {
    alignItems: 'center',
    flex: 1,
  },
  inningStatusText: {
    color: themeColors.secondaryText,
    fontSize: isTablet ? 28 : 22,
    fontWeight: '900',
    letterSpacing: 2,
  },
  halfInningText: {
    color: themeColors.secondaryText,
    fontSize: isTablet ? 20 : 16,
    fontWeight: 'bold',
    marginTop: 4,
  },
  batterDisplay: {
    alignItems: 'center',
    flex: 1,
    borderLeftWidth: 2,
    borderLeftColor: themeColors.secondaryText,
    paddingLeft: 20,
  },
  batterLabel: {
    color: themeColors.secondaryText,
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 1,
    opacity: 0.8,
  },
  batterTeam: {
    color: themeColors.secondaryText,
    fontSize: isTablet ? 24 : 20,
    fontWeight: '900',
    letterSpacing: 2,
    marginTop: 4,
  },

  // Score Grid
  scoreGrid: {
    marginBottom: 30,
  },
  headerRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  scoreRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  teamLabel: {
    width: isTablet ? 150 : 120,
    justifyContent: 'center',
    paddingRight: 12,
  },
  teamText: {
    color: themeColors.secondaryText,
    fontSize: isTablet ? 28 : 20,
    fontWeight: '900',
    letterSpacing: 1,
  },
  inningCell: {
    flex: 1,
    minWidth: isTablet ? 65 : 55,
    height: isTablet ? 50 : 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: isTablet ? 4 : 3,
  },
  inningText: {
    color: themeColors.secondaryText,
    fontSize: isTablet ? 36 : 28,
    fontWeight: '900',
  },
  inningScore: {
    flex: 1,
    minWidth: isTablet ? 65 : 55,
    height: isTablet ? 65 : 55,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: themeColors.headerBackground,
    marginHorizontal: isTablet ? 4 : 3,
    borderWidth: isTablet ? 3 : 3,
    borderColor: themeColors.secondaryText,
  },
  scoreText: {
    color: themeColors.secondaryText,
    fontSize: isTablet ? 40 : 32,
    fontWeight: '900',
  },
  runCell: {
    width: isTablet ? 80 : 60,
    height: isTablet ? 50 : 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: isTablet ? 12 : 8,
  },
  runHeaderText: {
    color: themeColors.secondaryText,
    fontSize: isTablet ? 36 : 28,
    fontWeight: '900',
  },
  totalRuns: {
    width: isTablet ? 80 : 60,
    height: isTablet ? 60 : 50,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: themeColors.headerBackground,
    marginLeft: isTablet ? 12 : 8,
    borderWidth: isTablet ? 4 : 3,
    borderColor: themeColors.secondaryText,
  },
  totalRunsText: {
    color: themeColors.secondaryText,
    fontSize: isTablet ? 40 : 32,
    fontWeight: '900',
  },

  // Bottom Section
  bottomSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-start',
    flexWrap: 'nowrap',
    gap: isTablet ? 30 : 15,
    marginTop: isTablet ? 30 : 20,
  },
  
  // At Bat
  atBatSection: {
    alignItems: 'center',
    minWidth: isTablet ? 180 : 150,
  },
  sectionLabel: {
    color: themeColors.secondaryText,
    fontSize: isTablet ? 30 : 22,
    fontWeight: '900',
    letterSpacing: 1,
    marginBottom: isTablet ? 16 : 12,
  },
  atBatBox: {
    width: isTablet ? 100 : 80,
    height: isTablet ? 100 : 80,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: isTablet ? 4 : 3,
    borderColor: themeColors.secondaryText,
  },
  atBatText: {
    color: themeColors.secondaryText,
    fontSize: isTablet ? 50 : 40,
    fontWeight: '900',
  },

  // Indicators (Ball, Strike, Out)
  indicatorSection: {
    alignItems: 'center',
    minWidth: isTablet ? 200 : 150,
  },
  indicatorRow: {
    flexDirection: 'row',
    gap: isTablet ? 16 : 12,
  },
  indicator: {
    width: isTablet ? 60 : 50,
    height: isTablet ? 60 : 50,
    borderRadius: isTablet ? 30 : 25,
    backgroundColor: themeColors.headerBackground,
    borderWidth: isTablet ? 4 : 3,
    borderColor: themeColors.secondaryText,
  },
  indicatorActive: {
    backgroundColor: themeColors.accentColor,
  },
});
