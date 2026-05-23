import { thinGoldFrame } from "@/assets/images/ui";
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
    <View style={style}>
      <View
        style={{
          position: "absolute",
          top: 10,
          left: 10,
          right: 10,
          bottom: 10,
          borderRadius: 12,
          backgroundColor: "#000000",
          opacity: 0.7,
        }}
      />
      <ImageBackground
        source={thinGoldFrame}
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
        {typeof children === "string" ? (
          <Text style={styles.text}>{children}</Text>
        ) : (
          children
        )}
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
