import {
  FORTUNE_POEMS_STORAGE_FOLDER,
  MASTER_DATA_MANIFEST_FILE_NAME,
  STORAGE_BUCKET,
  SUPPORTED_LANGUAGES,
} from "@/constants";
import type { LanguageKey, MasterDataManifest } from "@/types";
import { KAUCIM_CONCERNS } from "@/types/UserState";
import { createClient } from "@supabase/supabase-js";
import { Argument, Command } from "commander";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { KAUCIM_STORIES_STORAGE_FOLDER } from "../admin/src/constants";

// Load environment variables from .env and .env.local (local overrides)
dotenv.config({ path: path.resolve(process.cwd(), ".env") });
dotenv.config({
  path: path.resolve(process.cwd(), ".env.local"),
  override: true,
});

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || "";

/**
 * Strip bidi / invisible format characters and normalize Unicode so written JSON
 * does not trigger "ambiguous Unicode" warnings in editors (VS Code / Cursor).
 */
function sanitizeForMasterDataJson(value: unknown): unknown {
  if (typeof value === "string") {
    return value
      .normalize("NFKC")
      .replace(/[\u200B-\u200D\uFEFF]/g, "")
      .replace(/[\u200E\u200F\u202A-\u202E\u2066-\u2069]/g, "");
  }
  if (Array.isArray(value)) {
    return value.map(sanitizeForMasterDataJson);
  }
  if (value !== null && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([k, v]) => [
        k,
        sanitizeForMasterDataJson(v),
      ]),
    );
  }
  return value;
}

function stringifyMasterDataJson(data: unknown): string {
  return `${JSON.stringify(sanitizeForMasterDataJson(data), null, 2)}\n`;
}

const ALL_KAUCIM_CONCERNS = Object.values(KAUCIM_CONCERNS) as KAUCIM_CONCERNS[];

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables");
}

async function loginSupabase() {
  console.log("Logging in to Supabase...");
  await supabase.auth.signInWithPassword({
    email: process.env.DASHBOARD_ADMIN_EMAIL || "",
    password: process.env.DASHBOARD_ADMIN_PASSWORD || "",
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
    console.error("Error fetching manifest:", error);
  }

  return null;
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);
const masterDataDir = path.join(process.cwd(), "src", "masterdata");

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
    stringifyMasterDataJson(manifest),
    "utf-8",
  );
  console.log(`✓ Manifest saved to ${manifestPath}`);

  return manifest;
}

async function downloadLanguageFiles(
  versionsParams:
    | Record<
        string,
        {
          [key in LanguageKey]?: number;
        }
      >
    | {
        [key in LanguageKey]?: number;
      },
  remoteFolder: string,
  prefixes?: string[],
): Promise<void> {
  console.log(`\n📥 Downloading language files... ${remoteFolder}`);

  const dummyPrefix = "_";
  let versions: Record<
    string,
    {
      [key in LanguageKey]?: number;
    }
  > = {};
  if (typeof Object.keys(versionsParams)[0] === "string") {
    versions = {
      [dummyPrefix]: versionsParams,
    };
  } else {
    versions = versionsParams as Record<
      string,
      {
        [key in LanguageKey]?: number;
      }
    >;
  }

  prefixes = prefixes || [dummyPrefix];

  const allData: Record<string, Record<LanguageKey, any>> = {};

  for (const prefix of prefixes) {
    const fileData: Record<LanguageKey, any> = {
      en: [],
      ja: [],
      ko: [],
      vi: [],
      "zh-CN": [],
      "zh-TW": [],
    };

    for (const language of SUPPORTED_LANGUAGES) {
      const version = versions[prefix]?.[language] || 1;

      const fileName = `${remoteFolder}/${prefix && prefix !== dummyPrefix ? `${prefix}-` : ""}${language}-${version}.json`;

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
        console.log(`✓ Downloaded ${fileName} (v${version})`);
      } catch (error) {
        console.error(
          `✗ Failed to download ${fileName}: ${error instanceof Error ? error.message : String(error)}`,
        );
      }

      fileData[language] = fileContent;
    }

    allData[prefix] = fileData;
  }

  const payload =
    Object.keys(allData).length > 1
      ? allData
      : allData[Object.keys(allData)[0]!];
  const fileContent = stringifyMasterDataJson(payload);

  const filePath = path.join(masterDataDir, `${remoteFolder}.json`);
  await fs.promises.writeFile(filePath, fileContent, "utf-8");
}

