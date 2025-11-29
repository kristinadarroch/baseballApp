import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Modal, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import DraggableFlatList, { RenderItemParams, ScaleDecorator } from 'react-native-draggable-flatlist';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Player, useConnection } from '../../contexts/ConnectionContext';

const SCOREBOARD_GREEN = '#2d6945';
const SCOREBOARD_DARK_GREEN = '#1a4029';
const WHITE = '#FFFFFF';

export default function RostersScreen() {
  const { 
    visitorTeamName, 
    homeTeamName, 
    visitorRoster,
    homeRoster,
    setVisitorRoster,
    setHomeRoster,
  } = useConnection();

  const [activeTeam, setActiveTeam] = useState<'visitor' | 'home'>('visitor');
  const [playerNumber, setPlayerNumber] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [showBenchModal, setShowBenchModal] = useState(false);
  const [benchPlayerNumber, setBenchPlayerNumber] = useState('');
  const [benchPlayerName, setBenchPlayerName] = useState('');
  const [selectedPlayerForSubstitution, setSelectedPlayerForSubstitution] = useState<Player | null>(null);
  const [showSubstitutionModal, setShowSubstitutionModal] = useState(false);

  const currentRoster = activeTeam === 'visitor' ? visitorRoster : homeRoster;
  const currentTeamName = activeTeam === 'visitor' ? visitorTeamName : homeTeamName;
  const setCurrentRoster = activeTeam === 'visitor' ? setVisitorRoster : setHomeRoster;

  // Migrate existing players without isInLineup property (default to lineup)
  const migratedRoster = currentRoster.map(p => ({
    ...p,
    isInLineup: p.isInLineup !== undefined ? p.isInLineup : true, // Default existing players to lineup
  }));

  // Separate lineup and bench players
  const lineupPlayers = migratedRoster.filter(p => p.isInLineup);
  const benchPlayers = migratedRoster.filter(p => !p.isInLineup);

  const handleAddPlayer = () => {
    if (!playerNumber.trim()) {
      Alert.alert('Number Required', 'Please enter a player number', [{ text: 'OK' }]);
      return;
    }
    if (!playerName.trim()) {
      Alert.alert('Name Required', 'Please enter a player name', [{ text: 'OK' }]);
      return;
    }

    // Check for duplicate number
    const isDuplicate = migratedRoster.some(p => p.number === playerNumber.trim());
    if (isDuplicate) {
      Alert.alert(
        'Duplicate Number', 
        `Player #${playerNumber} already exists on this roster`,
        [{ text: 'OK' }]
      );
      return;
    }

    // Check lineup limit (9 players)
    if (lineupPlayers.length >= 9) {
      Alert.alert(
        'Lineup Full',
        'Lineup is limited to 9 players. Remove a player or use "Manage Bench" to add alternates.',
        [{ text: 'OK' }]
      );
      return;
    }

    const newPlayer: Player = {
      number: playerNumber.trim(),
      name: playerName.trim().toUpperCase(),
      isInLineup: true, // Always add to lineup from main screen
    };

    setCurrentRoster([...migratedRoster, newPlayer]);
    setPlayerNumber('');
    setPlayerName('');
  };

  const handleAddBenchPlayer = () => {
    if (!benchPlayerNumber.trim()) {
      Alert.alert('Number Required', 'Please enter a player number', [{ text: 'OK' }]);
      return;
    }
    if (!benchPlayerName.trim()) {
      Alert.alert('Name Required', 'Please enter a player name', [{ text: 'OK' }]);
      return;
    }

    // Check for duplicate number
    const isDuplicate = migratedRoster.some(p => p.number === benchPlayerNumber.trim());
    if (isDuplicate) {
      Alert.alert(
        'Duplicate Number', 
        `Player #${benchPlayerNumber} already exists on this roster`,
        [{ text: 'OK' }]
      );
      return;
    }

    const newPlayer: Player = {
      number: benchPlayerNumber.trim(),
      name: benchPlayerName.trim().toUpperCase(),
      isInLineup: false,
    };

    setCurrentRoster([...migratedRoster, newPlayer]);
    setBenchPlayerNumber('');
    setBenchPlayerName('');
  };

  const handleRemovePlayer = (index: number) => {
    const player = migratedRoster[index];
    Alert.alert(
      'Remove Player?',
      `Remove #${player.number} ${player.name} from roster?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            const updated = migratedRoster.filter((_, i) => i !== index);
            setCurrentRoster(updated);
          },
        },
      ]
    );
  };

  const handleClearRoster = () => {
    Alert.alert(
      'Clear Roster?',
      `Remove all players from ${currentTeamName} roster?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: () => setCurrentRoster([]),
        },
      ]
    );
  };

  const handlePromoteToBench = (playerNumber: string) => {
    const updated = migratedRoster.map(p =>
      p.number === playerNumber ? { ...p, isInLineup: false } : p
    );
    setCurrentRoster(updated);
  };

  const handlePromoteToLineup = (playerNumber: string) => {
    if (lineupPlayers.length >= 9) {
      Alert.alert(
        'Lineup Full',
        'Lineup is limited to 9 players. Remove a player from lineup first.',
        [{ text: 'OK' }]
      );
      return;
    }
    const updated = migratedRoster.map(p =>
      p.number === playerNumber ? { ...p, isInLineup: true } : p
    );
    setCurrentRoster(updated);
  };

  const handleSubstitutePlayer = (benchPlayer: Player) => {
    if (!selectedPlayerForSubstitution) return;

    Alert.alert(
      'Confirm Substitution',
      `Substitute #${selectedPlayerForSubstitution.number} ${selectedPlayerForSubstitution.name} with #${benchPlayer.number} ${benchPlayer.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Substitute',
          onPress: () => {
            // Find the positions of both players in the current roster
            const lineupPlayerIndex = migratedRoster.findIndex(
              p => p.number === selectedPlayerForSubstitution.number
            );
            const benchPlayerIndex = migratedRoster.findIndex(
              p => p.number === benchPlayer.number
            );

            if (lineupPlayerIndex === -1 || benchPlayerIndex === -1) return;

            // Get the batting order position of the lineup player
            const lineupPlayerBattingOrder = lineupPlayers.findIndex(
              p => p.number === selectedPlayerForSubstitution.number
            );

            // Create new roster with swapped positions
            const newRoster = [...migratedRoster];
            
            // Swap the players - maintain array positions to preserve batting order
            const tempLineupPlayer = { ...newRoster[lineupPlayerIndex], isInLineup: false };
            const tempBenchPlayer = { ...newRoster[benchPlayerIndex], isInLineup: true };
            
            // To maintain batting order, we need to insert bench player at the same position
            // and move lineup player elsewhere
            newRoster[lineupPlayerIndex] = tempBenchPlayer;
            newRoster[benchPlayerIndex] = tempLineupPlayer;

            setCurrentRoster(newRoster);
            setShowSubstitutionModal(false);
            setSelectedPlayerForSubstitution(null);

            Alert.alert(
              'Substitution Complete',
              `#${benchPlayer.number} ${benchPlayer.name} is now batting in position ${lineupPlayerBattingOrder + 1}`,
              [{ text: 'OK' }]
            );
            
            console.log(`Substitution: #${selectedPlayerForSubstitution.number} OUT, #${benchPlayer.number} IN at batting position ${lineupPlayerBattingOrder + 1}`);
          },
        },
      ]
    );
  };

  const handleLineupPlayerTap = (player: Player) => {
    if (benchPlayers.length === 0) {
      Alert.alert(
        'No Bench Players',
        'Add alternate players to the bench before making substitutions.',
        [{ text: 'OK' }]
      );
      return;
    }
    setSelectedPlayerForSubstitution(player);
    setShowSubstitutionModal(true);
  };

  const renderLineupPlayer = ({ item, drag, isActive, getIndex }: RenderItemParams<Player>) => {
    const index = getIndex();
    
    return (
      <ScaleDecorator>
        <TouchableOpacity
          onLongPress={drag}
          onPress={() => handleLineupPlayerTap(item)}
          disabled={isActive}
          style={[
            styles.playerRow,
            isActive && styles.playerRowActive,
          ]}
        >
          <View style={styles.dragHandle}>
            <Text style={styles.dragIcon}>☰</Text>
          </View>
          
          <View style={styles.battingOrderBadge}>
            <Text style={styles.battingOrderText}>{(index ?? 0) + 1}</Text>
          </View>

          <View style={styles.playerInfo}>
            <Text style={styles.playerNumber}>#{item.number}</Text>
            <Text style={styles.playerName}>{item.name}</Text>
          </View>

          <TouchableOpacity
            style={styles.substituteButton}
            onPress={() => handleLineupPlayerTap(item)}
          >
            <Text style={styles.substituteButtonText}>🔄 Sub</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.benchButton}
            onPress={() => handlePromoteToBench(item.number)}
          >
            <Text style={styles.benchButtonText}>→ Bench</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.removeButton}
            onPress={() => {
              const rosterIndex = migratedRoster.findIndex(p => p.number === item.number);
              if (rosterIndex !== -1) handleRemovePlayer(rosterIndex);
            }}
          >
            <Text style={styles.removeButtonText}>✕</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      </ScaleDecorator>
    );
  };

  const renderBenchPlayer = (item: Player, index: number) => {
    return (
      <View key={item.number} style={styles.benchPlayerRow}>
        <View style={styles.playerInfo}>
          <Text style={styles.playerNumber}>#{item.number}</Text>
          <Text style={styles.playerName}>{item.name}</Text>
        </View>

        <TouchableOpacity
          style={styles.lineupButton}
          onPress={() => handlePromoteToLineup(item.number)}
        >
          <Text style={styles.lineupButtonText}>→ Lineup</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => {
            const rosterIndex = migratedRoster.findIndex(p => p.number === item.number);
            if (rosterIndex !== -1) handleRemovePlayer(rosterIndex);
          }}
        >
          <Text style={styles.removeButtonText}>✕</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <GestureHandlerRootView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>👥 Team Rosters</Text>
            <Text style={styles.subtitle}>Drag to reorder batting lineup</Text>
          </View>

          {/* Team Switcher */}
          <View style={styles.teamSwitcher}>
            <TouchableOpacity
              style={[
                styles.teamButton,
                activeTeam === 'visitor' && styles.teamButtonActive,
              ]}
              onPress={() => setActiveTeam('visitor')}
            >
              <Text style={[
                styles.teamButtonText,
                activeTeam === 'visitor' && styles.teamButtonTextActive,
              ]}>
                {visitorTeamName} ({visitorRoster.length})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.teamButton,
                activeTeam === 'home' && styles.teamButtonActive,
              ]}
              onPress={() => setActiveTeam('home')}
            >
              <Text style={[
                styles.teamButtonText,
                activeTeam === 'home' && styles.teamButtonTextActive,
              ]}>
                {homeTeamName} ({homeRoster.length})
              </Text>
            </TouchableOpacity>
          </View>

          {/* Add Player Form */}
          <View style={styles.addPlayerSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Add to Lineup</Text>
              <TouchableOpacity
                style={styles.manageBenchButton}
                onPress={() => setShowBenchModal(true)}
              >
                <Text style={styles.manageBenchText}>🪑 Manage Bench ({benchPlayers.length})</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.addPlayerForm}>
              <TextInput
                style={styles.numberInput}
                value={playerNumber}
                onChangeText={setPlayerNumber}
                placeholder="##"
                placeholderTextColor="#999"
                keyboardType="numeric"
                maxLength={3}
              />
              <TextInput
                style={styles.nameInput}
                value={playerName}
                onChangeText={setPlayerName}
                placeholder="Player Name"
                placeholderTextColor="#999"
                autoCapitalize="characters"
                autoCorrect={false}
                maxLength={25}
              />
              <TouchableOpacity
                style={styles.addButton}
                onPress={handleAddPlayer}
              >
                <Text style={styles.addButtonText}>+ Add</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Lineup Section */}
          <View style={styles.rosterSection}>
            <View style={styles.rosterHeader}>
              <Text style={styles.rosterTitle}>
                🎯 Batting Lineup ({lineupPlayers.length}/9)
              </Text>
              {migratedRoster.length > 0 && (
                <TouchableOpacity
                  style={styles.clearButton}
                  onPress={handleClearRoster}
                >
                  <Text style={styles.clearButtonText}>Clear All</Text>
                </TouchableOpacity>
              )}
            </View>

            {lineupPlayers.length === 0 ? (
              <View style={styles.emptyStateSmall}>
                <Text style={styles.emptyStateText}>No players in lineup</Text>
                <Text style={styles.emptyStateHint}>Add players to lineup (max 9)</Text>
              </View>
            ) : (
              <>
                <Text style={styles.helpText}>
                  Tap to substitute • Long press to drag and reorder
                </Text>
                <DraggableFlatList
                  data={lineupPlayers}
                  onDragEnd={({ data }) => {
                    // Reconstruct full roster with updated lineup order
                    const updatedRoster = [
                      ...data.map(p => ({ ...p, isInLineup: true })),
                      ...benchPlayers,
                    ];
                    setCurrentRoster(updatedRoster);
                  }}
                  keyExtractor={(item, index) => `lineup-${item.number}-${index}`}
                  renderItem={renderLineupPlayer}
                  containerStyle={styles.listContainer}
                />
              </>
            )}
          </View>
        </View>

        {/* Bench Management Modal */}
        <Modal
          visible={showBenchModal}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setShowBenchModal(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>🪑 Bench / Alternates</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowBenchModal(false)}
              >
                <Text style={styles.closeButtonText}>Done</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              {/* Add Bench Player Form */}
              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>Add Alternate Player</Text>
                <View style={styles.addPlayerForm}>
                  <TextInput
                    style={styles.numberInput}
                    value={benchPlayerNumber}
                    onChangeText={setBenchPlayerNumber}
                    placeholder="##"
                    placeholderTextColor="#999"
                    keyboardType="numeric"
                    maxLength={3}
                  />
                  <TextInput
                    style={styles.nameInput}
                    value={benchPlayerName}
                    onChangeText={setBenchPlayerName}
                    placeholder="Player Name"
                    placeholderTextColor="#999"
                    autoCapitalize="characters"
                    autoCorrect={false}
                    maxLength={25}
                  />
                  <TouchableOpacity
                    style={styles.addButton}
                    onPress={handleAddBenchPlayer}
                  >
                    <Text style={styles.addButtonText}>+ Add</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Bench Players List */}
              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>
                  Bench Players ({benchPlayers.length})
                </Text>
                {benchPlayers.length === 0 ? (
                  <View style={styles.emptyStateSmall}>
                    <Text style={styles.emptyStateText}>No bench players</Text>
                    <Text style={styles.emptyStateHint}>Add alternates for substitutions</Text>
                  </View>
                ) : (
                  <View style={styles.benchList}>
                    {benchPlayers.map((player, index) => renderBenchPlayer(player, index))}
                  </View>
                )}
              </View>
            </ScrollView>
          </View>
        </Modal>

        {/* Substitution Modal */}
        <Modal
          visible={showSubstitutionModal}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => {
            setShowSubstitutionModal(false);
            setSelectedPlayerForSubstitution(null);
          }}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>🔄 Substitute Player</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => {
                  setShowSubstitutionModal(false);
                  setSelectedPlayerForSubstitution(null);
                }}
              >
                <Text style={styles.closeButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              {selectedPlayerForSubstitution && (
                <>
                  <View style={styles.modalSection}>
                    <Text style={styles.modalSectionTitle}>Removing from Lineup</Text>
                    <View style={styles.substitutionPlayerCard}>
                      <View style={styles.battingOrderBadge}>
                        <Text style={styles.battingOrderText}>
                          {lineupPlayers.findIndex(p => p.number === selectedPlayerForSubstitution.number) + 1}
                        </Text>
                      </View>
                      <View style={styles.playerInfo}>
                        <Text style={styles.playerNumber}>#{selectedPlayerForSubstitution.number}</Text>
                        <Text style={styles.playerName}>{selectedPlayerForSubstitution.name}</Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.modalSection}>
                    <Text style={styles.modalSectionTitle}>
                      Select Substitute from Bench ({benchPlayers.length})
                    </Text>
                    {benchPlayers.length === 0 ? (
                      <View style={styles.emptyStateSmall}>
                        <Text style={styles.emptyStateText}>No bench players available</Text>
                      </View>
                    ) : (
                      <View style={styles.benchList}>
                        {benchPlayers.map((player) => (
                          <TouchableOpacity
                            key={player.number}
                            style={styles.substitutionOptionRow}
                            onPress={() => handleSubstitutePlayer(player)}
                          >
                            <View style={styles.playerInfo}>
                              <Text style={styles.playerNumber}>#{player.number}</Text>
                              <Text style={styles.playerName}>{player.name}</Text>
                            </View>
                            <View style={styles.selectButton}>
                              <Text style={styles.selectButtonText}>Select →</Text>
                            </View>
                          </TouchableOpacity>
                        ))}
                      </View>
                    )}
                  </View>
                </>
              )}
            </ScrollView>
          </View>
        </Modal>
      </KeyboardAvoidingView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
  },
  header: {
    backgroundColor: SCOREBOARD_GREEN,
    padding: 24,
    paddingTop: Platform.OS === 'ios' ? 60 : 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: WHITE,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: WHITE,
    textAlign: 'center',
    opacity: 0.9,
  },

  // Team Switcher
  teamSwitcher: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    backgroundColor: WHITE,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  teamButton: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    borderWidth: 2,
    borderColor: '#e0e0e0',
    alignItems: 'center',
  },
  teamButtonActive: {
    backgroundColor: SCOREBOARD_GREEN,
    borderColor: SCOREBOARD_GREEN,
  },
  teamButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666',
  },
  teamButtonTextActive: {
    color: WHITE,
  },

  // Add Player Section
  addPlayerSection: {
    backgroundColor: WHITE,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: SCOREBOARD_GREEN,
  },
  manageBenchButton: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  manageBenchText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#666',
  },
  addPlayerForm: {
    flexDirection: 'row',
    gap: 8,
  },
  numberInput: {
    width: 70,
    borderWidth: 2,
    borderColor: SCOREBOARD_GREEN,
    borderRadius: 8,
    padding: 12,
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    backgroundColor: WHITE,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  nameInput: {
    flex: 1,
    borderWidth: 2,
    borderColor: SCOREBOARD_GREEN,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: WHITE,
  },
  addButton: {
    backgroundColor: SCOREBOARD_GREEN,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: 'center',
  },
  addButtonText: {
    color: WHITE,
    fontSize: 16,
    fontWeight: 'bold',
  },

  // Roster Section (Lineup)
  rosterSection: {
    flex: 1,
    padding: 16,
  },
  rosterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  rosterTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: SCOREBOARD_GREEN,
  },
  
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  modalHeader: {
    backgroundColor: SCOREBOARD_GREEN,
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: WHITE,
  },
  closeButton: {
    backgroundColor: WHITE,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  closeButtonText: {
    color: SCOREBOARD_GREEN,
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalContent: {
    flex: 1,
  },
  modalSection: {
    backgroundColor: WHITE,
    padding: 16,
    marginBottom: 12,
  },
  modalSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: SCOREBOARD_GREEN,
    marginBottom: 12,
  },

  // Bench Section
  benchList: {
    gap: 12,
  },
  benchPlayerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: '#e0e0e0',
  },

  // Substitution Modal Styles
  substitutionPlayerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffe0e0',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: '#ff4444',
  },
  substitutionOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e8f5e9',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: SCOREBOARD_GREEN,
  },
  selectButton: {
    backgroundColor: SCOREBOARD_GREEN,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    marginLeft: 12,
  },
  selectButtonText: {
    color: WHITE,
    fontSize: 14,
    fontWeight: 'bold',
  },
  clearButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#f0f0f0',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  clearButtonText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#666',
  },
  helpText: {
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
    marginBottom: 12,
    fontStyle: 'italic',
  },

  // Player Row (Draggable)
  listContainer: {
    flex: 1,
  },
  playerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: WHITE,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  playerRowActive: {
    backgroundColor: '#e8f5e9',
    borderColor: SCOREBOARD_GREEN,
    shadowOpacity: 0.3,
    elevation: 8,
  },
  dragHandle: {
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  dragIcon: {
    fontSize: 24,
    color: '#999',
  },
  battingOrderBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: SCOREBOARD_GREEN,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  battingOrderText: {
    color: WHITE,
    fontSize: 18,
    fontWeight: 'bold',
  },
  playerInfo: {
    flex: 1,
  },
  playerNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: SCOREBOARD_GREEN,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  playerName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 2,
  },
  removeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#ff4444',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  removeButtonText: {
    color: WHITE,
    fontSize: 18,
    fontWeight: 'bold',
  },
  substituteButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    marginLeft: 8,
  },
  substituteButtonText: {
    color: WHITE,
    fontSize: 11,
    fontWeight: 'bold',
  },
  benchButton: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginLeft: 8,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  benchButtonText: {
    color: '#666',
    fontSize: 12,
    fontWeight: 'bold',
  },
  lineupButton: {
    backgroundColor: SCOREBOARD_GREEN,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginLeft: 8,
  },
  lineupButtonText: {
    color: WHITE,
    fontSize: 12,
    fontWeight: 'bold',
  },

  // Empty State
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateSmall: {
    paddingVertical: 30,
    alignItems: 'center',
  },
  emptyStateIcon: {
    fontSize: 64,
    marginBottom: 16,
    opacity: 0.3,
  },
  emptyStateText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#999',
    marginBottom: 8,
  },
  emptyStateHint: {
    fontSize: 14,
    color: '#aaa',
    textAlign: 'center',
  },
});

