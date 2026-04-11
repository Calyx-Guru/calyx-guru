import { useContext } from "react";

import { Tabs } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { AppAppearanceContext } from "@/contexts/AppAppearanceContext";

export default function TabsLayout() {
  const { colors } = useContext(AppAppearanceContext);

  return (
    <GestureHandlerRootView>
      <Tabs
        screenOptions={{
          headerShown: false,
          sceneStyle: { backgroundColor: colors.background },
          tabBarStyle: { display: "none" },
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.neutralInverse,
        }}
      >
      </Tabs>
    </GestureHandlerRootView>
  );
}
