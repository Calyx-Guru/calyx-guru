import { useAppAppearance } from '@/contexts/AppAppearanceContext';
import { getDeviceIdAsync } from '@/lib/app/helper';
import { getRandomInt } from '@/lib/app/rng';
import { KaucimStoryLineType } from '@/types/KaucimStories';
import { FIVE_ELEMENTS, KAUCIM_CONCERNS, KaucimResult, UserState } from '@/types/UserState';
import { useCallback, useEffect, useState } from 'react';
import { useMasterData } from './useMasterData';
import { useUserProfile } from './useUserProfile';
import { useUserState } from './useUserState';

const KAUCIM_RNG_INDEX = 100;

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
  const [deviceId, setDeviceId] = useState<string>('');
  const { getKaucimStoryBundle } = useMasterData();
  const { locale } = useAppAppearance();
  const { userState, updateUserState } = useUserState();
  const { profile } = useUserProfile();

  const getPowerChange = useCallback((fortuneLevel: number, rngSeed: number) => {
    const num = getRandomInt(deviceId, rngSeed, new Date(), 0, 100);    
    switch (fortuneLevel) {
      case 1:
        return -(10 + Math.ceil(15 * num / 100));
      case 2:
        return -(5 + Math.ceil(10 * num / 100));
      case 3:
        return 0;
      case 4:
        return 5 + Math.ceil(5 * num / 100);
      case 5:
        return 10 + Math.ceil(10 * num / 100);
    }        

    return 0;
  }, [profile?.element]);

  const getKaucimResult = useCallback(async (concern: KAUCIM_CONCERNS, userState: UserState) => {
    const concernIndex = KAUCIM_CONCERNS_META[concern].index;
    const rngIndex = KAUCIM_RNG_INDEX + concernIndex * 10;
    const stickNumber = getRandomInt(deviceId, rngIndex, new Date(), 0, 100);
    const storyIndex = getRandomInt(deviceId, rngIndex + 1, new Date(), 0, 100);
    const storyBundle = getKaucimStoryBundle(concern, locale, stickNumber);
    const story = storyBundle[storyIndex];
    const powerChange = getPowerChange(story.fortuneLevel, rngIndex + 2);
    const result: KaucimResult & { story: KaucimStoryLineType } = {
      concern,
      stickNumber,
      powerChange,
      story,
      element: profile?.element || FIVE_ELEMENTS.EARTH,
      currentPower: userState.petPower,      
      timestamp: Date.now(),
    };
    return result;
  }, [deviceId, getKaucimStoryBundle]);

  const applyKaucimResult = useCallback((result: KaucimResult) => {
    if (!userState) return;
    updateUserState({
      petPower: userState.petPower + result.powerChange,
    });
  }, [userState]);

  useEffect(() => {
    const fetchDeviceId = async () => {
      const id = await getDeviceIdAsync();
      setDeviceId(id);
    }
    fetchDeviceId();
  }, []);

  return {
    getKaucimResult,
    applyKaucimResult
  }
}

