import { Animated, Image, Pressable, StyleSheet } from "react-native";
import { ELEMENTS } from "../constants";
import type * as Types from "../type";

type Props = {
  elementsVisible: boolean;
  selectedElement: Types.ElementName | null;
  elementEntrance: Record<Types.ElementName, Animated.Value>;
  uiOpacity: Animated.Value;
  onSelectElement: (key: Types.ElementName) => void;
};

export function ElementGrid({
  elementsVisible,
  selectedElement,
  elementEntrance,
  uiOpacity,
  onSelectElement,
}: Props) {
  return (
    <Animated.View
      style={[styles.container, { opacity: uiOpacity }]}
      pointerEvents={elementsVisible ? "auto" : "none"}
    >
      {ELEMENTS.map((element) => {
        const isSelected = selectedElement === element.key;
        const animatedStyle = {
          opacity: elementEntrance[element.key],
          transform: [
            {
              translateY: elementEntrance[element.key].interpolate({
                inputRange: [0, 1],
                outputRange: [18, 0],
              }),
            },
            {
              scale: elementEntrance[element.key].interpolate({
                inputRange: [0, 1],
                outputRange: [0.65, 1],
              }),
            },
            { scale: isSelected ? 1.04 : 1 },
          ],
        };

        return (
          <Animated.View
            key={element.key}
            style={[
              styles.element,
              styles[element.positionStyleKey],
              animatedStyle,
              isSelected && styles.elementSelected,
            ]}
          >
            <Pressable
              onPress={() => onSelectElement(element.key)}
              disabled={!elementsVisible}
              style={styles.pressable}
            >
              <Image source={element.source} style={styles.image} />
            </Pressable>
          </Animated.View>
        );
      })}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: "50%",
    left: "50%",
    width: 300,
    height: 300,
    marginLeft: -150,
    marginTop: -150,
  },
  element: {
    position: "absolute",
    width: 100,
    height: 100,
  },
  elementSelected: {
    zIndex: 4,
  },
  pressable: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  elementTop: {
    top: -50,
    left: "50%",
    marginLeft: -50,
  },
  elementLeft: {
    top: 50,
    left: -25,
  },
  elementRight: {
    top: 50,
    right: -25,
  },
  elementBottomRight: {
    bottom: -50,
    right: 0,
  },
  elementBottomLeft: {
    bottom: -50,
    left: 0,
  },
});
