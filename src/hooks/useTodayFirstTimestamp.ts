import { getTodayFirstTimestamp } from "@/lib/app/time";
import { useEffect, useState } from "react";

/** Local midnight timestamp; updates when the calendar day changes (checked every minute). */
export function useTodayFirstTimestamp(): number {
  const [todayFirstTimestamp, setTodayFirstTimestamp] = useState(
    getTodayFirstTimestamp,
  );

  useEffect(() => {
    const tick = () => {
      const next = getTodayFirstTimestamp();
      setTodayFirstTimestamp((current) => (current === next ? current : next));
    };

    tick();
    const intervalId = setInterval(tick, 60_000);
    return () => clearInterval(intervalId);
  }, []);

  return todayFirstTimestamp;
}
