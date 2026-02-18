import { AppAppearanceContext } from '@/contexts/AppAppearanceContext';
import i18n from '@/lib/i18n/config';
import { ColorType, SizeType } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { useContext, useState } from 'react';
import {
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
    ViewProps,
} from 'react-native';

type SelectOption = {
  label: string;
  value: string | number;
};

type SelectInputProps = ViewProps & {
  label?: string;
  placeholder?: string;
  error?: string;
  value?: string | number;
  options: SelectOption[];
  onValueChange: (value: string | number) => void;
  labelColor?: ColorType;
  labelSize?: SizeType;
  selectColor?: ColorType;
  placeHolderColor?: ColorType;
  translateLabel?: boolean;
  translatePlaceholder?: boolean;
  translateOptions?: boolean;
  helperText?: string;
};

export function SelectInput({
  label,
  placeholder,
  error,
  helperText,
  value,
  options,
  onValueChange,
  labelColor = 'onBackground',
  labelSize = 'md',
  selectColor = 'onSurface',
  placeHolderColor = 'onSurfaceVariant',
  translateLabel = true,
  translatePlaceholder = true,
  translateOptions = true,
  style,
}: SelectInputProps) {
  const [isModalVisible, setIsModalVisible] = useState(false);
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

  const selectedOption = options.find((opt) => opt.value === value);
  const displayText = selectedOption
    ? translateOptions
      ? i18n.t(selectedOption.label, {
          lng: fontsLoaded ? undefined : fallbackLocale,
        })
      : selectedOption.label
    : translatedPlaceholder;

  const handleSelectOption = (optionValue: string | number) => {
    onValueChange(optionValue);
    setIsModalVisible(false);
  };

  return (
    <View style={[styles.container, style]}>
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
      <Pressable
        style={[
          styles.select,
          {
            borderColor: error ? colors.error : colors.outline,
            backgroundColor: colors.surface,
            paddingHorizontal: spacing.layout.md,
            paddingVertical: spacing.layout.sm,
          },
        ]}
        onPress={() => setIsModalVisible(true)}
      >
        <Text
          style={{
            fontFamily: fontRegistryToUse.body,
            fontSize: fontSize.md,
            color: selectedOption
              ? colors[selectColor]
              : colors[placeHolderColor],
            flex: 1,
          }}
        >
          {displayText}
        </Text>
        <Ionicons name="chevron-down" size={20} color={colors[selectColor]} />
      </Pressable>

      {error && (
        <Text
          style={{
            fontFamily: fontRegistryToUse.body,
            fontSize: fontSize.xs,
            color: colors.error,
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
            color: colors.onSurface,
            marginTop: spacing.dense.xs,
          }}
        >
          {helperText}
        </Text>
      )}

      <Modal
        visible={isModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setIsModalVisible(false)}
        >
          <View
            style={[styles.modalContent, { backgroundColor: colors.surface }]}
          >
            <ScrollView>
              {options.map((option) => (
                <Pressable
                  key={option.value}
                  style={[
                    styles.option,
                    value === option.value && {
                      backgroundColor: colors.primary,
                    },
                  ]}
                  onPress={() => handleSelectOption(option.value)}
                >
                  <Text
                    style={{
                      fontFamily: fontRegistryToUse.body,
                      fontSize: fontSize.md,
                      color:
                        value === option.value
                          ? colors.onPrimary
                          : colors.onSurface,
                    }}
                  >
                    {translateOptions
                      ? i18n.t(option.label, {
                          lng: fontsLoaded ? undefined : fallbackLocale,
                        })
                      : option.label}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: 16,
  },
  select: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    borderRadius: 8,
    maxHeight: 300,
    width: '80%',
    paddingVertical: 8,
  },
  option: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
});
