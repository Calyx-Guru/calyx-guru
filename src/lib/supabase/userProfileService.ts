/**
 * User profile service for Supabase operations
 * Handles fetching, updating, and subscribing to user profile changes
 */

import supabase from '@/lib/supabase/client';
import { UserProfile } from '@/types/UserProfile';

/**
 * Fetch user profile by user ID
 */
export async function fetchUserProfile(
  userId: string,
): Promise<UserProfile | null> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data as UserProfile;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
}

/**
 * Update user profile
 */
export async function updateUserProfile(
  userId: string,
  updates: Partial<UserProfile>,
): Promise<UserProfile | null> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data as UserProfile;
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
}

/**
 * Subscribe to real-time profile changes using the new listen API
 * Returns an unsubscribe function
 */
export function subscribeToProfileChangesV2(
  userId: string,
  callback: (profile: UserProfile) => void,
): (() => Promise<string>) | null {
  try {
    const channel = supabase
      .channel(`profiles:${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${userId}`,
        },
        (payload: any) => {
          if (payload.new) {
            callback(payload.new as UserProfile);
          }
        },
      )
      .subscribe();

    return () => channel.unsubscribe();
  } catch (error) {
    console.error('Error subscribing to profile changes:', error);
    return null;
  }
}
