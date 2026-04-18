export const ENV = {
  DEBUG_MODE: process.env.EXPO_PUBLIC_DEBUG_MODE === 'true',
  SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL,
  SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
}
