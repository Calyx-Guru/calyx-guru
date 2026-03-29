import {
  Animated,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { ELEMENTS } from "./constants";
import type * as Types from "./type";

type Props = {
  visible: boolean;
  selectedElement: Types.ElementName | null;
  overlayElementScale: Animated.Value;
  overlayBackdropOpacity: Animated.Value;
  onConfirm: () => void;
  onChooseAgain: () => void;
};

export function ElementSelectionModal({
  visible,
  selectedElement,
  overlayElementScale,
  overlayBackdropOpacity,
  onConfirm,
  onChooseAgain,
}: Props) {
  const selectedElementData = ELEMENTS.find((e) => e.key === selectedElement);
  const elementLabel = selectedElementData?.label.toUpperCase() ?? "";

  return (
    <Modal
      animationType="fade"
      transparent
      visible={visible}
      onRequestClose={onChooseAgain}
    >
      <View style={styles.overlay}>
        <Animated.View
          style={[styles.backdrop, { opacity: overlayBackdropOpacity }]}
        />

        <View style={styles.header}>
          <Text style={styles.title}>Confirm Your Element Selection</Text>
          <Text style={styles.description}>
            You have selected the{" "}
            <Text style={styles.elementHighlight}>{elementLabel}</Text>. This
            element determines your unique cosmic connections and luck.{" "}
            <Text style={styles.bold}>
              Once confirmed, you cannot change it later
            </Text>
            . But you can{" "}
            <Text style={styles.bold}>reset as another element</Text> from your
            settings menu to start over.
          </Text>
        </View>

        <Animated.View
          style={[
            styles.preview,
            { transform: [{ scale: overlayElementScale }] },
          ]}
        >
          {selectedElementData && (
            <Image
              source={selectedElementData.source}
              style={styles.previewImage}
            />
          )}
        </Animated.View>

        <View style={styles.actions}>
          <Pressable onPress={onConfirm} style={styles.confirmButton}>
            <Text
              style={styles.confirmText}
            >{`Confirm '${elementLabel}'`}</Text>
          </Pressable>
          <Pressable onPress={onChooseAgain}>
            <Text style={styles.chooseAgainText}>Choose Again</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#ffffff",
  },
  header: {
    backgroundColor: "#000000",
    borderBottomWidth: 1,
    borderBottomColor: "#ced4da",
    paddingVertical: 42,
    paddingHorizontal: 24,
    marginTop: 48,
    alignItems: "center",
    zIndex: 2,
  },
  title: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 4,
  },
  description: {
    color: "#b0b8c0",
    fontSize: 14,
    fontWeight: "400",
  },
  elementHighlight: {
    color: "#f0e68c",
    fontSize: 20,
    fontWeight: "800",
  },
  bold: {
    color: "#ffffff",
    fontWeight: "900",
  },
  preview: {
    flex: 1,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
  },
  previewImage: {
    position: "absolute",
    top: "50%",
    left: "50%",
    marginLeft: -100,
    marginTop: -150,
    width: 200,
    height: 200,
  },
  actions: {
    alignItems: "center",
    rowGap: 12,
    marginBottom: 48,
    width: "100%",
    zIndex: 1,
  },
  confirmButton: {
    alignItems: "center",
    paddingVertical: 16,
    width: "80%",
    borderRadius: 8,
    backgroundColor: "#262b33",
  },
  confirmText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
  },
  chooseAgainText: {
    color: "#000000",
    fontSize: 15,
    textDecorationLine: "underline",
    fontWeight: "600",
  },
});
