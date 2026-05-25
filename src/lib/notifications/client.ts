import {
  MANAGED_PUSH_NOTIFICATION_IDS,
  PUSH_NOTIFICATION_CHANNEL_ID,
} from "@/constants/notifications";
import { isPushNotificationAvailable } from "@/lib/notifications/capabilities";
import type {
  NotificationRecurrence,
  PushNotificationId,
  ScheduledNotificationEntry,
} from "@/types/PushNotification";
import type * as ExpoNotifications from "expo-notifications";
import { Platform } from "react-native";

type NotificationsModule = typeof ExpoNotifications;

let notificationsModule: NotificationsModule | null = null;
let initialized = false;

function isNotificationsModuleUsable(
  mod: NotificationsModule | null | undefined,
): mod is NotificationsModule {
  return (
    mod != null &&
    typeof mod.setNotificationHandler === "function" &&
    typeof mod.getPermissionsAsync === "function"
  );
}

async function getNotifications(): Promise<NotificationsModule | null> {
  if (!isPushNotificationAvailable()) {
    return null;
  }

  if (isNotificationsModuleUsable(notificationsModule)) {
    return notificationsModule;
  }

  try {
    const mod = await import("expo-notifications");
    if (!isNotificationsModuleUsable(mod)) {
      return null;
    }
    notificationsModule = mod;
    return mod;
  } catch {
    notificationsModule = null;
    return null;
  }
}

export type NotificationPermissionStatus =
  | "undetermined"
  | "granted"
  | "denied"
  | "unavailable";

export async function initializeNotificationClient(): Promise<boolean> {
  const Notifications = await getNotifications();
  if (!Notifications) {
    return false;
  }

  if (initialized) {
    return true;
  }

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync(
      PUSH_NOTIFICATION_CHANNEL_ID,
      {
        name: "Calyx Guru",
        importance: Notifications.AndroidImportance.DEFAULT,
        vibrationPattern: [0, 250, 250, 250],
      },
    );
  }

  initialized = true;
  return true;
}

export async function getNotificationPermissionStatus(): Promise<NotificationPermissionStatus> {
  const Notifications = await getNotifications();
  if (!Notifications) {
    return "unavailable";
  }

  const { status } = await Notifications.getPermissionsAsync();
  if (status === Notifications.PermissionStatus.GRANTED) {
    return "granted";
  }
  if (status === Notifications.PermissionStatus.DENIED) {
    return "denied";
  }

  return "undetermined";
}

export async function requestNotificationPermissions(): Promise<boolean> {
  const Notifications = await getNotifications();
  if (!Notifications) {
    return false;
  }

  const current = await Notifications.getPermissionsAsync();
  if (current.status === Notifications.PermissionStatus.GRANTED) {
    return true;
  }

  const requested = await Notifications.requestPermissionsAsync();
  return requested.status === Notifications.PermissionStatus.GRANTED;
}

export type ScheduleNotificationInput = {
  id: PushNotificationId;
  title: string;
  body: string;
  recurrence: NotificationRecurrence;
  hour: number;
  minute: number;
  /** Required when `recurrence` is `weekly` (Expo: 1 = Sunday … 7 = Saturday). */
  weekday?: number;
};

function nextDailyTriggerMs(hour: number, minute: number): number {
  const next = new Date();
  next.setHours(hour, minute, 0, 0);
  if (next.getTime() <= Date.now()) {
    next.setDate(next.getDate() + 1);
  }
  return next.getTime();
}

function nextWeeklyTriggerMs(
  weekday: number,
  hour: number,
  minute: number,
): number {
  const next = new Date();
  next.setHours(hour, minute, 0, 0);
  const currentWeekday = next.getDay() + 1;
  let daysUntil = weekday - currentWeekday;
  if (daysUntil < 0 || (daysUntil === 0 && next.getTime() <= Date.now())) {
    daysUntil += 7;
  }
  next.setDate(next.getDate() + daysUntil);
  return next.getTime();
}

export async function scheduleRecurringNotification(
  input: ScheduleNotificationInput,
): Promise<ScheduledNotificationEntry | null> {
  const Notifications = await getNotifications();
  if (!Notifications) {
    return null;
  }

  const channelProps =
    Platform.OS === "android"
      ? { channelId: PUSH_NOTIFICATION_CHANNEL_ID }
      : {};

  const trigger: ExpoNotifications.NotificationTriggerInput =
    input.recurrence === "weekly"
      ? {
          type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
          weekday: input.weekday ?? 1,
          hour: input.hour,
          minute: input.minute,
          ...channelProps,
        }
      : {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour: input.hour,
          minute: input.minute,
          ...channelProps,
        };

  const nativeId = await Notifications.scheduleNotificationAsync({
    identifier: input.id,
    content: {
      title: input.title,
      body: input.body,
      sound: false,
      ...channelProps,
    },
    trigger,
  });

  const now = Date.now();
  const triggerAt =
    input.recurrence === "weekly" && input.weekday != null
      ? nextWeeklyTriggerMs(input.weekday, input.hour, input.minute)
      : nextDailyTriggerMs(input.hour, input.minute);

  return {
    id: input.id,
    nativeId,
    kind: input.id,
    recurrence: input.recurrence,
    title: input.title,
    body: input.body,
    scheduledAt: now,
    triggerAt,
  };
}

/** @deprecated Use {@link scheduleRecurringNotification}. */
export const scheduleDailyNotification = scheduleRecurringNotification;

export async function cancelManagedNotifications(): Promise<void> {
  const Notifications = await getNotifications();
  if (!Notifications) {
    return;
  }

  await Promise.all(
    MANAGED_PUSH_NOTIFICATION_IDS.map((id) =>
      Notifications.cancelScheduledNotificationAsync(id).catch(() => undefined),
    ),
  );
}

export async function cancelNotificationById(
  id: PushNotificationId,
): Promise<void> {
  const Notifications = await getNotifications();
  if (!Notifications) {
    return;
  }

  await Notifications.cancelScheduledNotificationAsync(id).catch(() => undefined);
}
