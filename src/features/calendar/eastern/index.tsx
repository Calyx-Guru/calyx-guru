import { getZodiac } from "lunar-ts";
import { ImageBackground, StyleSheet, Text, View } from "react-native";

import { calendarBook, calendarNote } from "@/assets/images/calendars";

import type * as Types from "./type";

export function CalendarEastern(properties: Types.Properties) {
  const { currentDate = new Date(), calendarStyle } = properties;

  return (
    <View style={styles.root}>
      <ImageBackground
        source={calendarBook}
        style={[styles.calendarWrapper, calendarStyle]}
        resizeMode="cover"
      >
        <Text style={styles.animalText}>
          {getZodiac(currentDate.getTime())}
        </Text>
        <Text style={styles.dayNumber}>
          {currentDate.getMonth() + 1} 月 {currentDate.getDate()}
        </Text>
      </ImageBackground>
      <ImageBackground
        source={calendarNote}
        style={[styles.noteWrapper, calendarStyle]}
        resizeMode="cover"
      >
        <Text style={styles.statusText}>CHAOS</Text>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flexDirection: "row",
    alignItems: "flex-end",
  },
  calendarWrapper: {
    alignItems: "center",
    width: "100%",
    aspectRatio: "6/7",
  },
  animalText: {
    marginTop: "12.5%",
    color: "#ffffff",
    fontSize: 12,
    textTransform: "uppercase",
  },
  dayNumber: {
    marginTop: "25%",
    color: "#b20606",
    fontSize: 20,
    fontWeight: "bold",
  },
  noteWrapper: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    aspectRatio: "50/65",
  },
  statusText: {
    marginTop: "25%",
    marginLeft: "5%",
    color: "#b20606",
    fontSize: 14,
    fontWeight: "bold",
  },
});
