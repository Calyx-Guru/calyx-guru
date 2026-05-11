import { KAUCIM_CONCERNS } from "@/types/UserState";
import { create } from "zustand";
import { devtools } from "zustand/middleware";

export type KaucimReplaySelection = {
  concern: KAUCIM_CONCERNS;
  stickNumber: number;
  storyIndex: number;
  powerChange: number;
};

interface AppState {
  lastKaucimConcern: KAUCIM_CONCERNS | null;
  lastKaucimFresh: boolean;
  lastPetPowerChange: number;
  kaucimReplay: KaucimReplaySelection | null;
}

interface AppStateStore extends AppState {
  setAppState: (updates: Partial<AppState>) => void;
  resetAppState: () => void;
}

const defaultAppState: AppState = {
  lastKaucimConcern: null,
  lastKaucimFresh: false,
  lastPetPowerChange: 0,
  kaucimReplay: null,
};

export const useAppStateStore = create<AppStateStore>()(
  devtools(
    (set) => ({
      ...defaultAppState,
      setAppState: (updates) => {
        set((prev) => ({ ...prev, ...updates }));
      },
      resetAppState: () => {
        set(defaultAppState);
      },
    }),
    { name: "AppStateStore" },
  ),
);
