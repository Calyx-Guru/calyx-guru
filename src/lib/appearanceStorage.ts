import { DEFAULT_LANGUAGE, STORAGE_THEME_KEY } from '@/constants';
import { mapDeviceLocaleToLanguageKey } from '@/lib/i18n/config';
import { storage } from '@/lib/storage';
import { LanguageKey, ThemeMode } from '@/types';

const LEGACY_THEME_KEY = 'appearance_theme';
const LEGACY_LOCALE_KEY = 'appearance_locale';

export type StoredAppearance = {
  themeMode: ThemeMode;
  locale: LanguageKey;
};

export const DEFAULT_STORED_APPEARANCE: StoredAppearance = {
  themeMode: 'system',
  locale: DEFAULT_LANGUAGE,
};

function parseStoredAppearance(raw: string | null): StoredAppearance | null {
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<StoredAppearance>;
    return {
      themeMode: (parsed.themeMode as ThemeMode) ?? DEFAULT_STORED_APPEARANCE.themeMode,
      locale: (parsed.locale as LanguageKey) ?? DEFAULT_STORED_APPEARANCE.locale,
    };
  } catch {
    return null;
  }
}

export async function loadStoredAppearance(): Promise<StoredAppearance> {
  const combined = parseStoredAppearance(await storage.getItem(STORAGE_THEME_KEY));
  if (combined) {
    return combined;
  }

  const [themeEntry, localeEntry] = await storage.multiGet([
    LEGACY_THEME_KEY,
    LEGACY_LOCALE_KEY,
  ]);
  const themeMode =
    (themeEntry[1] as ThemeMode) || DEFAULT_STORED_APPEARANCE.themeMode;
  const locale =
    (localeEntry[1] as LanguageKey) ||
    mapDeviceLocaleToLanguageKey() ||
    DEFAULT_LANGUAGE;

  const migrated: StoredAppearance = { themeMode, locale };
  await storage.setItem(STORAGE_THEME_KEY, JSON.stringify(migrated));
  return migrated;
}

export async function saveStoredAppearance(
  appearance: StoredAppearance,
): Promise<void> {
  await storage.setItem(STORAGE_THEME_KEY, JSON.stringify(appearance));
}
