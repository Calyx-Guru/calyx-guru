import { Stack, useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { useTranslation } from "@/hooks/useTranslation";
import { RouteKaucimCollection } from "@/routes/kau-cim-collection";

const HEADER_BAR_HEIGHT = 48;

function CollectionHeader() {
  const router = useRouter();
  const { t } = useTranslation();

  return (
    <View style={styles.header}>
      <Pressable
        onPress={() => router.back()}
        style={styles.backButton}
        accessibilityRole="button"
        accessibilityLabel="Go back"
      >
        <Text style={styles.backLabel}>‹</Text>
      </Pressable>
      <Text style={styles.title} numberOfLines={1}>
        {t("kau_cim_collection.header.title")}
      </Text>
      <View style={styles.backButton} />
    </View>
  );
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

const styles = StyleSheet.create({
  header: {
    height: HEADER_BAR_HEIGHT,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#10898d",
    paddingHorizontal: 4,
  },
  backButton: {
    width: HEADER_BAR_HEIGHT,
    height: HEADER_BAR_HEIGHT,
    alignItems: "center",
    justifyContent: "center",
  },
  backLabel: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "600",
    lineHeight: 30,
    marginTop: -2,
  },
  title: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
});
