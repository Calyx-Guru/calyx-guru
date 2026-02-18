import { DEFAULT_LANGUAGE, STORAGE_LOCALE_STORE_KEY } from '@/constants';
import {
  initializeI18n,
  mapDeviceLocaleToLanguageKey,
} from '@/lib/i18n/config';
import supabase from '@/lib/supabase/client';
import { ensureFonts } from '@/theme/fonts';
import { LanguageKey } from '@/types';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Initialize the entire app
 * This function runs while the splash screen is displayed
 */
export async function initializeApp(): Promise<void> {
  try {
    // Run all initialization tasks in parallel for better performance
    await Promise.all([initializeLocale(), initializeSupabaseConnection()]);
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
 * Initialize and verify Supabase connection
 */
async function initializeSupabaseConnection(): Promise<void> {
  try {
    // Check if we can connect to Supabase and verify auth status
    const { data, error } = await supabase.auth.getSession();

    if (error) {
      console.warn('Supabase connection warning:', error.message);
      return;
    }

    const session = data?.session;

    // Check if session exists and token is not expired
    if (session) {
      const expiresAt = session.expires_at;
      const now = Math.floor(Date.now() / 1000);

      if (expiresAt && expiresAt < now) {
        console.warn('Session token expired, attempting refresh');
        // Try to refresh the session
        const { error: refreshError } = await supabase.auth.refreshSession();
        if (refreshError) {
          console.warn('Failed to refresh session:', refreshError.message);
        }
      }
    }

    console.log('Supabase connection initialized successfully');
  } catch (error) {
    console.error('Supabase connection error:', error);
    // Continue even if Supabase check fails
  }
}
