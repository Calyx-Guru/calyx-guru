import { KAUCIM_CONCERNS, KaucimResult } from '@/types/UserState';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

type KaucimResultsMap = { [key in KAUCIM_CONCERNS]?: KaucimResult };

interface AppState {
  lastKaucimTimestamp: number;
  lastKaucimConcern: KAUCIM_CONCERNS | null;
  lastKaucimResults: KaucimResultsMap;
  lastKaucimFresh: boolean;
}

interface AppStateStore extends AppState {
  setKaucimState: (updates: Partial<AppState>) => void;
  resetAppState: () => void;
}

const defaultAppState: AppState = {
  lastKaucimTimestamp: 0,
  lastKaucimConcern: null,
  lastKaucimResults: {},
  lastKaucimFresh: false,
};

export const useAppStateStore = create<AppStateStore>()(
  devtools(
    (set) => ({
      ...defaultAppState,
      setKaucimState: (updates) => {
        set((prev) => ({ ...prev, ...updates }));
      },
      resetAppState: () => {
        set(defaultAppState);
      },
    }),
    { name: 'AppStateStore' },
  ),
);
