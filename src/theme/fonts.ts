import { LanguageKey, SizeType } from '@/types';

import { loadAsync } from 'expo-font';
import { Platform } from 'react-native';

export type FontRegistryType = {
  body: string;
  accent: string;
  heading: string;
};

export const fontSizes: Record<LanguageKey, Record<SizeType, number>> = {
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
  ko: {
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

const zhCNBody = Platform.select({ ios: 'PingFang SC', android: 'sans-serif', default: 'sans-serif' });
const zhCNHeading = Platform.select({ ios: 'PingFang SC', android: 'sans-serif-medium', default: 'sans-serif' });
const zhTWBody = Platform.select({ ios: 'PingFang TC', android: 'sans-serif', default: 'sans-serif' });
const zhTWHeading = Platform.select({ ios: 'PingFang TC', android: 'sans-serif-medium', default: 'sans-serif' });
const koBody = Platform.select({ ios: 'NotoSansKR-Regular', android: 'sans-serif', default: 'sans-serif' });
const koHeading = Platform.select({ ios: 'NotoSansKR-Bold', android: 'sans-serif-medium', default: 'sans-serif' });
const jaBody = Platform.select({ ios: 'NotoSansJP-Regular', android: 'sans-serif', default: 'sans-serif' });
const jaHeading = Platform.select({ ios: 'NotoSansJP-Bold', android: 'sans-serif-medium', default: 'sans-serif' });

export const fontRegistry: Record<LanguageKey, FontRegistryType> = {
  en: {
    body: 'Roboto-Regular',
    accent: 'CormorantSC-Bold',
    heading: 'Roboto-Bold',
  },
  'zh-CN': {
    body: zhCNBody,
    accent: 'ZCOOLXiaoWei-Regular',
    heading: zhCNHeading,
  },
  'zh-TW': {
    body: zhTWBody,
    accent: 'UoqMunThenKhung-Regular',
    heading: zhTWHeading,
  },
  vi: {
    body: 'Roboto-Regular',
    accent: 'CormorantSC-Bold',
    heading: 'Roboto-Bold',
  },
  ko: {
    body: koBody,
    accent: koHeading,
    heading: koHeading,
  },
  ja: {
    body: jaBody,
    accent: jaHeading,
    heading: jaHeading,
  },
};

const fontMap: Record<string, number> = {
  'Roboto-Regular': require('@/assets/fonts/roboto-latin/Roboto-Regular.ttf'),
  'Roboto-Medium': require('@/assets/fonts/roboto-latin/Roboto-Medium.ttf'),
  'Roboto-Bold': require('@/assets/fonts/roboto-latin/Roboto-Bold.ttf'),
  'CormorantSC-Bold': require('@/assets/fonts/cormorant-sc-latin/CormorantSC-Bold.ttf'),
  'UoqMunThenKhung-Regular': require('@/assets/fonts/uoq-mun-then-khung-traditional-chinese/UoqMunThenKhung-Regular.ttf'),  
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
