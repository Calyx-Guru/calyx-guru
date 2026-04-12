import type { LanguageKey } from './common';
import { KAUCIM_CONCERNS } from './UserState';

/**
 * A story line for a specific stick number in a pack
 */
export type KaucimStoryLineType = {  
  stickNumber: string;
  fortuneLevel: string;
  title: string;
  verdict: string;
  omen: string;
  action: string;
  conclusion: string;
}

/**
 * A pack of kaucim stories for a specific language and concern 
 */
export type KaucimStoriesPackType = Record<KAUCIM_CONCERNS, Record<LanguageKey, KaucimStoryLineType[]>>;
