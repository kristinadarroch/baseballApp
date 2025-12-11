import React from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import ScoreboardLayoutProps from './ScoreboardLayoutProps';

export default function RedLEDScoreboardLayout({
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
  const ballsArray = Array.from({ length: 4 }, (_, i) => i < balls ? 1 : 0);
  const strikesArray = Array.from({ length: 3 }, (_, i) => i < strikes ? 1 : 0);
  const outsArray = Array.from({ length: 3 }, (_, i) => i < outs ? 1 : 0);

  const styles = createStyles(themeColors, isTablet);

  return (
    <View style={styles.container}>
      {/* Top Section - BALL, STRIKE, OUT */}
      <View style={styles.topCountSection}>
        {/* BALL */}
        <View style={styles.countBox}>
          <Text style={styles.countLabelTop}>BALL</Text>
          <View style={styles.countDisplayBox}>
            <Text style={styles.countNumber}>{balls}</Text>
          </View>
        </View>

        {/* STRIKE */}
        <View style={styles.countBox}>
          <Text style={styles.countLabelTop}>STRIKE</Text>
          <View style={styles.countDisplayBox}>
            <Text style={styles.countNumber}>{strikes}</Text>
          </View>
        </View>

        {/* OUT */}
        <View style={styles.countBox}>
          <Text style={styles.countLabelTop}>OUT</Text>
          <View style={styles.countDisplayBox}>
            <Text style={styles.countNumber}>{outs}</Text>
          </View>
        </View>
      </View>

      {/* Main Score Grid */}
      <View style={styles.scoreSection}>
        {/* Header Row */}
        <View style={styles.gridHeaderRow}>
          <View style={styles.teamLabelCell} />
          <View style={styles.inningHeaderCell}><Text style={styles.inningHeaderText}>1</Text></View>
          <View style={styles.inningHeaderCell}><Text style={styles.inningHeaderText}>2</Text></View>
          <View style={styles.inningHeaderCell}><Text style={styles.inningHeaderText}>3</Text></View>
          <View style={styles.inningHeaderCell}><Text style={styles.inningHeaderText}>4</Text></View>
          <View style={styles.inningHeaderCell}><Text style={styles.inningHeaderText}>5</Text></View>
          <View style={styles.inningHeaderCell}><Text style={styles.inningHeaderText}>6</Text></View>
          <View style={styles.inningHeaderCell}><Text style={styles.inningHeaderText}>7</Text></View>
          <View style={styles.runsHeaderCell}><Text style={styles.runsHeaderText}>RUNS</Text></View>
        </View>

        {/* GUEST Row */}
        <View style={styles.gridScoreRow}>
          <View style={styles.teamLabelCell}>
            <Text style={styles.teamLabel}>GUEST</Text>
          </View>
          {[0, 1, 2, 3, 4, 5, 6].map((inningIndex) => (
            <View key={`visitor-${inningIndex}`} style={styles.inningScoreCell}>
              <Text style={styles.inningScoreText}>
                {getInningScore('visitor', inningIndex)}
              </Text>
            </View>
          ))}
          <View style={styles.runsScoreCell}>
            <Text style={styles.runsScoreText}>{fullGameState.visitorScore}</Text>
          </View>
        </View>

        {/* HOME Row */}
        <View style={styles.gridScoreRow}>
          <View style={styles.teamLabelCell}>
            <Text style={styles.teamLabel}>HOME</Text>
          </View>
          {[0, 1, 2, 3, 4, 5, 6].map((inningIndex) => (
            <View key={`home-${inningIndex}`} style={styles.inningScoreCell}>
              <Text style={styles.inningScoreText}>
                {getInningScore('home', inningIndex)}
              </Text>
            </View>
          ))}
          <View style={styles.runsScoreCell}>
            <Text style={styles.runsScoreText}>{fullGameState.homeScore}</Text>
          </View>
        </View>
      </View>

      {/* Bottom Info Section */}
      {fullGameState.gameStarted && (
        <View style={styles.bottomInfo}>
          <View style={styles.infoBox}>
            <Text style={styles.infoLabel}>INNING</Text>
            <Text style={styles.infoValue}>{fullGameState.inning} {fullGameState.isTopOfInning ? '▲' : '▼'}</Text>
          </View>
          <View style={styles.infoBox}>
            <Text style={styles.infoLabel}>AT BAT</Text>
            <Text style={styles.infoValue}>#{currentBatterNumber}</Text>
          </View>
          <View style={styles.infoBox}>
            <Text style={styles.infoLabel}>BATTING</Text>
            <Text style={styles.infoValue}>
              {fullGameState.currentBatterTeam === 'visitor' ? visitorTeamName : homeTeamName}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}

const createStyles = (themeColors: any, isTablet: boolean) => StyleSheet.create({
  container: {
    flex: 1,
  },

  // Top Count Section
  topCountSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: themeColors.scoreGridBackground,
    paddingVertical: isTablet ? 20 : 15,
    borderTopWidth: 3,
    borderBottomWidth: 3,
    borderColor: themeColors.secondaryText,
    marginBottom: isTablet ? 20 : 15,
  },
  countBox: {
    alignItems: 'center',
    flex: 1,
  },
  countLabelTop: {
    color: themeColors.secondaryText,
    fontSize: isTablet ? 20 : 16,
    fontWeight: 'bold',
    marginBottom: 12,
    letterSpacing: 1,
  },
  countDisplayBox: {
    backgroundColor: themeColors.headerBackground,
    paddingHorizontal: isTablet ? 35 : 28,
    paddingVertical: isTablet ? 15 : 12,
    borderRadius: 8,
    borderWidth: 3,
    borderColor: themeColors.secondaryText,
    minWidth: isTablet ? 80 : 65,
    alignItems: 'center',
  },
  countNumber: {
    color: themeColors.primaryText,
    fontSize: isTablet ? 48 : 38,
    fontWeight: '900',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },

  // Score Grid Section
  scoreSection: {
    backgroundColor: themeColors.scoreGridBackground,
    paddingVertical: isTablet ? 20 : 15,
    paddingHorizontal: isTablet ? 10 : 8,
    borderTopWidth: 3,
    borderBottomWidth: 3,
    borderColor: themeColors.secondaryText,
    marginBottom: isTablet ? 20 : 15,
  },
  gridHeaderRow: {
    flexDirection: 'row',
    marginBottom: 12,
    paddingHorizontal: isTablet ? 8 : 4,
  },
  gridScoreRow: {
    flexDirection: 'row',
    marginBottom: 10,
    paddingHorizontal: isTablet ? 8 : 4,
  },
  teamLabelCell: {
    width: isTablet ? 100 : 80,
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingLeft: 8,
  },
  teamLabel: {
    color: themeColors.secondaryText,
    fontSize: isTablet ? 22 : 18,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  inningHeaderCell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  inningHeaderText: {
    color: themeColors.secondaryText,
    fontSize: isTablet ? 18 : 14,
    fontWeight: 'bold',
  },
  inningScoreCell: {
    flex: 1,
    backgroundColor: themeColors.headerBackground,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: isTablet ? 15 : 12,
    marginHorizontal: 2,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: themeColors.secondaryText,
  },
  inningScoreText: {
    color: themeColors.primaryText,
    fontSize: isTablet ? 28 : 22,
    fontWeight: 'bold',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  runsHeaderCell: {
    width: isTablet ? 100 : 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  runsHeaderText: {
    color: themeColors.secondaryText,
    fontSize: isTablet ? 18 : 14,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  runsScoreCell: {
    width: isTablet ? 100 : 80,
    backgroundColor: themeColors.headerBackground,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: isTablet ? 15 : 12,
    borderRadius: 4,
    borderWidth: 3,
    borderColor: themeColors.accentColor,
  },
  runsScoreText: {
    color: themeColors.primaryText,
    fontSize: isTablet ? 36 : 28,
    fontWeight: 'bold',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },

  // Bottom Info Section
  bottomInfo: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: themeColors.scoreGridBackground,
    paddingVertical: isTablet ? 20 : 15,
    paddingHorizontal: isTablet ? 10 : 8,
    borderTopWidth: 3,
    borderBottomWidth: 3,
    borderColor: themeColors.secondaryText,
  },
  infoBox: {
    alignItems: 'center',
    flex: 1,
  },
  infoLabel: {
    color: themeColors.secondaryText,
    fontSize: isTablet ? 16 : 12,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  infoValue: {
    color: themeColors.primaryText,
    fontSize: isTablet ? 24 : 18,
    fontWeight: '900',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
});



