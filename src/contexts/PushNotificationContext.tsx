import { isPushNotificationAvailable } from "@/lib/notifications/capabilities";
import {
  cancelManagedNotifications,
  getNotificationPermissionStatus,
  initializeNotificationClient,
  requestNotificationPermissions,
  scheduleRecurringNotification,
  type NotificationPermissionStatus,
} from "@/lib/notifications/client";
import {
  buildSchedulePlan,
  getScheduleSignature,
} from "@/lib/notifications/scheduler";
import { useAppAppearance } from "@/contexts/AppAppearanceContext";
import { useAppState } from "@/hooks/useAppState";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useUserState } from "@/hooks/useUserState";
import { usePushNotificationStore } from "@/store/pushNotificationStore";
import type { ScheduledNotificationEntry } from "@/types/PushNotification";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

type PushNotificationContextValue = {
  isAvailable: boolean;
  permissionStatus: NotificationPermissionStatus;
  scheduled: ScheduledNotificationEntry[];
  isScheduling: boolean;
  requestPermissions: () => Promise<boolean>;
  rescheduleFromCurrentState: (options?: { force?: boolean }) => Promise<void>;
  cancelAllScheduled: () => Promise<void>;
};

const noopAsync = async () => {};

const disabledValue: PushNotificationContextValue = {
  isAvailable: false,
  permissionStatus: "unavailable",
  scheduled: [],
  isScheduling: false,
  requestPermissions: async () => false,
  rescheduleFromCurrentState: noopAsync,
  cancelAllScheduled: noopAsync,
};

const PushNotificationContext =
  createContext<PushNotificationContextValue>(disabledValue);

export function PushNotificationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const isAvailable = isPushNotificationAvailable();
  const { locale } = useAppAppearance();
  const { deviceId } = useAppState();
  const { userState, isLoading: isUserStateLoading } = useUserState();
  const { profile, isLoading: isProfileLoading } = useUserProfile();

  const [permissionStatus, setPermissionStatus] =
    useState<NotificationPermissionStatus>(
      isAvailable ? "undetermined" : "unavailable",
    );

  const entries = usePushNotificationStore((s) => s.entries);
  const isScheduling = usePushNotificationStore((s) => s.isScheduling);
  const setScheduling = usePushNotificationStore((s) => s.setScheduling);
  const replaceEntries = usePushNotificationStore((s) => s.replaceEntries);
  const clearEntries = usePushNotificationStore((s) => s.clearEntries);
  const lastScheduleSignature = usePushNotificationStore(
    (s) => s.lastScheduleSignature,
  );
  const setLastScheduleSignature = usePushNotificationStore(
    (s) => s.setLastScheduleSignature,
  );

  const initStartedRef = useRef(false);
  const rescheduleInFlightRef = useRef(false);

  useEffect(() => {
    if (!isAvailable || initStartedRef.current) {
      return;
    }

    initStartedRef.current = true;
    void (async () => {
      await initializeNotificationClient();
      setPermissionStatus(await getNotificationPermissionStatus());
    })();
  }, [isAvailable]);

  const requestPermissions = useCallback(async () => {
    if (!isAvailable) {
      return false;
    }

    const granted = await requestNotificationPermissions();
    setPermissionStatus(
      granted ? "granted" : await getNotificationPermissionStatus(),
    );
    return granted;
  }, [isAvailable]);

  const cancelAllScheduled = useCallback(async () => {
    if (!isAvailable) {
      return;
    }

    await cancelManagedNotifications();
    clearEntries();
    setLastScheduleSignature(null);
  }, [clearEntries, isAvailable, setLastScheduleSignature]);

  const rescheduleFromCurrentState = useCallback(
    async (options?: { force?: boolean }) => {
    if (!isAvailable || rescheduleInFlightRef.current) {
      return;
    }

    if (isUserStateLoading || isProfileLoading) {
      return;
    }

    if (!userState || !profile) {
      await cancelAllScheduled();
      return;
    }

    if (!deviceId) {
      return;
    }

    const signature = getScheduleSignature(userState, locale);
    if (!options?.force && signature === lastScheduleSignature) {
      return;
    }

    rescheduleInFlightRef.current = true;
    setScheduling(true);

    try {
      const permission =
        permissionStatus === "granted"
          ? true
          : await requestPermissions();

      if (!permission) {
        setLastScheduleSignature(signature);
        return;
      }

      const plan = buildSchedulePlan({ userState, deviceId, locale });

      await cancelManagedNotifications();

      const scheduled: ScheduledNotificationEntry[] = [];
      for (const item of plan.items) {
        const entry = await scheduleRecurringNotification(item);
        if (entry) {
          scheduled.push({ ...entry, tier: plan.tier });
        }
      }

      replaceEntries(scheduled);
      setLastScheduleSignature(signature);
    } catch (error) {
      console.warn("Failed to schedule local notifications:", error);
    } finally {
      setScheduling(false);
      rescheduleInFlightRef.current = false;
    }
  },
  [
    cancelAllScheduled,
    deviceId,
    isAvailable,
    isProfileLoading,
    isUserStateLoading,
    lastScheduleSignature,
    locale,
    permissionStatus,
    profile,
    replaceEntries,
    requestPermissions,
    setLastScheduleSignature,
    setScheduling,
    userState,
  ]);

  const isRehydrated =
    !isUserStateLoading && !isProfileLoading && Boolean(userState && profile);

  useEffect(() => {
    if (!isAvailable || !isRehydrated) {
      return;
    }

    void rescheduleFromCurrentState();
  }, [
    isAvailable,
    isRehydrated,
    rescheduleFromCurrentState,
    userState?.petPower,
    userState?.lastKaucimTimestamp,
    userState?.lastKaucimResults,
    locale,
    deviceId,
  ]);

  const scheduled = useMemo(() => Object.values(entries), [entries]);

  const value = useMemo<PushNotificationContextValue>(
    () =>
      isAvailable
        ? {
            isAvailable: true,
            permissionStatus,
            scheduled,
            isScheduling,
            requestPermissions,
            rescheduleFromCurrentState,
            cancelAllScheduled,
          }
        : disabledValue,
    [
      cancelAllScheduled,
      isAvailable,
      isScheduling,
      permissionStatus,
      requestPermissions,
      rescheduleFromCurrentState,
      scheduled,
    ],
  );

  return (
    <PushNotificationContext.Provider value={value}>
      {children}
    </PushNotificationContext.Provider>
  );
}

export function usePushNotificationContext(): PushNotificationContextValue {
  return useContext(PushNotificationContext);
}
