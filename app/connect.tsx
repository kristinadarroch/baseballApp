import { useConnection } from '@/contexts/ConnectionContext';
import { useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const SCOREBOARD_GREEN = '#2d6945';
const SCOREBOARD_DARK_GREEN = '#1a4029';
const WHITE = '#ffffff';

export default function ConnectScreen() {
  const router = useRouter();
  const { isConnected, isLoading, error, connect, esp32IpAddress } = useConnection();
  const hasNavigatedRef = useRef(false);

  const navigateToSettings = () => {
    try {
      router.push('/(tabs)/settings');
    } catch (err) {
      console.error('Navigation error:', err);
    }
  };

  // Navigate to scoreboard when connected
  useEffect(() => {
    if (isConnected && !hasNavigatedRef.current) {
      // Small delay to ensure router is ready
      const timer = setTimeout(() => {
        if (isConnected && !hasNavigatedRef.current) {
          hasNavigatedRef.current = true;
          router.replace('/(tabs)');
        }
      }, 100);
      return () => clearTimeout(timer);
    } else if (!isConnected) {
      hasNavigatedRef.current = false;
    }
  }, [isConnected, router]);

  return (
    <View style={styles.container}>
      <View style={styles.connectionPanel}>
        <Text style={styles.connectionTitle}>CONNECT TO SCOREBOARD</Text>
        <View style={styles.connectionInstructions}>
          <Text style={styles.instructionStep}>1. Connect WiFi to: BaseballClicker</Text>
          <Text style={styles.instructionStep}>2. Password: playball123</Text>
          <Text style={styles.instructionStep}>3. Tap Connect Below</Text>
        </View>
        
        <TouchableOpacity 
          style={styles.connectButton} 
          onPress={connect}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color={WHITE} size="large" />
          ) : (
            <Text style={styles.connectButtonText}>CONNECT</Text>
          )}
        </TouchableOpacity>

        <View style={styles.ipInfo}>
          <Text style={styles.ipLabel}>Connecting to:</Text>
          <Text style={styles.ipAddress}>{esp32IpAddress}</Text>
          <TouchableOpacity 
            style={styles.configLink}
            onPress={navigateToSettings}
          >
            <Text style={styles.configLinkText}>⚙️ Configure IP Address</Text>
          </TouchableOpacity>
        </View>

        {error && (
          <View style={styles.errorPanel}>
            <Text style={styles.errorText}>⚠ CONNECTION FAILED</Text>
            <Text style={styles.errorHint}>Check WiFi: BaseballClicker</Text>
            <Text style={styles.errorDetail}>Tried: {esp32IpAddress}</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  connectionPanel: {
    backgroundColor: SCOREBOARD_GREEN,
    borderRadius: 16,
    padding: 32,
    width: '100%',
    maxWidth: 500,
    borderWidth: 4,
    borderColor: WHITE,
  },
  connectionTitle: {
    color: WHITE,
    fontSize: 24,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: 2,
    marginBottom: 24,
  },
  connectionInstructions: {
    backgroundColor: SCOREBOARD_DARK_GREEN,
    padding: 20,
    borderRadius: 8,
    marginBottom: 24,
  },
  instructionStep: {
    color: WHITE,
    fontSize: 16,
    fontWeight: '600',
    marginVertical: 6,
  },
  connectButton: {
    backgroundColor: SCOREBOARD_DARK_GREEN,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 3,
    borderColor: WHITE,
  },
  connectButtonText: {
    color: WHITE,
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 2,
  },
  ipInfo: {
    marginTop: 16,
    padding: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    alignItems: 'center',
  },
  ipLabel: {
    color: WHITE,
    fontSize: 12,
    opacity: 0.7,
    marginBottom: 4,
  },
  ipAddress: {
    color: WHITE,
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Courier',
  },
  configLink: {
    marginTop: 12,
    padding: 8,
  },
  configLinkText: {
    color: WHITE,
    fontSize: 14,
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
  errorPanel: {
    backgroundColor: 'rgba(200, 0, 0, 0.3)',
    padding: 16,
    borderRadius: 8,
    marginTop: 20,
    borderWidth: 2,
    borderColor: '#ff0000',
  },
  errorText: {
    color: WHITE,
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  errorHint: {
    color: WHITE,
    fontSize: 14,
    textAlign: 'center',
    marginTop: 4,
  },
  errorDetail: {
    color: WHITE,
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
    fontFamily: 'Courier',
    opacity: 0.8,
  },
});

