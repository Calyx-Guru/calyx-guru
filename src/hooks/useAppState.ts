import { getDeviceIdAsync } from "@/lib/app/helper";
import { useAppStateStore } from "@/store/appStateStore";
import { useEffect, useState } from "react";

export function useAppState() {
  const [deviceId, setDeviceId] = useState<string>("");
  const lastKaucimConcern = useAppStateStore((s) => s.lastKaucimConcern);
  const lastKaucimFresh = useAppStateStore((s) => s.lastKaucimFresh);
  const lastPetPowerChange = useAppStateStore((s) => s.lastPetPowerChange);
  const kaucimReplay = useAppStateStore((s) => s.kaucimReplay);
  const setAppState = useAppStateStore((s) => s.setAppState);
  const resetAppState = useAppStateStore((s) => s.resetAppState);

  useEffect(() => {
    const fetchDeviceId = async () => {
      const id = await getDeviceIdAsync();
      setDeviceId(id);
    };
    fetchDeviceId();
  }, []);

  return {
    deviceId,
    lastKaucimConcern,
    lastKaucimFresh,
    lastPetPowerChange,
    kaucimReplay,
    setAppState,
    resetAppState,
  };
}
