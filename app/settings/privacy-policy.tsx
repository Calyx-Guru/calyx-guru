import { HeaderBar } from "@/components/typography/HeaderBar";
import { RoutePrivacyPolicy } from "@/routes/settings/privacy-policy";
import { Stack } from "expo-router";

function PrivacyPolicyHeader() {
  return <HeaderBar title="Privacy Policy" />;
}

export default function PrivacyPolicyScreen() {
  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          header: () => <PrivacyPolicyHeader />,
        }}
      />
      <RoutePrivacyPolicy />
    </>
  );
}
