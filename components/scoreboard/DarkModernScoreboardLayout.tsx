import React from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import ScoreboardLayoutProps from './ScoreboardLayoutProps';

export default function DarkModernScoreboardLayout({
  themeColors,
  visitorTeamName,
  homeTeamName,
  fullGameState,
  balls,
  strikes,
  outs,
  currentBatterNumber,
  isTablet,
  getInningScore,
}: ScoreboardLayoutProps) {
  const ballsArray = Array.from({ length: 4 }, (_, i) => i < balls ? 1 : 0);
  const strikesArray = Array.from({ length: 3 }, (_, i) => i < strikes ? 1 : 0);
  const outsArray = Array.from({ length: 3 }, (_, i) => i < outs ? 1 : 0);

  const styles = createStyles(themeColors, isTablet);

  return (
    <View style={styles.container}>
      {/* Top Section - Large Scores */}
      <View style={styles.topSection}>
        {/* HOME Score (Left) */}
        <View style={styles.teamScoreSection}>
          <Text style={styles.teamLabelLarge}>HOME</Text>
          <View style={styles.largeScoreBox}>
            <Text style={styles.largeScore}>{fullGameState.homeScore}</Text>
          </View>
        </View>

        {/* Center - Inning Display */}
        <View style={styles.centerInningSection}>
          <View style={styles.inningDisplayLarge}>
            <Text style={styles.inningNumberHuge}>{fullGameState.inning}</Text>
          </View>
          <Text style={styles.inningLabelCenter}>INNING</Text>
          {fullGameState.gameStarted && (
            <Text style={styles.inningIndicator}>
              {fullGameState.isTopOfInning ? '▲' : '▼'}
            </Text>
          )}
        </View>

        {/* GUEST Score (Right) */}
        <View style={styles.teamScoreSection}>
          <Text style={styles.teamLabelLarge}>GUEST</Text>
          <View style={styles.largeScoreBox}>
            <Text style={styles.largeScore}>{fullGameState.visitorScore}</Text>
          </View>
        </View>
      </View>

      {/* Middle Section - Ball, Strike, Out Indicators */}
      <View style={styles.middleSection}>
        {/* BALL (Left) */}
        <View style={styles.indicatorBox}>
          <Text style={styles.indicatorLabel}>BALL</Text>
          <View style={styles.dotRow}>
            {ballsArray.map((ball, idx) => (
              <View 
                key={`ball-${idx}`}
                style={[
                  styles.dot,
                  ball === 1 && styles.dotActive
                ]}
              />
            ))}
          </View>
        </View>

        {/* STRIKE (Center) */}
        <View style={styles.indicatorBox}>
          <Text style={styles.indicatorLabel}>STRIKE</Text>
          <View style={styles.dotRow}>
            {strikesArray.map((strike, idx) => (
              <View 
                key={`strike-${idx}`}
                style={[
                  styles.dot,
                  strike === 1 && styles.dotActive
                ]}
              />
            ))}
          </View>
        </View>

        {/* OUT (Right) */}
        <View style={styles.indicatorBox}>
          <Text style={styles.indicatorLabel}>OUT</Text>
          <View style={styles.dotRow}>
            {outsArray.map((out, idx) => (
              <View 
                key={`out-${idx}`}
                style={[
                  styles.dot,
                  out === 1 && styles.dotActive
                ]}
              />
            ))}
          </View>
        </View>
      </View>

      {/* Current Batter Info */}
      {fullGameState.gameStarted && (
        <View style={styles.batterInfo}>
          <Text style={styles.batterInfoText}>
            AT BAT: #{currentBatterNumber} • {fullGameState.currentBatterTeam === 'visitor' ? visitorTeamName : homeTeamName}
          </Text>
        </View>
      )}
    </View>
  );
}

