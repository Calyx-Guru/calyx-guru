export type FortuneTellingCategory = 'family_friends' | 'money' | 'love' | 'career' | 'health';

export interface FortuneTellingHighlights {
   seizeAllOpportunities: string;
   detailsAndActions: string;
   workWithPeople: string;
   ownYourFate: string;
}

export type FortuneTellingApplications = Record<FortuneTellingCategory, string[]>;

export interface FortuneTellingRow {
   id: string;
   draw_no: number;
   locale: string;
   value: number;
   original_explanation: string;
   updated_explanation: string;
   hexagram: string;
   picture_explanation: string;
   implications: string;
   matsus_words: string;
   highlights: FortuneTellingHighlights;
   applications: FortuneTellingApplications;
   last_reminders: string;
   illustration_url: string | null;
   hexagram_image_url: string | null;
   created_at: string;
   updated_at: string;
}
