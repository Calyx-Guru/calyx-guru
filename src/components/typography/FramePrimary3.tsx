import { framePrimary3 } from "@/assets/images/typography";
import React from "react";
import {
  ImageBackground,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from "react-native";

interface FramePrimaryProps {
  children: string | React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const FramePrimary3: React.FC<FramePrimaryProps> = ({
  children,
  style,
}) => {
  return (
    <View style={[styles.frame, style]}>
      <ImageBackground
        source={framePrimary3}
        style={styles.background}
        resizeMode="stretch"
      />
      {typeof children === "string" ? (
        <Text style={[styles.text]}>
          {typeof children === "string" ? children : children}
        </Text>
      ) : (
        children
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  frame: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    aspectRatio: "2/1",
  },
  background: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.8,
  },
  text: {
    fontSize: 16,
    fontWeight: "500",
    color: "#ffffff",
    textAlign: "center",
  },
});
