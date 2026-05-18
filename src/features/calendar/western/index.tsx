import { calendarBook } from "@/assets/images/calendars";
import { useTranslation } from "@/hooks/useTranslation";
import { createDate } from "@/lib/app/time";
import { ImageBackground, StyleSheet, Text } from "react-native";
import type * as Types from "./type";

export function CalendarWestern(properties: Types.Properties) {
  const { date = createDate(), width = 60 } = properties;
  const { t, i18n } = useTranslation();

  const dayNumber = date.getDate();
  const year = date.getFullYear();
  const monthName =
    i18n.language === "en"
      ? date.toLocaleDateString(i18n.language, {
          month: "short",
        })
      : date.getMonth() + 1;

  return (
    <ImageBackground
      source={calendarBook}
      style={[styles.calendarWrapper, { width }]}
      resizeMode="cover"
    >
      <Text style={[styles.monthText, { fontSize: width / 7 }]}>{year}</Text>
      <Text style={[styles.dayNumber, { fontSize: width / 6 }]}>
        {t("calendar.western.date", {
          day: dayNumber,
          month: monthName,
        })}
      </Text>
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
    marginTop: "30%",
    color: "#b20606",
    fontWeight: "bold",
  },
});
