import { useUserStateStore } from '@/store/userStateStore';

export function useUserState() {
  const getState = useUserStateStore.getState;
  const userState = useUserStateStore((s) => s.userState);
  const isLoading = useUserStateStore((s) => s.isLoading);
  const error = useUserStateStore((s) => s.error);
 
  const initializeUserStateForUser = useUserStateStore(
    (s) => s.initializeUserStateForUser,
  );
  const updateUserState = useUserStateStore((s) => s.updateUserState);
  const clearUserState = useUserStateStore((s) => s.clearUserState);
  const applyServerUserState = useUserStateStore(
    (s) => s.applyServerUserState,
  );
  const pushKaucimHistory = useUserStateStore((s) => s.pushKaucimHistory);
  const unlockKaucimStory = useUserStateStore((s) => s.unlockKaucimStory);

  return {
    getState,
    userState,
    isLoading,
    error,
    initializeUserStateForUser,
    updateUserState,
    clearUserState,
    applyServerUserState,
    pushKaucimHistory,
    unlockKaucimStory,
  };
}
