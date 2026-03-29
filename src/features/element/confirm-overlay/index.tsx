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
    <View style={styles.headerWrapper}>
      <Text style={styles.headerTitle}>Confirm Your Element Selection</Text>
      <Text style={styles.headerDescription}>
        You have selected the &nbsp;
        <Text style={styles.headerDescriptionHighlight}>
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
          style={styles.previewWrapperImage}
        />
      </Animated.View>
    );
  };

  const renderTool = () => (
    <View style={styles.toolWrapper}>
      <Pressable
        style={styles.toolConfirmWrapper}
        onPress={() => properties.onConfirm?.(element)}
      >
        <Text style={styles.toolConfirmTitle}>
          {`Confirm Element '${element.toUpperCase()}'`}
        </Text>
      </Pressable>
      <Pressable onPress={properties.onChooseAgain}>
        <Text style={styles.toolChooseAgainTitle}>Choose Again</Text>
      </Pressable>
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
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlayWrapper: {
    flex: 1,
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  backdropWrapper: {
    backgroundColor: "#ffffff",
  },
  headerWrapper: {
    alignItems: "center",
    rowGap: 16,
    paddingVertical: 24,
    paddingHorizontal: 24,
    marginTop: 48,
    backgroundColor: "#000000",
    borderBottomWidth: 1,
    borderBottomColor: "#ced4da",
    zIndex: 2,
  },
  headerTitle: {
    marginBottom: 4,
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "700",
  },
  headerDescription: {
    color: "#b0b8c0",
    fontSize: 14,
    fontWeight: "400",
  },
  headerDescriptionHighlight: {
    color: "#f0e68c",
    fontSize: 20,
    fontWeight: "800",
  },
  headerDescriptionBold: {
    color: "#ffffff",
    fontWeight: "900",
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
    marginLeft: -100,
    marginTop: -150,
    width: 200,
    height: 200,
  },
  toolWrapper: {
    alignItems: "center",
    rowGap: 12,
    marginBottom: 48,
    width: "100%",
    zIndex: 1,
  },
  toolConfirmWrapper: {
    alignItems: "center",
    paddingVertical: 16,
    width: "80%",
    borderRadius: 8,
    backgroundColor: "#262b33",
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
});
