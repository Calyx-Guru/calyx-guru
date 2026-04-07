import { calendarBook } from "@/assets/images/calendars";
import { useTranslation } from "@/hooks/useTranslation";
import { ImageBackground, StyleSheet, Text } from "react-native";
import type * as Types from "./type";

export function CalendarWestern(properties: Types.Properties) {
  const { currentDate = new Date(), style } = properties;
  const { i18n } = useTranslation();

  const monthName = currentDate.toLocaleDateString(i18n.language, {
    month: "long",
  });

  const dayNumber = currentDate.getDate();

  return (
    <ImageBackground
      source={calendarBook}
      style={[styles.calendarWrapper, style]}
      resizeMode="cover"
    >
      <Text style={styles.monthText}>{monthName}</Text>
      <Text style={styles.dayNumber}>{dayNumber}</Text>
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
    marginTop: "10%",
    color: "#b20606",
    fontSize: 36,
    fontWeight: "bold",
  },
});
