import * as Application from 'expo-application';
import { Platform } from 'react-native';
import { storage } from '@/lib/storage';

const RUNNING_TASKS: any = {};

const DEVICE_INSTALL_ID_KEY = 'calyx_device_install_id';

function newInstallId(): string {
  const g = globalThis as { crypto?: Crypto };
  if (g.crypto?.randomUUID) {
    return g.crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

async function getOrCreatePersistedInstallId(): Promise<string> {
  const existing = await storage.getItem(DEVICE_INSTALL_ID_KEY);
  if (existing) return existing;

  const id = newInstallId();
  await storage.setItem(DEVICE_INSTALL_ID_KEY, id);
  return id;
}

async function getIosIdForVendorResolved(): Promise<string | null> {
  for (let attempt = 0; attempt < 3; attempt++) {
    const id = await Application.getIosIdForVendorAsync();
    if (id) return id;
    if (attempt < 2) {
      await new Promise((r) => setTimeout(r, 100));
    }
  }
  return null;
}

export function runOnce(
  id: string,
  fn: () => Promise<any>,
): () => Promise<any> {
  RUNNING_TASKS[id] = RUNNING_TASKS[id] || {
    hasRun: false,
    result: null,
    isRunning: false,
  };

  async function runOnceWrapper() {
    const task = RUNNING_TASKS[id];
    const { hasRun } = task;

    if (hasRun) {
      await new Promise((resolve) => {
        const checkInterval = setInterval(() => {
          if (!task.isRunning) {
            clearInterval(checkInterval);
            resolve(null);
          }
        }, 100);
      });
      return task.result;
    }
    task.hasRun = true;
    task.isRunning = true;
    task.result = await fn();
    task.isRunning = false;
    return task.result;
  }

  return runOnceWrapper;
}

const resolveDeviceId = runOnce('calyx-device-id', async (): Promise<string> => {
  if (Platform.OS === 'android') {
    try {
      const androidId = Application.getAndroidId();
      if (androidId) return androidId;
    } catch {
      /* unavailable */
    }
    return getOrCreatePersistedInstallId();
  }

  if (Platform.OS === 'ios') {
    try {
      const idfv = await getIosIdForVendorResolved();
      if (idfv) return idfv;
    } catch {
      /* native module unavailable */
    }
    return getOrCreatePersistedInstallId();
  }

  return getOrCreatePersistedInstallId();
});

/**
 * Best-effort device / installation identifier.
 * - Android: `Settings.Secure.ANDROID_ID` (can change on factory reset or signing-key changes).
 * - iOS: identifier for vendor (resets if all apps from the vendor are removed; rarely null before unlock).
 * - Web and fallbacks: random UUID persisted in storage for this install.
 */
export function getDeviceIdAsync(): Promise<string> {
  return resolveDeviceId();
}

export function runWithTimeout<T>(
  fn: () => Promise<T>,
  timeout: number,
): Promise<T> {
  return Promise.race([
    fn(),
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error('Operation timed out')), timeout),
    ),
  ]);
}

export function fetchWithTimeout(
  url: string,
  timeout: number,
  options?: RequestInit,
): Promise<Response> {
  return runWithTimeout(() => fetch(url, options), timeout);
}
