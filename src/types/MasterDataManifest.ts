import type { LanguageKey } from './common';
import { KAUCIM_CONCERNS } from './UserState';

export interface MasterDataManifest {
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
    [key in KAUCIM_CONCERNS]?: {
      [key in LanguageKey]?: number;
    };
  };
}
