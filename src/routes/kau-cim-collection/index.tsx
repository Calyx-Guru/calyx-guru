import * as subButtonSet from "@/assets/images/kau-cim/set-2";
import { background, thinGoldFrame } from "@/assets/images/ui";
import { useTranslation } from "@/hooks/useTranslation";
import { KAUCIM_CONCERNS } from "@/types/UserState";
import { useMemo, useState } from "react";
import {
  FlatList,
  Image,
  ImageBackground,
  ImageSourcePropType,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";

import { useUserState } from "@/hooks/useUserState";
import { StoryCard } from "./story-card";

const TAB_BUTTON_PROPERTIES: {
  image: ImageSourcePropType;
  action: KAUCIM_CONCERNS;
  labelKey: string;
}[] = [
  {
    image: subButtonSet.wealth,
    action: KAUCIM_CONCERNS.WEALTH,
    labelKey: "Wealth",
  },
  {
    image: subButtonSet.love,
    action: KAUCIM_CONCERNS.LOVE,
    labelKey: "Love",
  },
  {
    image: subButtonSet.career,
    action: KAUCIM_CONCERNS.CAREER,
    labelKey: "Career",
  },
];

const GRID_HORIZONTAL_PADDING = 16;
const CARD_GAP = 10;
const BREAKPOINT_WIDE = 480;

export function RouteKaucimCollection() {
  const { t } = useTranslation();
  const { width: windowWidth } = useWindowDimensions();
  const { userState } = useUserState();

  const [selectedConcern, setSelectedConcern] = useState<KAUCIM_CONCERNS>(
    TAB_BUTTON_PROPERTIES[0]?.action ?? KAUCIM_CONCERNS.WEALTH,
  );

  const numColumns = windowWidth >= BREAKPOINT_WIDE ? 3 : 2;

  const cardWidth = useMemo(() => {
    const gaps = CARD_GAP * (numColumns - 1);
    const inner = windowWidth - GRID_HORIZONTAL_PADDING * 2 - gaps;
    return inner / numColumns;
  }, [windowWidth, numColumns]);

  const gridData = useMemo(() => {
    const concernUnlocks = userState?.kaucimStoryUnlocks?.[selectedConcern];

    return Array.from({ length: 100 }, (_, index) => ({
      key: `${selectedConcern}-${index + 1}`,
      stickNumber: index + 1,
    })).sort((a, b) => {
      const aUnlocked = Boolean(concernUnlocks?.[a.stickNumber]);
      const bUnlocked = Boolean(concernUnlocks?.[b.stickNumber]);

      if (aUnlocked !== bUnlocked) {
        return aUnlocked ? -1 : 1;
      }

      return a.stickNumber - b.stickNumber;
    });
  }, [selectedConcern, userState?.kaucimStoryUnlocks]);

  return (
    <View style={styles.root}>
      <ImageBackground source={background} style={styles.rootBackground} />
      <FlatList
        style={styles.gridList}
        key={`${selectedConcern}-${numColumns}`}
        data={gridData}
        numColumns={numColumns}
        keyExtractor={(item) => item.key}
        renderItem={({ item, index }) => (
          <StoryCard
            concern={selectedConcern}
            stickNumber={item.stickNumber}
            width={cardWidth}
            index={index}
            numColumns={numColumns}
            gap={CARD_GAP}
          />
        )}
        columnWrapperStyle={numColumns > 1 ? styles.gridRow : undefined}
        contentContainerStyle={styles.gridContent}
        showsVerticalScrollIndicator={false}
      />

      <View style={styles.tabBarContent}>
        <ImageBackground
          source={thinGoldFrame}
          style={[styles.tabBarFrame]}
          resizeMode="stretch"
        ></ImageBackground>
        {TAB_BUTTON_PROPERTIES.map((tab) => {
          const selected = tab.action === selectedConcern;
          return (
            <Pressable
              key={tab.action}
              onPress={() => setSelectedConcern(tab.action)}
              style={[styles.tab, selected && styles.tabSelected]}
              accessibilityRole="tab"
              accessibilityState={{ selected }}
              accessibilityLabel={t(tab.labelKey)}
            >
              <Image source={tab.image} style={styles.tabImage} />
              <Text
                style={[styles.tabLabel, selected && styles.tabLabelSelected]}
              >
                {t(tab.labelKey)}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#f4f7f8",
    position: "relative",
    width: "100%",
    height: "100%",
  },
  rootBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  gridList: {
    flex: 1,
  },
  tabBarFrame: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  tabBarContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-evenly",
    paddingVertical: 6,
    paddingHorizontal: 4,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 3,
    paddingVertical: 4,
    paddingHorizontal: 2,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "transparent",
    backgroundColor: "rgba(11, 60, 73, 0.06)",
  },
  tabSelected: {
    borderColor: "#0B3C49",
    backgroundColor: "rgba(11, 60, 73, 0.12)",
  },
  tabImage: {
    width: 42,
    height: 42,
    marginBottom: 2,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: "#ffffff",
    textAlign: "center",
    textShadowColor: "#000000",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  tabLabelSelected: {
    color: "#ffffff",
  },
  gridContent: {
    paddingHorizontal: GRID_HORIZONTAL_PADDING,
    paddingTop: 12,
    paddingBottom: 12,
  },
  gridRow: {
    justifyContent: "flex-start",
    marginBottom: CARD_GAP,
  },
});
