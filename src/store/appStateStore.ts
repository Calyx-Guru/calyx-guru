import { KAUCIM_CONCERNS } from "@/types/UserState";
import { create } from "zustand";
import { devtools } from "zustand/middleware";

interface AppState {
  lastKaucimConcern: KAUCIM_CONCERNS | null;
  lastKaucimFresh: boolean;
  lastPetPowerChange: number;
}

interface AppStateStore extends AppState {
  setAppState: (updates: Partial<AppState>) => void;
  resetAppState: () => void;
}

const defaultAppState: AppState = {
  lastKaucimConcern: null,
  lastKaucimFresh: false,
  lastPetPowerChange: 0,
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
