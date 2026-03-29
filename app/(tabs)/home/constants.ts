import { earth, fire, metal, water, wood } from "@/assets/images/elements";

import BACKGROUND_METAL from "@/assets/videos/background/metal.mp4";
import HATCHING_IDLE from "@/assets/videos/hatching/idle.mp4";
import STAGE_NORMAL from "@/assets/videos/mascot/normal.webm";

import type { Element, ElementName } from "./type";

export const VIDEOS = {
  hatching: {
    idle: HATCHING_IDLE,
    normal: STAGE_NORMAL,
  },
  background: {
    metal: BACKGROUND_METAL,
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

export const CHINESE_ELEMENT_TO_KEY: Record<string, ElementName> = {
  木: "wood",
  火: "fire",
  土: "earth",
  金: "metal",
  水: "water",
};
