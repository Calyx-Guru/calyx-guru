import { AppAppearanceContext } from '@/contexts/AppAppearanceContext';
import i18n from '@/lib/i18n/config';
import { ColorType, SizeType } from '@/types';
import { PropsWithChildren, useContext } from 'react';
import { Text } from 'react-native';

type HeadingTextProps = {
  color?: ColorType;
  size?: SizeType;
  translate?: boolean;
  style?: object;
};

export function HeadingText({
  children,
  color = 'primary',
  size = 'xl',
  translate = true,
  style,
}: PropsWithChildren<HeadingTextProps>) {
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
      style={[
        {
          fontFamily: fontRegistryToUse.heading,
          fontSize: fontSize[size],
          color: colors[color],
        },
        style,
      ]}
    >
      {translate
        ? i18n.t(children as string, {
            lng: fontsLoaded ? undefined : fallbackLocale,
          })
        : children}
    </Text>
  );
}
