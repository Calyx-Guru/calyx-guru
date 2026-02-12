import type { MasterDataManifest } from '@/types/MasterDataManifest';

export const DEFAULT_MASTER_DATA_MANIFEST: MasterDataManifest = {
  fortunePoems: {
    lastUpdated: new Date().toISOString(),
    languages: {},
  },
};
