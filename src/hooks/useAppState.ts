import { useAppStateStore } from '@/store/appStateStore';

export function useAppState() {
  const lastKaucimTimestamp = useAppStateStore((s) => s.lastKaucimTimestamp);
  const lastKaucimConcern = useAppStateStore((s) => s.lastKaucimConcern);
  const lastKaucimResults = useAppStateStore((s) => s.lastKaucimResults);
  const lastKaucimFresh = useAppStateStore((s) => s.lastKaucimFresh);
  const setKaucimState = useAppStateStore((s) => s.setKaucimState);
  const resetAppState = useAppStateStore((s) => s.resetAppState);

  return {
    lastKaucimTimestamp,
    lastKaucimConcern,
    lastKaucimResults,
    lastKaucimFresh,
    setKaucimState,
    resetAppState,
  };
}
