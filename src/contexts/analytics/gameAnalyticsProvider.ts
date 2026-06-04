import * as Application from 'expo-application';
import Constants from 'expo-constants';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, type AppStateStatus } from 'react-native';

import GameAnalytics, {
  isGameAnalyticsReady,
  onGameAnalyticsBeforeUnload,
  setGameAnalyticsUserId,
} from '@/lib/gameanalytics';

import {
  cohortPropsFromInstall,
  type InstallWindowState,
} from './installWindow';
import type { AnalyticsActions, AnalyticsEventProps } from './types';

export type GameAnalyticsConfig = {
  gameKey: string;
  secretKey: string;
  debugMode?: boolean;
};

export type GameAnalyticsHookResult = AnalyticsActions & {
  isSessionReady: boolean;
};

let gaInitForKeys: string | null = null;

function ensureGameAnalyticsInit(config: GameAnalyticsConfig) {
  const key = `${config.gameKey}:${config.secretKey}`;
  if (gaInitForKeys === key) {
    return;
  }

  const build =
    Application.nativeApplicationVersion ??
    Constants.expoConfig?.version ??
    '1.0.0';

  if (config.debugMode) {
    GameAnalytics.setEnabledInfoLog(true);
    GameAnalytics.setEnabledVerboseLog(true);
  }

  GameAnalytics.configureBuild(build);
  GameAnalytics.configureGameEngineVersion('react-native');
  GameAnalytics.configureSdkGameEngineVersion('expo');
  GameAnalytics.initialize(config.gameKey, config.secretKey);
  gaInitForKeys = key;
}

/** GameAnalytics design event ids: segments separated by `:`. */
export function toDesignEventId(eventName: string): string {
  return eventName
    .trim()
    .replace(/\s+/g, ':')
    .replace(/:+/g, ':')
    .replace(/^:+|:+$/g, '');
}

/** GameAnalytics custom fields only accept string or number (not boolean). */
function toGameAnalyticsCustomFields(
  properties: AnalyticsEventProps,
): Record<string, string | number> {
  const fields: Record<string, string | number> = {};
  for (const [k, v] of Object.entries(properties)) {
    if (v === undefined || v === null) {
      continue;
    }
    if (typeof v === 'boolean') {
      fields[k] = v ? 1 : 0;
    } else if (typeof v === 'string' || typeof v === 'number') {
      fields[k] = v;
    }
  }
  return fields;
}

type PendingDesignEvent = {
  eventId: string;
  fields: Record<string, string | number>;
};

function sendDesignEvent(
  eventId: string,
  fields: Record<string, string | number>,
) {
  GameAnalytics.addDesignEvent(eventId, undefined, fields, true);
}

