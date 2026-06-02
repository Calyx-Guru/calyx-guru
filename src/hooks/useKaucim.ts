import { KAUCIM_RNG_INDEX, MAX_PET_POWER } from "@/constants";
import { useAppAppearance } from "@/contexts/AppAppearanceContext";
import { useAppState } from "@/hooks/useAppState";
import { getRandomInt } from "@/lib/app/rng";
import { createDate, getTodayFirstTimestamp } from "@/lib/app/time";
import {
  computeKaucimPowerChange,
  KAUCIM_POWER_CALCULATION_CONFIG_KEY,
  parseKaucimPowerCalculation,
} from "@/lib/kaucim/powerChange";
import {
  FIVE_ELEMENTS,
  KAUCIM_CONCERNS,
  KaucimResult,
} from "@/types/UserState";
import { useCallback, useMemo } from "react";
import { useMasterData } from "./useMasterData";
import { useUserProfile } from "./useUserProfile";
import { useUserState } from "./useUserState";

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
};

export function useKaucim() {
  const { getKaucimStoryBundle, getAppConfigValue } = useMasterData();
  const { locale } = useAppAppearance();
  const { userState, updateUserState, pushKaucimHistory, unlockKaucimStory } =
    useUserState();
  const { deviceId, setAppState } = useAppState();
  const { profile } = useUserProfile();
  const lastKaucimResults = userState?.lastKaucimResults || {};

  const powerCalculation = useMemo(
    () =>
      parseKaucimPowerCalculation(
        getAppConfigValue(KAUCIM_POWER_CALCULATION_CONFIG_KEY),
      ),
    [getAppConfigValue],
  );

  const getPowerChange = useCallback(
    (fortuneLevel: number, rngSeed: number) => {
      const roll = getRandomInt(deviceId, rngSeed, createDate(), 0, 100);
      if (!powerCalculation) return 0;
      return computeKaucimPowerChange(fortuneLevel, roll, powerCalculation);
    },
    [deviceId, powerCalculation],
  );

  const isConcernReadToday = useCallback(
    (concern: KAUCIM_CONCERNS) => {
      if (userState) {
        const lastKaucimTimestamp = userState?.lastKaucimTimestamp || 0;
        const todayFirstTimestamp = getTodayFirstTimestamp();
        if (lastKaucimTimestamp >= todayFirstTimestamp) {
          const result = lastKaucimResults[concern];
          if (result) {
            return true;
          }
        }
      }

      return false;
    },
    [userState, lastKaucimResults],
  );

  const calculateStickNumber = (
    journeyProgress: number,
    randomStickNumber: number,
  ) => {
    // Always a good or greater good stick in the first 3 days
    switch (journeyProgress) {
      case 0:
      case 1:
        return randomStickNumber % 20;
      case 2:
      case 3:
        return randomStickNumber % 40;
      case 4:
      case 5:
      case 6:
      case 7:
        return randomStickNumber % 60;
      case 8:
      case 9:
        return randomStickNumber % 80;
      case 10:
        return (randomStickNumber % 20) + 60;
      case 11:
        return randomStickNumber % 40;
      case 12:
        return randomStickNumber % 60;
      case 13:
        return (randomStickNumber % 40) + 60;
      case 14:
        return randomStickNumber % 80;
    }

    return randomStickNumber % 100;
  };

  const rollKaucimResult = useCallback(
    (concern: KAUCIM_CONCERNS) => {
      const todayFirstTimestamp = getTodayFirstTimestamp();

      let result: KaucimResult | undefined;
      if (userState) {
        const lastKaucimTimestamp = userState?.lastKaucimTimestamp || 0;
        // if (lastKaucimTimestamp >= todayFirstTimestamp) {
        //   result = lastKaucimResults[concern];
        //   if (result) {
        //     setAppState({
        //       lastKaucimConcern: concern,
        //       lastKaucimFresh: false,
        //       kaucimReplay: null,
        //     });
        //     unlockKaucimStory(concern, result.stickNumber);

        //     return result;
        //   }
        // }
      }

      const lastKaucimRollTimestamp = userState?.lastKaucimRollTimestamp || 0;
      let journeyProgress = userState?.kaucimJourneyProgress || 0;
      if (lastKaucimRollTimestamp >= todayFirstTimestamp) {
        journeyProgress += 1;
      }

      const concernIndex = KAUCIM_CONCERNS_META[concern].index;
      const rngIndex = KAUCIM_RNG_INDEX + concernIndex * 10;
      const randomStickNumber = getRandomInt(
        deviceId,
        rngIndex,
        createDate(),
        0,
        100,
      );
      const stickNumber = calculateStickNumber(
        journeyProgress,
        randomStickNumber,
      );
      const storyBundle = getKaucimStoryBundle(concern, locale, stickNumber);
      const storyIndex = getRandomInt(
        deviceId,
        rngIndex + 1,
        createDate(),
        0,
        storyBundle.length,
      );
      const story = storyBundle[storyIndex % storyBundle.length];
      const powerChange = getPowerChange(
        Number(story.fortuneLevel),
        rngIndex + 2,
      );

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
        const nextPetPower = Math.max(
          1,
          Math.min(MAX_PET_POWER, userState.petPower + result.powerChange),
        );
        const lastKaucimTimestamp = userState.lastKaucimTimestamp || 0;
        let nextLastKaucimTimestamp = lastKaucimTimestamp || 0;
        let nextLastKaucimResults = { ...lastKaucimResults };
        const todayFirstTimestamp = getTodayFirstTimestamp();
        if (lastKaucimTimestamp < todayFirstTimestamp) {
          nextLastKaucimTimestamp = todayFirstTimestamp;
          nextLastKaucimResults = {};
        }
        nextLastKaucimResults[concern] = result;
        pushKaucimHistory(result);
        unlockKaucimStory(concern, stickNumber);
        setAppState({
          lastKaucimConcern: concern,
          lastKaucimFresh: true,
          lastPetPowerChange: result.powerChange,
          kaucimReplay: null,
        });
        updateUserState({
          lastKaucimRollTimestamp: todayFirstTimestamp,
          kaucimJourneyProgress: journeyProgress,
          lastKaucimTimestamp: nextLastKaucimTimestamp,
          lastKaucimResults: nextLastKaucimResults,
          petPower: nextPetPower,
        });
      }
      return result;
    },
    [
      deviceId,
      getKaucimStoryBundle,
      getPowerChange,
      lastKaucimResults,
      locale,
      profile,
      pushKaucimHistory,
      setAppState,
      unlockKaucimStory,
      updateUserState,
      userState,
    ],
  );

  const getKaucimStory = useCallback(
    (concern: KAUCIM_CONCERNS, stickNumber: number, storyIndex: number) => {
      const storyBundle = getKaucimStoryBundle(concern, locale, stickNumber);
      return storyBundle[storyIndex % storyBundle.length];
    },
    [getKaucimStoryBundle, locale],
  );

  const findKaucimResultForStick = useCallback(
    (concern: KAUCIM_CONCERNS, stickNumber: number) => {
      if (!userState) {
        return undefined;
      }

      const todayResult = userState.lastKaucimResults[concern];
      if (todayResult?.stickNumber === stickNumber) {
        return todayResult;
      }

      for (const entry of userState.kaucimHistory) {
        const result = entry.results[concern];
        if (result?.stickNumber === stickNumber) {
          return result;
        }
      }

      return undefined;
    },
    [userState],
  );

  return {
    rollKaucimResult,
    getKaucimStory,
    findKaucimResultForStick,
    isConcernReadToday,
  };
}
