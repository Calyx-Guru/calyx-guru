import { useState } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

import { CarouselFold } from "@/components/carousel/FoldCarousel";
import { GradientButton } from "@/components/typography/GradientButton";

import { ELEMENTS } from "../constants";
import type * as Types from "./type";

export function ElementItemCarouselFold(properties: Types.Properties) {
  const { style } = properties;

  const [element, setElement] = useState<ElementName>(ELEMENTS[0].key);
  const [disabled, setDisabled] = useState(false);

  function onSelectElement() {
    if (disabled) {
      return;
    }

    properties.onSelectElement?.(element);
  }

  return (
    <View style={styles.root}>
      <CarouselFold
        slides={ELEMENTS}
        sideItemCount={2}
        style={style}
        onScrollStart={() => {
          setDisabled(true);
        }}
        onScrollEnd={(index) => {
          setElement(ELEMENTS[index].key);
          setDisabled(false);
        }}
        renderItem={(_, index) => {
          const element = ELEMENTS[index];

          return (
            <View style={[styles.cardWrapper, { borderColor: element.color }]}>
              <Image
                source={element.source}
                style={styles.cardImage}
                resizeMode="cover"
              />
            </View>
          );
        }}
      />
      <Pressable onPress={() => onSelectElement()}>
        <GradientButton
          color="SECONDARY"
          disabled={disabled}
          style={styles.confirmButtonWrapper}
        >
          <Text style={styles.confirmButton}>Choose this Element</Text>
        </GradientButton>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: "center",
    rowGap: 16,
  },
  cardWrapper: {
    backgroundColor: "#000000",
    borderRadius: 12,
    borderWidth: 1,
    overflow: "hidden",
    elevation: 8,
  },
  cardImage: {
    width: "100%",
    height: "100%",
  },
  confirmButtonWrapper: {
    justifyContent: "center",
    alignItems: "center",
  },
  confirmButton: {
    paddingVertical: 8,
    paddingHorizontal: 24,
    color: "#f5feff",
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
  },
});
