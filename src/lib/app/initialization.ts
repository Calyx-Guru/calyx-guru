import { DEFAULT_LANGUAGE } from '@/constants';
import { loadStoredAppearance } from '@/lib/appearanceStorage';
import { initializeI18n } from '@/lib/i18n/config';
import { ensureFonts } from '@/theme/fonts';
import { LanguageKey } from '@/types';

/**
 * Initialize the entire app
 * This function runs while the splash screen is displayed
 */
export async function initializeApp(): Promise<void> {
  try {
    // Run all initialization tasks in parallel for better performance
    await Promise.all([initializeLocale()]);
  } catch (error) {
    console.error('App initialization error:', error);
    // Continue even if initialization fails - app will still work with defaults
  }
}

/**
 * Initialize locale and fonts
 */
async function initializeLocale(): Promise<void> {
  try {
    const { locale: savedLocale } = await loadStoredAppearance();
    const locale: LanguageKey = savedLocale || DEFAULT_LANGUAGE;

    // Load fonts and initialize i18n in parallel
    await Promise.all([
      ensureFonts(DEFAULT_LANGUAGE),
      initializeI18n(DEFAULT_LANGUAGE),
      ensureFonts(locale),
      initializeI18n(locale),
    ]);
  } catch (error) {
    console.error('Locale initialization error:', error);
    // Fallback to default language
    await Promise.all([
      ensureFonts(DEFAULT_LANGUAGE),
      initializeI18n(DEFAULT_LANGUAGE),
    ]);
  }
}