const createStyles = (themeColors: any, isTablet: boolean) => StyleSheet.create({
  container: {
    flex: 1,
  },

  // Top Section - Large Scores
  topSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: themeColors.scoreGridBackground,
    paddingVertical: isTablet ? 30 : 20,
    paddingHorizontal: isTablet ? 20 : 15,
    borderTopWidth: 3,
    borderBottomWidth: 3,
    borderColor: themeColors.secondaryText,
    marginBottom: isTablet ? 20 : 15,
  },
  teamScoreSection: {
    alignItems: 'center',
    flex: 1,
  },
  teamLabelLarge: {
    color: themeColors.secondaryText,
    fontSize: isTablet ? 24 : 18,
    fontWeight: 'bold',
    marginBottom: 12,
    letterSpacing: 2,
  },
  largeScoreBox: {
    backgroundColor: themeColors.headerBackground,
    paddingHorizontal: isTablet ? 35 : 28,
    paddingVertical: isTablet ? 20 : 16,
    borderRadius: 8,
    borderWidth: 3,
    borderColor: themeColors.accentColor,
    minWidth: isTablet ? 120 : 95,
    alignItems: 'center',
  },
  largeScore: {
    color: themeColors.primaryText,
    fontSize: isTablet ? 72 : 56,
    fontWeight: '900',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  centerInningSection: {
    alignItems: 'center',
    paddingHorizontal: isTablet ? 40 : 30,
  },
  inningDisplayLarge: {
    backgroundColor: themeColors.headerBackground,
    paddingHorizontal: isTablet ? 45 : 35,
    paddingVertical: isTablet ? 25 : 20,
    borderRadius: 12,
    borderWidth: 4,
    borderColor: themeColors.secondaryText,
    minWidth: isTablet ? 140 : 110,
    alignItems: 'center',
  },
  inningNumberHuge: {
    color: themeColors.primaryText,
    fontSize: isTablet ? 80 : 64,
    fontWeight: '900',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  inningLabelCenter: {
    color: themeColors.secondaryText,
    fontSize: isTablet ? 20 : 16,
    fontWeight: 'bold',
    marginTop: 10,
    letterSpacing: 2,
  },
  inningIndicator: {
    color: themeColors.accentColor,
    fontSize: isTablet ? 28 : 22,
    marginTop: 6,
    fontWeight: 'bold',
  },

  // Middle Section - Indicators
  middleSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: themeColors.scoreGridBackground,
    paddingVertical: isTablet ? 25 : 18,
    paddingHorizontal: isTablet ? 20 : 15,
    borderTopWidth: 3,
    borderBottomWidth: 3,
    borderColor: themeColors.secondaryText,
    marginBottom: isTablet ? 20 : 15,
  },
  indicatorBox: {
    alignItems: 'center',
    flex: 1,
  },
  indicatorLabel: {
    color: themeColors.secondaryText,
    fontSize: isTablet ? 18 : 14,
    fontWeight: 'bold',
    marginBottom: 12,
    letterSpacing: 1,
  },
  dotRow: {
    flexDirection: 'row',
    gap: isTablet ? 12 : 10,
  },
  dot: {
    width: isTablet ? 24 : 20,
    height: isTablet ? 24 : 20,
    borderRadius: isTablet ? 12 : 10,
    backgroundColor: themeColors.headerBackground,
    borderWidth: 2,
    borderColor: themeColors.secondaryText,
  },
  dotActive: {
    backgroundColor: themeColors.ballIndicator,
  },

  // Bottom Section - Score Grid
  bottomSection: {
    backgroundColor: themeColors.scoreGridBackground,
    paddingVertical: isTablet ? 20 : 15,
    paddingHorizontal: isTablet ? 15 : 10,
    borderTopWidth: 3,
    borderBottomWidth: 3,
    borderColor: themeColors.secondaryText,
    marginBottom: isTablet ? 15 : 10,
  },
  bottomSectionTitle: {
    color: themeColors.secondaryText,
    fontSize: isTablet ? 18 : 14,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
    letterSpacing: 1,
  },
  scoreGridRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  scoreGridTeamLabel: {
    width: isTablet ? 90 : 70,
    justifyContent: 'center',
    paddingLeft: 4,
  },
  scoreGridTeamText: {
    color: themeColors.secondaryText,
    fontSize: isTablet ? 16 : 12,
    fontWeight: 'bold',
  },
  scoreGridCell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: themeColors.headerBackground,
    paddingVertical: isTablet ? 8 : 6,
    marginHorizontal: 1,
    borderRadius: 3,
  },
  scoreGridHeaderText: {
    color: themeColors.secondaryText,
    fontSize: isTablet ? 14 : 11,
    fontWeight: 'bold',
  },
  scoreGridValueText: {
    color: themeColors.scoreGridText,
    fontSize: isTablet ? 16 : 13,
    fontWeight: 'bold',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  scoreGridTotalCell: {
    width: isTablet ? 45 : 35,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: themeColors.headerBackground,
    borderRadius: 3,
    borderWidth: 2,
    borderColor: themeColors.accentColor,
  },
  scoreGridTotalText: {
    color: themeColors.primaryText,
    fontSize: isTablet ? 18 : 14,
    fontWeight: 'bold',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },

  // Current Batter Info
  batterInfo: {
    backgroundColor: themeColors.headerBackground,
    paddingVertical: isTablet ? 12 : 10,
    paddingHorizontal: isTablet ? 20 : 15,
    alignItems: 'center',
    borderTopWidth: 2,
    borderBottomWidth: 2,
    borderColor: themeColors.accentColor,
  },
  batterInfoText: {
    color: themeColors.primaryText,
    fontSize: isTablet ? 18 : 14,
    fontWeight: 'bold',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
});

