import { router } from "expo-router";
import { useMemo } from "react";
import { StyleSheet, View } from "react-native";

import { KaucimStoryExperience } from "@/features/kau-cim/story-experience";

import { useAppState } from "@/hooks/useAppState";
import { useKaucim } from "@/hooks/useKaucim";
import { pickRandom } from "@/lib/app/helper";

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
  const { lastKaucimConcern, lastKaucimResults, lastKaucimFresh } = useAppState();
  const { getKaucimStory } = useKaucim();

  const concern = lastKaucimConcern;
  const result = concern ? lastKaucimResults[concern] : undefined;
  const illustrations = concern ? ILLUSTRATIONS[concern] : undefined;
  const story =
    concern && result ? getKaucimStory(concern, result.storyIndex) : undefined;

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

    return [
      {
        image: verdictIllustration(),
        text: story.omen,
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
  }, [illustrations, story, result, fortuneLevel, stickNumber]);

  if (!concern) {
    console.warn("Invalid state: no concern");
    router.replace("/main-menu");
    return null;
  }

  if (!result) {
    console.warn("Invalid state: no result");
    router.replace("/main-menu");
    return null;
  }

  if (!illustrations) {
    console.error("No illustration found!");
    router.replace("/main-menu");
    return null;
  }

  if (!story) {
    console.error("No story found!");
    router.replace("/main-menu");
    return null;
  }

  return (
    <View style={styles.root}>
      <KaucimStoryExperience
        video={video}
        verdict={story.verdict}
        slides={slideShow}
        summary={{
          title: story.title,
          powerChange: lastKaucimFresh ? result.powerChange : 0,
        }}
        onResultDismiss={() => {
          router.replace("/main-menu");
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
