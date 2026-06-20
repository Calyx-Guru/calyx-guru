import { RouteHome } from "@/routes/home";
import { Stack } from "expo-router";

export default function Index() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <RouteHome />
    </>
  );
}
