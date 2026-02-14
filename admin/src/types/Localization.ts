import type { LanguageKey } from './common';

export type LocalizationTranslationType = {
  key: string;
  translations: Record<LanguageKey, string>;
};

export type LocalizationDataType = Record<string, LocalizationTranslationType>;
