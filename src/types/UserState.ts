export enum FIVE_ELEMENTS {
  WOOD = 'wood',
  FIRE = 'fire',
  EARTH = 'earth',
  METAL = 'metal',
  WATER = 'water',
}

export enum KAUCIM_CONCERNS {
  CAREER = 'career',
  WEALTH = 'wealth',
  LOVE = 'love',
  HEALTH = 'health',
  FAMILY = 'family',
  CHILDREN = 'children',
  FRIENDS = 'friends',
  TRAVEL = 'travel',
  LAWSUITS = 'lawsuits',
  ACADEMIC = 'academic',
  LOST_ITEMS = 'lost_items',
}

export interface KaucimResult {
  storyIndex: number;
  concern: KAUCIM_CONCERNS;
  stickNumber: number; 
  element: FIVE_ELEMENTS;
  currentPower: number;
  powerChange: number;
  timestamp: number;
}

export interface KaucimState {
  startOfDayTimestamp: number;
  results: { [key in KAUCIM_CONCERNS]?: KaucimResult };
}

export interface UserState {
  id: string;
  petPower: number;
  kaucimHistory: KaucimState[];
  lastKaucimTimestamp: number;
  lastKaucimConcern: KAUCIM_CONCERNS | null;
  lastKaucimResults: { [key in KAUCIM_CONCERNS]?: KaucimResult };
}
