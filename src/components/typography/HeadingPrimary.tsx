import { ribbon } from "@/assets/images/ui";
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
      source={ribbon}
      style={[styles.heading]}
      resizeMode="stretch"
    >
      <Text style={[styles.text]}>{children}</Text>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  heading: {
    justifyContent: "center",
    alignItems: "stretch",
    width: "100%",
    height: "auto",
    aspectRatio: 7,
  },
  text: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ffffff",
    textAlign: "center",
    textShadowColor: "#000000",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
    marginBottom: 10,
  },
});
