import { RouteDebug } from "@/routes/debug";
import { Stack } from "expo-router";

export default function DebugScreen() {
  return (
    <Stack.Screen
      options={{
        headerShown: false,
      }}
    >
      <RouteDebug />
    </Stack.Screen>
  );
}
