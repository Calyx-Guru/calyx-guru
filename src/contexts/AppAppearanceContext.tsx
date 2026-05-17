import React, {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Appearance, Platform } from 'react-native';

import { DEFAULT_LANGUAGE } from '@/constants';
import {
  DEFAULT_STORED_APPEARANCE,
  loadStoredAppearance,
  saveStoredAppearance,
  type StoredAppearance,
} from '@/lib/appearanceStorage';
import {
  initializeI18n,
  mapDeviceLocaleToLanguageKey,
} from '@/lib/i18n/config';
import colors, { ThemeColorType } from '@/theme/colors';
import {
  ensureFonts,
  fontRegistry,
  FontRegistryType,
  fontSizes,
} from '@/theme/fonts';
import { layoutProfiles } from '@/theme/layout';
import { spacing, SpacingType } from '@/theme/spacing';
import { LanguageKey, SizeType, ThemeMode } from '@/types';

type AppAppearance = {
  platform: typeof Platform.OS;
  locale: LanguageKey;
  fallbackLocale: LanguageKey;
  themeMode: ThemeMode;
  resolvedTheme: ThemeMode;

  colors: ThemeColorType;
  fontRegistry: FontRegistryType;
  fallbackFontRegistry: FontRegistryType;
  fontSize: Record<SizeType, number>;
  spacing: SpacingType;
  lineHeightScale: number;
  fontsLoaded: boolean;

  setThemeMode: (mode: ThemeMode) => void;
  setLocale: (locale: LanguageKey) => void;
};

export const AppAppearanceContext = createContext<AppAppearance>({
  platform: Platform.OS,
  locale: DEFAULT_LANGUAGE,
  fallbackLocale: DEFAULT_LANGUAGE,
  themeMode: 'system',
  resolvedTheme: 'dark',
  colors: colors['dark'],
  fontRegistry: fontRegistry[DEFAULT_LANGUAGE],
  fallbackFontRegistry: fontRegistry[DEFAULT_LANGUAGE],
  fontSize: fontSizes[DEFAULT_LANGUAGE],
  spacing,
  lineHeightScale: 1,
  fontsLoaded: false,

  setThemeMode: () => {},
  setLocale: () => {},
});

export function AppAppearanceProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [appearance, setAppearance] = useState<StoredAppearance>(
    DEFAULT_STORED_APPEARANCE,
  );
  const [fontsLoaded, setFontsLoaded] = useState(false);

  const { themeMode, locale } = appearance;
  const systemTheme = Appearance.getColorScheme() === 'dark' ? 'dark' : 'light';

  useEffect(() => {
    loadStoredAppearance().then((stored) => {
      setAppearance({
        themeMode: stored.themeMode,
        locale:
          stored.locale ||
          mapDeviceLocaleToLanguageKey() ||
          DEFAULT_LANGUAGE,
      });
    });
  }, []);

  const resolvedTheme = themeMode === 'system' ? systemTheme : themeMode;
  const langKey = locale || DEFAULT_LANGUAGE;

  const layout = layoutProfiles[langKey];
  const resolvedFontRegistry = fontRegistry[langKey];

  const resolvedSpacing: SpacingType = useMemo(() => {
    return {
      layout: spacing.layout,
      text: Object.fromEntries(
        Object.entries(spacing.text).map(([key, value]) => [
          key,
          Math.round(value * layout.textSpacingMultiplier),
        ]),
      ) as SpacingType['text'],
      dense: spacing.dense,
      buttonWidth: spacing.buttonWidth,
      buttonHeight: spacing.buttonHeight,
    };
  }, [layout.textSpacingMultiplier]);

  const setThemeMode = useCallback(async (mode: ThemeMode) => {
    setAppearance((prev) => {
      const next = { ...prev, themeMode: mode };
      void saveStoredAppearance(next);
      return next;
    });
  }, []);

  const setLocale = useCallback(async (loc: LanguageKey) => {
    setAppearance((prev) => {
      const next = { ...prev, locale: loc };
      void saveStoredAppearance(next);
      return next;
    });
    await initializeI18n(loc);
  }, []);

  const value = useMemo<AppAppearance>(
    () => ({
      platform: Platform.OS,
      locale,
      fallbackLocale: DEFAULT_LANGUAGE,
      themeMode,
      resolvedTheme,
      fontRegistry: resolvedFontRegistry,
      fallbackFontRegistry: fontRegistry[DEFAULT_LANGUAGE],

      colors: colors[resolvedTheme],
      fontSize: fontSizes[langKey],
      spacing: resolvedSpacing,
      lineHeightScale: layout.lineHeightScale,
      fontsLoaded,

      setThemeMode,
      setLocale,
    }),
    [
      locale,
      themeMode,
      resolvedTheme,
      resolvedFontRegistry,
      langKey,
      resolvedSpacing,
      layout.lineHeightScale,
      fontsLoaded,
      setThemeMode,
      setLocale,
    ],
  );

  useEffect(() => {
    setFontsLoaded(false);
    Promise.all([ensureFonts(langKey), initializeI18n(langKey)]).then(() =>
      setFontsLoaded(true),
    );
  }, [langKey]);

  return (
    <AppAppearanceContext.Provider value={value}>
      {children}
    </AppAppearanceContext.Provider>
  );
}

export const useAppAppearance = () => React.useContext(AppAppearanceContext);
