import { redCircleButton } from "@/assets/images/ui";
import { useTranslation } from "@/hooks/useTranslation";
import { KAUCIM_CONCERNS } from "@/types/UserState";
import { useCallback } from "react";
import {
  Image,
  ImageBackground,
  ImageSourcePropType,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

type SubButtonProps = {
  image: ImageSourcePropType;
  action: KAUCIM_CONCERNS;
  labelKey: string;
  onPress: (action: KAUCIM_CONCERNS) => void;
};

export function SubButton({
  image,
  action,
  labelKey,
  onPress,
}: SubButtonProps) {
  const { t } = useTranslation();

  const handlePress = useCallback(() => {
    onPress(action);
  }, [action, onPress]);

  return (
    <Pressable onPress={handlePress} style={styles.container}>
      <ImageBackground
        source={redCircleButton}
        style={styles.buttonBackground}
        resizeMode="contain"
      >
        <Image source={image} style={styles.icon} resizeMode="contain" />
      </ImageBackground>
      <View style={styles.textContainer}>
        <Text style={styles.label}>{t(labelKey)}</Text>
      </View>
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
    width: 80,
    height: 80,
    alignItems: "center",
    justifyContent: "center",
  },
  icon: {
    width: 48,
    height: 48,
  },
  textContainer: {
    position: "absolute",
    bottom: 5, // Position near bottom
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  label: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
    textAlign: "center",
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
});