export function useGameAnalytics(
  config: GameAnalyticsConfig | null,
  installState: InstallWindowState,
): GameAnalyticsHookResult {
  const gameKey = config?.gameKey?.trim() ?? '';
  const secretKey = config?.secretKey?.trim() ?? '';
  const debugMode = config?.debugMode ?? false;
  const isEnabled = Boolean(gameKey && secretKey);
  const { install, isInstallReady, isNewInstall, firstOpenAt } = installState;

  const [isSessionReady, setIsSessionReady] = useState(false);
  const globalFieldsRef = useRef<Record<string, string | number>>({});
  const setOnceKeysRef = useRef(new Set<string>());
  const pendingEventsRef = useRef<PendingDesignEvent[]>([]);

  const mergeGlobalFields = useCallback(
    (extra: Record<string, string | number>) => {
      globalFieldsRef.current = { ...globalFieldsRef.current, ...extra };
      GameAnalytics.setGlobalCustomEventFields(globalFieldsRef.current);
    },
    [],
  );

  const flushPendingEvents = useCallback(() => {
    if (!isGameAnalyticsReady()) {
      setIsSessionReady(false);
      return;
    }
    setIsSessionReady(true);
    const pending = pendingEventsRef.current;
    if (pending.length === 0) {
      return;
    }
    pendingEventsRef.current = [];
    for (const event of pending) {
      sendDesignEvent(event.eventId, event.fields);
    }
  }, []);

  const enqueueOrSendDesignEvent = useCallback(
    (eventId: string, fields: Record<string, string | number>) => {
      if (!isEnabled) {
        return;
      }
      if (!isGameAnalyticsReady()) {
        pendingEventsRef.current.push({ eventId, fields });
        return;
      }
      sendDesignEvent(eventId, fields);
    },
    [isEnabled],
  );

  useEffect(() => {
    if (!isEnabled || !gameKey || !secretKey) {
      return;
    }
    ensureGameAnalyticsInit({ gameKey, secretKey, debugMode });
  }, [debugMode, gameKey, isEnabled, secretKey]);

  useEffect(() => {
    if (!isEnabled) {
      setIsSessionReady(false);
      pendingEventsRef.current = [];
      return;
    }

    const listener = { onRemoteConfigsUpdated: () => flushPendingEvents() };
    GameAnalytics.addRemoteConfigsListener(listener);
    flushPendingEvents();

    const interval = setInterval(flushPendingEvents, 250);
    const stopPolling = setTimeout(() => clearInterval(interval), 60_000);

    return () => {
      GameAnalytics.removeRemoteConfigsListener(listener);
      clearInterval(interval);
      clearTimeout(stopPolling);
    };
  }, [flushPendingEvents, isEnabled]);

  useEffect(() => {
    if (!isEnabled) {
      return;
    }

    const handleAppState = (next: AppStateStatus) => {
      if (next === 'active') {
        GameAnalytics.onResume();
        flushPendingEvents();
        return;
      }
      if (next === 'background' || next === 'inactive') {
        setIsSessionReady(false);
        onGameAnalyticsBeforeUnload();
      }
    };

    const subscription = AppState.addEventListener('change', handleAppState);
    return () => subscription.remove();
  }, [flushPendingEvents, isEnabled]);

  useEffect(() => {
    if (!isEnabled || !isInstallReady || !firstOpenAt) {
      return;
    }

    mergeGlobalFields(
      toGameAnalyticsCustomFields({
        first_open_at: firstOpenAt,
        last_known_day_since_install: install.daySinceInstall,
        is_in_first_14_days: install.isInFirst14Days,
      }),
    );
  }, [
    firstOpenAt,
    install.daySinceInstall,
    install.isInFirst14Days,
    isEnabled,
    isInstallReady,
    mergeGlobalFields,
  ]);

  useEffect(() => {
    if (!isEnabled || !isInstallReady || !firstOpenAt || !isNewInstall) {
      return;
    }

    enqueueOrSendDesignEvent(
      toDesignEventId('App First Open'),
      toGameAnalyticsCustomFields({
        ...cohortPropsFromInstall(install),
        first_open_at: firstOpenAt,
      }),
    );
    flushPendingEvents();
  }, [
    enqueueOrSendDesignEvent,
    firstOpenAt,
    flushPendingEvents,
    install,
    isEnabled,
    isInstallReady,
    isNewInstall,
  ]);

  const track = useCallback(
    (eventName: string, eventProperties?: AnalyticsEventProps) => {
      enqueueOrSendDesignEvent(
        toDesignEventId(eventName),
        toGameAnalyticsCustomFields({
          ...cohortPropsFromInstall(install),
          ...(eventProperties ?? {}),
        }),
      );
    },
    [enqueueOrSendDesignEvent, install],
  );

  const trackScreen = useCallback(
    (screenName: string, properties?: AnalyticsEventProps) => {
      track('Screen Viewed', {
        screen_name: screenName,
        ...properties,
      });
    },
    [track],
  );

  const identify = useCallback(
    (userId: string | undefined) => {
      if (!isEnabled || !userId) {
        return;
      }
      setGameAnalyticsUserId(userId);
    },
    [isEnabled],
  );

  const setUserProperties = useCallback(
    (properties: AnalyticsEventProps) => {
      if (!isEnabled) {
        return;
      }
      mergeGlobalFields(toGameAnalyticsCustomFields(properties));
    },
    [isEnabled, mergeGlobalFields],
  );

  const setUserPropertiesOnce = useCallback(
    (properties: AnalyticsEventProps) => {
      if (!isEnabled) {
        return;
      }
      const once: Record<string, string | number> = {};
      for (const [k, v] of Object.entries(properties)) {
        if (v === undefined || v === null || setOnceKeysRef.current.has(k)) {
          continue;
        }
        setOnceKeysRef.current.add(k);
        const normalized = toGameAnalyticsCustomFields({ [k]: v });
        if (k in normalized) {
          once[k] = normalized[k];
        }
      }
      if (Object.keys(once).length > 0) {
        mergeGlobalFields(once);
      }
    },
    [isEnabled, mergeGlobalFields],
  );

  const reset = useCallback(() => {
    if (!isEnabled) {
      return;
    }
    onGameAnalyticsBeforeUnload();
    globalFieldsRef.current = {};
    setOnceKeysRef.current.clear();
    pendingEventsRef.current = [];
    setIsSessionReady(false);
    GameAnalytics.setGlobalCustomEventFields({});
    gaInitForKeys = null;
  }, [isEnabled]);

  return {
    track,
    trackScreen,
    identify,
    setUserProperties,
    setUserPropertiesOnce,
    reset,
    isSessionReady,
  };
}
