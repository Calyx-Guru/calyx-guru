import { MAX_ELEMENTAL_ENERGY, MIN_ELEMENTAL_ENERGY } from "@/constants";
import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, Text, View } from "react-native";

import { FIVE_ELEMENTS } from "@/types/UserState";

const ELEMENT_DISPLAY_ORDER: FIVE_ELEMENTS[] = [
  FIVE_ELEMENTS.WATER,
  FIVE_ELEMENTS.WOOD,
  FIVE_ELEMENTS.EARTH,
  FIVE_ELEMENTS.METAL,
  FIVE_ELEMENTS.FIRE,
];

const ELEMENT_LABELS: Record<FIVE_ELEMENTS, string> = {
  [FIVE_ELEMENTS.WATER]: "Water",
  [FIVE_ELEMENTS.WOOD]: "Wood",
  [FIVE_ELEMENTS.EARTH]: "Earth",
  [FIVE_ELEMENTS.METAL]: "Metal",
  [FIVE_ELEMENTS.FIRE]: "Fire",
};

const ELEMENT_GRADIENTS: Record<FIVE_ELEMENTS, readonly [string, string]> = {
  [FIVE_ELEMENTS.WATER]: ["#7dd3fc", "#0369a1"],
  [FIVE_ELEMENTS.WOOD]: ["#86efac", "#15803d"],
  [FIVE_ELEMENTS.EARTH]: ["#d6b36a", "#713f12"],
  [FIVE_ELEMENTS.METAL]: ["#e2e8f0", "#475569"],
  [FIVE_ELEMENTS.FIRE]: ["#fca5a5", "#b91c1c"],
};

const GAUGE_TRACK_HEIGHT = 72;
const GAUGE_WIDTH = 36;

type ElementEnergyGaugesProps = {
  energy: Record<FIVE_ELEMENTS, number> | undefined;
};

function ElementEnergyGauge({
  element,
  value,
}: {
  element: FIVE_ELEMENTS;
  value: number;
}) {
  value = value - MIN_ELEMENTAL_ENERGY;
  const energyRange = MAX_ELEMENTAL_ENERGY - MIN_ELEMENTAL_ENERGY;
  const clamped = Math.max(0, Math.min(value, energyRange));
  const fillHeight = (clamped / energyRange) * GAUGE_TRACK_HEIGHT;
  const energyValue = clamped + MIN_ELEMENTAL_ENERGY;
  const valueColor =
    energyValue < -10 ? "#ef4444" : energyValue > 10 ? "#22c55e" : "#ffffff";

  return (
    <View style={styles.gaugeColumn}>
      <Text style={[styles.gaugeLabel, { color: valueColor }]}>
        {ELEMENT_LABELS[element]}
      </Text>
      <View style={styles.gaugeTrack}>
        <View style={[styles.gaugeFill, { height: fillHeight }]}>
          <LinearGradient
            colors={[...ELEMENT_GRADIENTS[element]]}
            style={StyleSheet.absoluteFill}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
          />
        </View>
      </View>
      <Text style={styles.gaugeValue}>{energyValue}</Text>
    </View>
  );
}

export function ElementEnergyGauges({ energy }: ElementEnergyGaugesProps) {
  return (
    <View style={styles.row}>
      {ELEMENT_DISPLAY_ORDER.map((element) => (
        <ElementEnergyGauge
          key={element}
          element={element}
          value={energy?.[element] ?? 0}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-evenly",
    width: "100%",
  },
  gaugeColumn: {
    alignItems: "center",
    gap: 4,
    minWidth: GAUGE_WIDTH,
  },
  gaugeLabel: {
    color: "#ffffff",
    fontSize: 11,
    fontWeight: "600",
    textTransform: "capitalize",
    textShadowColor: "#000000",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
  },
  gaugeTrack: {
    width: GAUGE_WIDTH,
    height: GAUGE_TRACK_HEIGHT,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.85)",
    borderRadius: 6,
    backgroundColor: "rgba(0, 0, 0, 0.45)",
    overflow: "hidden",
    justifyContent: "flex-end",
  },
  gaugeFill: {
    width: "100%",
    borderRadius: 0,
    overflow: "hidden",
  },
  gaugeValue: {
    color: "#ffffff",
    fontSize: 11,
    fontWeight: "700",
    textShadowColor: "#000000",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
  },
});
