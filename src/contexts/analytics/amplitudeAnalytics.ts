import * as Amplitude from '@amplitude/analytics-react-native';
import { Identify, Types } from '@amplitude/analytics-react-native';
import { useCallback, useEffect } from 'react';

import {
  cohortPropsFromInstall,
  type InstallWindowState,
} from './installWindow';
import type { AnalyticsActions, AnalyticsEventProps } from './types';

export type AmplitudeAnalyticsConfig = {
  apiKey: string;
  debugMode?: boolean;
};

let amplitudeInitForKey: string | null = null;

function ensureAmplitudeInit(apiKey: string, debugMode: boolean) {
  if (amplitudeInitForKey === apiKey) {
    return;
  }
  Amplitude.init(apiKey, undefined, {
    logLevel: debugMode ? Types.LogLevel.Verbose : Types.LogLevel.Warn,
  });
  amplitudeInitForKey = apiKey;
}

export function useAmplitudeAnalytics(
  config: AmplitudeAnalyticsConfig | null,
  installState: InstallWindowState,
): AnalyticsActions {
  const apiKey = config?.apiKey?.trim() ?? '';
  const debugMode = config?.debugMode ?? false;
  const isEnabled = Boolean(apiKey);
  const { install, isInstallReady, isNewInstall, firstOpenAt } = installState;

  useEffect(() => {
    if (!isEnabled || !apiKey) {
      return;
    }
    ensureAmplitudeInit(apiKey, debugMode);
  }, [apiKey, debugMode, isEnabled]);

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
      Amplitude.track(eventName, {
        ...cohortPropsFromInstall(install),
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

  return {
    track,
    trackScreen,
    identify,
    setUserProperties,
    setUserPropertiesOnce,
    reset,
  };
}
