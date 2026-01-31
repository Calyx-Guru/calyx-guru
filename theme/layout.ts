import { LanguageKey } from '@/types';

export type LayoutProfileType = {
  textSpacingMultiplier: number;
  lineHeightScale: number;
};

export const layoutProfiles: Record<LanguageKey, LayoutProfileType> = {
  en: {
    textSpacingMultiplier: 1.0,
    lineHeightScale: 1.0,
  },
  'zh-CN': {
    textSpacingMultiplier: 1.0,
    lineHeightScale: 1.0,
  },
  'zh-TW': {
    textSpacingMultiplier: 1.0,
    lineHeightScale: 1.0,
  },
  vi: {
    textSpacingMultiplier: 1.0,
    lineHeightScale: 1.0,
  },
  kr: {
    textSpacingMultiplier: 1.0,
    lineHeightScale: 1.0,
  },
  ja: {
    textSpacingMultiplier: 1.0,
    lineHeightScale: 1.0,
  },
} as const;
