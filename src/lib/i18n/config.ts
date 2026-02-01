import { LanguageKey } from '@/types';
import * as Localization from 'expo-localization';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import translation files
import enTranslations from '@/locales/en/translation.json';
import jaTranslations from '@/locales/ja/translation.json';
import krTranslations from '@/locales/kr/translation.json';
import viTranslations from '@/locales/vi/translation.json';
import zhCNTranslations from '@/locales/zh-CN/translation.json';
import zhTWTranslations from '@/locales/zh-TW/translation.json';

const resources = {
  en: { translation: enTranslations },
  'zh-CN': { translation: zhCNTranslations },
  'zh-TW': { translation: zhTWTranslations },
  vi: { translation: viTranslations },
  kr: { translation: krTranslations },
  ja: { translation: jaTranslations },
};

/**
 * Map device locale to our supported language keys
 */
export function mapDeviceLocaleToLanguageKey(): LanguageKey {
  const deviceLocale = Localization.getLocales()[0]?.languageTag || 'en';

  // Map common locales to our keys
  const localeMap: Record<string, LanguageKey> = {
    en: 'en',
    'en-US': 'en',
    'en-GB': 'en',
    zh: 'zh-CN',
    'zh-Hans': 'zh-CN',
    'zh-CN': 'zh-CN',
    'zh-Hant': 'zh-TW',
    'zh-TW': 'zh-TW',
    vi: 'vi',
    'vi-VN': 'vi',
    ko: 'kr',
    'ko-KR': 'kr',
    ja: 'ja',
    'ja-JP': 'ja',
  };

  return localeMap[deviceLocale] || 'en';
}

let curentLanguage: LanguageKey | null = null;

/**
 * Initialize i18n with the provided language
 */
export async function initializeI18n(language: LanguageKey): Promise<void> {
  if (!language || curentLanguage === language) return;
  curentLanguage = language;

  if (i18n.isInitialized) {
    await i18n.changeLanguage(language);
    return;
  }

  await i18n.use(initReactI18next).init({
    resources,
    lng: language,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // React already escapes values
    },
    defaultNS: 'translation',
    ns: ['translation'],
    react: {
      useSuspense: false, // Disable suspense for Expo
    },
  });
}

export default i18n;
