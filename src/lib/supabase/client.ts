import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase credentials. Please set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY in your .env file',
  );
}

/**
 * Custom storage adapter that uses SecureStore for sensitive data (tokens)
 * and AsyncStorage for non-sensitive data
 */
const customStorage = {
  getItem: async (key: string) => {
    try {
      // Use SecureStore for auth tokens
      if (key.includes('token') || key.includes('supabase')) {
        const value = await SecureStore.getItemAsync(key);
        return value || null;
      }
      // Use AsyncStorage for other data
      return await AsyncStorage.getItem(key);
    } catch (error) {
      console.error(`Error retrieving ${key}:`, error);
      return null;
    }
  },
  setItem: async (key: string, value: string) => {
    try {
      // Use SecureStore for auth tokens
      if (key.includes('token') || key.includes('supabase')) {
        await SecureStore.setItemAsync(key, value);
      } else {
        // Use AsyncStorage for other data
        await AsyncStorage.setItem(key, value);
      }
    } catch (error) {
      console.error(`Error setting ${key}:`, error);
    }
  },
  removeItem: async (key: string) => {
    try {
      // Try removing from SecureStore first (for tokens)
      if (key.includes('token') || key.includes('supabase')) {
        await SecureStore.deleteItemAsync(key);
      } else {
        // Remove from AsyncStorage
        await AsyncStorage.removeItem(key);
      }
    } catch (error) {
      console.error(`Error removing ${key}:`, error);
    }
  },
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: customStorage as any,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

export default supabase;
