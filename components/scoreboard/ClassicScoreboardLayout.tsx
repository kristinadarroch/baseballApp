import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { DISPLAYED_BALL_LIGHTS, DISPLAYED_OUT_LIGHTS, DISPLAYED_STRIKE_LIGHTS } from '../../constants/baseball-counts';
import ScoreboardLayoutProps from './ScoreboardLayoutProps';

export default function ClassicScoreboardLayout({
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
  const ballsArray = Array.from({ length: DISPLAYED_BALL_LIGHTS }, (_, i) => i < balls ? 1 : 0);
  const strikesArray = Array.from({ length: DISPLAYED_STRIKE_LIGHTS }, (_, i) => i < strikes ? 1 : 0);
  const outsArray = Array.from({ length: DISPLAYED_OUT_LIGHTS }, (_, i) => i < outs ? 1 : 0);

  const styles = createStyles(themeColors, isTablet);

  return (
    <View style={styles.container}>
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
            <Text style={styles.teamText}>{visitorTeamName}</Text>
          </View>
          {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((inningIndex) => (
            <View key={`visitor-${inningIndex}`} style={styles.inningScore}>
              <Text style={styles.scoreText}>
                {getInningScore('visitor', inningIndex)}
              </Text>
            </View>
          ))}
          <View style={styles.totalRuns}><Text style={styles.totalRunsText}>{fullGameState.visitorScore}</Text></View>
        </View>

        {/* Home Row */}
        <View style={styles.scoreRow}>
          <View style={styles.teamLabel}>
            <Text style={styles.teamText}>{homeTeamName}</Text>
          </View>
          {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((inningIndex) => (
            <View key={`home-${inningIndex}`} style={styles.inningScore}>
              <Text style={styles.scoreText}>
                {getInningScore('home', inningIndex)}
              </Text>
            </View>
          ))}
          <View style={styles.totalRuns}><Text style={styles.totalRunsText}>{fullGameState.homeScore}</Text></View>
        </View>
      </View>

      {/* Bottom Section - At Bat, Ball, Strike, Out */}
      <View style={styles.bottomSection}>
        {/* At Bat */}
        <View style={styles.atBatSection}>
          <Text style={styles.sectionLabel}>AT BAT</Text>
          <View style={styles.atBatBox}>
            <Text style={styles.atBatText}>
              {currentBatterNumber}
            </Text>
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
    </View>
  );
}

const createStyles = (themeColors: any, isTablet: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    padding: isTablet ? 20 : 12,
  },
  // Score Grid
  scoreGrid: {
    marginBottom: isTablet ? 30 : 20,
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
