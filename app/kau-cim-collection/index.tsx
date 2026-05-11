import { Stack } from "expo-router";

import { RouteKaucimCollection } from "@/routes/kau-cim-collection";

export default function KaucimCollectionScreen() {
  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: "Kau Cim Collection",
          headerStyle: {
            backgroundColor: "#10898d",
          },
          headerTintColor: "#FFFFFF",
          headerTitleStyle: {
            color: "#FFFFFF",
          },
        }}
      />
      <RouteKaucimCollection />
    </>
  );
}
