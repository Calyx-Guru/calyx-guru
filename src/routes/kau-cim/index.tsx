import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";

import { KaucimStoryExperience } from "@/features/kau-cim/story-experience";

import { useAppState } from "@/hooks/useAppState";
import { useKaucim } from "@/hooks/useKaucim";
import { useUserState } from "@/hooks/useUserState";
import { pickRandom } from "@/lib/app/helper";
import { FIVE_ELEMENTS } from "@/types/UserState";

import * as KAUCIM_VIDEOS from "@/assets/videos/kau-cim";

import { ILLUSTRATIONS } from "./constants";

function getKaucimVideoAsset(fortuneLevel: number) {
  if (fortuneLevel >= 4) {
    return KAUCIM_VIDEOS.GOOD;
  }

  if (fortuneLevel <= 2) {
    return KAUCIM_VIDEOS.BAD;
  }

  return KAUCIM_VIDEOS.NORMAL;
}

export function RouteKaucim() {
  const { lastKaucimConcern, kaucimReplay } = useAppState();
  const { rollKaucimResult } = useKaucim();
  const [isKaucimReady, setIsKaucimReady] = useState(false);

  useEffect(() => {
    if (kaucimReplay) {
      setIsKaucimReady(true);
      return;
    }

    if (lastKaucimConcern) {
      rollKaucimResult(lastKaucimConcern);
      setIsKaucimReady(true);
    }
  }, []);

  return isKaucimReady ? <KaucimSlideShow /> : null;
}

function KaucimSlideShow() {
  const { lastKaucimConcern, lastKaucimFresh, kaucimReplay, setAppState } =
    useAppState();
  const { userState } = useUserState();
  const { getKaucimStory } = useKaucim();

  const concern = kaucimReplay?.concern ?? lastKaucimConcern;
  const lastKaucimResults = userState?.lastKaucimResults || {};
  const result = kaucimReplay
    ? {
        concern: kaucimReplay.concern,
        stickNumber: kaucimReplay.stickNumber,
        storyIndex: kaucimReplay.storyIndex,
        powerChange: kaucimReplay.powerChange,
        element:
          userState?.lastKaucimResults[kaucimReplay.concern]?.element ??
          FIVE_ELEMENTS.EARTH,
        currentPower: userState?.petPower ?? 0,
        timestamp: 0,
      }
    : concern
      ? lastKaucimResults[concern]
      : undefined;
  const illustrations = concern ? ILLUSTRATIONS[concern] : undefined;
  const story =
    concern && result
      ? getKaucimStory(concern, result.stickNumber, result.storyIndex)
      : undefined;

  const fortuneLevel = story ? Number(story.fortuneLevel) : 0;
  const stickNumber = story ? Number(story.stickNumber) : 0;

  const video = useMemo(
    () => (story ? getKaucimVideoAsset(fortuneLevel) : KAUCIM_VIDEOS.NORMAL),
    [story, fortuneLevel],
  );

  const slideShow = useMemo<Kaucim.Slide[]>(() => {
    if (!illustrations || !story || !result) {
      return [];
    }

    const verdictIllustration = pickRandom(
      illustrations.omen[stickNumber % illustrations.omen.length],
    );
    const actionIllustration = pickRandom(
      illustrations.action[stickNumber % illustrations.action.length],
    );
    const concludeIllustration = pickRandom(
      illustrations.conclude[stickNumber % illustrations.conclude.length],
    );
    const openingText = kaucimReplay
      ? [story.verdict.trim(), story.omen.trim()].filter(Boolean).join("\n\n")
      : story.omen;

    return [
      {
        image: verdictIllustration(),
        text: openingText,
      },
      {
        image: actionIllustration(),
        text: story.action,
      },
      {
        image: concludeIllustration(),
        text: story.conclusion,
        textParams: { bonus: result.powerChange },
      },
    ];
  }, [illustrations, kaucimReplay, result, stickNumber, story]);

  if (!concern) {
    console.warn("Invalid state: no concern");
    router.back();
    return null;
  }

  if (!result) {
    console.warn("Invalid state: no result");
    router.back();
    return null;
  }

  if (!illustrations) {
    console.error("No illustration found!");
    router.back();
    return null;
  }

  if (!story) {
    console.error("No story found!");
    router.back();
    return null;
  }

  return (
    <View style={styles.root}>
      <KaucimStoryExperience
        video={video}
        verdict={story.verdict}
        slides={slideShow}
        showIntroVideo={!kaucimReplay}
        showResultPopup={!kaucimReplay}
        summary={{
          title: story.title,
          powerChange:
            !kaucimReplay && lastKaucimFresh ? result.powerChange : 0,
        }}
        onResultDismiss={() => {
          const replayedFromCollection = Boolean(kaucimReplay);
          setAppState({ kaucimReplay: null });
          if (replayedFromCollection) {
            router.back();
            return;
          }
          router.back();
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
});
