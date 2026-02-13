import HeaderComponent from '@/components/home/HeaderComponent';
import { AppAppearanceProvider } from '@/contexts/AppAppearanceContext';
import { MasterDataProvider } from '@/contexts/MasterDataContext';
import { SupabaseAuthProvider } from '@/contexts/SupabaseAuthContext';
import { useMasterData } from '@/hooks/useMasterData';
import { initializeApp } from '@/lib/app/initialization';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

function AppContent() {
  const { initialize: initializeMasterData } = useMasterData();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        // Initialize app (load fonts, i18n, check auth) and master data in parallel
        await Promise.all([initializeApp(), initializeMasterData()]);
      } catch (error) {
        console.error('Error during app initialization:', error);
      } finally {
        setIsReady(true);
        // Hide the splash screen once initialization is complete
        await SplashScreen.hideAsync();
      }
    }

    prepare();
  }, [initializeMasterData]);

  if (!isReady) {
    return null;
  }

  return (
    <AppAppearanceProvider>
      <SafeAreaView style={styles.container}>
        {/* Header Component - style it so it will float on top */}
        <HeaderComponent style={styles.headerComponent} />
        <View style={styles.container}>
          <Stack
            screenOptions={{
              headerShown: false,
            }}
          >
            <Stack.Screen name="index" />
            <Stack.Screen name="(auth)" />
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
  },
  headerComponent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
});
