import { RouteMainMenu } from "@/routes/main-menu";
import { Stack } from "expo-router";

export default function MainMenuScreen() {
  return (
    <Stack.Screen
      options={{
        headerShown: false,
      }}
    >
      <RouteMainMenu />
    </Stack.Screen>
  );
}
