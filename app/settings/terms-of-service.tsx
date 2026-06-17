import { HeaderBar } from "@/components/typography/HeaderBar";
import { RouteTermsOfService } from "@/routes/settings/terms-of-service";
import { Stack } from "expo-router";

function TermsOfServiceHeader() {
  return <HeaderBar title="Terms of Service" />;
}

export default function TermsOfServiceScreen() {
  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          header: () => <TermsOfServiceHeader />,
        }}
      />
      <RouteTermsOfService />
    </>
  );
}
