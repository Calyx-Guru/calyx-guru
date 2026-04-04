import { headingPrimary } from "@/assets/images/typography";
import React from "react";
import {
  GestureResponderEvent,
  ImageBackground,
  StyleSheet,
  Text,
} from "react-native";

interface ButtonPrimaryProps {
  onPress?: (event: GestureResponderEvent) => void;
  children: string;
  disabled?: boolean;
}

export const HeadingPrimary: React.FC<ButtonPrimaryProps> = ({ children }) => {
  return (
    <ImageBackground
      source={headingPrimary}
      style={[styles.heading]}
      resizeMode="cover"
    >
      <Text style={[styles.text]}>{children}</Text>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  heading: {
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    aspectRatio: "6/1",
  },
  text: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ffffff",
    textAlign: "center",
  },
});
