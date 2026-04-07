import { calendarBook } from "@/assets/images/calendars";
import { ImageBackground, StyleSheet, Text } from "react-native";
import type * as Types from "./type";

export function CalendarWestern(properties: Types.Properties) {
  const { currentDate = new Date(), style } = properties;

  const year = currentDate.getFullYear();
  const monthName = new Date().toLocaleDateString("en", { month: "short" });
  const dayNumber = currentDate.getDate();

  return (
    <ImageBackground
      source={calendarBook}
      style={[styles.calendarWrapper, style]}
      resizeMode="cover"
    >
      <Text style={styles.monthText}>{year}</Text>
      <Text style={styles.dayNumber}>{`${dayNumber} ${monthName}`}</Text>
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
    fontSize: 12,
    textTransform: "uppercase",
  },
  dayNumber: {
    marginTop: "25%",
    color: "#b20606",
    fontSize: 20,
    fontWeight: "bold",
  },
});
