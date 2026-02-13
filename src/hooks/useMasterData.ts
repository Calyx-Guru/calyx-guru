import { MasterDataContext } from '@/contexts/MasterDataContext';
import { useContext } from 'react';

export function useMasterData() {
  const context = useContext(MasterDataContext);

  if (context === undefined) {
    throw new Error('useMasterData must be used within MasterDataProvider');
  }

  return context;
}
