import { blueButton } from "@/assets/images/ui";
import React from "react";
import {
  GestureResponderEvent,
  ImageBackground,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
} from "react-native";

interface ButtonPrimaryProps {
  onPress?: (event: GestureResponderEvent) => void;
  children: React.ReactNode;
  disabled?: boolean;
  textStyle?: StyleProp<TextStyle>;
}

export const ButtonPrimary: React.FC<ButtonPrimaryProps> = ({
  onPress,
  children,
  textStyle,
  disabled = false,
}) => {
  return (
    <TouchableOpacity onPress={onPress} disabled={disabled}>
      <ImageBackground
        source={blueButton}
        style={[styles.button]}
        resizeMode="contain"
      >
        <Text style={[styles.text, textStyle]}>{children}</Text>
      </ImageBackground>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    height: "100%",
    aspectRatio: 3,
  },
  text: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ffffff",
    textAlign: "center",
    marginBottom: 14,
    textShadowColor: "#000000",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
  },
});
