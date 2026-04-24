import { useTranslation } from "@/hooks/useTranslation";
import { KAUCIM_CONCERNS } from "@/types/UserState";
import { useCallback } from "react";
import {
  Image,
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
      <Image style={styles.image} source={image} />
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
  image: {
    width: 80,
    height: 80,
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
