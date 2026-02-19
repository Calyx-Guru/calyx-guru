import {
  FORTUNE_POEMS_STORAGE_FOLDER,
  MASTER_DATA_MANIFEST_FILE_NAME,
  STORAGE_BUCKET,
  SUPPORTED_LANGUAGES,
} from '@/constants';
import type { LanguageKey, MasterDataManifest } from '@/types';
import { createClient } from '@supabase/supabase-js';
import { Argument, Command } from 'commander';
import dotenv from 'dotenv';
import fs from 'fs';
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

const supabase = createClient(supabaseUrl, supabaseAnonKey);
const masterDataDir = path.join(process.cwd(), 'src', 'masterdata');

async function ensureDirectoryExists(dir: string): Promise<void> {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`✓ Created directory: ${dir}`);
  }
}

async function downloadManifest(): Promise<MasterDataManifest> {
  console.log(
    `\n📥 Downloading manifest from ${STORAGE_BUCKET}/${MASTER_DATA_MANIFEST_FILE_NAME}...`,
  );

  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .download(MASTER_DATA_MANIFEST_FILE_NAME);

  if (error) {
    throw new Error(`Failed to download manifest: ${error.message}`);
  }

  const manifestText = await data.text();
  const manifest: MasterDataManifest = JSON.parse(manifestText);

  const manifestPath = path.join(masterDataDir, MASTER_DATA_MANIFEST_FILE_NAME);
  await fs.promises.writeFile(
    manifestPath,
    JSON.stringify(manifest, null, 2),
    'utf-8',
  );
  console.log(`✓ Manifest saved to ${manifestPath}`);

  return manifest;
}

async function downloadLanguageFiles(
  versions: {
    [key in LanguageKey]?: number;
  },
  remoteFolder: string,
): Promise<void> {
  console.log(`\n📥 Downloading language files...`);

  const fileData: Record<LanguageKey, any> = {
    en: [],
    ja: [],
    ko: [],
    vi: [],
    'zh-CN': [],
    'zh-TW': [],
  };
  for (const language of SUPPORTED_LANGUAGES) {
    const version = versions[language] || 1;

    const fileName = `${remoteFolder}/${language}-${version}.json`;

    let fileContent = [];
    try {
      const { data, error } = await supabase.storage
        .from(STORAGE_BUCKET)
        .download(fileName);

      if (error) {
        throw error;
      }

      const text = await data.text();
      fileContent = JSON.parse(text);
      console.log(`✓ Downloaded ${language}.json (v${version})`);
    } catch (error) {
      console.error(
        `✗ Failed to download: ${error instanceof Error ? error.message : String(error)}`,
      );
    }

    fileData[language] = fileContent;
  }

  const filePath = path.join(masterDataDir, `${remoteFolder}.json`);
  await fs.promises.writeFile(
    filePath,
    JSON.stringify(fileData, null, 2),
    'utf-8',
  );
}

async function uploadLanguageFiles(
  versions: {
    [key in LanguageKey]?: number;
  },
  remoteFolder: string,
): Promise<void> {
  console.log(`\n📤 Uploading language files...`);

  const filePath = path.join(masterDataDir, `${remoteFolder}.json`);
  const fileContent = await fs.promises.readFile(filePath, 'utf-8');
  const fileData: Record<LanguageKey, any> = JSON.parse(fileContent);

  for (const language of SUPPORTED_LANGUAGES) {
    const version = versions[language] || 1;

    const fileName = `${remoteFolder}/${language}-${version}.json`;

    let fileContent = fileData[language] || [];

    try {
      const { error } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(fileName, JSON.stringify(fileContent, null, 2), {
          contentType: 'application/json',
          upsert: true,
        });

      if (error) {
        throw error;
      }

      console.log(`✓ Uploaded ${fileName} (v${version})`);
    } catch (error) {
      console.error(
        `✗ Failed to upload: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }
}

async function versionUpManifest(): Promise<MasterDataManifest | null> {
  // Download the manifest to get the current version number (or use a default version if manifest doesn't exist)
  let manifest = await loadManifest();
  if (!manifest) {
    return null;
  }

  // Update the manifest version
  console.log(`Updating manifest version...`);

  manifest.fortunePoems.lastUpdated = new Date().toISOString();
  for (const key of SUPPORTED_LANGUAGES) {
    const version = manifest.fortunePoems.languages[key] || 0;
    manifest.fortunePoems.languages[key] = version + 1;
  }

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

  await uploadLanguageFiles(
    manifest.fortunePoems.languages,
    FORTUNE_POEMS_STORAGE_FOLDER,
  );

  await uploadManifest(manifest);
  console.log('✓ Successfully uploaded master data and updated manifest');
}

async function download(): Promise<void> {
  try {
    console.log(`🔄 Syncing Master Data...`);
    console.log(`   Storage: ${STORAGE_BUCKET}`);
    console.log(`   Target: ${masterDataDir}`);

    // Ensure directory exists
    await ensureDirectoryExists(masterDataDir);

    // Download manifest first to get version info
    const manifest = await downloadManifest();

    // Download language files based on manifest
    await downloadLanguageFiles(
      manifest.fortunePoems.languages,
      FORTUNE_POEMS_STORAGE_FOLDER,
    );

    console.log(`\n✅ Master data sync completed successfully!`);
  } catch (error) {
    console.error(
      `\n❌ Error syncing master data:`,
      error instanceof Error ? error.message : String(error),
    );
    process.exit(1);
  }
}

const program = new Command();

program
  .name('sync-master-data')
  .description(
    'Sync master data from Supabase storage to local src/masterdata folder',
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
      console.error('Error syncing master data:', error);
    }
  });

program.parse(process.argv);
