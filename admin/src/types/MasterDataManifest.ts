import type { KAUCIM_CONCERNS, LanguageKey } from './common';

export interface MasterDataManifest {
  appConfig: {
    lastUpdated: string;
    version: number;
  };
  localization: {
    lastUpdated: string;
    version: number;
  };
  fortunePoems: {
    lastUpdated: string;
    languages: {
      [key in LanguageKey]?: number;
    };
  };
  kaucimStories: {
    [key in KAUCIM_CONCERNS]: {
      [key in LanguageKey]?: number;
    };
  };
}
