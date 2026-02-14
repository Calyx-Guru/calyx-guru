import { type LanguageKey } from '@/types';

export const DEFAULT_LANGUAGE: LanguageKey = 'en';
export const SUPPORTED_LANGUAGES: LanguageKey[] = [
  'en',
  'zh-CN',
  'zh-TW',
  'vi',
  'ko',
  'ja',
];
export const LANGUAGE_LABELS: Record<LanguageKey, string> = {
  en: 'English',
  'zh-CN': 'Chinese (Simplified)',
  'zh-TW': 'Chinese (Traditional)',
  vi: 'Vietnamese',
  ko: 'Korean',
  ja: 'Japanese',
};

export const STORAGE_BUCKET = 'fortune_data';
export const MASTER_DATA_MANIFEST_FILE_NAME = 'manifest.json';
export const LOCALIZATION_FILE_NAME = 'localization.json';
export const FORTUNE_POEMS_STORAGE_FOLDER = 'fortune_poems';
