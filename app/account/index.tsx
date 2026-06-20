import { HeaderBar } from "@/components/typography/HeaderBar";
import { useTranslation } from "@/hooks/useTranslation";
import { RouteAccount } from "@/routes/account";
import { Stack } from "expo-router";

function AccountHeader() {
  const { t } = useTranslation();

  return <HeaderBar title={t("auth.accountInformation")} />;
}

export default function AccountScreen() {
  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          header: () => <AccountHeader />,
        }}
      />
      <RouteAccount />
    </>
  );
}
