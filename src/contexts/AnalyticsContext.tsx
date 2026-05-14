import * as Amplitude from '@amplitude/analytics-react-native';
import { Identify, Types } from '@amplitude/analytics-react-native';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { STORAGE_ANALYTICS_FIRST_OPEN_AT_KEY } from '@/constants';
import { ENV } from '@/constants/env';
import { storage } from '@/lib/storage';

const FIRST_14_DAYS = 14;

export type AnalyticsEventProps = Record<
  string,
  string | number | boolean | null | undefined
>;

export type InstallWindow = {
  /** Calendar days since first open (UTC date), 0 on the first calendar day */
  daySinceInstall: number;
  isInFirst14Days: boolean;
  firstOpenAt: string | null;
};

type AnalyticsContextValue = {
  isEnabled: boolean;
  install: InstallWindow;
  /** True after first-open timestamp has been read from storage (or set on first launch). */
  isInstallReady: boolean;
  track: (eventName: string, eventProperties?: AnalyticsEventProps) => void;
  trackScreen: (screenName: string, properties?: AnalyticsEventProps) => void;
  identify: (userId: string | undefined) => void;
  setUserProperties: (properties: AnalyticsEventProps) => void;
  setUserPropertiesOnce: (properties: AnalyticsEventProps) => void;
  reset: () => void;
};

const noop = () => {};

const defaultInstall: InstallWindow = {
  daySinceInstall: 0,
  isInFirst14Days: true,
  firstOpenAt: null,
};

const AnalyticsContext = createContext<AnalyticsContextValue>({
  isEnabled: false,
  install: defaultInstall,
  isInstallReady: false,
  track: noop,
  trackScreen: noop,
  identify: noop,
  setUserProperties: noop,
  setUserPropertiesOnce: noop,
  reset: noop,
});

function utcDayStartMs(d: Date): number {
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
}

function computeInstallWindow(firstOpenIso: string | null): InstallWindow {
  if (!firstOpenIso) {
    return { daySinceInstall: 0, isInFirst14Days: true, firstOpenAt: null };
  }
  const first = new Date(firstOpenIso);
  if (Number.isNaN(first.getTime())) {
    return { daySinceInstall: 0, isInFirst14Days: true, firstOpenAt: null };
  }
  const daySinceInstall = Math.max(
    0,
    Math.floor(
      (utcDayStartMs(new Date()) - utcDayStartMs(first)) / 86_400_000,
    ),
  );
  return {
    daySinceInstall,
    isInFirst14Days: daySinceInstall < FIRST_14_DAYS,
    firstOpenAt: firstOpenIso,
  };
}

let amplitudeInitForKey: string | null = null;

function ensureAmplitudeInit(apiKey: string) {
  if (amplitudeInitForKey === apiKey) {
    return;
  }
  Amplitude.init(apiKey, undefined, {
    logLevel: ENV.DEBUG_MODE
      ? Types.LogLevel.Verbose
      : Types.LogLevel.Warn,
  });
  amplitudeInitForKey = apiKey;
}

function cohortPropsFromInstall(install: InstallWindow): AnalyticsEventProps {
  if (!install.firstOpenAt) {
    return {};
  }
  return {
    day_since_install: install.daySinceInstall,
    is_first_14_days: install.isInFirst14Days,
  };
}

