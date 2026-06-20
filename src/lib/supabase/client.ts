import { ENV } from "@/constants";
import { storage } from "@/lib/storage";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import createMockSupabaseClient from "./mockClient";

const supabaseUrl = ENV.SUPABASE_URL;
const supabaseAnonKey = ENV.SUPABASE_ANON_KEY;

// Skip credential validation when using mock data
// if (!ENV.USE_MOCK_DATA && (!supabaseUrl || !supabaseAnonKey)) {
//   throw new Error(
//     'Missing Supabase credentials. Please set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY in your .env file',
//   );
// }

const customStorage = {
  getItem: async (key: string) => {
    try {
      return await storage.getItem(key);
    } catch (error) {
      console.error(`Error retrieving ${key}:`, error);
      return null;
    }
  },
  setItem: async (key: string, value: string) => {
    try {
      await storage.setItem(key, value);
    } catch (error) {
      console.error(`Error setting ${key}:`, error);
    }
  },
  removeItem: async (key: string) => {
    try {
      await storage.removeItem(key);
    } catch (error) {
      console.error(`Error removing ${key}:`, error);
    }
  },
};

// Always use real credentials for Storage savedata (`mock/` vs `prod/` path is env-driven).
export const supabaseStorageClient: SupabaseClient | null =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
          detectSessionInUrl: false,
        },
      })
    : null;

// Create either a real or mock Supabase client based on the USE_MOCK_DATA flag
export const supabase: SupabaseClient = ENV.USE_MOCK_DATA
  ? (createMockSupabaseClient() as any)
  : createClient(supabaseUrl!, supabaseAnonKey!, {
      auth: {
        storage: customStorage as any,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
    });

if (!ENV.USE_MOCK_DATA) {
  console.log("Using real Supabase client");
} else {
  console.log(
    "Using mock Supabase client - set USE_MOCK_DATA to false in constants/general.ts to use real API",
  );
}

if (supabaseStorageClient) {
  console.log("Supabase Storage client ready for savedata sync");
} else {
  console.warn(
    "Supabase Storage client unavailable — set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY for savedata sync",
  );
}

export default supabase;
