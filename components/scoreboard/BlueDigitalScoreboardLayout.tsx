import React from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { DISPLAYED_BALL_LIGHTS, DISPLAYED_OUT_LIGHTS, DISPLAYED_STRIKE_LIGHTS } from '../../constants/baseball-counts';
import ScoreboardLayoutProps from './ScoreboardLayoutProps';

export default function BlueDigitalScoreboardLayout({
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
}: ScoreboardLayoutProps) {
  const ballsArray = Array.from({ length: DISPLAYED_BALL_LIGHTS }, (_, i) => i < balls ? 1 : 0);
  const strikesArray = Array.from({ length: DISPLAYED_STRIKE_LIGHTS }, (_, i) => i < strikes ? 1 : 0);
  const outsArray = Array.from({ length: DISPLAYED_OUT_LIGHTS }, (_, i) => i < outs ? 1 : 0);

  const styles = createStyles(themeColors, isTablet);

  return (
    <View style={styles.container}>
      {/* Top Section - HOME and GUEST Scores */}
      <View style={styles.topScoreSection}>
        {/* HOME Score */}
        <View style={styles.teamScoreBox}>
          <Text style={styles.teamLabelLarge}>HOME</Text>
          <View style={styles.scoreBoxLarge}>
            <Text style={styles.scoreLarge}>{fullGameState.homeScore}</Text>
          </View>
        </View>

        {/* Middle - Inning Display */}
        <View style={styles.middleSection}>
          <View style={styles.inningBoxLarge}>
            <Text style={styles.inningNumberLarge}>{fullGameState.inning}</Text>
          </View>
          <Text style={styles.innLabel}>INN</Text>
          {fullGameState.gameStarted && (
            <Text style={styles.inningHalfLarge}>
              {fullGameState.isTopOfInning ? '▲' : '▼'}
            </Text>
          )}
        </View>

        {/* GUEST Score */}
        <View style={styles.teamScoreBox}>
          <Text style={styles.teamLabelLarge}>GUEST</Text>
          <View style={styles.scoreBoxLarge}>
            <Text style={styles.scoreLarge}>{fullGameState.visitorScore}</Text>
          </View>
        </View>
      </View>

      {/* Middle Section - Current Batter */}
      {fullGameState.gameStarted && (
        <View style={styles.batterSection}>
          <Text style={styles.batterLabel}>AT BAT: #{currentBatterNumber}</Text>
          <Text style={styles.batterTeam}>
            {fullGameState.currentBatterTeam === 'visitor' ? visitorTeamName : homeTeamName}
          </Text>
        </View>
      )}

      {/* Bottom Section - BALL, STRIKE, OUT */}
      <View style={styles.bottomSection}>
        {/* BALL */}
        <View style={styles.countBox}>
          <Text style={styles.countLabelBottom}>BALL</Text>
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

        {/* STRIKE */}
        <View style={styles.countBox}>
          <Text style={styles.countLabelBottom}>STRIKE</Text>
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

        {/* OUT */}
        <View style={styles.countBox}>
          <Text style={styles.countLabelBottom}>OUT</Text>
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
    </View>
  );
}

const createStyles = (themeColors: any, isTablet: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    padding: isTablet ? 20 : 12,
    paddingBottom: 20,
  },
  
  // Top Section - Large Scores
  topScoreSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: themeColors.scoreGridBackground,
    padding: isTablet ? 30 : 20,
    borderRadius: 12,
    marginBottom: isTablet ? 20 : 15,
    borderWidth: 4,
    borderColor: themeColors.secondaryText,
  },
  teamScoreBox: {
    alignItems: 'center',
    flex: 1,
  },
  teamLabelLarge: {
    color: themeColors.secondaryText,
    fontSize: isTablet ? 28 : 22,
    fontWeight: '900',
    marginBottom: 12,
    letterSpacing: 2,
  },
  scoreBoxLarge: {
    backgroundColor: themeColors.headerBackground,
    paddingHorizontal: isTablet ? 40 : 30,
    paddingVertical: isTablet ? 20 : 15,
    borderRadius: 12,
    borderWidth: 3,
    borderColor: themeColors.accentColor,
    minWidth: isTablet ? 140 : 110,
    alignItems: 'center',
  },
  scoreLarge: {
    color: themeColors.primaryText,
    fontSize: isTablet ? 80 : 64,
    fontWeight: '900',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  
  // Middle Section
  middleSection: {
    alignItems: 'center',
    paddingHorizontal: isTablet ? 30 : 20,
  },
  inningBoxLarge: {
    backgroundColor: themeColors.headerBackground,
    paddingHorizontal: isTablet ? 35 : 28,
    paddingVertical: isTablet ? 18 : 14,
    borderRadius: 12,
    borderWidth: 3,
    borderColor: themeColors.secondaryText,
    minWidth: isTablet ? 100 : 80,
    alignItems: 'center',
  },
  inningNumberLarge: {
    color: themeColors.primaryText,
    fontSize: isTablet ? 56 : 44,
    fontWeight: '900',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  innLabel: {
    color: themeColors.secondaryText,
    fontSize: isTablet ? 24 : 18,
    fontWeight: 'bold',
    marginTop: 8,
    letterSpacing: 1,
  },
  inningHalfLarge: {
    color: themeColors.accentColor,
    fontSize: isTablet ? 28 : 22,
    marginTop: 6,
    fontWeight: 'bold',
  },

  // Batter Section
  batterSection: {
    backgroundColor: themeColors.headerBackground,
    padding: isTablet ? 16 : 12,
    borderRadius: 8,
    marginBottom: isTablet ? 20 : 15,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: themeColors.accentColor,
  },
  batterLabel: {
    color: themeColors.secondaryText,
    fontSize: isTablet ? 18 : 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  batterTeam: {
    color: themeColors.primaryText,
    fontSize: isTablet ? 22 : 18,
    fontWeight: '900',
  },
  
  // Bottom Section - Count Indicators
  bottomSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: themeColors.scoreGridBackground,
    padding: isTablet ? 25 : 18,
    borderRadius: 12,
    marginBottom: isTablet ? 20 : 15,
    borderWidth: 4,
    borderColor: themeColors.secondaryText,
  },
  countBox: {
    alignItems: 'center',
  },
  countLabelBottom: {
    color: themeColors.secondaryText,
    fontSize: isTablet ? 22 : 18,
    fontWeight: '900',
    marginBottom: 12,
    letterSpacing: 1,
  },
  indicatorRow: {
    flexDirection: 'row',
    gap: isTablet ? 10 : 8,
  },
  indicator: {
    width: isTablet ? 50 : 40,
    height: isTablet ? 50 : 40,
    borderRadius: isTablet ? 25 : 20,
    backgroundColor: themeColors.headerBackground,
    borderWidth: isTablet ? 3 : 2,
    borderColor: themeColors.secondaryText,
  },
  indicatorActive: {
    backgroundColor: themeColors.accentColor,
  }
});
