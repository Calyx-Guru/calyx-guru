import type { LanguageKey } from './common';

export interface MasterDataManifest {
  fortunePoems: {
    lastUpdated: string;
    languages: {
      [key in LanguageKey]: number;
    };
  };
}
