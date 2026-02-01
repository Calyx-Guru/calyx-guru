import { AppAppearanceContext } from '@/contexts/AppAppearanceContext';
import i18n from '@/lib/i18n/config';
import { ColorType } from '@/theme/colors';
import { FontSizeType } from '@/theme/fonts';
import { PropsWithChildren, useContext } from 'react';
import { Text } from 'react-native';

type AccentTextProps = {
  color?: ColorType;
  size?: FontSizeType;
  translate?: boolean;
};

export function AccentText({
  children,
  color = 'primary',
  size = 'md',
  translate = true,
}: PropsWithChildren<AccentTextProps>) {
  const {
    colors,
    fallbackLocale,
    fontRegistry,
    fallbackFontRegistry,
    fontsLoaded,
    fontSize,
  } = useContext(AppAppearanceContext);

  const fontRegistryToUse = fontsLoaded ? fontRegistry : fallbackFontRegistry;

  // If font is not loaded, use the fallback locale to translate
  return (
    <Text
      style={{
        fontFamily: fontRegistryToUse.accent,
        fontSize: fontSize[size],
        color: colors[color],
      }}
    >
      {translate
        ? i18n.t(children as string, {
            lng: fontsLoaded ? undefined : fallbackLocale,
          })
        : children}
    </Text>
  );
}
