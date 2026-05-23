import { Image } from "expo-image";
import { getZodiac, toLunar } from "lunar-ts";
import { useEffect, useState } from "react";
import { ImageBackground, StyleSheet, Text, View } from "react-native";

import { calendarFrame } from "@/assets/images/ui";
import * as ZODIACS from "@/assets/images/zodiacs/set-1";
import { useTranslation } from "@/hooks/useTranslation";
import { createDate } from "@/lib/app/time";

import type * as Types from "./type";

export function CalendarEastern(properties: Types.Properties) {
  const { date = createDate(), width = 70 } = properties;
  const { t } = useTranslation();

  const lunarDate = toLunar(date.getTime());
  const zodiac = getZodiac(date.getTime());

  const [zodiacImage, setZodiacImage] = useState<any>(null);

  useEffect(() => {
    if (!zodiac) {
      return;
    }

    for (const [key, value] of Object.entries(ZODIACS)) {
      if (zodiac === key) {
        setZodiacImage(value);
        break;
      }
    }
  }, [zodiac]);

  return (
    <View style={styles.root}>
      <View style={styles.dateBackdrop} />
      <ImageBackground
        source={calendarFrame}
        style={[styles.calendarWrapper, { width }]}
        resizeMode="cover"
      >
        {zodiacImage && (
          <Image
            source={zodiacImage}
            style={styles.zodiacImage}
            contentFit="contain"
          />
        )}
        <View style={styles.dateSection}>
          <View style={styles.dateTextBlock}>
            <Text
              style={[styles.zodiacText, { fontSize: width / 6 }]}
              numberOfLines={1}
            >
              {t("calendar.eastern.month", {
                month: lunarDate?.lMonth,
              })}
            </Text>
            <Text
              style={[styles.zodiacText, { fontSize: width / 6 }]}
              numberOfLines={1}
            >
              {t("calendar.eastern.day", {
                day: lunarDate?.lDay,
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
    marginTop: "2%",
    alignSelf: "stretch",
    alignItems: "center",
    marginHorizontal: "2%",
  },
  dateBackdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: 10,
    margin: 2,
  },
  dateTextBlock: {
    alignItems: "center",
    gap: 2,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  zodiacText: {
    fontWeight: "bold",
    color: "#ffffff",
    textTransform: "uppercase",
    textAlign: "center",
    textShadowColor: "rgba(0, 0, 0, 0.85)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  zodiacImage: {
    width: "60%",
    aspectRatio: 1,
    marginTop: "-26%",
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
