export enum FIVE_ELEMENTS {
  WOOD = "wood",
  FIRE = "fire",
  EARTH = "earth",
  METAL = "metal",
  WATER = "water",
}

export enum KAUCIM_CONCERNS {
  CAREER = "career",
  WEALTH = "wealth",
  LOVE = "love",
  HEALTH = "health",
  FAMILY = "family",
  CHILDREN = "children",
  FRIENDS = "friends",
  TRAVEL = "travel",
  LAWSUITS = "lawsuits",
  ACADEMIC = "academic",
  LOST_ITEMS = "lost_items",
}

export const ELEMENT_OPPOSITES: Record<FIVE_ELEMENTS, FIVE_ELEMENTS> = {
  [FIVE_ELEMENTS.WOOD]: FIVE_ELEMENTS.FIRE,
  [FIVE_ELEMENTS.FIRE]: FIVE_ELEMENTS.EARTH,
  [FIVE_ELEMENTS.EARTH]: FIVE_ELEMENTS.METAL,
  [FIVE_ELEMENTS.METAL]: FIVE_ELEMENTS.WATER,
  [FIVE_ELEMENTS.WATER]: FIVE_ELEMENTS.WOOD,
};

export type KaucimStoryUnlock = Record<number, number>;

export interface KaucimResult {
  storyIndex: number;
  concern: KAUCIM_CONCERNS;
  stickNumber: number;
  element: FIVE_ELEMENTS;
  currentPower: number;
  powerChange: number;
  timestamp: number;
  elementalEnergyChange: [FIVE_ELEMENTS, number];
}

export interface KaucimState {
  startOfDayTimestamp: number;
  results: { [key in KAUCIM_CONCERNS]?: KaucimResult };
}

export type KaucimResultsMap = { [key in KAUCIM_CONCERNS]?: KaucimResult };

export interface UserState {
  id: string;
  petPower: number;
  lastKaucimTimestamp: number;
  lastKaucimResults: KaucimResultsMap;
  kaucimHistory: KaucimState[];
  kaucimStoryUnlocks: Partial<Record<KAUCIM_CONCERNS, KaucimStoryUnlock>>;
  lastKaucimRollTimestamp: number;
  kaucimJourneyProgress: number;
  elementalEnergy: Record<FIVE_ELEMENTS, number>;
}
