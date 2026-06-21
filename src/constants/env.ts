import Constants from 'expo-constants';

function readUseMockData(): boolean {
  const fromExtra = Constants.expoConfig?.extra?.useMockData;
  if (typeof fromExtra === 'boolean') {
    return fromExtra;
  }
  return process.env.EXPO_PUBLIC_USE_MOCK_DATA === 'true';
}

export const ENV = {
  DEBUG_MODE: process.env.EXPO_PUBLIC_DEBUG_MODE === 'true',
  SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL,
  SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
  GOOGLE_WEB_CLIENT_ID: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
  AMPLITUDE_API_KEY: process.env.EXPO_PUBLIC_AMPLITUDE_API_KEY,
  GAME_ANALYTICS_GAME_KEY: process.env.EXPO_PUBLIC_GAME_ANALYTICS_GAME_KEY,
  GAME_ANALYTICS_SECRET_KEY: process.env.EXPO_PUBLIC_GAME_ANALYTICS_SECRET_KEY,
  USE_MOCK_DATA: readUseMockData(),
};
