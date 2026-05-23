import { HeaderBar } from "@/components/typography/HeaderBar";
import { useTranslation } from "@/hooks/useTranslation";
import { RouteSettings } from "@/routes/settings";
import { Stack } from "expo-router";

function SettingsHeader() {
  const { t } = useTranslation();

  return <HeaderBar title={t("common.settings")} />;
}

export default function SettingsScreen() {
  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          header: () => <SettingsHeader />,
        }}
      />
      <RouteSettings />
    </>
  );
}
