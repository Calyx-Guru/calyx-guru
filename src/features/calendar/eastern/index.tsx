import { Image } from "expo-image";
import { getZodiac, toLunar } from "lunar-ts";
import { useEffect, useState } from "react";
import { ImageBackground, StyleSheet, Text, View } from "react-native";

import { calendarBook } from "@/assets/images/calendars";
import * as ZODIACS from "@/assets/images/zodiacs/set-1";
import { useTranslation } from "@/hooks/useTranslation";
import { createDate } from "@/lib/app/time";

import type * as Types from "./type";

export function CalendarEastern(properties: Types.Properties) {
  const { date = createDate(), width = 60 } = properties;
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
      <ImageBackground
        source={calendarBook}
        style={[styles.calendarWrapper, { width }]}
        resizeMode="cover"
      >
        <Text style={[styles.zodiacText, { fontSize: width / 8 }]}>
          {t("calendar.eastern.date", {
            month: lunarDate?.lMonth,
            day: lunarDate?.lDay,
          })}
        </Text>
        {zodiacImage && (
          <Image
            source={zodiacImage}
            style={styles.zodiacImage}
            contentFit="contain"
          />
        )}
      </ImageBackground>
      {/* <ImageBackground
        source={calendarNote}
        style={[styles.noteWrapper, { width }]}
        resizeMode="cover"
      >
        <Text style={[styles.statusText, { fontSize: width / 6 }]}>CHAOS</Text>
      </ImageBackground> */}
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
  zodiacText: {
    marginTop: "15%",
    color: "#ffffff",
    textTransform: "uppercase",
  },
  zodiacImage: {
    width: "75%",
    aspectRatio: 1,
    marginTop: "8%",
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
