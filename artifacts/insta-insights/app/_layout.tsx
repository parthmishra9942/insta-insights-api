import React, { useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { HistoryProvider } from '@/context/HistoryContext';
import { LicenseProvider, useLicense } from '@/context/LicenseContext';
import LicenseGate from '@/components/LicenseGate';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import { Feather } from '@expo/vector-icons';
import { loadAsync, useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { setBaseUrl } from '@workspace/api-client-react';

// Configure the API client base URL so the mobile app can reach the API server.
// For development this is the Replit artifact proxy path. For production builds,
// set EXPO_PUBLIC_API_URL to your deployed API server origin.
// Local API server running on your PC
const API_BASE_URL = "http://172.25.209.171:8080";

setBaseUrl(API_BASE_URL);

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerBackTitle: 'Back' }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="insights" options={{ headerShown: false }} />
    </Stack>
  );
}

function LicenseApp() {
  const { isReady, isValid } = useLicense();
  if (!isReady) return null;
  if (!isValid) return <LicenseGate />;
  return <RootLayoutNav />;
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    ...Feather.font,
  });
  const [iconsReady, setIconsReady] = useState(false);

  useEffect(() => {
    // Ensure the Feather icon font is loaded before we render the app so
    // icons never render as blank boxes on Android. Some Android builds need
    // the family registered as the capitalized "Feather" name, so we load the
    // same asset under both names to cover both cases.
    const asset = Feather.font['feather'];
    Promise.allSettled([
      Feather.loadFont(),
      loadAsync({ Feather: asset }),
    ]).then((results) => {
      const failures = results.filter((r) => r.status === 'rejected');
      if (failures.length === results.length) {
        console.warn('Feather icon font failed to load:', failures);
      }
      setIconsReady(true);
    });
  }, []);

  useEffect(() => {
    if ((fontsLoaded || fontError) && iconsReady) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError, iconsReady]);

  if ((!fontsLoaded && !fontError) || !iconsReady) return null;

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <GestureHandlerRootView>
            <KeyboardProvider>
              <LicenseProvider>
                <HistoryProvider>
                  <LicenseApp />
                </HistoryProvider>
              </LicenseProvider>
            </KeyboardProvider>
          </GestureHandlerRootView>
        </QueryClientProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
