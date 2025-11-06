import { Tabs } from 'expo-router';
import { Platform } from 'react-native';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: Platform.select({
          ios: {
            position: 'absolute',
          },
          default: {},
        }),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Héroes',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="ai"
        options={{
          title: 'Galacta',
          tabBarIcon: ({ color }) => {
            // Usar un emoji como fallback en Android/Web
            return Platform.OS === 'ios' 
              ? <IconSymbol size={28} name="sparkles" color={color} />
              : <ThemedText style={{ fontSize: 28, color }}>💜</ThemedText>;
          },
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Buscar',
          tabBarIcon: ({ color }) => {
            return Platform.OS === 'ios'
              ? <IconSymbol size={28} name="magnifyingglass" color={color} />
              : <ThemedText style={{ fontSize: 28, color }}>🔍</ThemedText>;
          },
        }}
      />
    </Tabs>
  );
}