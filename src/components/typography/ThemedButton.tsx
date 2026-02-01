import { AppAppearanceContext } from '@/contexts/AppAppearanceContext';
import i18n from '@/lib/i18n/config';
import { ColorType, SizeType } from '@/types';
import { PropsWithChildren, useContext } from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';

type ThemedButtonProps = {
  size?: SizeType;
  background?: ColorType;
  border?: ColorType;
  labelColor?: ColorType;
  labelSize?: SizeType;
  translate?: boolean;
  onPress?: () => void;
};

export function ThemedButton({
  children,
  onPress = () => {},
  size = 'xs',
  background = 'primary',
  border = 'light',
  labelColor = 'light',
  labelSize = 'md',
  translate = true,
}: PropsWithChildren<ThemedButtonProps>) {
  const {
    colors,
    spacing,
    fallbackLocale,
    fontRegistry,
    fallbackFontRegistry,
    fontsLoaded,
    fontSize,
  } = useContext(AppAppearanceContext);

  const fontRegistryToUse = fontsLoaded ? fontRegistry : fallbackFontRegistry;

  // If font is not loaded, use the fallback locale to translate
  return (
    <TouchableOpacity
      style={[
        styles.button,
        {
          backgroundColor: colors[background],
          borderColor: colors[border],
          minWidth: spacing.buttonWidth[size],
          minHeight: spacing.buttonHeight[size],
        },
      ]}
      onPress={onPress}
    >
      <Text
        style={{
          fontFamily: fontRegistryToUse.accent,
          fontSize: fontSize[labelSize],
          color: colors[labelColor],
        }}
      >
        {translate
          ? i18n.t(children as string, {
              lng: fontsLoaded ? undefined : fallbackLocale,
            })
          : children}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
    borderStyle: 'solid',
    borderWidth: 1,
  },
});
