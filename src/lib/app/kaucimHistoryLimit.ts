import type { KaucimState, UserState } from '@/types/UserState';

/** Max kaucim sessions kept; oldest entries are dropped first. */
export const KAUCIM_HISTORY_LIMIT = 1000;

export function trimKaucimHistory(history: KaucimState[]): KaucimState[] {
  if (history.length <= KAUCIM_HISTORY_LIMIT) return history;
  return history.slice(history.length - KAUCIM_HISTORY_LIMIT);
}

export function clampUserState(state: UserState): UserState {
  const kaucimHistory = trimKaucimHistory(state.kaucimHistory);
  const hasValidLastKaucimTimestamp = Number.isFinite(state.lastKaucimTimestamp);
  const hasValidLastKaucimResults =
    state.lastKaucimResults !== null && typeof state.lastKaucimResults === 'object';
  if (
    kaucimHistory === state.kaucimHistory &&
    hasValidLastKaucimTimestamp &&
    hasValidLastKaucimResults
  ) {
    return state;
  }
  return {
    ...state,
    lastKaucimTimestamp: hasValidLastKaucimTimestamp ? state.lastKaucimTimestamp : 0,
    lastKaucimResults: hasValidLastKaucimResults ? state.lastKaucimResults : {},
    kaucimHistory,
  };
}

export function kaucimHistoryExceedsLimit(history: KaucimState[]): boolean {
  return history.length > KAUCIM_HISTORY_LIMIT;
}
