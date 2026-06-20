import { defineRouting } from "next-intl/routing";

export const locales = [
  "en",
  "ko",
  "ja",
  "cn-ZH",
  "cn-TW",
  "vi",
] as const;

export type Locale = (typeof locales)[number];

export const routing = defineRouting({
  locales,
  defaultLocale: "en",
  localePrefix: "as-needed",
});

/** BCP 47 language tags for the `lang` attribute on `<html>`. */
export const htmlLang: Record<Locale, string> = {
  en: "en",
  ko: "ko",
  ja: "ja",
  "cn-ZH": "zh-Hans",
  "cn-TW": "zh-Hant",
  vi: "vi",
};
