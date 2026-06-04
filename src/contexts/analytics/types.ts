export type AnalyticsProviderName = 'amplitude' | 'game-analytics';

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

export type AnalyticsActions = {
  track: (eventName: string, eventProperties?: AnalyticsEventProps) => void;
  trackScreen: (screenName: string, properties?: AnalyticsEventProps) => void;
  identify: (userId: string | undefined) => void;
  setUserProperties: (properties: AnalyticsEventProps) => void;
  setUserPropertiesOnce: (properties: AnalyticsEventProps) => void;
  reset: () => void;
};

export type AnalyticsContextValue = {
  provider: AnalyticsProviderName;
  isEnabled: boolean;
  install: InstallWindow;
  /** True after first-open timestamp has been read from storage (or set on first launch). */
  isInstallReady: boolean;
  /** True when the active provider can accept events (GA: after init session started). */
  isSessionReady: boolean;
} & AnalyticsActions;

export const defaultInstall: InstallWindow = {
  daySinceInstall: 0,
  isInFirst14Days: true,
  firstOpenAt: null,
};

export const noop = () => {};

/** Stable no-op implementations when credentials are unset. */
export const disabledAnalyticsActions: AnalyticsActions = {
  track: noop,
  trackScreen: noop,
  identify: noop,
  setUserProperties: noop,
  setUserPropertiesOnce: noop,
  reset: noop,
};
