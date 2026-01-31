import { useTranslation as useReactI18nextTranslation } from 'react-i18next';

/**
 * Wrapper around react-i18next's useTranslation hook
 * Provides typed access to translations
 *
 * Usage:
 * const { t } = useTranslation();
 * <Text>{t('common.welcome')}</Text>
 */
export function useTranslation() {
  return useReactI18nextTranslation();
}
