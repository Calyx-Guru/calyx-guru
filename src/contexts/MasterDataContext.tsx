'use client';

import type { LanguageKey, MasterDataManifest } from '@/types';
import type { FortunePoemContentType } from '@/types/FortunePoems';
import { createContext, useEffect, useState } from 'react';

// Import built-in JSON files
import { DEFAULT_LANGUAGE } from '@/constants';
import { runOnce } from '@/lib/app/helper';
import fortunePoemsRaw from '@/masterdata/fortune_poems.json';
import kaucimStoriesRaw from '@/masterdata/kaucim_stories.json';
import localManifestRaw from '@/masterdata/manifest.json';
import { KaucimStoriesPackType, KaucimStoryLineType } from '@/types/KaucimStories';
import { KAUCIM_CONCERNS } from '@/types/UserState';

// Type the localManifest - it may only have partial language versions
const localManifest = localManifestRaw as unknown as MasterDataManifest;

type MasterDataContextType = {
  manifest: MasterDataManifest | null;
  localManifest: MasterDataManifest;
  fortunePoems: Record<LanguageKey, FortunePoemContentType[]>;
  fortuneTellings: any;
  isLoading: boolean;
  error: string | null;
  updateAvailable: boolean;
  initialize: () => Promise<void>;  
  getKaucimStoryBundle: (concern: KAUCIM_CONCERNS, language: LanguageKey, stickNumber: number) => KaucimStoryLineType[];
};

export const MasterDataContext = createContext<
  MasterDataContextType | undefined
>(undefined);

const LOCAL_POEMS_MAP: Record<LanguageKey, FortunePoemContentType[]> =
  fortunePoemsRaw as unknown as Record<LanguageKey, FortunePoemContentType[]>;

const LOCAL_KAUCIM_STORIES_MAP: KaucimStoriesPackType =
  kaucimStoriesRaw as unknown as KaucimStoriesPackType;

export function MasterDataProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [manifest, setManifest] = useState<MasterDataManifest | null>(null);
  const [fortunePoems] =
    useState<Record<LanguageKey, FortunePoemContentType[]>>(LOCAL_POEMS_MAP);
  const [kaucimStories] = useState<KaucimStoriesPackType>(LOCAL_KAUCIM_STORIES_MAP);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [updateAvailable, setUpdateAvailable] = useState(false);

  const initialize = async () => {
    // try {
    //   setIsLoading(true);
    //   setError(null);

    //   // Load manifest from Supabase storage
    //   const { data } = await supabase.storage
    //     .from(STORAGE_BUCKET)
    //     .getPublicUrl(MASTER_DATA_MANIFEST_FILE_NAME);

    //   const url = data.publicUrl;
    //   const res = await fetchWithTimeout(url, 3000);
    //   const json = await res.json();

    //   if (!json) {
    //     throw new Error(`Failed to download manifest: No data returned`);
    //   }

    //   const remoteManifest: MasterDataManifest = json;
    //   setManifest(remoteManifest);

    //   // Check for version updates
    //   checkForUpdates(remoteManifest);
    // } catch (err) {
    //   const errorMessage =
    //     err instanceof Error ? err.message : 'Unknown error occurred';
    //   setError(errorMessage);
    //   console.error('Error loading master data manifest:', err);
    // } finally {
    //   setIsLoading(false);
    // }
  };

  const checkForUpdates = (remoteManifest: MasterDataManifest) => {
    // const localVersions = localManifest.fortunePoems.languages as Record<
    //   string,
    //   number
    // >;
    // const remoteVersions = remoteManifest.fortunePoems.languages;

    // let hasUpdates = false;

    // for (const language of SUPPORTED_LANGUAGES) {
    //   const localVersion =
    //     localVersions[language as keyof typeof localVersions];
    //   const remoteVersion = remoteVersions[language];

    //   if (remoteVersion && localVersion && remoteVersion > localVersion) {
    //     hasUpdates = true;
    //     console.log(
    //       `Update available for ${language}: v${localVersion} → v${remoteVersion}`,
    //     );
    //   }
    // }

    // setUpdateAvailable(hasUpdates);
  };

  const getKaucimStoryBundle = (concern: KAUCIM_CONCERNS, language: LanguageKey, stickNumber: number) => {
    const concerns = kaucimStories[concern];
    if (!concerns) {
      return [];
    }
    let languages = concerns[language];
    if (!languages) {
      languages = concerns[DEFAULT_LANGUAGE];
      if (!languages) {
        return [];
      }
    }
    const result = languages.filter(story => story.stickNumber === stickNumber);
    if (result.length === 0) {
      const random = result[Math.floor(Math.random() * result.length)];
      const fallbackStickNumber = random.stickNumber;
      return languages.filter(story => story.stickNumber === fallbackStickNumber);
    }
    return result;
  };
  
  useEffect(() => {
    runOnce('masterdata_initialize', () => initialize());
  }, []);

  const value: MasterDataContextType = {
    manifest,
    localManifest,
    fortunePoems,    
    fortuneTellings: null,
    isLoading,
    error,
    updateAvailable,
    initialize,
    getKaucimStoryBundle
  };

  return (
    <MasterDataContext.Provider value={value}>
      {children}
    </MasterDataContext.Provider>
  );
}
