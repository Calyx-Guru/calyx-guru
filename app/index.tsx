import { SKIP_SIGN_IN_SCREEN } from "@/constants/config";
import { RouteHome } from "@/routes/home";
import { Redirect, Stack } from "expo-router";

export default function Index() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      {SKIP_SIGN_IN_SCREEN ? (
        <Redirect href="/main-menu" />
      ) : (
        <RouteHome />
      )}
    </>
  );
}
