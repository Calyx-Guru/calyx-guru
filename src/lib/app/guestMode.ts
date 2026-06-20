import { STORAGE_GUEST_MODE_KEY } from '@/constants/common';
import { getDeviceIdAsync } from '@/lib/app/helper';
import { storage } from '@/lib/storage';

const GUEST_ID_PREFIX = 'guest_';

export function isGuestUserId(userId: string | null | undefined): boolean {
  return !!userId && userId.startsWith(GUEST_ID_PREFIX);
}

export async function isGuestMode(): Promise<boolean> {
  return (await storage.getItem(STORAGE_GUEST_MODE_KEY)) === 'true';
}

export async function getGuestUserId(): Promise<string> {
  const deviceId = await getDeviceIdAsync();
  return `${GUEST_ID_PREFIX}${deviceId}`;
}

export async function enableGuestMode(): Promise<string> {
  const guestId = await getGuestUserId();
  await storage.setItem(STORAGE_GUEST_MODE_KEY, 'true');
  return guestId;
}

export async function clearGuestMode(): Promise<void> {
  await storage.removeItem(STORAGE_GUEST_MODE_KEY);
}
