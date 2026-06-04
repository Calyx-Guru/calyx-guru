import { useEffect, useMemo, useState } from 'react';

import { STORAGE_ANALYTICS_FIRST_OPEN_AT_KEY } from '@/constants';
import { storage } from '@/lib/storage';

import type { InstallWindow } from './types';

const FIRST_14_DAYS = 14;

function utcDayStartMs(d: Date): number {
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
}

export function computeInstallWindow(firstOpenIso: string | null): InstallWindow {
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

export function cohortPropsFromInstall(
  install: InstallWindow,
): Record<string, string | number | boolean> {
  if (!install.firstOpenAt) {
    return {};
  }
  return {
    day_since_install: install.daySinceInstall,
    is_first_14_days: install.isInFirst14Days,
  };
}

export type InstallWindowState = {
  firstOpenAt: string | null;
  isInstallReady: boolean;
  /** True only when this run created the persisted first-open timestamp (new install). */
  isNewInstall: boolean;
  install: InstallWindow;
};

/** Provider-agnostic first-open / cohort window (persisted in app storage). */
export function useInstallWindowState(isEnabled: boolean): InstallWindowState {
  const [firstOpenAt, setFirstOpenAt] = useState<string | null>(null);
  const [isInstallReady, setIsInstallReady] = useState(false);
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

  return { firstOpenAt, isInstallReady, isNewInstall, install };
}
