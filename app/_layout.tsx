import { Stack, useRouter, useSegments } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useEffect } from 'react';
import * as Location from 'expo-location';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

function RootLayoutNav() {
  const { user, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    // Request permissions on app start
    (async () => {
      await Location.requestForegroundPermissionsAsync();
    })();
  }, []);

  useEffect(() => {
    if (loading) return;

    const currentRoute = segments[0];
    const isAuthRoute = currentRoute === 'login' || currentRoute === 'signup';
    const isAppRoute = currentRoute === '(tabs)' || currentRoute === 'fake-call';

    if (!user && !isAuthRoute) {
      // Redirect to login if not authenticated and not on auth screen
      router.replace('/login');
    } else if (user && isAuthRoute) {
      // Redirect to home if authenticated and on auth screen
      router.replace('/(tabs)');
    }
  }, [user, loading, segments]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#e91e63" />
      </View>
    );
  }

  return (
    <Stack>
      <Stack.Screen 
        name="login" 
        options={{ 
          headerShown: false,
          presentation: 'fullScreenModal'
        }} 
      />
      <Stack.Screen 
        name="signup" 
        options={{ 
          headerShown: false,
          presentation: 'fullScreenModal'
        }} 
      />
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
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <RootLayoutNav />
      </AuthProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
});
