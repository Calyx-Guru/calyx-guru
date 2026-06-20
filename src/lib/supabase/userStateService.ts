/**
 * User app state row in Supabase (kaucim history, etc.)
 */

import {
  clampUserState,
  trimKaucimHistory,
} from '@/lib/app/kaucimHistoryLimit';
import supabase from '@/lib/supabase/client';
import type { UserState } from '@/types/UserState';

function fromRow(row: Record<string, unknown>): UserState {
  return clampUserState({
    id: row.id as string,
    kaucimHistory: (row.kaucim_history as UserState['kaucimHistory']) ?? [],
  });
}

function toRowPatch(updates: Partial<UserState>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  if (updates.kaucimHistory !== undefined) {
    out.kaucim_history = trimKaucimHistory(updates.kaucimHistory);
  }
  return out;
}

export async function fetchUserState(
  userId: string,
): Promise<UserState | null> {
  const { data, error } = await supabase
    .from('user_states')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;
  return fromRow(data as Record<string, unknown>);
}

export async function deleteUserState(userId: string): Promise<void> {
  const { error } = await supabase.from('user_states').delete().eq('id', userId);
  if (error) throw error;
}

export async function updateUserState(
  userId: string,
  updates: Partial<UserState>,
): Promise<UserState | null> {
  const patch = toRowPatch(updates);
  const { data, error } = await supabase
    .from('user_states')
    .upsert({ id: userId, ...patch }, { onConflict: 'id' })
    .select()
    .single();

  if (error) throw error;
  return data ? fromRow(data as Record<string, unknown>) : null;
}
