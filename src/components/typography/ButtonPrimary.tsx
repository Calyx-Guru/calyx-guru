import { buttonPrimary2 } from "@/assets/images/typography";
import React from "react";
import {
  GestureResponderEvent,
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
} from "react-native";

interface ButtonPrimaryProps {
  onPress?: (event: GestureResponderEvent) => void;
  children: React.ReactNode;
  disabled?: boolean;
}

export const ButtonPrimary: React.FC<ButtonPrimaryProps> = ({
  onPress,
  children,
  disabled = false,
}) => {
  return (
    <TouchableOpacity onPress={onPress} disabled={disabled}>
      <ImageBackground
        source={buttonPrimary2}
        style={[styles.button]}
        resizeMode="cover"
      >
        <Text style={[styles.text]}>{children}</Text>
      </ImageBackground>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
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
