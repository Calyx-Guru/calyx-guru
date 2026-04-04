import {
  GestureResponderEvent,
  Pressable,
  StyleSheet,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";

type Color = "PRIMARY" | "SECONDARY";

interface Properties {
  color: Color;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  buttonStyle?: StyleProp<ViewStyle>;
  children: React.ReactNode;
  onPress?: (event: GestureResponderEvent) => void;
}

const COLORS: Record<Color, { main: string; linear: string }> = {
  PRIMARY: {
    main: "#854e18",
    linear: "#f4e787",
  },
  SECONDARY: {
    main: "#226f76",
    linear: "#3eacb2",
  },
};

export function ButtonGradient(properties: Properties) {
  const { color, disabled, style, buttonStyle, children, onPress } = properties;

  const selectedColors = COLORS[color];

  return (
    <Pressable style={style} onPress={onPress}>
      <LinearGradient
        colors={[
          selectedColors.main,
          selectedColors.linear,
          selectedColors.main,
        ]}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        locations={[0.1, 0.5, 0.9]}
        style={[disabled && styles.disabled, buttonStyle]}
      >
        {children}
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  disabled: {
    opacity: 0.5,
  },
});
