import { type LanguageKey } from '@/types';

export const DEFAULT_LANGUAGE: LanguageKey = 'en';
export const SUPPORTED_LANGUAGES: LanguageKey[] = [
  'en',
  'zh-CN',
  'zh-TW',
  'vi',
  'kr',
  'ja',
];

export const STORAGE_BUCKET = 'fortune_data';
export const MASTER_DATA_MANIFEST_FILE_NAME = 'manifest.json';
export const FORTUNE_POEMS_STORAGE_FOLDER = 'fortune_poems';
