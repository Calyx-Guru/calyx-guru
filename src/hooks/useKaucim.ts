import { getDeviceIdAsync } from '@/lib/app/helper';
import { KAUCIM_CONCERNS } from '@/types/UserState';
import { useMemo } from 'react';

export const KAUCIM_CONCERNS_META = {
  [KAUCIM_CONCERNS.CAREER]: {
    index: 1,
  },
  [KAUCIM_CONCERNS.WEALTH]: {
    index: 2,
  },
  [KAUCIM_CONCERNS.LOVE]: {
    index: 3,
  },
  [KAUCIM_CONCERNS.HEALTH]: {
    index: 4,
  },
  [KAUCIM_CONCERNS.FAMILY]: {
    index: 5,
  },
  [KAUCIM_CONCERNS.CHILDREN]: {
    index: 6,
  },
  [KAUCIM_CONCERNS.FRIENDS]: {
    index: 7,
  },
  [KAUCIM_CONCERNS.TRAVEL]: {
    index: 8,
  },
  [KAUCIM_CONCERNS.LAWSUITS]: {
    index: 9,
  },
  [KAUCIM_CONCERNS.ACADEMIC]: {
    index: 10,
  },
  [KAUCIM_CONCERNS.LOST_ITEMS]: {
    index: 11,
  },
}

export function useKaucim() {
  const deviceId = useMemo(async () => {
    return await getDeviceIdAsync();
  }, []);
}

