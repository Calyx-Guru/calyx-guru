import { StyleSheet, Text, View } from "react-native";

type OutlineDirection = [number, number];

interface Properties {
  fontSize: number;
  children: string;
}

const OUTLINE_OFFSET_PX = 1;
const OUTLINE_DIRECTIONS: OutlineDirection[] = [
  [0, OUTLINE_OFFSET_PX],
  [0, -OUTLINE_OFFSET_PX],
  [OUTLINE_OFFSET_PX, 0],
  [-OUTLINE_OFFSET_PX, 0],
  [OUTLINE_OFFSET_PX, OUTLINE_OFFSET_PX],
  [-OUTLINE_OFFSET_PX, OUTLINE_OFFSET_PX],
  [OUTLINE_OFFSET_PX, -OUTLINE_OFFSET_PX],
  [-OUTLINE_OFFSET_PX, -OUTLINE_OFFSET_PX],
];

export function CaptionText(properties: Properties) {
  const { fontSize, children } = properties;

  return (
    <View style={styles.captionStack}>
      <View style={styles.captionOutlineHost} pointerEvents="none">
        {OUTLINE_DIRECTIONS.map(([translateX, translateY], index) => (
          <Text
            key={index}
            style={[
              styles.captionOutline,
              {
                fontSize,
                transform: [{ translateX }, { translateY }],
              },
            ]}
          >
            {children}
          </Text>
        ))}
      </View>
      <Text style={[styles.captionFill, { fontSize }]} accessibilityRole="text">
        {children}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  captionStack: {
    position: "relative",
    alignSelf: "stretch",
    width: "100%",
  },
  captionOutlineHost: {
    ...StyleSheet.absoluteFill,
  },
  captionOutline: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    color: "rgba(0,0,0,0.4)",
    lineHeight: 30,
    fontWeight: "600",
    textAlign: "center",
  },
  captionFill: {
    color: "#ffffff",
    lineHeight: 30,
    fontWeight: "600",
    textAlign: "center",
    textShadowColor: "rgba(0,0,0,0.38)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 12,
  },
});
