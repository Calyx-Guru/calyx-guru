import { AppAppearanceProvider } from '@/contexts/AppAppearanceContext';
import { SupabaseAuthProvider } from '@/contexts/SupabaseAuthContext';
import { initializeApp } from '@/lib/app/initialization';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useEffect(() => {
    async function prepare() {
      try {
        // Initialize app (load fonts, i18n, check auth)
        await initializeApp();
      } catch (error) {
        console.error('Error during app initialization:', error);
      } finally {
        // Hide the splash screen once initialization is complete
        await SplashScreen.hideAsync();
      }
    }

    prepare();
  }, []);

  return (
    <SupabaseAuthProvider>
      <AppAppearanceProvider>
        <Stack
          screenOptions={{
            headerShown: false,
          }}
        />
      </AppAppearanceProvider>
    </SupabaseAuthProvider>
  );
}
