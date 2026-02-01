import { LanguageKey } from '@/types';

import { loadAsync } from 'expo-font';

export type FontRegistryType = {
  body: string;
  accent: string;
};

export type FontSizeType = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';

export const fontSizes: Record<LanguageKey, Record<FontSizeType, number>> = {
  en: {
    xs: 8,
    sm: 10,
    md: 12,
    lg: 16,
    xl: 24,
    '2xl': 30,
    '3xl': 36,
  },
  'zh-CN': {
    xs: 8,
    sm: 10,
    md: 12,
    lg: 16,
    xl: 24,
    '2xl': 30,
    '3xl': 36,
  },
  'zh-TW': {
    xs: 8,
    sm: 10,
    md: 12,
    lg: 16,
    xl: 24,
    '2xl': 30,
    '3xl': 36,
  },
  vi: {
    xs: 8,
    sm: 10,
    md: 12,
    lg: 16,
    xl: 24,
    '2xl': 30,
    '3xl': 36,
  },
  kr: {
    xs: 8,
    sm: 10,
    md: 12,
    lg: 16,
    xl: 24,
    '2xl': 30,
    '3xl': 36,
  },
  ja: {
    xs: 8,
    sm: 10,
    md: 12,
    lg: 16,
    xl: 24,
    '2xl': 30,
    '3xl': 36,
  },
};

export const fontRegistry: Record<LanguageKey, FontRegistryType> = {
  en: {
    body: 'Roboto-Regular',
    accent: 'CormorantSC-Bold',
  },
  'zh-CN': {
    body: 'NotoSansSC-Regular',
    accent: 'ZCOOLXiaoWei-Regular',
  },
  'zh-TW': {
    body: 'NotoSansTC-Regular',
    accent: 'UoqMunThenKhung-Regular',
  },
  vi: {
    body: 'Roboto-Regular',
    accent: 'CormorantSC-Bold',
  },
  kr: {
    body: 'NotoSansKR-Regular',
    accent: 'NotoSansKR-Bold',
  },
  ja: {
    body: 'NotoSansJP-Regular',
    accent: 'NotoSansJP-Bold',
  },
};

const fontMap: Record<string, number> = {
  'Roboto-Regular': require('@/assets/fonts/roboto-latin/Roboto-Regular.ttf'),
  'Roboto-Medium': require('@/assets/fonts/roboto-latin/Roboto-Medium.ttf'),
  'Roboto-Bold': require('@/assets/fonts/roboto-latin/Roboto-Bold.ttf'),
  'CormorantSC-Bold': require('@/assets/fonts/cormorant-sc-latin/CormorantSC-Bold.ttf'),
  'UoqMunThenKhung-Regular': require('@/assets/fonts/uoq-mun-then-khung-traditional-chinese/UoqMunThenKhung-Regular.ttf'),
  'NotoSansSC-Regular': require('@/assets/fonts/noto-sans-simplified-chinese/NotoSansSC-Regular.ttf'),
  'NotoSansTC-Regular': require('@/assets/fonts/noto-sans-traditional-chinese/NotoSansTC-Regular.ttf'),
  'NotoSansTC-Medium': require('@/assets/fonts/noto-sans-traditional-chinese/NotoSansTC-Medium.ttf'),
  'NotoSansTC-Bold': require('@/assets/fonts/noto-sans-traditional-chinese/NotoSansTC-Bold.ttf'),
  'NotoSansKR-Regular': require('@/assets/fonts/noto-sans-korean/NotoSansKR-Regular.ttf'),
  'NotoSansKR-Medium': require('@/assets/fonts/noto-sans-korean/NotoSansKR-Medium.ttf'),
  'NotoSansKR-Bold': require('@/assets/fonts/noto-sans-korean/NotoSansKR-Bold.ttf'),
  'NotoSansJP-Regular': require('@/assets/fonts/noto-sans-japanese/NotoSansJP-Regular.ttf'),
  'NotoSansJP-Medium': require('@/assets/fonts/noto-sans-japanese/NotoSansJP-Medium.ttf'),
  'NotoSansJP-Bold': require('@/assets/fonts/noto-sans-japanese/NotoSansJP-Bold.ttf'),
  'JetBrainsMono-Thin': require('@/assets/fonts/jetbrains-mono-numeral/JetBrainsMono-Thin.ttf'),
  'JetBrainsMono-Light': require('@/assets/fonts/jetbrains-mono-numeral/JetBrainsMono-Light.ttf'),
  'JetBrainsMono-Regular': require('@/assets/fonts/jetbrains-mono-numeral/JetBrainsMono-Regular.ttf'),
  'JetBrainsMono-Medium': require('@/assets/fonts/jetbrains-mono-numeral/JetBrainsMono-Medium.ttf'),
  'ZCOOLXiaoWei-Regular': require('@/assets/fonts/zcool-xiao-wei-simplified-chinese/ZCOOLXiaoWei-Regular.ttf'),
};

const loaded = new Set<string>();

export async function loadFont(name: string, source: number) {
  if (loaded.has(name)) return;

  loaded.add(name);
  await loadAsync({ [name]: source });
}

export async function ensureFonts(language: LanguageKey) {
  if (!language) return;
  const registry = fontRegistry[language];
  for (const [key, name] of Object.entries(registry)) {
    const source = fontMap[name];
    if (source) {
      await loadFont(name, source);
    }
  }
}
