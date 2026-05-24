import { Ionicons } from "@expo/vector-icons";
import { loadAsync } from "expo-font";

let iconFontsLoaded = false;
let loadPromise: Promise<void> | null = null;

/** Preload vector icon fonts from the bundle (avoids first-render Metro fetch on device). */
export async function ensureIconFonts(): Promise<void> {
  if (iconFontsLoaded) {
    return;
  }

  if (!loadPromise) {
    loadPromise = loadAsync(Ionicons.font)
      .then(() => {
        iconFontsLoaded = true;
      })
      .catch((error) => {
        loadPromise = null;
        console.warn("Failed to preload icon fonts:", error);
        throw error;
      });
  }

  return loadPromise;
}
