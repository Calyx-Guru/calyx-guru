import {
  LOCALIZATION_FILE_NAME,
  MASTER_DATA_MANIFEST_FILE_NAME,
  STORAGE_BUCKET,
  SUPPORTED_LANGUAGES,
} from '@/constants';
import { MasterDataManifest } from '@/types';
import { LocalizationTranslationType } from '@/types/Localization';
import { createClient } from '@supabase/supabase-js';
import { Argument, Command } from 'commander';
import dotenv from 'dotenv';
import fs from 'fs/promises';
import path from 'path';

// Load environment variables from .env and .env.local (local overrides)
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({
  path: path.resolve(process.cwd(), '.env.local'),
  override: true,
});

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function loginSupabase() {
  await supabase.auth.signInWithPassword({
    email: process.env.DASHBOARD_ADMIN_EMAIL || '',
    password: process.env.DASHBOARD_ADMIN_PASSWORD || '',
  });
}

async function loadManifest(): Promise<MasterDataManifest | null> {
  console.log(
    `📥 Loading manifest from ${STORAGE_BUCKET}/${MASTER_DATA_MANIFEST_FILE_NAME}...`,
  );
  try {
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .download(MASTER_DATA_MANIFEST_FILE_NAME);

    if (error) {
      return null;
    } else {
      const manifestText = await data.text();
      const manifest: MasterDataManifest = JSON.parse(manifestText);
      return manifest;
    }
  } catch (error) {
    console.error('Error fetching manifest:', error);
  }

  return null;
}

async function versionUpManifest(): Promise<MasterDataManifest | null> {
  // Download the manifest to get the current version number (or use a default version if manifest doesn't exist)
  let manifest = await loadManifest();
  if (!manifest) {
    return null;
  }

  // Update the manifest version
  console.log(`Updating manifest version ...`);

  manifest.localization.version = (manifest?.localization.version || 0) + 1;
  manifest.localization.lastUpdated = new Date().toISOString();

  return manifest;
}

async function uploadManifest(updatedManifest: MasterDataManifest) {
  // Upload the updated manifest back to Supabase storage
  return supabase.storage
    .from(STORAGE_BUCKET)
    .upload(
      MASTER_DATA_MANIFEST_FILE_NAME,
      JSON.stringify(updatedManifest, null, 2),
      {
        contentType: 'application/json',
        upsert: true,
      },
    );
}

async function upload(): Promise<void> {
  await loginSupabase();

  const manifest = await versionUpManifest();
  if (!manifest) {
    console.error('Failed to update manifest version. Aborting upload.');
    return;
  }

  const { version } = manifest.localization;

  console.log(
    'Uploading translation data to Supabase storage, target:',
    `${LOCALIZATION_FILE_NAME}-${version}.json`,
  );

  const localizationData: Record<string, LocalizationTranslationType> = {};

  for (const language of SUPPORTED_LANGUAGES) {
    const content = await fs.readFile(
      path.join(process.cwd(), 'src', 'locales', language, 'translation.json'),
      'utf-8',
    );
    const translationData = JSON.parse(content);

    // traverse through the translation data and flatten it to dot notation keys
    const flattenObject = (obj: any, prefix = ''): Record<string, string> => {
      return Object.keys(obj).reduce(
        (acc, key) => {
          const value = obj[key];
          const newKey = prefix ? `${prefix}.${key}` : key;
          if (typeof value === 'object' && value !== null) {
            Object.assign(acc, flattenObject(value, newKey));
          } else {
            acc[newKey] = value;
          }
          return acc;
        },
        {} as Record<string, string>,
      );
    };

    for (const [key, value] of Object.entries(flattenObject(translationData))) {
      if (!localizationData[key]) {
        localizationData[key] = {
          key,
          translations: {
            en: '',
            ja: '',
            vi: '',
            ko: '',
            'zh-CN': '',
            'zh-TW': '',
          },
        };
      }

      localizationData[key].translations[language] = value;
    }
  }

  // Upload the localization data to Supabase storage (you can choose to upload as a JSON file or directly to a database table)
  const uploadContent = JSON.stringify(
    Object.values(localizationData),
    null,
    2,
  );
  const { error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(`${LOCALIZATION_FILE_NAME}-${version}.json`, uploadContent, {
      contentType: 'application/json',
      upsert: true,
    });

  if (error) {
    throw error;
  }

  await uploadManifest(manifest);
  console.log('✓ Successfully uploaded localization data and updated manifest');
}

async function download(): Promise<void> {
  // Download the manifest to get the current version number (or use a default version if manifest doesn't exist)
  let version = 1;
  const manifest = await loadManifest();
  if (manifest) {
    version = manifest.localization.version;
  }

  console.log(
    'Downloading translation data from Supabase storage, target:',
    `${LOCALIZATION_FILE_NAME}-${version}.json`,
  );

  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .download(`${LOCALIZATION_FILE_NAME}-${version}.json`);

  if (error) {
    console.error('Error downloading localization data:', error);
    throw error;
  }

  const localizationText = await data.text();
  const localizationData: LocalizationTranslationType[] =
    JSON.parse(localizationText);

  for (const language of SUPPORTED_LANGUAGES) {
    const languageData: any = {};
    for (const item of localizationData) {
      // break the dot notation keys into nested objects
      const keys = item.key.split('.');
      let current = languageData;
      for (let i = 0; i < keys.length - 1; i++) {
        const key = keys[i];
        if (!current[key]) {
          current[key] = {};
        }
        current = current[key];
      }
      current[keys[keys.length - 1]] = item.translations[language];
    }

    // Write the language-specific data to a file
    const languageFilePath = path.join(
      process.cwd(),
      'src',
      'locales',
      language,
      'translation.json',
    );
    await fs.writeFile(
      languageFilePath,
      JSON.stringify(languageData, null, 2),
      'utf-8',
    );
    console.log(
      `✓ Downloaded translations for ${language} to ${languageFilePath}`,
    );
  }
}

const program = new Command();

program
  .name('sync-translation')
  .description(
    'Sync translation data from Supabase storage to local src/masterdata folder',
  )
  .version('1.0.0');

program
  .addArgument(
    new Argument('<action>', 'Action to perform')
      .choices(['download', 'upload'])
      .default('download'),
  )
  .action(async (action: string) => {
    try {
      if (action === 'download') {
        await download();
      } else if (action === 'upload') {
        await upload();
      } else {
        throw new Error(`Unknown action: ${action}`);
      }
    } catch (error) {
      console.error('Error syncing translation data:', error);
    }
  });

program.parse(process.argv);
