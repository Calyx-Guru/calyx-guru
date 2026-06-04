import { usePathname, useSegments } from 'expo-router';
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
} from 'react';

import { useAmplitudeAnalytics } from './amplitudeAnalytics';
import { useGameAnalytics } from './gameAnalyticsProvider';
import { useInstallWindowState } from './installWindow';
import {
  defaultInstall,
  disabledAnalyticsActions,
  type AnalyticsActions,
  type AnalyticsContextValue,
  type AnalyticsEventProps,
  type AnalyticsProviderName,
  type InstallWindow,
} from './types';

export type {
  AnalyticsEventProps,
  AnalyticsProviderName,
  InstallWindow,
} from './types';

export type AnalyticsProviderProps = {
  provider: AnalyticsProviderName;
  children: React.ReactNode;
  debugMode?: boolean;
  /** Required when `provider` is `"amplitude"`. */
  amplitudeApiKey?: string;
  /** Required when `provider` is `"game-analytics"`. */
  gameAnalyticsGameKey?: string;
  /** Required when `provider` is `"game-analytics"`. */
  gameAnalyticsSecretKey?: string;
};

const AnalyticsContext = createContext<AnalyticsContextValue>({
  provider: 'amplitude',
  isEnabled: false,
  install: defaultInstall,
  isInstallReady: false,
  isSessionReady: false,
  ...disabledAnalyticsActions,
});

function resolveIsEnabled(props: AnalyticsProviderProps): boolean {
  if (props.provider === 'amplitude') {
    return Boolean(props.amplitudeApiKey?.trim());
  }
  return Boolean(
    props.gameAnalyticsGameKey?.trim() && props.gameAnalyticsSecretKey?.trim(),
  );
}

type AnalyticsProviderBridgeProps = AnalyticsProviderProps & {
  isEnabled: boolean;
};

function AmplitudeAnalyticsBridge({
  children,
  debugMode,
  amplitudeApiKey,
  isEnabled,
}: AnalyticsProviderBridgeProps) {
  const installState = useInstallWindowState(isEnabled);
  const actions = useAmplitudeAnalytics(
    isEnabled && amplitudeApiKey
      ? { apiKey: amplitudeApiKey.trim(), debugMode }
      : null,
    installState,
  );
  const isSessionReady = isEnabled && installState.isInstallReady;

  return (
    <AnalyticsContextProviderInner
      provider="amplitude"
      isEnabled={isEnabled}
      installState={installState}
      isSessionReady={isSessionReady}
      actions={actions}
    >
      {children}
    </AnalyticsContextProviderInner>
  );
}

function GameAnalyticsBridge({
  children,
  debugMode,
  gameAnalyticsGameKey,
  gameAnalyticsSecretKey,
  isEnabled,
}: AnalyticsProviderBridgeProps) {
  const installState = useInstallWindowState(isEnabled);
  const { isSessionReady, ...actions } = useGameAnalytics(
    isEnabled && gameAnalyticsGameKey && gameAnalyticsSecretKey
      ? {
          gameKey: gameAnalyticsGameKey.trim(),
          secretKey: gameAnalyticsSecretKey.trim(),
          debugMode,
        }
      : null,
    installState,
  );
  return (
    <AnalyticsContextProviderInner
      provider="game-analytics"
      isEnabled={isEnabled}
      installState={installState}
      isSessionReady={isSessionReady}
      actions={actions}
    >
      {children}
    </AnalyticsContextProviderInner>
  );
}

function AnalyticsContextProviderInner({
  provider,
  isEnabled,
  installState,
  isSessionReady,
  actions,
  children,
}: {
  provider: AnalyticsProviderName;
  isEnabled: boolean;
  installState: ReturnType<typeof useInstallWindowState>;
  isSessionReady: boolean;
  actions: AnalyticsActions;
  children: React.ReactNode;
}) {
  const value = useMemo<AnalyticsContextValue>(() => {
    if (!isEnabled) {
      return {
        provider,
        isEnabled: false,
        install: defaultInstall,
        isInstallReady: true,
        isSessionReady: false,
        ...disabledAnalyticsActions,
      };
    }
    return {
      provider,
      isEnabled: true,
      install: installState.install,
      isInstallReady: installState.isInstallReady,
      isSessionReady,
      ...actions,
    };
  }, [
    actions,
    installState.install,
    installState.isInstallReady,
    isEnabled,
    isSessionReady,
    provider,
  ]);

  return (
    <AnalyticsContext.Provider value={value}>
      {children}
    </AnalyticsContext.Provider>
  );
}

export function AnalyticsProvider(props: AnalyticsProviderProps) {
  const isEnabled = resolveIsEnabled(props);

  if (props.provider === 'game-analytics') {
    return <GameAnalyticsBridge {...props} isEnabled={isEnabled} />;
  }

  return <AmplitudeAnalyticsBridge {...props} isEnabled={isEnabled} />;
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
  const { trackScreen, isEnabled, isInstallReady, isSessionReady } =
    useAnalytics();
  const lastTrackedRef = useRef<string | null>(null);

  const segmentKey = segments.join('/');
  const routePath =
    pathname && pathname.length > 0 ? pathname : `/${segmentKey}`;

  useEffect(() => {
    if (!isEnabled || !isInstallReady || !isSessionReady) {
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
    isSessionReady,
    routePath,
    segmentKey,
    segments,
    trackScreen,
  ]);

  return null;
}
