import { KAUCIM_CONCERNS } from '@/types/UserState';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface AppState {
  lastKaucimConcern: KAUCIM_CONCERNS | null;
  lastKaucimFresh: boolean;
}

interface AppStateStore extends AppState {
  setKaucimState: (updates: Partial<AppState>) => void;
  resetAppState: () => void;
}

const defaultAppState: AppState = {
  lastKaucimConcern: null,
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
