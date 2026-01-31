import { AppAppearanceContext } from '@/contexts/AppAppearanceContext';
import i18n from '@/lib/i18n/config';
import { PropsWithChildren, useContext } from 'react';
import { Text } from 'react-native';

type BodyTextProps = {
  translate?: boolean;
};

export function BodyText({
  children,
  translate = true,
}: PropsWithChildren<BodyTextProps>) {
  const { fallbackLocale, fontRegistry, fallbackFontRegistry, fontsLoaded } =
    useContext(AppAppearanceContext);

  const fontRegistryToUse = fontsLoaded ? fontRegistry : fallbackFontRegistry;

  // If font is not loaded, use the fallback locale to translate
  return (
    <Text style={{ fontFamily: fontRegistryToUse.body }}>
      {translate
        ? i18n.t(children as string, {
            lng: fontsLoaded ? undefined : fallbackLocale,
          })
        : children}
    </Text>
  );
}
