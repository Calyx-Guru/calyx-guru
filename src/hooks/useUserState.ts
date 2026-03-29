import { useUserStateStore } from '@/store/userStateStore';

export function useUserState() {
  const userState = useUserStateStore((s) => s.userState);
  const isLoading = useUserStateStore((s) => s.isLoading);
  const error = useUserStateStore((s) => s.error);
  const userStateRemoteDisabled = useUserStateStore(
    (s) => s.userStateRemoteDisabled,
  );
  const initializeUserStateForUser = useUserStateStore(
    (s) => s.initializeUserStateForUser,
  );
  const updateUserState = useUserStateStore((s) => s.updateUserState);
  const clearUserState = useUserStateStore((s) => s.clearUserState);
  const applyServerUserState = useUserStateStore(
    (s) => s.applyServerUserState,
  );

  return {
    userState,
    isLoading,
    error,
    userStateRemoteDisabled,
    initializeUserStateForUser,
    updateUserState,
    clearUserState,
    applyServerUserState,
  };
}
