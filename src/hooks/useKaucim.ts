import { useAppAppearance } from '@/contexts/AppAppearanceContext';
import { useAppState } from '@/hooks/useAppState';
import { getDeviceIdAsync } from '@/lib/app/helper';
import { getRandomInt } from '@/lib/app/rng';
import { createDate } from '@/lib/app/time';
import { FIVE_ELEMENTS, KAUCIM_CONCERNS, KaucimResult } from '@/types/UserState';
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
  const { userState, updateUserState, pushKaucimHistory, unlockKaucimStory } = useUserState();
  const { setKaucimState } = useAppState();
  const { profile } = useUserProfile();  
  const lastKaucimResults = userState?.lastKaucimResults || {};

  const getPowerChange = useCallback((fortuneLevel: number, rngSeed: number) => {
    const num = getRandomInt(deviceId, rngSeed, createDate(), 0, 100);  
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

  const isConcernReadToday = useCallback((concern: KAUCIM_CONCERNS) => {  
    if (userState) {
      const lastKaucimTimestamp = userState?.lastKaucimTimestamp || 0;
      const todayFirstTimestamp = createDate().setHours(0, 0, 0, 0);
      if (lastKaucimTimestamp >= todayFirstTimestamp) {
        const result = lastKaucimResults[concern];
        if (result) {
          return true;
        }
      }
    }

    return false;    
  }, [userState, lastKaucimResults]);

  const rollKaucimResult = useCallback((concern: KAUCIM_CONCERNS) => {
    let result: KaucimResult | undefined;
    if (userState) {
      const lastKaucimTimestamp = userState?.lastKaucimTimestamp || 0;
      const todayFirstTimestamp = createDate().setHours(0, 0, 0, 0);
      if (lastKaucimTimestamp >= todayFirstTimestamp) {
        result = lastKaucimResults[concern];
        if (result) {
          setKaucimState({
            lastKaucimConcern: concern,
            lastKaucimFresh: false,
          });

          return result;
        }
      }
    }

    const concernIndex = KAUCIM_CONCERNS_META[concern].index;
    const rngIndex = KAUCIM_RNG_INDEX + concernIndex * 10;
    const stickNumber = getRandomInt(deviceId, rngIndex, createDate(), 0, 100);
    const storyIndex = getRandomInt(deviceId, rngIndex + 1, createDate(), 0, 100);
    const storyBundle = getKaucimStoryBundle(concern, locale, stickNumber);
    const story = storyBundle[storyIndex % storyBundle.length];
    const powerChange = getPowerChange(Number(story.fortuneLevel), rngIndex + 2);
    
    result = {
      concern,
      stickNumber,
      powerChange,
      storyIndex,
      element: profile?.element || FIVE_ELEMENTS.EARTH,
      currentPower: userState?.petPower || 0,      
      timestamp: createDate().getTime(),
    };

    if (userState) {
      const lastKaucimTimestamp = userState.lastKaucimTimestamp || 0;
      let nextLastKaucimTimestamp = lastKaucimTimestamp || 0;
      let nextLastKaucimResults = { ...lastKaucimResults };
      const todayFirstTimestamp = createDate().setHours(0, 0, 0, 0);
      if (lastKaucimTimestamp < todayFirstTimestamp) {
        nextLastKaucimTimestamp = todayFirstTimestamp;
        nextLastKaucimResults = {};
      }
      nextLastKaucimResults[concern] = result;
      pushKaucimHistory(result);
      unlockKaucimStory(concern, storyIndex);
      setKaucimState({
        lastKaucimConcern: concern,
        lastKaucimFresh: true,
      });
      updateUserState({
        lastKaucimTimestamp: nextLastKaucimTimestamp,
        lastKaucimResults: nextLastKaucimResults,
        petPower: userState.petPower + result.powerChange,
      });
    }
    return result;
  }, [
    deviceId,
    getKaucimStoryBundle,
    lastKaucimResults,
    profile,
    setKaucimState,
    userState,
  ]);

  const getKaucimStory = useCallback((concern: KAUCIM_CONCERNS, storyIndex: number) => {
    const storyBundle = getKaucimStoryBundle(concern, locale, storyIndex);
    return storyBundle[storyIndex % storyBundle.length];
  }, [getKaucimStoryBundle, locale]);

  useEffect(() => {
    const fetchDeviceId = async () => {
      const id = await getDeviceIdAsync();
      setDeviceId(id);
    }
    fetchDeviceId();
  }, []);

  return {
    rollKaucimResult,
    getKaucimStory,
    isConcernReadToday
  }
}

