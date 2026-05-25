import type { MasterDataManifest } from '@/types/MasterDataManifest';

export const DEFAULT_MASTER_DATA_MANIFEST: MasterDataManifest = {
  appConfig: {
    lastUpdated: new Date().toISOString(),
    version: 0,
  },
  localization: {
    lastUpdated: new Date().toISOString(),
    version: 0,
  },
  fortunePoems: {
    lastUpdated: new Date().toISOString(),
    languages: {},
  },
};