export function AnalyticsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const apiKey = ENV.AMPLITUDE_API_KEY?.trim() ?? '';
  const isEnabled = Boolean(apiKey);

  const [firstOpenAt, setFirstOpenAt] = useState<string | null>(null);
  const [isInstallReady, setIsInstallReady] = useState(false);
  /** True only when this run created the persisted first-open timestamp (new install). */
  const [isNewInstall, setIsNewInstall] = useState(false);

  const install = useMemo(
    () => computeInstallWindow(firstOpenAt),
    [firstOpenAt],
  );

  useEffect(() => {
    if (!isEnabled) {
      setIsInstallReady(true);
      return;
    }

    let cancelled = false;

    (async () => {
      const existing = await storage.getItem(
        STORAGE_ANALYTICS_FIRST_OPEN_AT_KEY,
      );
      if (cancelled) {
        return;
      }

      if (existing) {
        setFirstOpenAt(existing);
        setIsNewInstall(false);
        setIsInstallReady(true);
        return;
      }

      const iso = new Date().toISOString();
      await storage.setItem(STORAGE_ANALYTICS_FIRST_OPEN_AT_KEY, iso);
      if (cancelled) {
        return;
      }
      setFirstOpenAt(iso);
      setIsNewInstall(true);
      setIsInstallReady(true);
    })();

    return () => {
      cancelled = true;
    };
  }, [isEnabled]);

  useEffect(() => {
    if (!isEnabled || !apiKey) {
      return;
    }
    ensureAmplitudeInit(apiKey);
  }, [apiKey, isEnabled]);

  useEffect(() => {
    if (!isEnabled || !isInstallReady || !firstOpenAt) {
      return;
    }

    const identifyObj = new Identify();
    identifyObj.setOnce('first_open_at', firstOpenAt);
    identifyObj.set('last_known_day_since_install', install.daySinceInstall);
    identifyObj.set('is_in_first_14_days', install.isInFirst14Days);
    Amplitude.identify(identifyObj);
  }, [
    firstOpenAt,
    install.daySinceInstall,
    install.isInFirst14Days,
    isEnabled,
    isInstallReady,
  ]);

  useEffect(() => {
    if (!isEnabled || !isInstallReady || !firstOpenAt || !isNewInstall) {
      return;
    }

    Amplitude.track('App First Open', {
      ...cohortPropsFromInstall(install),
      first_open_at: firstOpenAt,
    });
  }, [firstOpenAt, install, isEnabled, isInstallReady, isNewInstall]);

  const track = useCallback(
    (eventName: string, eventProperties?: AnalyticsEventProps) => {
      if (!isEnabled) {
        return;
      }
      const cohort = cohortPropsFromInstall(install);
      Amplitude.track(eventName, {
        ...cohort,
        ...eventProperties,
      });
    },
    [install, isEnabled],
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
      if (!isEnabled) {
        return;
      }
      Amplitude.setUserId(userId);
    },
    [isEnabled],
  );

  const setUserProperties = useCallback(
    (properties: AnalyticsEventProps) => {
      if (!isEnabled) {
        return;
      }
      const id = new Identify();
      for (const [k, v] of Object.entries(properties)) {
        if (v === undefined || v === null) {
          continue;
        }
        id.set(k, v);
      }
      Amplitude.identify(id);
    },
    [isEnabled],
  );

  const setUserPropertiesOnce = useCallback(
    (properties: AnalyticsEventProps) => {
      if (!isEnabled) {
        return;
      }
      const id = new Identify();
      for (const [k, v] of Object.entries(properties)) {
        if (v === undefined || v === null) {
          continue;
        }
        id.setOnce(k, v);
      }
      Amplitude.identify(id);
    },
    [isEnabled],
  );

  const reset = useCallback(() => {
    if (!isEnabled) {
      return;
    }
    Amplitude.reset();
  }, [isEnabled]);

  const value = useMemo<AnalyticsContextValue>(
    () => ({
      isEnabled,
      install,
      isInstallReady,
      track,
      trackScreen,
      identify,
      setUserProperties,
      setUserPropertiesOnce,
      reset,
    }),
    [
      identify,
      install,
      isEnabled,
      isInstallReady,
      reset,
      setUserProperties,
      setUserPropertiesOnce,
      track,
      trackScreen,
    ],
  );

  return (
    <AnalyticsContext.Provider value={value}>
      {children}
    </AnalyticsContext.Provider>
  );
}

export function useAnalytics() {
  return useContext(AnalyticsContext);
}

/** Stable `track` only; useful when you do not need the full context object in a consumer. */
export function useTrack() {
  const { track } = useAnalytics();
  return track;
}

/** Install / “first 14 days” window for onboarding UX or conditional logic. */
export function useInstallWindow() {
  const { install, isInstallReady } = useAnalytics();
  return useMemo(
    () => ({ ...install, isInstallReady }),
    [install, isInstallReady],
  );
}
