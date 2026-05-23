import { Stack } from "expo-router";

import { HeaderBar } from "@/components/typography/HeaderBar";
import { useTranslation } from "@/hooks/useTranslation";
import { RouteKaucimCollection } from "@/routes/kau-cim-collection";

function CollectionHeader() {
  const { t } = useTranslation();

  return <HeaderBar title={t("kau_cim_collection.header.title")} />;
}

export default function KaucimCollectionScreen() {
  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          header: () => <CollectionHeader />,
        }}
      />
      <RouteKaucimCollection />
    </>
  );
}
