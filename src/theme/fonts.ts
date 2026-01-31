import { LanguageKey } from '@/types';

import { loadAsync } from 'expo-font';

export type FontRegistryType = {
  body: string;
};

export const fontRegistry: Record<LanguageKey, FontRegistryType> = {
  en: {
    body: 'Roboto-Regular',
  },
  'zh-CN': {
    body: 'NotoSansSC-Regular',
  },
  'zh-TW': {
    body: 'NotoSansTC-Regular',
  },
  vi: {
    body: 'Roboto-Regular',
  },
  kr: {
    body: 'NotoSansKR-Regular',
  },
  ja: {
    body: 'NotoSansJP-Regular',
  },
};

const fontMap: Record<string, number> = {
  'Roboto-Regular': require('@/assets/fonts/roboto-latin/Roboto-Regular.ttf'),
  'NotoSansSC-Regular': require('@/assets/fonts/noto-sans-simplified-chinese/NotoSansSC-Regular.ttf'),
  'NotoSansTC-Regular': require('@/assets/fonts/noto-sans-traditional-chinese/NotoSansTC-Regular.ttf'),
  'NotoSansKR-Regular': require('@/assets/fonts/noto-sans-korean/NotoSansKR-Regular.ttf'),
  'NotoSansJP-Regular': require('@/assets/fonts/noto-sans-japanese/NotoSansJP-Regular.ttf'),
};

const loaded = new Set<string>();

export async function loadFont(name: string, source: number) {
  if (loaded.has(name)) return;

  await loadAsync({ [name]: source });
  loaded.add(name);
}

export async function ensureFonts(language: LanguageKey) {
  const registry = fontRegistry[language];
  for (const [key, name] of Object.entries(registry)) {
    const source = fontMap[name];
    if (source) {
      await loadFont(name, source);
    }
  }
}
