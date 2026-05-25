import type { PushNotificationId } from "@/types/PushNotification";

export const PUSH_NOTIFICATION_CHANNEL_ID = "calyx_guru_default";

/**
 * Recurring local notification times (device local timezone).
 * DAILY / WEEKLY triggers repeat indefinitely until cancelled — longest practical retention.
 */
export const PUSH_SCHEDULE = {
  dailyStatus: { hour: 9, minute: 0 },
  dailyCheckIn: { hour: 12, minute: 0 },
  lowPowerReminder: { hour: 19, minute: 0 },
  dailyEngagement: { hour: 20, minute: 0 },
  /** Expo WEEKLY: 1 = Sunday */
  weeklyReturn: { weekday: 1, hour: 10, minute: 0 },
} as const;

/** All identifiers the app owns — used for cancel + reschedule. */
export const MANAGED_PUSH_NOTIFICATION_IDS: PushNotificationId[] = [
  "daily_status",
  "daily_check_in",
  "low_power_reminder",
  "kaucim_daily_reminder",
  "daily_engagement",
  "weekly_return",
];
