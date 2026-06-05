import { FramePrimary3 } from "@/components/typography/FramePrimary3";
import { useAppState } from "@/hooks/useAppState";
import { useTodayFirstTimestamp } from "@/hooks/useTodayFirstTimestamp";
import { useTranslation } from "@/hooks/useTranslation";
import { useUserState } from "@/hooks/useUserState";
import { getPetStatusMessage } from "@/lib/notifications/petStatus";
import type { LanguageKey } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { useCallback, useMemo, useRef, useState } from "react";
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { ElementEnergyGauges } from "./element-energy-gauges";
import type * as Types from "./type";

const PAGE_COUNT = 2;

export const StatusMessage = (properties: Types.Properties) => {
  const { style } = properties;
  const { i18n } = useTranslation();
  const { deviceId } = useAppState();
  const { userState } = useUserState();
  const petPower = userState?.petPower ?? 0;
  const todayFirstTimestamp = useTodayFirstTimestamp();
  const scrollRef = useRef<ScrollView>(null);
  const [pageWidth, setPageWidth] = useState(0);
  const [pageIndex, setPageIndex] = useState(0);

  const message = useMemo(
    () => getPetStatusMessage(petPower, deviceId, i18n.language as LanguageKey),
    [petPower, deviceId, i18n.language, todayFirstTimestamp],
  );

  const scrollToPage = useCallback(
    (index: number) => {
      if (pageWidth <= 0) {
        return;
      }
      const nextIndex = Math.max(0, Math.min(index, PAGE_COUNT - 1));
      scrollRef.current?.scrollTo({
        x: pageWidth * nextIndex,
        animated: true,
      });
      setPageIndex(nextIndex);
    },
    [pageWidth],
  );

  const handleMomentumScrollEnd = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (pageWidth <= 0) {
        return;
      }
      const nextIndex = Math.round(
        event.nativeEvent.contentOffset.x / pageWidth,
      );
      setPageIndex(Math.max(0, Math.min(nextIndex, PAGE_COUNT - 1)));
    },
    [pageWidth],
  );

  const canGoLeft = pageIndex > 0;
  const canGoRight = pageIndex < PAGE_COUNT - 1;

  return (
    <View style={[styles.root, style]}>
      <Pressable
        onPress={() => scrollToPage(pageIndex - 1)}
        disabled={!canGoLeft}
        style={[styles.navButton, styles.navButtonLeft, !canGoLeft && styles.navDisabled]}
        accessibilityRole="button"
        accessibilityLabel="Previous status page"
      >
        <Ionicons name="chevron-back" size={22} color="#ffffff" />
      </Pressable>

      <FramePrimary3 style={styles.frameWrapper}>
        <View
          style={styles.carouselHost}
          onLayout={(event) => setPageWidth(event.nativeEvent.layout.width)}
        >
          {pageWidth > 0 ? (
            <ScrollView
              ref={scrollRef}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={handleMomentumScrollEnd}
              style={styles.scrollView}
              contentContainerStyle={styles.scrollContent}
            >
              <View style={[styles.page, { width: pageWidth }]}>
                <Text style={styles.text}>{message}</Text>
              </View>
              <View style={[styles.page, styles.energyPage, { width: pageWidth }]}>
                <ElementEnergyGauges energy={userState?.elementalEnergy} />
              </View>
            </ScrollView>
          ) : null}
        </View>
      </FramePrimary3>

      <Pressable
        onPress={() => scrollToPage(pageIndex + 1)}
        disabled={!canGoRight}
        style={[
          styles.navButton,
          styles.navButtonRight,
          !canGoRight && styles.navDisabled,
        ]}
        accessibilityRole="button"
        accessibilityLabel="Next status page"
      >
        <Ionicons name="chevron-forward" size={22} color="#ffffff" />
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
  },
  frameWrapper: {
    flex: 1,
    aspectRatio: 2,
  },
  carouselHost: {
    width: "100%",
    height: "100%",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    height: "100%",
  },
  page: {
    height: "100%",
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  energyPage: {
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  text: {
    color: "#ffffff",
    textAlign: "center",
    fontSize: 18,
    fontWeight: "500",
    textShadowColor: "#000000",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 1,
  },
  navButton: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },
  navButtonLeft: {
    marginRight: 4,
  },
  navButtonRight: {
    marginLeft: 4,
  },
  navDisabled: {
    opacity: 0.35,
  },
});
