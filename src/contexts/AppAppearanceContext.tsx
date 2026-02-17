import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useEffect, useMemo, useState } from 'react';
import { Appearance, Platform } from 'react-native';

import {
  DEFAULT_LANGUAGE,
  STORAGE_LOCALE_STORE_KEY,
  STORAGE_THEME_STORE_KEY,
} from '@/constants';
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
  const [themeMode, setThemeModeState] = useState<ThemeMode>('system');
  const [locale, setLocaleState] = useState<LanguageKey>(DEFAULT_LANGUAGE);
  const [fontsLoaded, setFontsLoaded] = useState(false);

  const systemTheme = Appearance.getColorScheme() ?? 'dark';

  useEffect(() => {
    AsyncStorage.multiGet([
      STORAGE_THEME_STORE_KEY,
      STORAGE_LOCALE_STORE_KEY,
    ]).then((entries) => {
      const theme = entries[0][1];
      const loc = entries[1][1];
      const savedLocale =
        (loc as LanguageKey) ||
        mapDeviceLocaleToLanguageKey() ||
        DEFAULT_LANGUAGE;
      setThemeModeState((theme as ThemeMode) || 'system');
      setLocaleState(savedLocale);
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

      setThemeMode: async (mode) => {
        setThemeModeState(mode);
        await AsyncStorage.setItem(STORAGE_THEME_STORE_KEY, mode);
      },

      setLocale: async (loc) => {
        setLocaleState(loc);
        await AsyncStorage.setItem(STORAGE_LOCALE_STORE_KEY, loc);
        await initializeI18n(loc);
      },
    }),
    [locale, resolvedTheme, fontsLoaded],
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
