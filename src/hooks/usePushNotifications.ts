import { usePushNotificationContext } from "@/contexts/PushNotificationContext";
import { usePushNotificationStore } from "@/store/pushNotificationStore";

export function usePushNotifications() {
  const {
    isAvailable,
    permissionStatus,
    scheduled,
    isScheduling,
    requestPermissions,
    rescheduleFromCurrentState,
    cancelAllScheduled,
  } = usePushNotificationContext();

  const entries = usePushNotificationStore((s) => s.entries);
  const lastSyncedAt = usePushNotificationStore((s) => s.lastSyncedAt);
  const lastScheduleSignature = usePushNotificationStore(
    (s) => s.lastScheduleSignature,
  );

  return {
    isAvailable,
    permissionStatus,
    scheduled,
    scheduledEntries: scheduled,
    entries,
    lastSyncedAt,
    isScheduling,
    lastScheduleSignature,
    requestPermissions,
    rescheduleFromCurrentState,
    cancelAllScheduled,
  };
}
