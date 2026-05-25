import {
  APP_CONFIG_FILE_NAME,
  MASTER_DATA_MANIFEST_FILE_NAME,
  STORAGE_BUCKET,
} from "@/constants";
import type { AppConfigEntryType, AppConfigMap } from "@/types/AppConfig";
import { MasterDataManifest } from "@/types";
import { createClient } from "@supabase/supabase-js";
import { Argument, Command } from "commander";
import dotenv from "dotenv";
import fs from "fs/promises";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });
dotenv.config({
  path: path.resolve(process.cwd(), ".env.local"),
  override: true,
});

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || "";

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables");
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const LOCAL_APP_CONFIG_PATH = path.join(
  process.cwd(),
  "src",
  "masterdata",
  "appConfig.json",
);

function entriesToMap(entries: AppConfigEntryType[]): AppConfigMap {
  return entries.reduce<AppConfigMap>((acc, { key, value }) => {
    if (key) {
      acc[key] = value;
    }
    return acc;
  }, {});
}

function mapToEntries(map: AppConfigMap): AppConfigEntryType[] {
  return Object.entries(map).map(([key, value]) => ({ key, value }));
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
    }

    const manifestText = await data.text();
    return JSON.parse(manifestText) as MasterDataManifest;
  } catch (error) {
    console.error("Error fetching manifest:", error);
  }

  return null;
}

async function versionUpManifest(): Promise<MasterDataManifest | null> {
  let manifest = await loadManifest();
  if (!manifest) {
    const manifestText = await fs.readFile(
      path.join(process.cwd(), "src", "masterdata", "manifest.json"),
      "utf-8",
    );
    manifest = JSON.parse(manifestText) as MasterDataManifest;
    return manifest;
  }

  console.log("Updating manifest appConfig version...");
  manifest.appConfig = manifest.appConfig ?? {
    lastUpdated: new Date().toISOString(),
    version: 0,
  };
  manifest.appConfig.version = (manifest.appConfig.version || 0) + 1;
  manifest.appConfig.lastUpdated = new Date().toISOString();

  return manifest;
}

async function uploadManifest(updatedManifest: MasterDataManifest) {
  return supabase.storage
    .from(STORAGE_BUCKET)
    .upload(
      MASTER_DATA_MANIFEST_FILE_NAME,
      JSON.stringify(updatedManifest, null, 2),
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

  const version = manifest.appConfig?.version || 1;
  const storageFileName = `${APP_CONFIG_FILE_NAME}-${version}.json`;

  console.log(
    "Uploading app config to Supabase storage, target:",
    storageFileName,
  );

  const localText = await fs.readFile(LOCAL_APP_CONFIG_PATH, "utf-8");
  const localMap = JSON.parse(localText) as AppConfigMap;
  const uploadContent = JSON.stringify(mapToEntries(localMap), null, 2);

  const { error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(storageFileName, uploadContent, {
      contentType: "application/json",
      upsert: true,
    });

  if (error) {
    throw error;
  }

  await uploadManifest(manifest);
  console.log("✓ Successfully uploaded app config and updated manifest");
}

async function download(): Promise<void> {
  let version = 1;
  const manifest = await loadManifest();
  if (manifest?.appConfig?.version) {
    version = manifest.appConfig.version;
  }

  const storageFileName = `${APP_CONFIG_FILE_NAME}-${version}.json`;
  console.log(
    "Downloading app config from Supabase storage, target:",
    storageFileName,
  );

  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .download(storageFileName);

  if (error) {
    console.error("Error downloading app config:", error);
    throw error;
  }

  const configText = await data.text();
  const entries = JSON.parse(configText) as AppConfigEntryType[];
  const configMap = entriesToMap(
    Array.isArray(entries) ? entries : [],
  );

  await fs.writeFile(
    LOCAL_APP_CONFIG_PATH,
    JSON.stringify(configMap, null, 2),
    "utf-8",
  );
  console.log(`✓ Downloaded app config to ${LOCAL_APP_CONFIG_PATH}`);
}

const program = new Command();

program
  .name("sync-app-config")
  .description(
    "Sync app config key-value data between Supabase storage and src/masterdata/appConfig.json",
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
      console.error("Error syncing app config:", error);
      process.exitCode = 1;
    }
  });

program.parse(process.argv);
