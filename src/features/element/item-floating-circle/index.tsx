import { useEffect, useMemo, useState } from "react";
import {
  Animated,
  Image,
  ImageBackground,
  Pressable,
  StyleSheet,
} from "react-native";

import { circleBlueButton } from "@/assets/images/ui";
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
          <ImageBackground
            source={circleBlueButton}
            style={styles.elementButtonBackground}
            resizeMode="stretch"
          >
            <Image source={element.source} style={styles.elementImage} />
          </ImageBackground>
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
    top: "51%",
    left: "52%",
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
    top: -200,
    left: -50,
  },
  elementLeft: {
    top: -100,
    left: 75,
  },
  elementRight: {
    top: -100,
    right: 75,
  },
  elementBottomRight: {
    bottom: -175,
    right: 25,
  },
  elementBottomLeft: {
    bottom: -175,
    left: 25,
  },
  elementImageWrapper: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  elementButtonBackground: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    aspectRatio: 1.02,
  },
  elementImage: {
    width: "80%",
    height: "80%",
    resizeMode: "contain",
    marginBottom: 10,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    borderRadius: 100,
    overflow: "hidden",
  },
});
