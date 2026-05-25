export type PetStatusTier = "veryGood" | "good" | "normal" | "bad" | "veryBad";

export type PushNotificationKind =
  | "daily_status"
  | "daily_check_in"
  | "low_power_reminder"
  | "kaucim_daily_reminder"
  | "daily_engagement"
  | "weekly_return";

/** Stable identifier used with `scheduleNotificationAsync({ identifier })`. */
export type PushNotificationId =
  | "daily_status"
  | "daily_check_in"
  | "low_power_reminder"
  | "kaucim_daily_reminder"
  | "daily_engagement"
  | "weekly_return";

export type NotificationRecurrence = "daily" | "weekly";

export type ScheduledNotificationEntry = {
  id: PushNotificationId;
  /** Native notification identifier (same as `id` for our scheduler). */
  nativeId: string;
  kind: PushNotificationKind;
  recurrence: NotificationRecurrence;
  title: string;
  body: string;
  /** Epoch ms when this entry was written to the store. */
  scheduledAt: number;
  /** Best-effort next trigger time (epoch ms), if known. */
  triggerAt: number | null;
  tier?: PetStatusTier;
  metadata?: Record<string, string | number | boolean>;
};
