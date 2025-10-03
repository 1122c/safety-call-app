import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useEffect } from 'react';
import * as Location from 'expo-location';

export default function RootLayout() {
  useEffect(() => {
    // Request permissions on app start
    (async () => {
      await Location.requestForegroundPermissionsAsync();
    })();
  }, []);

  return (
    <SafeAreaProvider>
      <Stack>
        <Stack.Screen 
          name="(tabs)" 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="fake-call" 
          options={{ 
            headerShown: false,
            presentation: 'fullScreenModal'
          }} 
        />
      </Stack>
    </SafeAreaProvider>
  );
}
