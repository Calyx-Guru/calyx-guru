import { LanguageKey } from "@/types";

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
export const STORAGE_GUEST_MODE_KEY = "guest_mode";
export const STORAGE_GOOGLE_PLAY_USER_ID_KEY = "google_play_user_id";

export const STORAGE_BUCKET = "calyx-fortune-data";
export const MASTER_DATA_MANIFEST_FILE_NAME = "manifest.json";
export const FORTUNE_POEMS_STORAGE_FOLDER = "fortune_poems";
export const LOCALIZATION_FILE_NAME = "localization";
export const APP_CONFIG_FILE_NAME = "appConfig";

export const SAVEDATA_STORAGE_BUCKET = "calyx-users";
export const SAVEDATA_STORAGE_MOCK_PREFIX = "mock";
export const SAVEDATA_STORAGE_PROD_PREFIX = "prod";
export const SAVEDATA_PROFILE_FILE_NAME = "profile.json";
export const SAVEDATA_STATE_FILE_NAME = "state.json";

// TODO: Get these from server
export const MAX_PET_POWER = 200;
export const INITIAL_PET_POWER = 100;
export const INITIAL_ELEMENTAL_ENERGY = 0;
export const MIN_ELEMENTAL_ENERGY = -100;
export const MAX_ELEMENTAL_ENERGY = 100;
