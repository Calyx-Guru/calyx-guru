import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env and .env.local (local overrides)
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({
  path: path.resolve(process.cwd(), '.env.local'),
  override: true,
});

import {
    FORTUNE_POEMS_STORAGE_FOLDER,
    MASTER_DATA_MANIFEST_FILE_NAME,
    STORAGE_BUCKET,
    SUPPORTED_LANGUAGES,
} from '@/constants';
import type { LanguageKey, MasterDataManifest } from '@/types';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
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
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  console.log(`✓ Manifest saved to ${manifestPath}`);

  return manifest;
}

async function downloadLanguageFiles(
  versions: Record<LanguageKey, number>,
  remoteFolder: string,
): Promise<void> {
  console.log(`\n📥 Downloading language files...`);

  for (const language of SUPPORTED_LANGUAGES) {
    const version = versions[language] || 1;

    const fileName = `${remoteFolder}/${language}-${version}.json`;

    let fileContent = '[]';
    try {
      const { data, error } = await supabase.storage
        .from(STORAGE_BUCKET)
        .download(fileName);

      if (error) {
        throw error;
      }

      fileContent = await data.text();
      console.log(`✓ Downloaded ${language}.json (v${version})`);
    } catch (error) {
      console.error(
        `✗ Failed to download: ${error instanceof Error ? error.message : String(error)}`,
      );
    }

    const filePath = path.join(masterDataDir, remoteFolder, `${language}.json`);
    ensureDirectoryExists(path.dirname(filePath));
    fs.writeFileSync(filePath, fileContent);
  }
}

async function main(): Promise<void> {
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

main();
