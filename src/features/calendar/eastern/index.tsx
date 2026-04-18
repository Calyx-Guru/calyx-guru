import { getZodiac } from "lunar-ts";
import { ImageBackground, StyleSheet, Text, View } from "react-native";

import { calendarBook, calendarNote } from "@/assets/images/calendars";

import { createDate } from "@/lib/app/time";
import type * as Types from "./type";

export function CalendarEastern(properties: Types.Properties) {
  const { date = createDate(), width = 60 } = properties;

  return (
    <View style={styles.root}>
      <ImageBackground
        source={calendarBook}
        style={[styles.calendarWrapper, { width }]}
        resizeMode="cover"
      >
        <Text style={[styles.animalText, { fontSize: width / 7 }]}>
          {getZodiac(date.getTime())}
        </Text>
        <Text style={[styles.dayNumber, { fontSize: width / 5 }]}>
          {date.getMonth() + 1} 月 {date.getDate()}
        </Text>
      </ImageBackground>
      <ImageBackground
        source={calendarNote}
        style={[styles.noteWrapper, { width }]}
        resizeMode="cover"
      >
        <Text style={[styles.statusText, { fontSize: width / 6 }]}>CHAOS</Text>
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
    textTransform: "uppercase",
  },
  dayNumber: {
    marginTop: "25%",
    color: "#b20606",
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
    fontWeight: "bold",
  },
});
