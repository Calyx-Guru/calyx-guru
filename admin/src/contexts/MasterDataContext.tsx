import { MASTER_DATA_MANIFEST_FILE_NAME, STORAGE_BUCKET } from '@/constants';
import { DEFAULT_MASTER_DATA_MANIFEST } from '@/constants/MasterData';
import supabase from '@/lib/supabase/client';
import { type MasterDataManifest } from '@/types/MasterDataManifest';
import React, { createContext, useEffect, useState } from 'react';

export type MasterData = {
  manifest: MasterDataManifest | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  setManifest: React.Dispatch<React.SetStateAction<MasterDataManifest | null>>;
};

export const MasterDataContext = createContext<MasterData>({
  manifest: null,
  isLoading: true,
  error: null,
  refetch: async () => {},
  setManifest: () => {},
});

export function MasterDataProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [manifest, setManifest] = useState<MasterDataManifest | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadManifest = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error: downloadError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .download(MASTER_DATA_MANIFEST_FILE_NAME);

      if (downloadError && downloadError.message !== 'Not found') {
        throw downloadError;
      }

      if (data) {
        const text = await data.text();
        const json = JSON.parse(text);
        setManifest({ ...DEFAULT_MASTER_DATA_MANIFEST, ...json });
      } else {
        console.log('Manifest not found in storage, using default');
        setManifest(DEFAULT_MASTER_DATA_MANIFEST);
      }
    } catch (err: any) {
      console.error('Error loading manifest:', err);
      setError(err.message ?? 'Failed to load manifest');
      setManifest(DEFAULT_MASTER_DATA_MANIFEST);
    } finally {
      setIsLoading(false);
    }
  };

  // Load manifest on component mount
  useEffect(() => {
    loadManifest();
  }, []);

  return (
    <MasterDataContext.Provider
      value={{
        manifest,
        isLoading,
        error,
        refetch: loadManifest,
        setManifest,
      }}
    >
      {children}
    </MasterDataContext.Provider>
  );
}
