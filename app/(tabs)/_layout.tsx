import { Tabs, useRouter, useSegments } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';

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
  const hasNavigatedRef = useRef(false);
  const [isMounted, setIsMounted] = useState(false);

  // Mark as mounted after first render
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Guard: redirect to connect screen if trying to access scoreboard when not connected
  // Allow Settings and Rosters tabs even when disconnected
  useEffect(() => {
    // Don't navigate until component is mounted and router is ready
    if (!isMounted) {
      return;
    }

    const currentTab = segments[segments.length - 1];
    if (!currentTab) {
      return;
    }

    const allowedWhenDisconnected = ['settings', 'rosters', 'connect'];
    
    if (!isConnected && !allowedWhenDisconnected.includes(currentTab as string) && !hasNavigatedRef.current) {
      hasNavigatedRef.current = true;
      const timer = setTimeout(() => {
        try {
          router.replace('/connect');
        } catch (err) {
          console.error('Navigation error in TabLayout:', err);
          hasNavigatedRef.current = false;
        }
      }, 200);

      return () => {
        clearTimeout(timer);
      };
    } else if (isConnected) {
      hasNavigatedRef.current = false;
    }
  }, [isConnected, segments, router, isMounted]);

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
        name="rosters"
        options={{
          title: 'Rosters',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="person.3.fill" color={color} />,
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
