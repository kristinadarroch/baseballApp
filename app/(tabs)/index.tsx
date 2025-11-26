import { useConnection } from '@/contexts/ConnectionContext';
import * as ScreenOrientation from 'expo-screen-orientation';
import { useEffect } from 'react';
import { Dimensions, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const SCOREBOARD_GREEN = '#2d6945';
const SCOREBOARD_DARK_GREEN = '#1a4029';
const WHITE = '#ffffff';

const { width, height } = Dimensions.get('window');
const isTablet = Math.min(width, height) >= 600;

export default function HomeScreen() {
  const { isConnected, disconnect, balls, strikes, outs, fullGameState, beginGame, endGame, debugRunButtonState } = useConnection();

  // Generate display arrays based on counts
  // If balls = 2, generate [1, 1, 0, 0] to show first 2 circles filled
  const ballsArray = Array.from({ length: 4 }, (_, i) => i < balls ? 1 : 0);
  const strikesArray = Array.from({ length: 3 }, (_, i) => i < strikes ? 1 : 0);
  const outsArray = Array.from({ length: 3 }, (_, i) => i < outs ? 1 : 0);

  // Lock to landscape orientation for scoreboard
  useEffect(() => {
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
    
    return () => {
      // Unlock when leaving screen
      ScreenOrientation.unlockAsync();
    };
  }, []);

  return (
    <View style={styles.container}>
      {/* Main Scoreboard */}
      <View style={styles.scoreboard}>
        {/* Status Bar */}
        <View style={styles.statusBar}>
          <View style={[styles.statusDot, isConnected ? styles.statusConnected : styles.statusDisconnected]} />
          <Text style={styles.statusText}>{isConnected ? 'LIVE' : 'OFFLINE'}</Text>
          
          {/* DEBUG: Run Button State */}
          <View style={styles.debugDisplay}>
            <Text style={styles.debugLabel}>RUN BTN:</Text>
            <Text style={[styles.debugValue, debugRunButtonState === 1 ? styles.debugHigh : styles.debugLow]}>
              {debugRunButtonState === 1 ? 'HIGH (1)' : 'LOW (0)'}
            </Text>
          </View>
          
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

          {/* Game Status Display */}
          {fullGameState.gameStarted && (
            <View style={styles.gameStatusPanel}>
              <View style={styles.inningDisplay}>
                <Text style={styles.inningStatusText}>INNING {fullGameState.inning}</Text>
                <Text style={styles.halfInningText}>
                  {fullGameState.isTopOfInning ? '▲ TOP' : '▼ BOTTOM'}
                </Text>
              </View>
              <View style={styles.batterDisplay}>
                <Text style={styles.batterLabel}>AT BAT:</Text>
                <Text style={styles.batterTeam}>
                  {fullGameState.currentBatterTeam === 'visitor' ? 'VISITOR' : 'HOME'}
                </Text>
              </View>
            </View>
          )}

          {/* Score Grid */}
          <View style={styles.scoreGrid}>
            {/* Header Row - Innings */}
            <View style={styles.headerRow}>
              <View style={styles.teamLabel} />
              <View style={styles.inningCell}><Text style={styles.inningText}>1</Text></View>
              <View style={styles.inningCell}><Text style={styles.inningText}>2</Text></View>
              <View style={styles.inningCell}><Text style={styles.inningText}>3</Text></View>
              <View style={styles.inningCell}><Text style={styles.inningText}>4</Text></View>
              <View style={styles.inningCell}><Text style={styles.inningText}>5</Text></View>
              <View style={styles.inningCell}><Text style={styles.inningText}>6</Text></View>
              <View style={styles.inningCell}><Text style={styles.inningText}>7</Text></View>
              <View style={styles.inningCell}><Text style={styles.inningText}>8</Text></View>
              <View style={styles.inningCell}><Text style={styles.inningText}>9</Text></View>
              <View style={styles.runCell}><Text style={styles.runHeaderText}>R</Text></View>
            </View>

            {/* Visitor Row */}
            <View style={styles.scoreRow}>
              <View style={styles.teamLabel}>
                <Text style={styles.teamText}>VISITOR</Text>
              </View>
              <View style={styles.inningScore}><Text style={styles.scoreText}>-</Text></View>
              <View style={styles.inningScore}><Text style={styles.scoreText}>-</Text></View>
              <View style={styles.inningScore}><Text style={styles.scoreText}>-</Text></View>
              <View style={styles.inningScore}><Text style={styles.scoreText}>-</Text></View>
              <View style={styles.inningScore}><Text style={styles.scoreText}>-</Text></View>
              <View style={styles.inningScore}><Text style={styles.scoreText}>-</Text></View>
              <View style={styles.inningScore}><Text style={styles.scoreText}>-</Text></View>
              <View style={styles.inningScore}><Text style={styles.scoreText}>-</Text></View>
              <View style={styles.inningScore}><Text style={styles.scoreText}>-</Text></View>
              <View style={styles.totalRuns}><Text style={styles.totalRunsText}>{fullGameState.visitorScore}</Text></View>
            </View>

            {/* Home Row */}
            <View style={styles.scoreRow}>
              <View style={styles.teamLabel}>
                <Text style={styles.teamText}>HOME</Text>
              </View>
              <View style={styles.inningScore}><Text style={styles.scoreText}>-</Text></View>
              <View style={styles.inningScore}><Text style={styles.scoreText}>-</Text></View>
              <View style={styles.inningScore}><Text style={styles.scoreText}>-</Text></View>
              <View style={styles.inningScore}><Text style={styles.scoreText}>-</Text></View>
              <View style={styles.inningScore}><Text style={styles.scoreText}>-</Text></View>
              <View style={styles.inningScore}><Text style={styles.scoreText}>-</Text></View>
              <View style={styles.inningScore}><Text style={styles.scoreText}>-</Text></View>
              <View style={styles.inningScore}><Text style={styles.scoreText}>-</Text></View>
              <View style={styles.inningScore}><Text style={styles.scoreText}>-</Text></View>
              <View style={styles.totalRuns}><Text style={styles.totalRunsText}>{fullGameState.homeScore}</Text></View>
            </View>
          </View>

          {/* Bottom Section - At Bat, Ball, Strike, Out */}
          <View style={styles.bottomSection}>
            {/* At Bat */}
            <View style={styles.atBatSection}>
              <Text style={styles.sectionLabel}>AT BAT</Text>
              <View style={styles.atBatBox}>
                <Text style={styles.atBatText}>-</Text>
              </View>
            </View>

            {/* Ball */}
            <View style={styles.indicatorSection}>
              <Text style={styles.sectionLabel}>BALL</Text>
              <View style={styles.indicatorRow}>
                {ballsArray.map((ball, idx) => (
                  <View 
                    key={`ball-${idx}`}
                    style={[
                      styles.indicator,
                      ball === 1 && styles.indicatorActive
                    ]}
                  />
                ))}
              </View>
            </View>

            {/* Strike */}
            <View style={styles.indicatorSection}>
              <Text style={styles.sectionLabel}>STRIKE</Text>
              <View style={styles.indicatorRow}>
                {strikesArray.map((strike, idx) => (
                  <View 
                    key={`strike-${idx}`}
                    style={[
                      styles.indicator,
                      strike === 1 && styles.indicatorActive
                    ]}
                  />
                ))}
              </View>
            </View>

            {/* Out */}
            <View style={styles.indicatorSection}>
              <Text style={styles.sectionLabel}>OUT</Text>
              <View style={styles.indicatorRow}>
                {outsArray.map((out, idx) => (
                  <View 
                    key={`out-${idx}`}
                    style={[
                      styles.indicator,
                      out === 1 && styles.indicatorActive
                    ]}
                  />
                ))}
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  
  // Main Scoreboard
  scoreboard: {
    flex: 1,
    backgroundColor: SCOREBOARD_GREEN,
  },
  
  // Status Bar
  statusBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: SCOREBOARD_DARK_GREEN,
    paddingHorizontal: 20,
    paddingVertical: 12,
    paddingTop: Platform.OS === 'ios' ? 50 : 12,
    borderBottomWidth: 3,
    borderBottomColor: WHITE,
  },
  statusDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 10,
    borderWidth: 2,
    borderColor: WHITE,
  },
  statusConnected: {
    backgroundColor: '#00ff00',
  },
  statusDisconnected: {
    backgroundColor: '#ff0000',
  },
  statusText: {
    color: WHITE,
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
    borderColor: WHITE,
  },
  disconnectText: {
    color: WHITE,
    fontSize: 12,
    fontWeight: 'bold',
  },
  
  // Debug Display
  debugDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 20,
    padding: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 4,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  debugLabel: {
    color: WHITE,
    fontSize: 12,
    fontWeight: 'bold',
    marginRight: 8,
    opacity: 0.8,
  },
  debugValue: {
    fontSize: 14,
    fontWeight: '900',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 3,
  },
  debugHigh: {
    color: '#00ff00',
    backgroundColor: 'rgba(0, 255, 0, 0.2)',
  },
  debugLow: {
    color: '#888',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },

  scrollContent: {
    padding: isTablet ? 30 : 16,
    paddingBottom: 40,
  },

  // Game Control Panel
  gameControlPanel: {
    backgroundColor: SCOREBOARD_DARK_GREEN,
    padding: 30,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 30,
    borderWidth: 3,
    borderColor: WHITE,
  },
  gameControlTitle: {
    color: WHITE,
    fontSize: 24,
    fontWeight: '900',
    marginBottom: 20,
    letterSpacing: 2,
  },
  beginGameButton: {
    backgroundColor: WHITE,
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 8,
    marginBottom: 15,
  },
  beginGameText: {
    color: SCOREBOARD_GREEN,
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 2,
  },
  gameControlHint: {
    color: WHITE,
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.8,
  },

  // Game Status Panel
  gameStatusPanel: {
    backgroundColor: SCOREBOARD_DARK_GREEN,
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 3,
    borderColor: WHITE,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  inningDisplay: {
    alignItems: 'center',
    flex: 1,
  },
  inningStatusText: {
    color: WHITE,
    fontSize: isTablet ? 28 : 22,
    fontWeight: '900',
    letterSpacing: 2,
  },
  halfInningText: {
    color: WHITE,
    fontSize: isTablet ? 20 : 16,
    fontWeight: 'bold',
    marginTop: 4,
  },
  batterDisplay: {
    alignItems: 'center',
    flex: 1,
    borderLeftWidth: 2,
    borderLeftColor: WHITE,
    paddingLeft: 20,
  },
  batterLabel: {
    color: WHITE,
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 1,
    opacity: 0.8,
  },
  batterTeam: {
    color: WHITE,
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
    color: WHITE,
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
    color: WHITE,
    fontSize: isTablet ? 36 : 28,
    fontWeight: '900',
  },
  inningScore: {
    flex: 1,
    minWidth: isTablet ? 65 : 55,
    height: isTablet ? 65 : 55,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: SCOREBOARD_DARK_GREEN,
    marginHorizontal: isTablet ? 4 : 3,
    borderWidth: isTablet ? 3 : 3,
    borderColor: WHITE,
  },
  scoreText: {
    color: WHITE,
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
    color: WHITE,
    fontSize: isTablet ? 36 : 28,
    fontWeight: '900',
  },
  totalRuns: {
    width: isTablet ? 80 : 60,
    height: isTablet ? 60 : 50,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: SCOREBOARD_DARK_GREEN,
    marginLeft: isTablet ? 12 : 8,
    borderWidth: isTablet ? 4 : 3,
    borderColor: WHITE,
  },
  totalRunsText: {
    color: WHITE,
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
    color: WHITE,
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
    borderColor: WHITE,
  },
  atBatText: {
    color: WHITE,
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
    backgroundColor: SCOREBOARD_DARK_GREEN,
    borderWidth: isTablet ? 4 : 3,
    borderColor: WHITE,
  },
  indicatorActive: {
    backgroundColor: WHITE,
  },
});
