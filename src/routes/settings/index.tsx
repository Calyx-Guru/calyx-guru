import { ENV, LANGUAGE_NATIVE_LABELS, SUPPORTED_LANGUAGES } from "@/constants";
import { useAppAppearance } from "@/contexts/AppAppearanceContext";
import type { ThemeMode } from "@/types";
import { router, type Href } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

const THEME_OPTIONS: ThemeMode[] = ["system", "light", "dark"];

export function RouteSettings() {
  const { locale, themeMode, setLocale, setThemeMode } = useAppAppearance();

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Language</Text>
        {SUPPORTED_LANGUAGES.map((lang) => (
          <Pressable
            key={lang}
            onPress={() => setLocale(lang)}
            style={[styles.option, locale === lang && styles.optionSelected]}
          >
            <Text style={styles.optionLabel}>
              {LANGUAGE_NATIVE_LABELS[lang]}
            </Text>
          </Pressable>
        ))}
      </View>

      {ENV.DEBUG_MODE && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Developer</Text>
          <Pressable
            onPress={() => router.push("/debug" as Href)}
            style={styles.option}
            accessibilityRole="button"
            accessibilityLabel="Open debug screen"
          >
            <Text style={styles.optionLabel}>Debug</Text>
          </Pressable>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#f4f7f8",
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 24,
  },
  section: {
    marginBottom: 24,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0B3C49",
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  option: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: "#ffffff",
  },
  optionSelected: {
    backgroundColor: "#d6a12d",
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0B3C49",
  },
});
