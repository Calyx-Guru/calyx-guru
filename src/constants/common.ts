import { LanguageKey } from "@/types";

export const USE_MOCK_DATA = true; // process.env.EXPO_PUBLIC_USE_MOCK_DATA;

export const DEFAULT_LANGUAGE: LanguageKey = "en";
export const SUPPORTED_LANGUAGES: LanguageKey[] = [
  "en",
  "zh-CN",
  "zh-TW",
  "vi",
  "ko",
  "ja",
];

/** Each language shown in its own name (not translated by the active UI locale). */
export const LANGUAGE_NATIVE_LABELS: Record<LanguageKey, string> = {
  en: "English",
  "zh-CN": "简体中文",
  "zh-TW": "繁體中文",
  vi: "Tiếng Việt",
  ko: "한국어",
  ja: "日本語",
};

export const STORAGE_THEME_KEY = "appearance";
export const STORAGE_ANALYTICS_FIRST_OPEN_AT_KEY = "analytics_first_open_at";

export const STORAGE_BUCKET = "fortune_data";
export const MASTER_DATA_MANIFEST_FILE_NAME = "manifest.json";
export const FORTUNE_POEMS_STORAGE_FOLDER = "fortune_poems";
export const LOCALIZATION_FILE_NAME = "localization";

// TODO: Get these from server
export const MAX_PET_POWER = 200;
export const INITIAL_PET_POWER = 100;
