import { AppAppearanceContext } from '@/contexts/AppAppearanceContext';
import i18n from '@/lib/i18n/config';
import { ColorType, SizeType } from '@/types';
import { useContext } from 'react';
import {
  TextInput as RNTextInput,
  StyleSheet,
  Text,
  TextInputProps,
  View,
} from 'react-native';

type ThemedTextInputProps = TextInputProps & {
  label?: string;
  placeholder?: string;
  error?: string;
  labelColor?: ColorType;
  labelSize?: SizeType;
  inputColor?: ColorType;
  translateLabel?: boolean;
  translatePlaceholder?: boolean;
  helperText?: string;
};

export function TextInput({
  label,
  placeholder,
  error,
  helperText,
  labelColor = 'light',
  labelSize = 'md',
  inputColor = 'dark',
  translateLabel = true,
  translatePlaceholder = true,
  ...props
}: ThemedTextInputProps) {
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

  const translatedLabel = translateLabel
    ? i18n.t(label || '', {
        lng: fontsLoaded ? undefined : fallbackLocale,
      })
    : label;

  const translatedPlaceholder = translatePlaceholder
    ? i18n.t(placeholder || '', {
        lng: fontsLoaded ? undefined : fallbackLocale,
      })
    : placeholder;

  return (
    <View style={styles.container}>
      {label && (
        <Text
          style={{
            fontFamily: fontRegistryToUse.body,
            fontSize: fontSize[labelSize],
            color: colors[labelColor],
            marginBottom: spacing.dense.sm,
          }}
        >
          {translatedLabel}
        </Text>
      )}
      <RNTextInput
        style={[
          styles.input,
          {
            borderColor: error ? colors.danger : colors.border,
            backgroundColor: colors.input,
            color: colors[inputColor],
            fontFamily: fontRegistryToUse.body,
            fontSize: fontSize.md,
            paddingHorizontal: spacing.layout.md,
            paddingVertical: spacing.layout.sm,
          },
        ]}
        placeholderTextColor={colors.grey}
        placeholder={translatedPlaceholder}
        {...props}
      />
      {error && (
        <Text
          style={{
            fontFamily: fontRegistryToUse.body,
            fontSize: fontSize.xs,
            color: colors.danger,
            marginTop: spacing.dense.xs,
          }}
        >
          {error}
        </Text>
      )}
      {helperText && !error && (
        <Text
          style={{
            fontFamily: fontRegistryToUse.body,
            fontSize: fontSize.xs,
            color: colors.grey,
            marginTop: spacing.dense.xs,
          }}
        >
          {helperText}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
  },
});
