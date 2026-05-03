import { getDeviceIdAsync } from '@/lib/app/helper';
import { useAppStateStore } from '@/store/appStateStore';
import { useEffect, useState } from 'react';

export function useAppState() {
  const [deviceId, setDeviceId] = useState<string>('');
  const lastKaucimConcern = useAppStateStore((s) => s.lastKaucimConcern);
  const lastKaucimFresh = useAppStateStore((s) => s.lastKaucimFresh);
  const setKaucimState = useAppStateStore((s) => s.setKaucimState);
  const resetAppState = useAppStateStore((s) => s.resetAppState);

  useEffect(() => {
    const fetchDeviceId = async () => {
      const id = await getDeviceIdAsync();
      setDeviceId(id);
    }
    fetchDeviceId();
  }, []);

  return {
    deviceId,
    lastKaucimConcern,
    lastKaucimFresh,
    setKaucimState,
    resetAppState,
  };
}
