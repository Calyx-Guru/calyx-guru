import {
  AnalyticsProvider,
  AnalyticsScreenTracker,
} from "@/contexts/AnalyticsContext";
import { AppAppearanceProvider } from "@/contexts/AppAppearanceContext";
import { MasterDataProvider } from "@/contexts/MasterDataContext";
import { SupabaseAuthProvider } from "@/contexts/SupabaseAuthContext";
import { useMasterData } from "@/hooks/useMasterData";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useUserState } from "@/hooks/useUserState";
import { runOnce, waitFor } from "@/lib/app/helper";
import { initializeApp } from "@/lib/app/initialization";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import { StyleSheet } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSupabaseAuth } from "../admin/src/hooks/useSupabaseAuth";

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

function AppContent() {
  const { initialize: initializeMasterData } = useMasterData();
  const { initializeSupabaseProfile } = useSupabaseAuth();
  const [isReady, setIsReady] = useState(false);
  const { getState: getUserProfileState } = useUserProfile();
  const { getState: getUserStateState } = useUserState();
  useEffect(() => {
    async function prepare() {
      try {
        console.log("Starting app initialization...");
        // Initialize app (load fonts, i18n, check auth) and master data in parallel
        await Promise.all([
          runOnce("initializeApp", initializeApp)(),
          runOnce("initializeMasterData", initializeMasterData)(),
          runOnce("initializeSupabaseProfile", initializeSupabaseProfile)(),
        ]);

        await Promise.all([
          waitFor(() => !getUserProfileState().isLoading),
          waitFor(() => !getUserStateState().isLoading),
        ]);
      } catch (error) {
        console.error("Error during app initialization:", error);
      } finally {
        console.log("App initialization complete");
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
      <SafeAreaView
        style={styles.container}
        edges={["top", "left", "right", "bottom"]}
      >
        <AnalyticsScreenTracker />
        <Stack
          screenOptions={{
            headerShown: false,
          }}
        >
          <Stack.Screen name="index" />
        </Stack>
      </SafeAreaView>
    </AppAppearanceProvider>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={styles.gestureRoot}>
      <SupabaseAuthProvider>
        <MasterDataProvider>
          <AnalyticsProvider>
            <AppContent />
          </AnalyticsProvider>
        </MasterDataProvider>
      </SupabaseAuthProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  gestureRoot: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 0,
    margin: 0,
    backgroundColor: "#000000",
  },
});
