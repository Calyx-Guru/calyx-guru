import type { ScheduledNotificationEntry } from "@/types/PushNotification";
import { create } from "zustand";
import { devtools } from "zustand/middleware";

export interface PushNotificationStore {
  entries: Record<string, ScheduledNotificationEntry>;
  lastSyncedAt: number | null;
  isScheduling: boolean;
  lastScheduleSignature: string | null;

  setScheduling: (isScheduling: boolean) => void;
  replaceEntries: (entries: ScheduledNotificationEntry[]) => void;
  upsertEntry: (entry: ScheduledNotificationEntry) => void;
  removeEntry: (id: string) => void;
  clearEntries: () => void;
  setLastScheduleSignature: (signature: string | null) => void;
}

export const usePushNotificationStore = create<PushNotificationStore>()(
  devtools(
    (set) => ({
      entries: {},
      lastSyncedAt: null,
      isScheduling: false,
      lastScheduleSignature: null,

      setScheduling: (isScheduling) => set({ isScheduling }),

      replaceEntries: (entries) =>
        set({
          entries: Object.fromEntries(entries.map((entry) => [entry.id, entry])),
          lastSyncedAt: Date.now(),
        }),

      upsertEntry: (entry) =>
        set((state) => ({
          entries: { ...state.entries, [entry.id]: entry },
          lastSyncedAt: Date.now(),
        })),

      removeEntry: (id) =>
        set((state) => {
          const next = { ...state.entries };
          delete next[id];
          return { entries: next, lastSyncedAt: Date.now() };
        }),

      clearEntries: () =>
        set({
          entries: {},
          lastSyncedAt: Date.now(),
        }),

      setLastScheduleSignature: (lastScheduleSignature) =>
        set({ lastScheduleSignature }),
    }),
    { name: "PushNotificationStore" },
  ),
);
