import {
  STORAGE_ANALYTICS_FIRST_OPEN_AT_KEY,
  STORAGE_GUEST_MODE_KEY,
  STORAGE_GOOGLE_PLAY_PATH_BY_ACCOUNT_PREFIX,
  STORAGE_GOOGLE_PLAY_USER_ID_KEY,
  STORAGE_THEME_KEY,
  STORAGE_USER_EMAIL_KEY,
} from '@/constants/common';
import { ENV } from '@/constants/env';
import {
  fromGooglePlayUserId,
  signOutGooglePlay,
} from '@/lib/auth/googlePlaySignIn';
import { storage } from '@/lib/storage';
import supabase from '@/lib/supabase/client';

const DEVICE_INSTALL_ID_KEY = 'calyx_device_install_id';
const USER_PROFILE_STORAGE_KEY = 'userProfile';
const USER_STATE_STORAGE_KEY = 'userState';
const FORTUNE_TELLINGS_HISTORY_KEY = 'fortuneTellingsHistory';

const GAME_ANALYTICS_STORE_SUFFIXES = [
  'ga_event',
  'ga_session',
  'ga_progression',
  'ga_items',
] as const;

function toGameAnalyticsPersistedKey(logicalKey: string): string {
  return logicalKey.replace(/::/g, '__').replace(/[^a-zA-Z0-9._-]/g, '_');
}

function getSupabaseAuthStorageKeys(): string[] {
  const url = ENV.SUPABASE_URL?.trim();
  if (!url) return [];

  try {
    const projectRef = new URL(url).hostname.split('.')[0];
    if (!projectRef) return [];
    return [`sb-${projectRef}-auth-token`];
  } catch {
    return [];
  }
}

function getGameAnalyticsStorageKeys(): string[] {
  const gameKey = ENV.GAME_ANALYTICS_GAME_KEY?.trim();
  if (!gameKey) return [];

  return GAME_ANALYTICS_STORE_SUFFIXES.map((suffix) =>
    toGameAnalyticsPersistedKey(`GA::${gameKey}::${suffix}`),
  );
}

function getStaticAppStorageKeys(): string[] {
  return [
    STORAGE_THEME_KEY,
    STORAGE_ANALYTICS_FIRST_OPEN_AT_KEY,
    STORAGE_GUEST_MODE_KEY,
    STORAGE_GOOGLE_PLAY_USER_ID_KEY,
    STORAGE_USER_EMAIL_KEY,
    DEVICE_INSTALL_ID_KEY,
    USER_PROFILE_STORAGE_KEY,
    USER_STATE_STORAGE_KEY,
    FORTUNE_TELLINGS_HISTORY_KEY,
    ...getSupabaseAuthStorageKeys(),
    ...getGameAnalyticsStorageKeys(),
  ];
}

async function getGooglePlayPathMappingKeys(): Promise<string[]> {
  const userId = await storage.getItem(STORAGE_GOOGLE_PLAY_USER_ID_KEY);
  const accountId = fromGooglePlayUserId(userId);
  if (!accountId) return [];
  return [`${STORAGE_GOOGLE_PLAY_PATH_BY_ACCOUNT_PREFIX}${accountId}`];
}

/** All storage keys the app may write (best-effort; dynamic keys need explicit tracking). */
export async function getAllKnownAppStorageKeys(): Promise<string[]> {
  return [
    ...new Set([
      ...getStaticAppStorageKeys(),
      ...(await getGooglePlayPathMappingKeys()),
    ]),
  ];
}

/**
 * Removes persisted app data from SecureStore / localStorage.
 * Dev-only: no-op in production builds.
 */
export async function clearAllLocalAppStorage(): Promise<string[]> {
  if (!__DEV__) {
    return [];
  }

  const keys = await getAllKnownAppStorageKeys();

  if (typeof localStorage !== 'undefined') {
    localStorage.clear();
  } else {
    await Promise.all(
      keys.map((key) =>
        storage.removeItem(key).catch((error) => {
          console.warn(`Failed to remove storage key "${key}":`, error);
        }),
      ),
    );
  }

  try {
    await supabase.auth.signOut({ scope: 'local' });
  } catch (error) {
    console.warn('Supabase local sign-out during storage clear:', error);
  }

  try {
    await signOutGooglePlay();
  } catch (error) {
    console.warn('Google Play sign-out during storage clear:', error);
  }

  return keys;
}
