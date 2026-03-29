import type { StyleProp, ViewStyle } from "react-native";
import LinearGradient from "react-native-linear-gradient";

type Color = "PRIMARY" | "SECONDARY";

interface Properties {
  color: Color;
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
}

const COLORS: Record<Color, { main: string; linear: string }> = {
  PRIMARY: {
    main: "#fdb462",
    linear: "#fdb462",
  },
  SECONDARY: {
    main: "#226f76",
    linear: "#3eacb2",
  },
};

export function GradientButton(properties: Properties) {
  const { color, style, children } = properties;

  const selectedColors = COLORS[color];

  return (
    <LinearGradient
      colors={[selectedColors.main, selectedColors.linear, selectedColors.main]}
      start={{ x: 0, y: 0.5 }}
      end={{ x: 1, y: 0.5 }}
      locations={[0.1, 0.5, 0.9]}
      style={style}
    >
      {children}
    </LinearGradient>
  );
}
