import { AppAppearanceContext } from '@/contexts/AppAppearanceContext';
import i18n from '@/lib/i18n/config';
import { ColorType, SizeType } from '@/types';
import { PropsWithChildren, useContext } from 'react';
import { Text } from 'react-native';

type BodyTextProps = {
  color?: ColorType;
  size?: SizeType;
  translate?: boolean;
};

export function BodyText({
  children,
  color = 'primary',
  size = 'md',
  translate = true,
}: PropsWithChildren<BodyTextProps>) {
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
        fontFamily: fontRegistryToUse.body,
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
