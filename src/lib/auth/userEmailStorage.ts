import { STORAGE_USER_EMAIL_KEY } from '@/constants/common';
import { storage } from '@/lib/storage';

export function normalizeUserEmail(email: string): string {
  return email.trim().toLowerCase();
}

export async function getStoredUserEmail(): Promise<string | null> {
  const raw = await storage.getItem(STORAGE_USER_EMAIL_KEY);
  return raw ? normalizeUserEmail(raw) : null;
}

export async function persistUserEmail(email: string): Promise<void> {
  const normalized = normalizeUserEmail(email);
  if (!normalized) {
    throw new Error('Cannot persist an empty user email');
  }
  await storage.setItem(STORAGE_USER_EMAIL_KEY, normalized);
}

export async function clearStoredUserEmail(): Promise<void> {
  await storage.removeItem(STORAGE_USER_EMAIL_KEY);
}

/** Active savedata storage path key (e.g. Google Play `displayName_uuid`). */
export async function getStoredSavedataPathKey(): Promise<string | null> {
  const raw = await storage.getItem(STORAGE_USER_EMAIL_KEY);
  return raw?.trim() || null;
}

export async function persistSavedataPathKey(pathKey: string): Promise<void> {
  const normalized = pathKey.trim();
  if (!normalized) {
    throw new Error('Cannot persist an empty savedata path key');
  }
  await storage.setItem(STORAGE_USER_EMAIL_KEY, normalized);
}
