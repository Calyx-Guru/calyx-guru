import { AppAppearanceProvider } from '@/contexts/AppAppearanceContext';
import { MasterDataProvider } from '@/contexts/MasterDataContext';
import { SupabaseAuthProvider } from '@/contexts/SupabaseAuthContext';
import { useMasterData } from '@/hooks/useMasterData';
import { runOnce } from '@/lib/app/helper';
import { initializeApp } from '@/lib/app/initialization';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSupabaseAuth } from '../admin/src/hooks/useSupabaseAuth';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

function AppContent() {
  const { initialize: initializeMasterData } = useMasterData();
  const { initializeSupabaseProfile } = useSupabaseAuth();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        console.log('Starting app initialization...');
        // Initialize app (load fonts, i18n, check auth) and master data in parallel
        await Promise.all([
          runOnce('initializeApp', initializeApp)(),
          runOnce('initializeMasterData', initializeMasterData)(),
          runOnce('initializeSupabaseProfile', initializeSupabaseProfile)(),
        ]);
      } catch (error) {
        console.error('Error during app initialization:', error);
      } finally {
        console.log('App initialization complete');
        setIsReady(true);
        // Hide the splash screen once initialization is complete
        await SplashScreen.hideAsync();
      }
    }

    prepare();
  }, []);

  if (!isReady) {
    return null;
  }

  return (
    <AppAppearanceProvider>
      <SafeAreaView style={styles.container}>
        <View style={[styles.container]}>
          <Stack
            screenOptions={{
              headerShown: false,
            }}
          >
            <Stack.Screen name="index" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(modal)" />
          </Stack>
        </View>
      </SafeAreaView>
    </AppAppearanceProvider>
  );
}

export default function RootLayout() {
  return (
    <SupabaseAuthProvider>
      <MasterDataProvider>
        <AppContent />
      </MasterDataProvider>
    </SupabaseAuthProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
});
