import { loadAsync } from "expo-font";

/** Must match `@expo/vector-icons` Ionicons `createIconSet` family name. */
const IONICONS_FONT_FAMILY = "ionicons";

const ioniconsSource = require("@/assets/fonts/Ionicons.ttf");

let iconFontsLoaded = false;
let loadPromise: Promise<void> | null = null;

/** Preload vector icon fonts from the app bundle (not Metro node_modules paths). */
export async function ensureIconFonts(): Promise<void> {
  if (iconFontsLoaded) {
    return;
  }

  if (!loadPromise) {
    loadPromise = loadAsync({ [IONICONS_FONT_FAMILY]: ioniconsSource })
      .then(() => {
        iconFontsLoaded = true;
      })
      .catch((error) => {
        loadPromise = null;
        console.warn("Failed to preload icon fonts:", error);
      });
  }

  return loadPromise;
}

export function areIconFontsLoaded(): boolean {
  return iconFontsLoaded;
}
