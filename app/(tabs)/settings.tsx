import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SCOREBOARD_THEMES } from '../../constants/scoreboard-themes';
import { useConnection } from '../../contexts/ConnectionContext';

const SCOREBOARD_GREEN = '#2d6945';
const WHITE = '#FFFFFF';

export default function SettingsScreen() {
  const { 
    esp32IpAddress, 
    setEsp32IpAddress, 
    isConnected, 
    visitorTeamName, 
    homeTeamName, 
    setVisitorTeamName, 
    setHomeTeamName,
    scoreboardTheme,
    setScoreboardTheme,
  } = useConnection();
  
  const [ipInput, setIpInput] = useState(esp32IpAddress);
  const [visitorInput, setVisitorInput] = useState(visitorTeamName);
  const [homeInput, setHomeInput] = useState(homeTeamName);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    // Basic IP validation
    const ipPattern = /^(\d{1,3}\.){3}\d{1,3}$/;
    
    if (!ipPattern.test(ipInput.trim())) {
      Alert.alert(
        'Invalid IP Address',
        'Please enter a valid IP address (e.g., 192.168.4.1)',
        [{ text: 'OK' }]
      );
      return;
    }

    // Validate each octet is 0-255
    const octets = ipInput.trim().split('.');
    const isValid = octets.every(octet => {
      const num = parseInt(octet, 10);
      return num >= 0 && num <= 255;
    });

    if (!isValid) {
      Alert.alert(
        'Invalid IP Address',
        'Each number must be between 0 and 255',
        [{ text: 'OK' }]
      );
      return;
    }

    setIsSaving(true);
    try {
      await setEsp32IpAddress(ipInput.trim());
      Alert.alert(
        'Settings Saved',
        isConnected 
          ? 'IP address updated. Please reconnect to ESP32.' 
          : 'IP address updated successfully!',
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert(
        'Error',
        'Failed to save IP address. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    Alert.alert(
      'Reset to Default?',
      'This will reset the IP address to 192.168.4.1 (Access Point mode)',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            setIpInput('192.168.4.1');
          },
        },
      ]
    );
  };

  const handleSaveTeamNames = async () => {
    if (!visitorInput.trim() || !homeInput.trim()) {
      Alert.alert(
        'Team Names Required',
        'Please enter names for both teams',
        [{ text: 'OK' }]
      );
      return;
    }

    setIsSaving(true);
    try {
      await setVisitorTeamName(visitorInput);
      await setHomeTeamName(homeInput);
      Alert.alert(
        'Teams Updated',
        'Team names have been updated successfully!',
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert(
        'Error',
        'Failed to save team names. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetTeamNames = () => {
    Alert.alert(
      'Reset Team Names?',
      'This will reset team names to VISITOR and HOME',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            setVisitorInput('VISITOR');
            setHomeInput('HOME');
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>⚙️ Settings</Text>

        {/* ESP32 Configuration Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ESP32 Configuration</Text>
          
          <Text style={styles.label}>IP Address</Text>
          <TextInput
            style={styles.input}
            value={ipInput}
            onChangeText={setIpInput}
            placeholder="192.168.4.1"
            keyboardType="numeric"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <Text style={styles.helpText}>
            Current IP: <Text style={styles.currentIp}>{esp32IpAddress}</Text>
          </Text>

          {isConnected && (
            <View style={styles.warningBox}>
              <Text style={styles.warningText}>
                ⚠️ Changing the IP will disconnect from ESP32
              </Text>
            </View>
          )}

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.button, styles.resetButton]}
              onPress={handleReset}
              disabled={isSaving}
            >
              <Text style={styles.resetButtonText}>Reset to Default</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.saveButton]}
              onPress={handleSave}
              disabled={isSaving}
            >
              <Text style={styles.saveButtonText}>
                {isSaving ? 'Saving...' : 'Save'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Team Names Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚾ Team Names</Text>
          
          <Text style={styles.label}>Visitor Team</Text>
          <TextInput
            style={styles.input}
            value={visitorInput}
            onChangeText={setVisitorInput}
            placeholder="VISITOR"
            autoCapitalize="characters"
            autoCorrect={false}
            maxLength={15}
          />

          <Text style={[styles.label, { marginTop: 16 }]}>Home Team</Text>
          <TextInput
            style={styles.input}
            value={homeInput}
            onChangeText={setHomeInput}
            placeholder="HOME"
            autoCapitalize="characters"
            autoCorrect={false}
            maxLength={15}
          />

          <Text style={styles.helpText}>
            Team names will appear on the scoreboard (max 15 characters)
          </Text>

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.button, styles.resetButton]}
              onPress={handleResetTeamNames}
              disabled={isSaving}
            >
              <Text style={styles.resetButtonText}>Reset Names</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.saveButton]}
              onPress={handleSaveTeamNames}
              disabled={isSaving}
            >
              <Text style={styles.saveButtonText}>
                {isSaving ? 'Saving...' : 'Apply'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Scoreboard Theme Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎨 Scoreboard Theme</Text>
          
          <Text style={styles.helpText}>
            Choose a visual style for your scoreboard display
          </Text>

          {Object.values(SCOREBOARD_THEMES).map((theme) => (
            <TouchableOpacity
              key={theme.id}
              style={[
                styles.themeCard,
                scoreboardTheme === theme.id && styles.themeCardSelected,
                { backgroundColor: theme.colors.background }
              ]}
              onPress={async () => {
                try {
                  await setScoreboardTheme(theme.id);
                  Alert.alert(
                    'Theme Updated',
                    `Scoreboard theme changed to "${theme.name}"`,
                    [{ text: 'OK' }]
                  );
                } catch (error) {
                  Alert.alert(
                    'Error',
                    'Failed to save theme. Please try again.',
                    [{ text: 'OK' }]
                  );
                }
              }}
            >
              <View style={styles.themeHeader}>
                <Text style={[styles.themeName, { color: theme.colors.secondaryText }]}>
                  {theme.name}
                </Text>
                {scoreboardTheme === theme.id && (
                  <Text style={[styles.themeCheckmark, { color: theme.colors.accentColor }]}>✓</Text>
                )}
              </View>
              <Text style={[styles.themeDescription, { color: theme.colors.secondaryText }]}>
                {theme.description}
              </Text>
              
              {/* Preview indicators */}
              <View style={styles.themePreview}>
                <View style={styles.themePreviewRow}>
                  <View style={[styles.themeIndicator, { backgroundColor: theme.colors.ballIndicator }]} />
                  <View style={[styles.themeIndicator, { backgroundColor: theme.colors.strikeIndicator }]} />
                  <View style={[styles.themeIndicator, { backgroundColor: theme.colors.outIndicator }]} />
                </View>
                <Text style={[styles.themeScorePreview, { color: theme.colors.primaryText }]}>
                  88
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Configuration Modes Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📡 Configuration Modes</Text>

          <View style={styles.modeCard}>
            <Text style={styles.modeTitle}>🏟️ Access Point Mode (Default)</Text>
            <Text style={styles.modeText}>
              • ESP32 creates {'"'}BaseballClicker{'"'} WiFi{'\n'}
              • IP Address: 192.168.4.1{'\n'}
              • Best for: Production, field use{'\n'}
              • Internet: Not available
            </Text>
          </View>

          <View style={styles.modeCard}>
            <Text style={styles.modeTitle}>📶 Station Mode (Development)</Text>
            <Text style={styles.modeText}>
              • ESP32 joins YOUR WiFi network{'\n'}
              • IP Address: Assigned by router (e.g., 192.168.1.156){'\n'}
              • Best for: Development with Expo{'\n'}
              • Internet: Available{'\n'}
              • Get IP from ESP32 Serial Monitor
            </Text>
          </View>
        </View>

        {/* Quick Setup Guide */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🚀 Quick Setup Guide</Text>

          <Text style={styles.guideTitle}>For Production (Access Point):</Text>
          <Text style={styles.guideText}>
            1. Keep default IP: 192.168.4.1{'\n'}
            2. Connect to {'"'}BaseballClicker{'"'} WiFi{'\n'}
            3. Tap Connect in app
          </Text>

          <Text style={styles.guideTitle}>For Development (Station Mode):</Text>
          <Text style={styles.guideText}>
            1. Upload Station Mode code to ESP32{'\n'}
            2. Check Serial Monitor for ESP32{"'"}s IP{'\n'}
            3. Enter that IP here and save{'\n'}
            4. Stay on your regular WiFi{'\n'}
            5. Tap Connect in app
          </Text>
        </View>

        {/* App Info */}
        <View style={styles.infoSection}>
          <Text style={styles.infoText}>
            ⚾ Baseball Scoreboard v1.0.0{'\n'}
            Built with React Native & Expo
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: SCOREBOARD_GREEN,
    marginBottom: 24,
    textAlign: 'center',
  },
  section: {
    backgroundColor: WHITE,
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: SCOREBOARD_GREEN,
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 2,
    borderColor: SCOREBOARD_GREEN,
    borderRadius: 8,
    padding: 12,
    fontSize: 18,
    fontFamily: 'Courier',
    backgroundColor: WHITE,
    marginBottom: 8,
  },
  helpText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  currentIp: {
    fontFamily: 'Courier',
    fontWeight: 'bold',
    color: SCOREBOARD_GREEN,
  },
  warningBox: {
    backgroundColor: '#fff3cd',
    borderColor: '#ffc107',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  warningText: {
    color: '#856404',
    fontSize: 14,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  resetButton: {
    backgroundColor: '#f0f0f0',
    borderWidth: 2,
    borderColor: '#ccc',
  },
  resetButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: 'bold',
  },
  saveButton: {
    backgroundColor: SCOREBOARD_GREEN,
  },
  saveButtonText: {
    color: WHITE,
    fontSize: 16,
    fontWeight: 'bold',
  },
  modeCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  modeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: SCOREBOARD_GREEN,
    marginBottom: 8,
  },
  modeText: {
    fontSize: 14,
    color: '#555',
    lineHeight: 22,
  },
  guideTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 12,
    marginBottom: 8,
  },
  guideText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
  },
  
  infoSection: {
    padding: 20,
    alignItems: 'center',
  },
  infoText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    lineHeight: 20,
  },
  
  // Theme card styles
  themeCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 3,
    borderColor: 'transparent',
  },
  themeCardSelected: {
    borderColor: '#FFD700',
    borderWidth: 3,
  },
  themeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  themeName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  themeCheckmark: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  themeDescription: {
    fontSize: 14,
    opacity: 0.8,
    marginBottom: 12,
  },
  themePreview: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  themePreviewRow: {
    flexDirection: 'row',
    gap: 6,
  },
  themeIndicator: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  themeScorePreview: {
    fontSize: 36,
    fontWeight: 'bold',
    fontFamily: 'Courier',
  },
});
