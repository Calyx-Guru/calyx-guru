import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

const HEADER_BAR_HEIGHT = 48;

type HeaderBarProps = {
  title: string;
  onBackPress?: () => void;
};

export function HeaderBar({ title, onBackPress }: HeaderBarProps) {
  const router = useRouter();

  const handleBack = onBackPress ?? (() => router.back());

  return (
    <LinearGradient
      colors={["#56BEBE", "#CA73C9"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.header}
    >
      <Pressable
        onPress={handleBack}
        style={styles.backButton}
        accessibilityRole="button"
        accessibilityLabel="Go back"
      >
        <Text style={styles.backLabel}>‹</Text>
      </Pressable>
      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>
      <View style={styles.backButton} />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  header: {
    height: HEADER_BAR_HEIGHT,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
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
    fontSize: 32,
    fontWeight: "600",
    lineHeight: 30,
    marginTop: -2,
    textShadowColor: "rgba(0, 0, 0, 0.85)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 4,
  },
  title: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    textShadowColor: "rgba(0, 0, 0, 0.85)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 4,
  },
});
