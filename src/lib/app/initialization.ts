import {
  DEFAULT_LANGUAGE,
  FORTUNE_POEMS_STORAGE_FOLDER,
  MASTER_DATA_MANIFEST_FILE_NAME,
  STORAGE_BUCKET,
} from '@/constants';
import {
  initializeI18n,
  mapDeviceLocaleToLanguageKey,
} from '@/lib/i18n/config';
import { ensureFonts } from '@/theme/fonts';
import { LanguageKey } from '@/types';
import { MasterDataManifest } from '@/types/MasterDataManifest';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEFAULT_MASTER_DATA_MANIFEST } from '../../../admin/src/constants/MasterData';
import supabase from '../supabase/client';

const STORAGE_LOCALE_STORE_KEY = 'appearance_locale';

/**
 * Initialize the entire app
 * This function runs while the splash screen is displayed
 */
export async function initializeApp(): Promise<void> {
  try {
    // Run all initialization tasks in parallel for better performance
    await Promise.all([initializeLocale(), loadMasterData()]);
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
 * Load master data from Supabase storage and update local storage if needed
 */
async function loadMasterData(): Promise<void> {
  try {
    // Load masterdata manifest file
    const { data, error: downloadError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .download(MASTER_DATA_MANIFEST_FILE_NAME);

    if (downloadError || !data) {
      throw downloadError || new Error('No data received');
    }

    const remoteManifestText = await data.text();
    const remoteManifest: MasterDataManifest = JSON.parse(remoteManifestText);

    // Load local manifest file
    const localManifestText = await AsyncStorage.getItem(
      MASTER_DATA_MANIFEST_FILE_NAME,
    );
    const localManifest: MasterDataManifest = localManifestText
      ? JSON.parse(localManifestText)
      : DEFAULT_MASTER_DATA_MANIFEST;

    await Promise.all([
      updateData(
        localManifest.fortunePoems.languages,
        remoteManifest.fortunePoems.languages,
        FORTUNE_POEMS_STORAGE_FOLDER,
      ),
    ]);

    // Save updated local manifest
    await AsyncStorage.setItem(
      MASTER_DATA_MANIFEST_FILE_NAME,
      JSON.stringify(localManifest),
    );
  } catch (error) {
    console.error('Error loading master data:', error);
  }
}

async function updateData(
  localVersions: Record<LanguageKey, number>,
  remoteVersions: Record<LanguageKey, number>,
  storageFolder: string,
): Promise<void> {
  try {
    const languagesToUpdate: LanguageKey[] = [];
    for (const [language, remoteTimestamp] of Object.entries(
      remoteVersions,
    ) as [LanguageKey, number][]) {
      const localTimestamp = localVersions[language];
      if (!localTimestamp || remoteTimestamp > localTimestamp) {
        languagesToUpdate.push(language);
      }
    }

    if (languagesToUpdate.length === 0) {
      console.log(`No updates needed for ${storageFolder}`);
      return;
    }

    console.log(
      `Updating data in ${storageFolder} for languages:`,
      languagesToUpdate,
    );
    for (const language of languagesToUpdate) {
      const version = remoteVersions[language];
      const fileName = `${storageFolder}/${language}-${version}.json`;
      const { data, error: downloadError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .download(fileName);
      if (downloadError || !data) {
        console.error(`Error downloading ${fileName}:`, downloadError);
        continue;
      }
      const fileText = await data.text();
      await AsyncStorage.setItem(fileName, fileText);
      // Update local manifest timestamp
      localVersions[language] = remoteVersions[language];
    }
  } catch (error) {
    console.error(`Error loading ${storageFolder}:`, error);
  }
}
