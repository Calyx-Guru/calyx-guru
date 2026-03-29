import { earth, fire, metal, water, wood } from "@/assets/images/elements";

import * as HATCHING from "@/assets/videos/hatching";

import type { Element } from "./type";

export const VIDEOS = {
  hatching: {
    idle: HATCHING.IDLE,
    break: HATCHING.BREAK,
    metal: HATCHING.METAL,
    water: HATCHING.WATER,
    wood: HATCHING.WOOD,
    fire: HATCHING.FIRE,
    earth: HATCHING.EARTH,
  },
};

export const ELEMENTS: Element[] = [
  {
    key: "wood",
    label: "Wood",
    source: wood,
    positionStyleKey: "elementTop",
  },
  {
    key: "fire",
    label: "Fire",
    source: fire,
    positionStyleKey: "elementRight",
  },
  {
    key: "earth",
    label: "Earth",
    source: earth,
    positionStyleKey: "elementBottomRight",
  },
  {
    key: "metal",
    label: "Metal",
    source: metal,
    positionStyleKey: "elementBottomLeft",
  },

  {
    key: "water",
    label: "Water",
    source: water,
    positionStyleKey: "elementLeft",
  },
];
