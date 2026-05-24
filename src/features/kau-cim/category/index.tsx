import { useCallback } from "react";
import {
  Image,
  ImageBackground,
  ImageSourcePropType,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Pressable } from "react-native-gesture-handler";

import { circleBlueButton } from "@/assets/images/ui";
import { useKaucim } from "@/hooks/useKaucim";
import { useTranslation } from "@/hooks/useTranslation";
import { KAUCIM_CONCERNS } from "@/types/UserState";

type SubButtonProps = {
  image: ImageSourcePropType;
  tag: ImageSourcePropType;
  glow: ImageSourcePropType;
  action: KAUCIM_CONCERNS;
  labelKey: string;
  onPress?: (action: KAUCIM_CONCERNS) => void;
  /** When true, visuals only — parent provides the press target (e.g. during opacity animation). */
  displayOnly?: boolean;
};

export function SubButton({
  image,
  tag,
  glow,
  action,
  labelKey,
  onPress,
  displayOnly = false,
}: SubButtonProps) {
  const { t } = useTranslation();
  const { isConcernReadToday } = useKaucim();

  const handlePress = useCallback(() => {
    onPress?.(action);
  }, [action, onPress]);

  const content = (
    <>
      <ImageBackground
        source={circleBlueButton}
        style={styles.buttonBackground}
        resizeMode="stretch"
      >
        <Image style={styles.image} source={image} />
        {!isConcernReadToday(action) && (
          <Image source={glow} style={styles.glow} resizeMode="cover" />
        )}
      </ImageBackground>
      <ImageBackground
        source={tag}
        style={styles.textContainer}
        resizeMode="stretch"
      >
        <Text style={styles.label}>{t(labelKey)}</Text>
      </ImageBackground>
    </>
  );

  if (displayOnly) {
    return <View style={styles.container}>{content}</View>;
  }

  return (
    <Pressable onPress={handlePress} style={styles.container}>
      {content}
    </Pressable>
  );
}

/** Layout box that fits circle + glow overflow + tag below (all children are absolute). */
const LAYOUT = {
  width: 142,
  height: 208,
  buttonTop: -55,
  buttonLeft: -55,
  buttonSize: 110,
} as const;

const styles = StyleSheet.create({
  container: {
    width: LAYOUT.width,
    height: LAYOUT.height,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  buttonBackground: {
    position: "absolute",
    top: LAYOUT.buttonTop,
    left: LAYOUT.buttonLeft,
    width: LAYOUT.buttonSize,
    height: LAYOUT.buttonSize,
    alignItems: "center",
    justifyContent: "center",
  },
  image: {
    width: 64,
    height: 64,
  },
  textContainer: {
    position: "absolute",
    left: -45,
    top: 35,
    alignItems: "center",
    justifyContent: "center",
    width: 90,
    height: 26,
  },
  label: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  glow: {
    position: "absolute",
    top: -15,
    left: -18,
    width: 142,
    height: 142,
  },
});
