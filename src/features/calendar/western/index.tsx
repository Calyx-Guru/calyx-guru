import { calendarBook } from "@/assets/images/calendars";
import { ImageBackground, StyleSheet, Text } from "react-native";
import type * as Types from "./type";

export function CalendarWestern(properties: Types.Properties) {
  const { date = new Date(), width = 60 } = properties;

  const year = date.getFullYear();
  const monthName = date.toLocaleDateString("en", { month: "short" });
  const dayNumber = date.getDate();

  return (
    <ImageBackground
      source={calendarBook}
      style={[styles.calendarWrapper, { width }]}
      resizeMode="cover"
    >
      <Text style={[styles.monthText, { fontSize: width / 7 }]}>{year}</Text>
      <Text
        style={[styles.dayNumber, { fontSize: width / 5 }]}
      >{`${dayNumber} ${monthName}`}</Text>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  calendarWrapper: {
    alignItems: "center",
    width: "100%",
    aspectRatio: "6/7",
  },
  monthText: {
    marginTop: "12.5%",
    color: "#ffffff",
    textTransform: "uppercase",
  },
  dayNumber: {
    marginTop: "25%",
    color: "#b20606",
    fontWeight: "bold",
  },
});
