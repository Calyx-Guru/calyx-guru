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
  stickNumber: number;  

}

export interface KaucimState {
  timestamp: number;
  results: Record<KAUCIM_CONCERNS, KaucimResult>;
}

export interface UserState {
  id: string;
  kaucimHistory: KaucimState[];
}
