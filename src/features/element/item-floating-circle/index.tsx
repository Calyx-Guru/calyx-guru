import { useEffect, useMemo, useState } from "react";
import { Animated, Image, Pressable, StyleSheet } from "react-native";

import { ELEMENTS } from "../constants";
import type * as Types from "./type";

export function ElementItemFloatingCircle(properties: Types.Properties) {
  const { style } = properties;

  const [selectedElement, setSelectedElement] = useState<ElementName | null>(
    null,
  );

  const animation = useMemo(() => {
    return {
      opacity: new Animated.Value(1),
      element: {
        water: new Animated.Value(0),
        fire: new Animated.Value(0),
        metal: new Animated.Value(0),
        earth: new Animated.Value(0),
        wood: new Animated.Value(0),
      },
    };
  }, []);

  function onSelectElement(elementName: ElementName) {
    setSelectedElement(elementName);
    properties.onSelectElement?.(elementName);
  }

  useEffect(() => {
    const animations = ELEMENTS.map((element) =>
      Animated.timing(animation.element[element.key], {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    );

    Animated.stagger(60, animations).start();
  }, []);

  const renderElement = (element: Types.Element) => {
    const isSelected = selectedElement === element.key;

    const animated = {
      opacity: animation.element[element.key],
      transform: [
        {
          translateY: animation.element[element.key].interpolate({
            inputRange: [0, 1],
            outputRange: [18, 0],
          }),
        },
        {
          scale: animation.element[element.key].interpolate({
            inputRange: [0, 1],
            outputRange: [0.65, 1],
          }),
        },
        {
          scale: isSelected ? 1.1 : 1,
        },
      ],
    };

    return (
      <Animated.View
        key={element.key}
        style={[
          style,
          styles.elementWrapper,
          styles[element.positionStyleKey],
          isSelected && styles.elementWrapperSelected,
          animated,
        ]}
      >
        <Pressable
          style={styles.elementImageWrapper}
          onPress={() => onSelectElement(element.key)}
        >
          <Image source={element.source} style={styles.elementImage} />
        </Pressable>
      </Animated.View>
    );
  };

  return (
    <Animated.View
      style={[
        styles.root,
        {
          opacity: animation.opacity,
        },
      ]}
    >
      {ELEMENTS.map((element) => renderElement(element))}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    position: "absolute",
    top: "50%",
    left: "50%",
    width: 300,
    height: 300,
    marginLeft: -150,
    marginTop: -150,
  },
  elementWrapper: {
    position: "absolute",
    width: 100,
    height: 100,
  },
  elementWrapperSelected: {
    zIndex: 10,
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
  elementImageWrapper: {
    alignItems: "center",
    justifyContent: "center",
  },
  elementImage: {
    width: "100%",
    height: "100%",
  },
});
