import { background } from "@/assets/images/ui";
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

import { careerIcon, loveIcon, wealthIcon } from "@/assets/images/kau-cim";
import { useUserState } from "@/hooks/useUserState";
import { LinearGradient } from "expo-linear-gradient";
import {
  HEADER_BAR_BORDER_GRADIENT,
  TAB_SELECTED_BACKGROUND_GRADIENT,
} from "./constants";
import { StoryCard } from "./story-card";

const TAB_BAR_BORDER_WIDTH = 4;
const TAB_BUTTON_BORDER_WIDTH = 2;
const TAB_BUTTON_PROPERTIES: {
  image: ImageSourcePropType;
  action: KAUCIM_CONCERNS;
  labelKey: string;
}[] = [
  {
    image: wealthIcon,
    action: KAUCIM_CONCERNS.WEALTH,
    labelKey: "kau_cim.category.wealth",
  },
  {
    image: loveIcon,
    action: KAUCIM_CONCERNS.LOVE,
    labelKey: "kau_cim.category.love",
  },
  {
    image: careerIcon,
    action: KAUCIM_CONCERNS.CAREER,
    labelKey: "kau_cim.category.career",
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

      <LinearGradient
        colors={HEADER_BAR_BORDER_GRADIENT}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.tabBarBorder}
      >
        <View style={styles.tabBarContent}>
          {TAB_BUTTON_PROPERTIES.map((tab) => {
            const selected = tab.action === selectedConcern;
            const tabContent = (
              <>
                <Image source={tab.image} style={styles.tabImage} />
                <Text
                  style={[styles.tabLabel, selected && styles.tabLabelSelected]}
                >
                  {t(tab.labelKey)}
                </Text>
              </>
            );

            return (
              <Pressable
                key={tab.action}
                onPress={() => setSelectedConcern(tab.action)}
                style={styles.tabPressable}
                accessibilityRole="tab"
                accessibilityState={{ selected }}
                accessibilityLabel={t(tab.labelKey)}
              >
                {selected ? (
                  <LinearGradient
                    colors={HEADER_BAR_BORDER_GRADIENT}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.tabSelectedBorder}
                  >
                    <LinearGradient
                      colors={TAB_SELECTED_BACKGROUND_GRADIENT}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.tabSelectedBackground}
                    >
                      {tabContent}
                    </LinearGradient>
                  </LinearGradient>
                ) : (
                  <View style={styles.tab}>{tabContent}</View>
                )}
              </Pressable>
            );
          })}
        </View>
      </LinearGradient>
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
  tabBarBorder: {
    padding: TAB_BAR_BORDER_WIDTH,
    shadowColor: "#0B3C49",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  tabBarContent: {
    flexDirection: "row",
    paddingVertical: 1,
    paddingHorizontal: 1,
    borderRadius: 8,
  },
  tabPressable: {
    flex: 1,
    marginHorizontal: 0,
    justifyContent: "center",
  },
  tab: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    backgroundColor: "rgba(11, 60, 73, 0.06)",
  },
  tabSelectedBorder: {
    borderRadius: 8,
    padding: TAB_BUTTON_BORDER_WIDTH,
  },
  tabSelectedBackground: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 1,
    paddingHorizontal: 1,
    borderRadius: 6,
  },
  tabImage: {
    width: 42,
    height: 42,
    marginBottom: 2,
  },
  tabLabel: {
    fontSize: 12,
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
