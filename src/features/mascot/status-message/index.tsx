import { FramePrimary3 } from "@/components/typography/FramePrimary3";
import { StyleSheet, Text } from "react-native";

import type * as Types from "./type";

export const StatusMessage = (properties: Types.Properties) => {
  return (
    <FramePrimary3 style={styles.frameWrapper}>
      <Text style={styles.text}>Your mythical pet is HAPPY.</Text>
      <Text style={styles.text}>
        Today is CHAOS. Fire Element is immune with CHAOS, you have no fear of
        misfortune today.
      </Text>
    </FramePrimary3>
  );
};

const styles = StyleSheet.create({
  frameWrapper: {
    //
  },
  text: {
    width: "90%",
    color: "#ffffff",
    textAlign: "center",
  },
});
