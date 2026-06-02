import type { FIVE_ELEMENTS, KAUCIM_CONCERNS, LanguageKey } from './common';

/**
 * A story line for a specific stick number in a pack
 */
export type KaucimStoryLineType = {  
  stickNumber: number;
  fortuneLevel: number;
  element: FIVE_ELEMENTS;
  title: string;
  verdict: string;
  omen: string;
  action: string;
  conclusion: string;
}

/**
 * A pack of kaucim stories for a specific language and concern 
 */
export type KaucimStoriesPackType = {
  language: LanguageKey;
  concern: KAUCIM_CONCERNS; 
  storyLines: KaucimStoryLineType[]; // Array of story groups for the concern, each item is mapped to one stick number
}
