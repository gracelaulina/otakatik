import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
  useFonts,
  Outfit_400Regular,
  Outfit_600SemiBold,
  Outfit_700Bold,
} from '@expo-google-fonts/outfit';
import { GameProvider } from './src/state/GameContext';
import Navigator from './src/navigation/Navigator';

export default function App() {
  const [loaded, error] = useFonts({ Outfit_400Regular, Outfit_600SemiBold, Outfit_700Bold });
  // kalau font gagal dimuat (mis. offline), tetap lanjut pakai font sistem
  if (!loaded && !error) return null;
  return (
    <SafeAreaProvider>
      <GameProvider>
        <StatusBar style="dark" />
        <Navigator />
      </GameProvider>
    </SafeAreaProvider>
  );
}
