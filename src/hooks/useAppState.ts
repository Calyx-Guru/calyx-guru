import { useAppStateStore } from '@/store/appStateStore';

export function useAppState() {
  const lastKaucimConcern = useAppStateStore((s) => s.lastKaucimConcern);
  const lastKaucimFresh = useAppStateStore((s) => s.lastKaucimFresh);
  const setKaucimState = useAppStateStore((s) => s.setKaucimState);
  const resetAppState = useAppStateStore((s) => s.resetAppState);

  return {
    lastKaucimConcern,
    lastKaucimFresh,
    setKaucimState,
    resetAppState,
  };
}
