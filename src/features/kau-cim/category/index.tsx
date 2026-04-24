import { useCallback } from "react";
import {
  Image,
  ImageBackground,
  ImageSourcePropType,
  Pressable,
  StyleSheet,
  Text,
} from "react-native";

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
      <Image style={styles.image} source={image} />
      {!isConcernReadToday(action) && (
        <Image source={glow} style={styles.glow} resizeMode="cover" />
      )}

      <ImageBackground
        source={tag}
        style={styles.textContainer}
        resizeMode="contain"
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
  image: {
    width: 80,
    height: 80,
  },
  textContainer: {
    position: "absolute",
    bottom: -10,
    alignItems: "center",
    justifyContent: "center",
    width: 65,
    height: 25,
  },
  label: {
    color: "#fff",
    fontSize: 7,
    fontWeight: "bold",
    textAlign: "center",
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  glow: {
    position: "absolute",
    top: -25,
    width: 120,
    height: 120,
  },
});
