import {
  darkBlueCircleButton,
  darkGreenCircleButton,
  darkGreyCircleButton,
  goldCircleButton,
  redCircleButton,
} from "@/assets/images/ui";
import { useAppState } from "@/hooks/useAppState";
import { useKaucim } from "@/hooks/useKaucim";
import { useUserState } from "@/hooks/useUserState";
import { KAUCIM_CONCERNS } from "@/types/UserState";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useCallback, useMemo } from "react";
import {
  ImageBackground,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  Image as RNImage,
} from "react-native";
import { ILLUSTRATIONS } from "../kau-cim/constants";

const CARD_BORDER_WIDTH = 4;
const GOLD_BORDER_GRADIENT = [
  "#fff4c2",
  "#f4d76b",
  "#d6a12d",
  "#9a6a12",
] as const;
const RED_BORDER_GRADIENT = [
  "#ffc2c2",
  "#ff8c8c",
  "#ff5656",
  "#ff2020",
] as const;
const GREEN_BORDER_GRADIENT = [
  "#c2ffc2",
  "#8cff8c",
  "#56ff56",
  "#20ff20",
] as const;
const BLUE_BORDER_GRADIENT = [
  "#c2c2ff",
  "#8c8cff",
  "#5656ff",
  "#2020ff",
] as const;
const DARK_GREY_BORDER_GRADIENT = [
  "#c8c8c8",
  "#a0a0a0",
  "#787878",
  "#505050",
] as const;
const LIGHT_GREY_BORDER_GRADIENT = [
  "#e0e0e0",
  "#b8b8b8",
  "#909090",
  "#686868",
] as const;

type StoryCardProps = {
  concern: KAUCIM_CONCERNS;
  stickNumber: number;
  width: number;
  index: number;
  numColumns: number;
  gap?: number;
};

export function StoryCard({
  concern,
  stickNumber,
  width,
  index,
  numColumns,
  gap = 10,
}: StoryCardProps) {
  const { userState } = useUserState();
  const { setAppState } = useAppState();
  const { getKaucimStory, findKaucimResultForStick } = useKaucim();
  const isLocked = useMemo(() => {
    if (!userState) {
      return true;
    }
    return !userState.kaucimStoryUnlocks?.[concern]?.[stickNumber];
  }, [userState, concern, stickNumber]);
  const omenImageSource = useMemo(() => {
    const illustrations = concern ? ILLUSTRATIONS[concern] : undefined;
    if (!illustrations) {
      return undefined;
    }
    const imageFunc = illustrations.omen[stickNumber]?.[0];
    if (!imageFunc) {
      return undefined;
    }
    const module = imageFunc();
    const resolved = RNImage.resolveAssetSource(module);
    if (!resolved?.uri) {
      return undefined;
    }
    // Unique cacheKey per stick — prevents expo-image reusing the wrong asset when FlatList recycles cells.
    return {
      uri: resolved.uri,
      cacheKey: `${concern}-omen-${stickNumber}`,
    };
  }, [concern, stickNumber]);
  const story = useMemo(() => {
    return getKaucimStory(concern, stickNumber, 0);
  }, [concern, stickNumber]);

  const handleOpenStory = useCallback(() => {
    if (isLocked) {
      return;
    }

    const savedResult = findKaucimResultForStick(concern, stickNumber);

    setAppState({
      lastKaucimConcern: concern,
      lastKaucimFresh: false,
      kaucimReplay: {
        concern,
        stickNumber,
        storyIndex: savedResult?.storyIndex ?? 0,
        powerChange: savedResult?.powerChange ?? 0,
      },
    });
    router.push("/kau-cim");
  }, [concern, findKaucimResultForStick, isLocked, setAppState, stickNumber]);

  const buttonImage = useMemo(() => {
    switch (Number(story.fortuneLevel)) {
      case 1:
        return darkGreyCircleButton;
      case 2:
        return redCircleButton;
      case 3:
        return darkGreenCircleButton;
      case 4:
        return darkBlueCircleButton;
      case 5:
        return goldCircleButton;
      default:
        return darkGreenCircleButton;
    }
  }, [story.fortuneLevel]);

  return (
    <View
      style={[
        styles.cardCell,
        { width },
        numColumns > 1 &&
          index % numColumns < numColumns - 1 && {
            marginRight: gap,
          },
      ]}
    >
      <Pressable
        onPress={handleOpenStory}
        disabled={isLocked}
        accessibilityRole="button"
        accessibilityState={{ disabled: isLocked }}
        accessibilityLabel={
          isLocked ? `Locked story ${stickNumber}` : `Open story ${stickNumber}`
        }
      >
        <LinearGradient
          colors={GOLD_BORDER_GRADIENT}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.cardBorder}
        >
          <View style={styles.card}>
            {omenImageSource ? (
              <View style={styles.omenImageContainer}>
                <Image
                  key={`${concern}-omen-${stickNumber}`}
                  source={omenImageSource}
                  style={[styles.omenImage, isLocked && styles.omenImageLocked]}
                  contentFit="cover"
                  recyclingKey={`${concern}-omen-${stickNumber}`}
                />
                {isLocked ? (
                  <>
                    {Platform.OS !== "web" ? (
                      <View
                        style={styles.omenLockedDesaturate}
                        pointerEvents="none"
                      />
                    ) : null}
                    <View style={styles.omenLockedWash} pointerEvents="none" />
                  </>
                ) : null}
              </View>
            ) : null}
            <View style={styles.stickBadge}>
              <ImageBackground
                source={buttonImage}
                style={styles.stickBadgeImage}
                resizeMode="cover"
              >
                <Text style={styles.stickNumber}>{stickNumber}</Text>
              </ImageBackground>
            </View>
          </View>
        </LinearGradient>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  cardCell: {
    marginBottom: 0,
  },
  cardBorder: {
    flex: 1,
    aspectRatio: 9 / 11,
    borderRadius: 12,
    padding: CARD_BORDER_WIDTH,
    shadowColor: "#0B3C49",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  card: {
    flex: 1,
    borderRadius: 8,
    backgroundColor: "#ffffff",
    overflow: "hidden",
  },
  omenImageContainer: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  omenImage: {
    width: "100%",
    height: "100%",
  },
  omenImageLocked: {
    opacity: 0.28,
  },
  omenLockedDesaturate: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "#c8c8c8",
    mixBlendMode: "saturation",
  },
  omenLockedWash: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(255, 255, 255, 0.62)",
  },
  stickBadge: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 40,
    height: 40,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  stickBadgeImage: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  stickNumber: {
    fontSize: 16,
    fontWeight: "800",
    color: "#ffffff",
    textAlign: "center",
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 2,
    marginBottom: 4,
    marginRight: 2,
  },
});
