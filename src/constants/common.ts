import { LanguageKey } from '@/types';

export const USE_MOCK_DATA = false;

export const DEFAULT_LANGUAGE: LanguageKey = 'en';
export const SUPPORTED_LANGUAGES: LanguageKey[] = [
  'en',
  'zh-CN',
  'zh-TW',
  'vi',
  'ko',
  'ja',
];

export const STORAGE_THEME_STORE_KEY = 'appearance_theme';
export const STORAGE_LOCALE_STORE_KEY = 'appearance_locale';

export const STORAGE_BUCKET = 'fortune_data';
export const MASTER_DATA_MANIFEST_FILE_NAME = 'manifest.json';
export const FORTUNE_POEMS_STORAGE_FOLDER = 'fortune_poems';
