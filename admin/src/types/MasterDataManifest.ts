import type { LanguageKey } from './common';

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
}
