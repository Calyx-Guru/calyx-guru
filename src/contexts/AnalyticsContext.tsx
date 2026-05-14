import * as Amplitude from '@amplitude/analytics-react-native';
import { Identify, Types } from '@amplitude/analytics-react-native';
import { usePathname, useSegments } from 'expo-router';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
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

/** Stable no-op implementations when `EXPO_PUBLIC_AMPLITUDE_API_KEY` is unset. */
const disabledAnalyticsActions: Pick<
  AnalyticsContextValue,
  | 'track'
  | 'trackScreen'
  | 'identify'
  | 'setUserProperties'
  | 'setUserPropertiesOnce'
  | 'reset'
> = {
  track: noop as AnalyticsContextValue['track'],
  trackScreen: noop as AnalyticsContextValue['trackScreen'],
  identify: noop as AnalyticsContextValue['identify'],
  setUserProperties: noop as AnalyticsContextValue['setUserProperties'],
  setUserPropertiesOnce: noop as AnalyticsContextValue['setUserPropertiesOnce'],
  reset: noop as AnalyticsContextValue['reset'],
};

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
      const cohort = cohortPropsFromInstall(install);
      Amplitude.track(eventName, {
        ...cohort,
        ...eventProperties,
      });
    },
    [install],
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

  const identify = useCallback((userId: string | undefined) => {
    Amplitude.setUserId(userId);
  }, []);

  const setUserProperties = useCallback(
    (properties: AnalyticsEventProps) => {
      const id = new Identify();
      for (const [k, v] of Object.entries(properties)) {
        if (v === undefined || v === null) {
          continue;
        }
        id.set(k, v);
      }
      Amplitude.identify(id);
    },
    [],
  );

  const setUserPropertiesOnce = useCallback(
    (properties: AnalyticsEventProps) => {
      const id = new Identify();
      for (const [k, v] of Object.entries(properties)) {
        if (v === undefined || v === null) {
          continue;
        }
        id.setOnce(k, v);
      }
      Amplitude.identify(id);
    },
    [],
  );

  const reset = useCallback(() => {
    Amplitude.reset();
  }, []);

  const value = useMemo<AnalyticsContextValue>(() => {
    if (!isEnabled) {
      return {
        isEnabled: false,
        install: defaultInstall,
        isInstallReady: true,
        ...disabledAnalyticsActions,
      };
    }
    return {
      isEnabled: true,
      install,
      isInstallReady,
      track,
      trackScreen,
      identify,
      setUserProperties,
      setUserPropertiesOnce,
      reset,
    };
  }, [
    identify,
    install,
    isEnabled,
    isInstallReady,
    reset,
    setUserProperties,
    setUserPropertiesOnce,
    track,
    trackScreen,
  ]);

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

function isDebugAnalyticsRoute(
  pathname: string,
  segments: readonly string[],
): boolean {
  if (segments.some((s) => s === 'debug')) {
    return true;
  }
  const p = pathname.toLowerCase();
  return p === '/debug' || p.startsWith('/debug/');
}

function formatRouteScreenTitle(pathname: string): string {
  const trimmed = (pathname || '/').replace(/\/$/, '') || '/';
  if (trimmed === '/' || trimmed === '') {
    return 'Index';
  }
  const leaf = trimmed.split('/').filter(Boolean).pop() ?? 'index';
  return leaf
    .split('-')
    .map((w) => (w.length > 0 ? w.charAt(0).toUpperCase() + w.slice(1) : w))
    .join(' ');
}

/**
 * Tracks `Screen Viewed` via {@link useAnalytics} for each Expo Router navigation.
 * Omits the in-app `debug` route. Mount once inside the router tree (e.g. root `app/_layout`).
 */
export function AnalyticsScreenTracker() {
  const pathname = usePathname() ?? '/';
  const segments = useSegments();
  const { trackScreen, isEnabled, isInstallReady } = useAnalytics();
  const lastTrackedRef = useRef<string | null>(null);

  const segmentKey = segments.join('/');
  const routePath =
    pathname && pathname.length > 0 ? pathname : `/${segmentKey}`;

  useEffect(() => {
    if (!isEnabled || !isInstallReady) {
      return;
    }
    if (lastTrackedRef.current === routePath) {
      return;
    }

    if (isDebugAnalyticsRoute(routePath, segments)) {
      lastTrackedRef.current = routePath;
      return;
    }

    lastTrackedRef.current = routePath;

    const title = formatRouteScreenTitle(routePath);
    trackScreen(title, {
      route_path: routePath,
      route_segments: segmentKey || undefined,
    });
  }, [
    isEnabled,
    isInstallReady,
    routePath,
    segmentKey,
    segments,
    trackScreen,
  ]);

  return null;
}
