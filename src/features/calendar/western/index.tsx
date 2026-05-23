import { calendarFrame } from "@/assets/images/ui";
import { useTranslation } from "@/hooks/useTranslation";
import { createDate } from "@/lib/app/time";
import { ImageBackground, StyleSheet, Text, View } from "react-native";
import type * as Types from "./type";

export function CalendarWestern(properties: Types.Properties) {
  const { date = createDate(), width = 70 } = properties;
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
    <View style={styles.root}>
      <View style={styles.dateBackdrop} />
      <ImageBackground
        source={calendarFrame}
        style={[styles.calendarWrapper, { width }]}
        resizeMode="cover"
      >
        <Text style={[styles.yearText, { fontSize: width / 6 }]}>{year}</Text>
        <View style={styles.dateSection}>
          <View style={styles.dateTextBlock}>
            <Text
              style={[styles.dayNumber, { fontSize: width / 6 }]}
              numberOfLines={1}
            >
              {t("calendar.western.month", {
                month: monthName,
              })}
            </Text>
            <Text
              style={[styles.dayNumber, { fontSize: width / 6 }]}
              numberOfLines={1}
            >
              {t("calendar.western.day", {
                day: dayNumber,
              })}
            </Text>
          </View>
        </View>
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
  dateSection: {
    marginTop: "18%",
    alignSelf: "stretch",
    alignItems: "center",
    marginHorizontal: "8%",
  },
  dateBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: 10,
    margin: 2,
  },
  yearText: {
    marginTop: "8%",
    color: "#ffffff",
    fontWeight: "bold",
    textTransform: "uppercase",
    textAlign: "center",
    textShadowColor: "rgba(0, 0, 0, 0.85)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  monthText: {
    marginTop: "10%",
    color: "#ffffff",
    textTransform: "uppercase",
    textAlign: "center",
    textShadowColor: "rgba(0, 0, 0, 0.85)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  dateTextBlock: {
    alignItems: "center",
    gap: 2,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  dayNumber: {
    color: "#ffffff",
    fontWeight: "bold",
    textAlign: "center",
    textShadowColor: "rgba(0, 0, 0, 0.55)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
});
