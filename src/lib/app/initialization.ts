import { DEFAULT_LANGUAGE } from '@/constants';
import {
  initializeI18n,
  mapDeviceLocaleToLanguageKey,
} from '@/lib/i18n/config';
import supabase from '@/lib/supabase/client';
import { ensureFonts } from '@/theme/fonts';
import { LanguageKey } from '@/types';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_LOCALE_STORE_KEY = 'appearance_locale';

/**
 * Initialize the entire app
 * This function runs while the splash screen is displayed
 */
export async function initializeApp(): Promise<void> {
  try {
    // Run all initialization tasks in parallel for better performance
    await Promise.all([initializeLocale(), initializeAuth()]);
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
    // Get saved locale or auto-detect device language
    const savedLocale = await AsyncStorage.getItem(STORAGE_LOCALE_STORE_KEY);
    const locale: LanguageKey =
      (savedLocale as LanguageKey) ||
      mapDeviceLocaleToLanguageKey() ||
      undefined;

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

/**
 * Initialize authentication
 * This checks if user is already logged in
 */
async function initializeAuth(): Promise<void> {
  try {
    const { data } = await supabase.auth.getSession();
    if (data.session) {
      console.log('User is already logged in:', data.session.user.email);
    } else {
      console.log('No user logged in');
    }
  } catch (error) {
    console.error('Auth initialization error:', error);
    // Continue without throwing - auth context will handle state
  }
}
