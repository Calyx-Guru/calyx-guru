import { earth, fire, metal, water, wood } from "@/assets/images/elements";

import * as Types from "./type";

export const ELEMENTS: Types.Element[] = [
  {
    key: "wood",
    label: "Wood",
    chinese: "木",
    color: "#7ED972",
    description: "Growth, Vitality, and Creativity",
    source: wood,
    positionStyleKey: "elementTop",
  },
  {
    key: "fire",
    label: "Fire",
    chinese: "火",
    color: "#F38D8D",
    description: "Passion, Energy, and Transformation",
    source: fire,
    positionStyleKey: "elementRight",
  },
  {
    key: "earth",
    label: "Earth",
    chinese: "土",
    color: "#F8C8B7",
    description: "Stability, Nourishment, and Grounding",
    source: earth,
    positionStyleKey: "elementBottomRight",
  },
  {
    key: "metal",
    label: "Metal",
    chinese: "金",
    color: "#E7E7E7",
    description: "Precision, Strength, and Focus",
    source: metal,
    positionStyleKey: "elementBottomLeft",
  },
  {
    key: "water",
    label: "Water",
    chinese: "水",
    color: "#7BB4F9",
    description: "Flow, Wisdom, and Reflection",
    source: water,
    positionStyleKey: "elementLeft",
  },
];
