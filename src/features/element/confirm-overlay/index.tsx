import {
  Animated,
  Easing,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { ELEMENTS } from "../constants";

import { ButtonPrimary } from "@/components/typography/ButtonPrimary";
import { FramePrimary } from "@/components/typography/FramePrimary";
import { useEffect, useMemo } from "react";
import type * as Types from "./type";

export function ConfirmOverlay(properties: Types.Properties) {
  const { element } = properties;

  const animation = useMemo(() => {
    return {
      scale: new Animated.Value(0.75),
      opacity: new Animated.Value(1),
    };
  }, []);

  const getElementColor = () => {
    const elementObj = ELEMENTS.find((el) => el.key === element);
    return elementObj?.color || "#f0e68c";
  };

  useEffect(() => {
    animation.scale.setValue(0.75);
    animation.opacity.setValue(0);

    Animated.parallel([
      Animated.spring(animation.scale, {
        toValue: 1,
        speed: 16,
        bounciness: 9,
        useNativeDriver: true,
      }),
      Animated.timing(animation.opacity, {
        toValue: 0.5,
        duration: 220,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const renderBackdrop = () => (
    <Animated.View
      style={[
        StyleSheet.absoluteFill,
        styles.backdropWrapper,
        {
          opacity: animation.opacity,
        },
      ]}
    />
  );

  const renderHeader = () => (
    <FramePrimary style={styles.frameWrapper}>
      <View style={styles.headerWrapper}>
        <Text style={styles.headerTitle}>Confirm Your Element Selection</Text>
        <Text style={styles.headerDescription}>
          You have selected the &nbsp;
          <Text
            style={[
              styles.headerDescriptionHighlight,
              { color: getElementColor() },
            ]}
          >
            {element.toUpperCase()}
          </Text>
          .This element determines your unique cosmic connections and luck.
          <Text style={styles.headerDescriptionBold}>
            Once confirmed, you cannot change it later
          </Text>
          .But you can &nbsp;
          <Text style={styles.headerDescriptionBold}>
            reset as another element
          </Text>
          &nbsp; from your settings menu to start over.
        </Text>
      </View>
    </FramePrimary>
  );

  const renderImage = () => {
    const animated = {
      transform: [
        {
          scale: animation.scale,
        },
      ],
    };

    return (
      <Animated.View style={[styles.previewWrapper, animated]}>
        <Image
          source={ELEMENTS.find((el) => el.key === element)?.source}
          style={styles.previewWrapperImageGlow}
          blurRadius={4}
        />
        <Image
          source={ELEMENTS.find((el) => el.key === element)?.source}
          style={styles.previewWrapperImage}
        />
      </Animated.View>
    );
  };

  const renderTool = () => (
    <View style={styles.toolWrapper}>
      <View
        style={{
          width: 100,
          height: 100,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ButtonPrimary
          onPress={() => properties.onConfirm?.(element)}
          textStyle={{ fontSize: 14 }}
        >
          {`Confirm Element "${element.toUpperCase()}"`}
        </ButtonPrimary>
      </View>
    </View>
  );

  return (
    <Modal
      animationType="fade"
      transparent
      visible={!!element}
      onRequestClose={properties.onChooseAgain}
    >
      <View style={styles.overlayWrapper}>
        {renderBackdrop()}

        {renderHeader()}
        {renderImage()}
        {renderTool()}

        <Pressable
          onPress={properties.onChooseAgain}
          style={styles.closeWrapper}
        >
          <Text style={styles.closeText}>✕</Text>
        </Pressable>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlayWrapper: {
    flex: 1,
    width: "100%",
    height: "100%",
    paddingHorizontal: 8,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  backdropWrapper: {
    backgroundColor: "#ffffff",
  },
  frameWrapper: {
    marginTop: 36,
    width: 400,
    height: "auto",
    aspectRatio: 3 / 2,
  },
  headerWrapper: {
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  headerTitle: {
    color: "#ffffff",
    fontSize: 21,
    fontWeight: "700",
    textAlign: "center",
    textShadowColor: "#000000",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
  },
  headerDescription: {
    color: "#dddddd",
    fontSize: 14,
    fontWeight: "400",
    textAlign: "center",
    textShadowColor: "#000000",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
  },
  headerDescriptionHighlight: {
    color: "#f0e68c",
    fontSize: 16,
    fontWeight: "800",
    textShadowColor: "#000000",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
  },
  headerDescriptionBold: {
    color: "#ffffff",
    fontWeight: "900",
    textShadowColor: "#000000",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
  },
  previewWrapper: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    zIndex: 1,
  },
  previewWrapperImage: {
    position: "absolute",
    top: "50%",
    left: "50%",
    marginLeft: -110,
    marginTop: -145,
    width: 220,
    height: 220,
  },
  previewWrapperImageGlow: {
    position: "absolute",
    top: "50%",
    left: "50%",
    marginLeft: -110,
    marginTop: -145,
    width: 220,
    height: 220,
    tintColor: "#eeeeee",
    opacity: 1,
    transform: [{ scale: 1.1 }],
  },
  toolWrapper: {
    display: "flex",
    alignItems: "center",
    rowGap: 12,
    marginBottom: 16,
    width: "100%",
    zIndex: 1,
  },
  toolConfirmWrapper: {
    alignItems: "center",
    width: "100%",
  },
  toolConfirmTitle: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
  },
  toolChooseAgainTitle: {
    color: "#000000",
    fontSize: 15,
    textDecorationLine: "underline",
    fontWeight: "600",
  },
  closeWrapper: {
    position: "absolute",
    top: 20,
    left: 20,
    zIndex: 2,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(0,0,0,0.7)",
    alignItems: "center",
    justifyContent: "center",
  },
  closeText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
  },
});
