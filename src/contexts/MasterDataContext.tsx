'use client';

import {
    MASTER_DATA_MANIFEST_FILE_NAME,
    STORAGE_BUCKET,
    SUPPORTED_LANGUAGES,
} from '@/constants';
import { supabase } from '@/lib/supabase/client';
import type { LanguageKey, MasterDataManifest } from '@/types';
import type { FortunePoemContentType } from '@/types/FortunePoems';
import { createContext, useEffect, useState } from 'react';

// Import built-in JSON files
import fortunePoemsEN from '@/masterdata/fortune_poems/en.json';
import fortunePoemsJA from '@/masterdata/fortune_poems/ja.json';
import fortunePoemsKO from '@/masterdata/fortune_poems/ko.json';
import fortunePoemsVI from '@/masterdata/fortune_poems/vi.json';
import fortunePoemsZHCN from '@/masterdata/fortune_poems/zh-CN.json';
import fortunePoemsZHTW from '@/masterdata/fortune_poems/zh-TW.json';
import localManifestRaw from '@/masterdata/manifest.json';

// Type the localManifest - it may only have partial language versions
const localManifest = localManifestRaw as unknown as MasterDataManifest;

type MasterDataContextType = {
  manifest: MasterDataManifest | null;
  localManifest: MasterDataManifest;
  fortunePoems: Record<LanguageKey, FortunePoemContentType[]>;
  isLoading: boolean;
  error: string | null;
  updateAvailable: boolean;
  initialize: () => Promise<void>;
};

export const MasterDataContext = createContext<
  MasterDataContextType | undefined
>(undefined);

const LOCAL_POEMS_MAP: Record<LanguageKey, FortunePoemContentType[]> = {
  en: fortunePoemsEN as FortunePoemContentType[],
  ko: fortunePoemsKO as FortunePoemContentType[],
  ja: fortunePoemsJA as FortunePoemContentType[],
  'zh-CN': fortunePoemsZHCN as FortunePoemContentType[],
  'zh-TW': fortunePoemsZHTW as FortunePoemContentType[],
  vi: fortunePoemsVI as FortunePoemContentType[],
};

export function MasterDataProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [manifest, setManifest] = useState<MasterDataManifest | null>(null);
  const [fortunePoems, setFortunePoems] =
    useState<Record<LanguageKey, FortunePoemContentType[]>>(LOCAL_POEMS_MAP);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [updateAvailable, setUpdateAvailable] = useState(false);

  const initialize = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Load manifest from Supabase storage
      const { data, error: downloadError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .download(MASTER_DATA_MANIFEST_FILE_NAME);

      if (downloadError) {
        throw new Error(
          `Failed to download manifest: ${downloadError.message}`,
        );
      }

      const manifestText = await data.text();
      const remoteManifest: MasterDataManifest = JSON.parse(manifestText);
      setManifest(remoteManifest);

      // Check for version updates
      checkForUpdates(remoteManifest);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Error loading master data manifest:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const checkForUpdates = (remoteManifest: MasterDataManifest) => {
    const localVersions = localManifest.fortunePoems.languages as Record<
      string,
      number
    >;
    const remoteVersions = remoteManifest.fortunePoems.languages;

    let hasUpdates = false;

    for (const language of SUPPORTED_LANGUAGES) {
      const localVersion =
        localVersions[language as keyof typeof localVersions];
      const remoteVersion = remoteVersions[language];

      if (remoteVersion && localVersion && remoteVersion > localVersion) {
        hasUpdates = true;
        console.log(
          `Update available for ${language}: v${localVersion} → v${remoteVersion}`,
        );
      }
    }

    setUpdateAvailable(hasUpdates);
  };

  useEffect(() => {
    initialize();
  }, []);

  const value: MasterDataContextType = {
    manifest,
    localManifest,
    fortunePoems,
    isLoading,
    error,
    updateAvailable,
    initialize,
  };

  return (
    <MasterDataContext.Provider value={value}>
      {children}
    </MasterDataContext.Provider>
  );
}
