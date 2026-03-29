import { earth, fire, metal, water, wood } from "@/assets/images/elements";

import * as Types from "./type";

export const ELEMENTS: Types.Element[] = [
  {
    key: "wood",
    label: "Wood",
    chinese: "木",
    color: "#2D5A27",
    description: "Growth, Vitality, and Creativity",
    source: wood,
    positionStyleKey: "elementTop",
  },
  {
    key: "fire",
    label: "Fire",
    chinese: "火",
    color: "#C62828",
    description: "Passion, Energy, and Transformation",
    source: fire,
    positionStyleKey: "elementRight",
  },
  {
    key: "earth",
    label: "Earth",
    chinese: "土",
    color: "#8D6E63",
    description: "Stability, Nourishment, and Grounding",
    source: earth,
    positionStyleKey: "elementBottomRight",
  },
  {
    key: "metal",
    label: "Metal",
    chinese: "金",
    color: "#BDBDBD",
    description: "Precision, Strength, and Focus",
    source: metal,
    positionStyleKey: "elementBottomLeft",
  },
  {
    key: "water",
    label: "Water",
    chinese: "水",
    color: "#1565C0",
    description: "Flow, Wisdom, and Reflection",
    source: water,
    positionStyleKey: "elementLeft",
  },
];
