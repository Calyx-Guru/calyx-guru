import * as SecureStore from 'expo-secure-store';

export type StoragePair = readonly [string, string | null];

function hasLocalStorage(): boolean {
  return typeof localStorage !== 'undefined';
}

async function secureStoreAvailable(): Promise<boolean> {
  try {
    return await SecureStore.isAvailableAsync();
  } catch {
    return false;
  }
}

export const storage = {
  async getItem(key: string): Promise<string | null> {
    if (hasLocalStorage()) {
      return localStorage.getItem(key);
    }

    if (await secureStoreAvailable()) {
      const v = await SecureStore.getItemAsync(key);
      return v ?? null;
    }

    return null;
  },

  async setItem(key: string, value: string): Promise<void> {
    if (hasLocalStorage()) {
      localStorage.setItem(key, value);
      return;
    }

    if (await secureStoreAvailable()) {
      await SecureStore.setItemAsync(key, value);
    }
  },

  async removeItem(key: string): Promise<void> {
    if (hasLocalStorage()) {
      localStorage.removeItem(key);
      return;
    }

    if (await secureStoreAvailable()) {
      await SecureStore.deleteItemAsync(key);
    }
  },

  async multiGet(keys: readonly string[]): Promise<StoragePair[]> {
    return Promise.all(
      keys.map(async (k) => [k, await storage.getItem(k)] as const),
    );
  },
};

