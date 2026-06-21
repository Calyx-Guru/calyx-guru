import {
  SAVEDATA_PROFILE_FILE_NAME,
  SAVEDATA_STATE_FILE_NAME,
  SAVEDATA_STORAGE_BUCKET,
  SAVEDATA_STORAGE_MOCK_PREFIX,
  SAVEDATA_STORAGE_PROD_PREFIX,
} from "@/constants/common";
import { ENV } from "@/constants/env";
import { isSavedataStorageUserId } from "@/lib/auth/savedataUserId";
import { supabaseStorageClient } from "@/lib/supabase/client";

export type SavedataKind = "profile" | "state";

const FILE_NAMES: Record<SavedataKind, string> = {
  profile: SAVEDATA_PROFILE_FILE_NAME,
  state: SAVEDATA_STATE_FILE_NAME,
};

export function getSavedataStoragePrefix(): string {
  return ENV.USE_MOCK_DATA
    ? SAVEDATA_STORAGE_MOCK_PREFIX
    : SAVEDATA_STORAGE_PROD_PREFIX;
}

/** Object path: `{mock|prod}/{email}/profile.json` or `{mock|prod}/{email}/state.json` */
export function getSavedataObjectPath(
  storagePathKey: string,
  kind: SavedataKind,
): string {
  return `${getSavedataStoragePrefix()}/${storagePathKey}/${FILE_NAMES[kind]}`;
}

export function getSavedataDebugInfo(
  userId: string | null | undefined,
  storagePathKey?: string | null,
) {
  const pathKey = storagePathKey ?? null;
  return {
    bucket: SAVEDATA_STORAGE_BUCKET,
    prefix: getSavedataStoragePrefix(),
    profilePath: pathKey ? getSavedataObjectPath(pathKey, "profile") : null,
    statePath: pathKey ? getSavedataObjectPath(pathKey, "state") : null,
    storageClientReady: supabaseStorageClient != null,
    supabaseUrl: ENV.SUPABASE_URL ?? null,
    useMockData: ENV.USE_MOCK_DATA,
    userId: userId ?? null,
    storagePathKey: pathKey,
  };
}

function jsonToUploadBody(body: string): Uint8Array {
  if (typeof TextEncoder !== "undefined") {
    return new TextEncoder().encode(body);
  }
  const bytes = new Uint8Array(body.length);
  for (let i = 0; i < body.length; i++) {
    bytes[i] = body.charCodeAt(i) & 0xff;
  }
  return bytes;
}

export function isSavedataStorageEnabled(
  userId: string | null | undefined,
  storagePathKey?: string | null,
): boolean {
  return (
    isSavedataStorageUserId(userId) &&
    !!storagePathKey?.trim() &&
    supabaseStorageClient != null
  );
}

async function blobToText(blob: Blob): Promise<string> {
  if (typeof blob.text === "function") {
    return blob.text();
  }
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(reader.error ?? new Error("Failed to read blob"));
    reader.readAsText(blob);
  });
}

export async function fetchSavedataJson<T>(
  storagePathKey: string,
  kind: SavedataKind,
): Promise<T | null> {
  if (!supabaseStorageClient) return null;

  const path = getSavedataObjectPath(storagePathKey, kind);
  const { data, error } = await supabaseStorageClient.storage
    .from(SAVEDATA_STORAGE_BUCKET)
    .download(path);

  if (error) {
    const status =
      error && typeof error === "object" && "statusCode" in error
        ? String((error as { statusCode: unknown }).statusCode)
        : undefined;
    if (status === "404" || error.message?.toLowerCase().includes("not found")) {
      return null;
    }
    throw error;
  }

  if (!data) return null;

  const text = await blobToText(data);
  if (!text.trim()) return null;

  return JSON.parse(text) as T;
}

export async function upsertSavedataJson<T extends { id: string }>(
  storagePathKey: string,
  kind: SavedataKind,
  payload: T,
): Promise<void> {
  if (!supabaseStorageClient) return;

  const path = getSavedataObjectPath(storagePathKey, kind);
  const body = JSON.stringify(payload);

  const { error } = await supabaseStorageClient.storage
    .from(SAVEDATA_STORAGE_BUCKET)
    .upload(path, jsonToUploadBody(body), {
      upsert: true,
      contentType: "application/json",
    });

  if (error) throw error;
}

function isStorageObjectNotFound(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const message =
    "message" in error && typeof (error as { message: unknown }).message === "string"
      ? (error as { message: string }).message.toLowerCase()
      : "";
  return message.includes("not found");
}

function savedataPathsForKind(storagePathKey: string, kind: SavedataKind): string[] {
  const fileName = FILE_NAMES[kind];
  return [
    `${SAVEDATA_STORAGE_MOCK_PREFIX}/${storagePathKey}/${fileName}`,
    `${SAVEDATA_STORAGE_PROD_PREFIX}/${storagePathKey}/${fileName}`,
  ];
}

/** Remove one savedata JSON file for a user from both mock and prod prefixes. */
export async function deleteSavedataKindFromStorage(
  storagePathKey: string,
  kind: SavedataKind,
): Promise<void> {
  if (!supabaseStorageClient || !storagePathKey.trim()) return;

  const { error } = await supabaseStorageClient.storage
    .from(SAVEDATA_STORAGE_BUCKET)
    .remove(savedataPathsForKind(storagePathKey, kind));

  if (error && !isStorageObjectNotFound(error)) {
    throw error;
  }
}

/** Remove profile and state JSON for a user from both mock and prod prefixes. */
export async function deleteSavedataFromStorage(
  storagePathKey: string,
): Promise<void> {
  if (!supabaseStorageClient || !storagePathKey.trim()) return;

  const paths = [
    ...savedataPathsForKind(storagePathKey, "profile"),
    ...savedataPathsForKind(storagePathKey, "state"),
  ];

  const { error } = await supabaseStorageClient.storage
    .from(SAVEDATA_STORAGE_BUCKET)
    .remove(paths);

  if (error && !isStorageObjectNotFound(error)) {
    throw error;
  }
}
