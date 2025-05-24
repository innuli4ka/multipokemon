import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { GameProvider } from '@/contexts/GameContext';
import { useFonts } from 'expo-font';
import { SplashScreen } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// Prevent the splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useFrameworkReady();

  const [fontsLoaded, fontError] = useFonts({
    'Pokemon-Solid': 'https://db.onlinewebfonts.com/t/f4d1593471d222ddebd973210265762a.ttf',
    'Pokemon-Hollow': 'https://db.onlinewebfonts.com/t/763ed85b0a80ca9bf99fc6b3b3ae3f32.ttf',
  });

  // Hide the splash screen once fonts are loaded
  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  // Return null to keep splash screen visible while fonts load
  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <GameProvider>
        <Stack screenOptions={{ 
          headerShown: false,
          animation: 'slide_from_right',
        }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="choose" />
          <Stack.Screen name="table" />
          <Stack.Screen name="evolve" />
          <Stack.Screen name="summary" />
          <Stack.Screen name="+not-found" />
        </Stack>
        <StatusBar style="auto" />
      </GameProvider>
    </GestureHandlerRootView>
  );
}