import { bigGoldFrame, blueRectangle } from "@/assets/images/ui";
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

export const FramePrimary: React.FC<FramePrimaryProps> = ({
  children,
  style,
}) => {
  return (
    <View style={style}>
      <ImageBackground
        source={blueRectangle}
        style={{
          width: "100%",
          height: "100%",
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: 0.7,
        }}
        resizeMode="stretch"
      ></ImageBackground>
      <ImageBackground
        source={bigGoldFrame}
        style={[
          styles.frame,
          {
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
          },
        ]}
        resizeMode="stretch"
      >
        <Text style={[styles.text]}>
          {typeof children === "string" ? children : children}
        </Text>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  frame: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: "100%",
  },
  text: {
    fontSize: 16,
    fontWeight: "500",
    color: "#ffffff",
    textAlign: "center",
    textShadowColor: "#000000",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
  },
});
