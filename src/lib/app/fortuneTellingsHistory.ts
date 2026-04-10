import { storage } from '@/lib/storage';

export type FortuneTellingHistoryEntry = {
  id: string;
  interest: string;
  resultText: string;
  toldAt: string;
};

const FORTUNE_TELLINGS_HISTORY_KEY = 'fortuneTellingsHistory';

function isSameLocalDay(firstDate: Date, secondDate: Date) {
  return (
    firstDate.getFullYear() === secondDate.getFullYear() &&
    firstDate.getMonth() === secondDate.getMonth() &&
    firstDate.getDate() === secondDate.getDate()
  );
}

export async function addFortuneTellingHistoryEntry(
  entry: Omit<FortuneTellingHistoryEntry, 'id' | 'toldAt'>,
) {
  try {
    const existingRaw = await storage.getItem(
      FORTUNE_TELLINGS_HISTORY_KEY,
    );
    const existingEntries: FortuneTellingHistoryEntry[] = existingRaw
      ? JSON.parse(existingRaw)
      : [];

    const newEntry: FortuneTellingHistoryEntry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      toldAt: new Date().toISOString(),
      ...entry,
    };

    const nextEntries = [newEntry, ...existingEntries].slice(0, 200);
    await storage.setItem(
      FORTUNE_TELLINGS_HISTORY_KEY,
      JSON.stringify(nextEntries),
    );
  } catch (error) {
    console.error('Failed to save fortune telling history:', error);
  }
}

export async function getTodayFortuneTellingHistoryEntries() {
  try {
    const existingRaw = await storage.getItem(
      FORTUNE_TELLINGS_HISTORY_KEY,
    );
    const allEntries: FortuneTellingHistoryEntry[] = existingRaw
      ? JSON.parse(existingRaw)
      : [];
    const now = new Date();

    return allEntries.filter((entry) => {
      const toldAtDate = new Date(entry.toldAt);
      if (Number.isNaN(toldAtDate.getTime())) {
        return false;
      }

      return isSameLocalDay(toldAtDate, now);
    });
  } catch (error) {
    console.error('Failed to load fortune telling history:', error);
    return [];
  }
}
