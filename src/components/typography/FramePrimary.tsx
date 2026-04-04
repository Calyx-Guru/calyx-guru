import { framePrimary } from "@/assets/images/typography";
import React from "react";
import {
  ImageBackground,
  StyleSheet,
  Text,
  TextStyle,
  ViewStyle,
} from "react-native";

interface FramePrimaryProps {
  children: string | React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const FramePrimary: React.FC<FramePrimaryProps> = ({
  children,
  style,
}) => {
  return (
    <ImageBackground
      source={framePrimary}
      style={[styles.frame, style]}
      resizeMode="cover"
    >
      <Text style={[styles.text]}>
        {typeof children === "string" ? children : children}
      </Text>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  frame: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    aspectRatio: "2/1",
  },
  text: {
    fontSize: 16,
    fontWeight: "500",
    color: "#fffff",
    textAlign: "center",
  },
});
