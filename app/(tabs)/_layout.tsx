import { Tabs, useRouter, useSegments } from 'expo-router';
import React, { useEffect } from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useConnection } from '@/contexts/ConnectionContext';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const segments = useSegments();
  const { isConnected } = useConnection();

  // Guard: redirect to connect screen if trying to access scoreboard when not connected
  // Allow Settings tab even when disconnected
  useEffect(() => {
    const currentTab = segments[segments.length - 1];
    const allowedWhenDisconnected = ['settings', 'connect'];
    
    if (!isConnected && !allowedWhenDisconnected.includes(currentTab as string)) {
      router.replace('/connect');
    }
  }, [isConnected, segments]);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Scoreboard',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="sportscourt.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="gearshape.fill" color={color} />,
        }}
      />
    </Tabs>
  );
}
