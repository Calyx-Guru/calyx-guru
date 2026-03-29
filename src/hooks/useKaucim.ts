import { getDeviceIdAsync } from '@/lib/app/helper';
import { useMemo } from 'react';

export enum KAUCIM_CONCERNS {
  CAREER = 'career',
  WEALTH = 'wealth',
  LOVE = 'love',
  HEALTH = 'health',
  FAMILY = 'family',
  CHILDREN = 'children',
  FRIENDS = 'friends',
  TRAVEL = 'travel',
  LAWSUITS = 'lawsuits',
  ACADEMIC = 'academic',
  LOST_ITEMS = 'lost_items',
}

export function useKaucim() {
  const deviceId = useMemo(async () => {
    return await getDeviceIdAsync();
  }, []);
}

