import React from "react";
import { GestureResponderEvent, StyleSheet } from "react-native";

import { RibbonHeading } from "@/components/typography/RibbonHeading";

interface ButtonPrimaryProps {
  onPress?: (event: GestureResponderEvent) => void;
  children: string;
  disabled?: boolean;
}

export const HeadingPrimary: React.FC<ButtonPrimaryProps> = ({ children }) => {
  return (
    <RibbonHeading style={styles.heading} textStyle={styles.text}>
      {children}
    </RibbonHeading>
  );
};

const styles = StyleSheet.create({
  heading: {
    width: "100%",
    aspectRatio: 7,
  },
  text: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ffffff",
    textShadowColor: "#000000",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
    marginBottom: 10,
  },
});
