import { useCallback } from "react";
import {
  Image,
  ImageBackground,
  ImageSourcePropType,
  Pressable,
  StyleSheet,
  Text,
} from "react-native";

import { darkGreenCircleButton } from "@/assets/images/ui";
import { useKaucim } from "@/hooks/useKaucim";
import { useTranslation } from "@/hooks/useTranslation";
import { KAUCIM_CONCERNS } from "@/types/UserState";

type SubButtonProps = {
  image: ImageSourcePropType;
  tag: ImageSourcePropType;
  glow: ImageSourcePropType;
  action: KAUCIM_CONCERNS;
  labelKey: string;
  onPress: (action: KAUCIM_CONCERNS) => void;
};

export function SubButton({
  image,
  tag,
  glow,
  action,
  labelKey,
  onPress,
}: SubButtonProps) {
  const { t } = useTranslation();
  const { isConcernReadToday } = useKaucim();

  const handlePress = useCallback(() => {
    onPress(action);
  }, [action, onPress]);

  return (
    <Pressable onPress={handlePress} style={styles.container}>
      <ImageBackground
        source={darkGreenCircleButton}
        style={styles.buttonBackground}
        resizeMode="contain"
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
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  buttonBackground: {
    position: "absolute",
    width: 110,
    height: 110,
    alignItems: "center",
    justifyContent: "center",
  },
  image: {
    width: 64,
    height: 64,
    marginBottom: 6,
    marginRight: 6,
  },
  textContainer: {
    position: "absolute",
    bottom: -54,
    alignItems: "center",
    justifyContent: "center",
    width: 82,
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
    top: -18,
    left: -22,
    width: 142,
    height: 142,
  },
});
