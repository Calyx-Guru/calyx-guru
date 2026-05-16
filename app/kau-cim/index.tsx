import { RouteKaucim } from "@/routes/kau-cim";
import { Stack } from "expo-router";

export default function KaucimScreen() {
  return (
    <Stack.Screen
      options={{
        headerShown: false,
      }}
    >
      <RouteKaucim />
    </Stack.Screen>
  );
}
