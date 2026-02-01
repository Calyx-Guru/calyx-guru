import HeaderComponent from '@/components/home/HeaderComponent';
import {
  AppAppearanceProvider
} from '@/contexts/AppAppearanceContext';
import { SupabaseAuthProvider } from '@/contexts/SupabaseAuthContext';
import { initializeApp } from '@/lib/app/initialization';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

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
            </Stack>
          </View>
        </SafeAreaView>
      </AppAppearanceProvider>
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
