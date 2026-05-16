import { RouteChooseElement } from "@/routes/choose-element";
import { Stack } from "expo-router";

export default function ChooseElementScreen() {
  return (
    <Stack.Screen
      options={{
        headerShown: false,
      }}
    >
      <RouteChooseElement dateLabel="Choose your element" />
    </Stack.Screen>
  );
}
