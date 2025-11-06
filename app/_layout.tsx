import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { useColorScheme } from '@/hooks/use-color-scheme';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? DarkTheme : DefaultTheme;

  return (
    <ThemeProvider value={theme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        <Stack.Screen 
          name="hero/[id]" 
          options={{ 
            headerShown: true,
            headerBackTitle: 'Atrás',
            title: 'Detalles',
            headerTransparent: true,
            headerTintColor: '#fff'
          }} 
        />
        <Stack.Screen 
          name="favorites" 
          options={{ 
            headerShown: true,
            title: 'Favoritos',
            presentation: 'modal'
          }} 
        />
      </Stack>
      {/* ✅ Solo una vez */}
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
    </ThemeProvider>
  );
}