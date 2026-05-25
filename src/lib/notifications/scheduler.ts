import { PUSH_SCHEDULE } from "@/constants/notifications";
import { getTodayFirstTimestamp } from "@/lib/app/time";
import i18n from "@/lib/i18n/config";
import type { ScheduleNotificationInput } from "@/lib/notifications/client";
import { getPetStatusTier, isLowPetStatusTier } from "@/lib/app/petStatus";
import { getPetStatusMessage } from "@/lib/notifications/petStatus";
import type { LanguageKey } from "@/types";
import type { PetStatusTier } from "@/types/PushNotification";
import {
  KAUCIM_CONCERNS,
  type KaucimResultsMap,
  type UserState,
} from "@/types/UserState";

const KAUCIM_REMINDER_CONCERNS: KAUCIM_CONCERNS[] = [
  KAUCIM_CONCERNS.WEALTH,
  KAUCIM_CONCERNS.LOVE,
  KAUCIM_CONCERNS.CAREER,
];

function isConcernReadToday(
  concern: KAUCIM_CONCERNS,
  lastKaucimTimestamp: number,
  lastKaucimResults: KaucimResultsMap,
): boolean {
  const todayFirstTimestamp = getTodayFirstTimestamp();
  if (lastKaucimTimestamp < todayFirstTimestamp) {
    return false;
  }

  return Boolean(lastKaucimResults[concern]);
}

export type BuildSchedulePlanInput = {
  userState: UserState;
  deviceId: string;
  locale: LanguageKey;
};

export type SchedulePlan = {
  tier: PetStatusTier;
  items: ScheduleNotificationInput[];
};

/**
 * Builds the maximum practical set of repeating local notifications.
 * DAILY / WEEKLY triggers run until cancelled (no fixed end date).
 */
export function buildSchedulePlan({
  userState,
  deviceId,
  locale,
}: BuildSchedulePlanInput): SchedulePlan {
  const tier = getPetStatusTier(userState.petPower);
  const statusBody = getPetStatusMessage(userState.petPower, deviceId, locale);

  const items: ScheduleNotificationInput[] = [
    {
      id: "daily_status",
      recurrence: "daily",
      title: i18n.t("pushNotifications.dailyStatus.title", { lng: locale }),
      body: statusBody,
      hour: PUSH_SCHEDULE.dailyStatus.hour,
      minute: PUSH_SCHEDULE.dailyStatus.minute,
    },
    {
      id: "daily_engagement",
      recurrence: "daily",
      title: i18n.t("pushNotifications.dailyEngagement.title", { lng: locale }),
      body: i18n.t("pushNotifications.dailyEngagement.body", { lng: locale }),
      hour: PUSH_SCHEDULE.dailyEngagement.hour,
      minute: PUSH_SCHEDULE.dailyEngagement.minute,
    },
    {
      id: "weekly_return",
      recurrence: "weekly",
      title: i18n.t("pushNotifications.weeklyReturn.title", { lng: locale }),
      body: i18n.t("pushNotifications.weeklyReturn.body", { lng: locale }),
      hour: PUSH_SCHEDULE.weeklyReturn.hour,
      minute: PUSH_SCHEDULE.weeklyReturn.minute,
      weekday: PUSH_SCHEDULE.weeklyReturn.weekday,
    },
  ];

  const hasUnreadKaucim = KAUCIM_REMINDER_CONCERNS.some(
    (concern) =>
      !isConcernReadToday(
        concern,
        userState.lastKaucimTimestamp,
        userState.lastKaucimResults,
      ),
  );

  if (hasUnreadKaucim) {
    items.push({
      id: "kaucim_daily_reminder",
      recurrence: "daily",
      title: i18n.t("pushNotifications.kaucimReminder.title", { lng: locale }),
      body: i18n.t("pushNotifications.kaucimReminder.body", { lng: locale }),
      hour: PUSH_SCHEDULE.dailyCheckIn.hour,
      minute: PUSH_SCHEDULE.dailyCheckIn.minute,
    });
  } else {
    items.push({
      id: "daily_check_in",
      recurrence: "daily",
      title: i18n.t("pushNotifications.dailyCheckIn.title", { lng: locale }),
      body: i18n.t("pushNotifications.dailyCheckIn.body", { lng: locale }),
      hour: PUSH_SCHEDULE.dailyCheckIn.hour,
      minute: PUSH_SCHEDULE.dailyCheckIn.minute,
    });
  }

  if (isLowPetStatusTier(tier)) {
    items.push({
      id: "low_power_reminder",
      recurrence: "daily",
      title: i18n.t("pushNotifications.lowPower.title", { lng: locale }),
      body: i18n.t("pushNotifications.lowPower.body", { lng: locale }),
      hour: PUSH_SCHEDULE.lowPowerReminder.hour,
      minute: PUSH_SCHEDULE.lowPowerReminder.minute,
    });
  }

  return { tier, items };
}

export function getScheduleSignature(
  userState: UserState,
  locale: LanguageKey,
): string {
  const tier = getPetStatusTier(userState.petPower);
  const unreadFlags = KAUCIM_REMINDER_CONCERNS.map((concern) =>
    isConcernReadToday(
      concern,
      userState.lastKaucimTimestamp,
      userState.lastKaucimResults,
    )
      ? "1"
      : "0",
  ).join("");

  return `${getTodayFirstTimestamp()}:${locale}:${tier}:${userState.petPower}:${unreadFlags}`;
}