async function uploadLanguageFiles(
  versionsParams:
    | Record<
        string,
        {
          [key in LanguageKey]?: number;
        }
      >
    | {
        [key in LanguageKey]?: number;
      },
  remoteFolder: string,
  prefixes?: string[],
): Promise<void> {
  console.log(`\n📤 Uploading language files...`);

  const dummyPrefix = "_";
  let versions: Record<
    string,
    {
      [key in LanguageKey]?: number;
    }
  > = {};
  if (typeof Object.keys(versionsParams)[0] === "string") {
    versions = {
      [dummyPrefix]: versionsParams,
    };
  } else {
    versions = versionsParams as Record<
      string,
      {
        [key in LanguageKey]?: number;
      }
    >;
  }

  prefixes = prefixes || [dummyPrefix];

  const filePath = path.join(masterDataDir, `${remoteFolder}.json`);
  const fileContent = await fs.promises.readFile(filePath, "utf-8");
  const fileData: any = JSON.parse(fileContent);

  for (const prefix of prefixes) {
    const uploadData: Record<LanguageKey, any> =
      prefix === dummyPrefix ? fileData : fileData[prefix] || {};
    for (const language of SUPPORTED_LANGUAGES) {
      const version = versions[prefix]?.[language] || 1;

      const fileName = `${remoteFolder}/${prefix && prefix !== dummyPrefix ? `${prefix}-` : ""}${language}-${version}.json`;

      let fileContent = uploadData[language] || [];

      try {
        const { error } = await supabase.storage
          .from(STORAGE_BUCKET)
          .upload(fileName, stringifyMasterDataJson(fileContent), {
            contentType: "application/json",
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
}

async function versionUpManifest(): Promise<MasterDataManifest | null> {
  // Download the manifest to get the current version number (or use a default version if manifest doesn't exist)
  let manifest = await loadManifest();
  if (!manifest) {
    // Load local manifest
    const manifestText = await fs.promises.readFile(
      path.join(process.cwd(), "src", "masterdata", "manifest.json"),
      "utf-8",
    );
    manifest = JSON.parse(manifestText);
    console.log(`Loaded local manifest: ${manifest?.localization.version}`);
    return manifest;
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
      stringifyMasterDataJson(updatedManifest),
      {
        contentType: "application/json",
        upsert: true,
      },
    );
}

async function upload(): Promise<void> {
  await loginSupabase();
  const manifest = await versionUpManifest();
  if (!manifest) {
    console.error("Failed to update manifest version. Aborting upload.");
    return;
  }

  await uploadLanguageFiles(
    manifest.fortunePoems.languages,
    FORTUNE_POEMS_STORAGE_FOLDER,
  );

  await uploadLanguageFiles(
    manifest.kaucimStories,
    KAUCIM_STORIES_STORAGE_FOLDER,
    ALL_KAUCIM_CONCERNS,
  );

  await uploadManifest(manifest);
  console.log("✓ Successfully uploaded master data and updated manifest");
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

    // Download all kaucim stories
    await downloadLanguageFiles(
      manifest.kaucimStories,
      KAUCIM_STORIES_STORAGE_FOLDER,
      ALL_KAUCIM_CONCERNS,
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
  .name("sync-master-data")
  .description(
    "Sync master data from Supabase storage to local src/masterdata folder",
  )
  .version("1.0.0");

program
  .addArgument(
    new Argument("<action>", "Action to perform")
      .choices(["download", "upload"])
      .default("download"),
  )
  .action(async (action: string) => {
    try {
      if (action === "download") {
        await download();
      } else if (action === "upload") {
        await upload();
      } else {
        throw new Error(`Unknown action: ${action}`);
      }
    } catch (error) {
      console.error("Error syncing master data:", error);
    }
  });

program.parse(process.argv);
