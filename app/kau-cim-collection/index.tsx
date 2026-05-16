import { Stack, useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { RouteKaucimCollection } from "@/routes/kau-cim-collection";

const HEADER_BAR_HEIGHT = 48;

function CollectionHeader() {
  const router = useRouter();

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
        Kau Cim Collection
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
