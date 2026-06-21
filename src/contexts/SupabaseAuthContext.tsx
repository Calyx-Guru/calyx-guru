import { useUserProfile } from '@/hooks/useUserProfile';
import { useUserState } from '@/hooks/useUserState';
import { runWithTimeout } from '@/lib/app/helper';
import {
  clearGuestMode,
  getGuestUserId,
  isGuestMode,
} from '@/lib/app/guestMode';
import {
  clearGooglePlayPathMapping,
  fromGooglePlayUserId,
  getStoredGooglePlayUserId,
  signInWithGooglePlay as performGooglePlaySignIn,
  signOutGooglePlay,
} from '@/lib/auth/googlePlaySignIn';
import {
  clearStoredUserEmail,
  getStoredSavedataPathKey,
  normalizeUserEmail,
  persistSavedataPathKey,
  persistUserEmail,
} from '@/lib/auth/userEmailStorage';
import { isStaleMockDevIdentity } from '@/lib/auth/mockDevIdentity';
import { deleteRemoteUserData } from '@/lib/account/deleteAccountAndData';
import { resetSavedataSync } from '@/lib/supabase/savedataSync';
import supabase from '@/lib/supabase/client';
import { Session, User } from '@supabase/supabase-js';
import { useUserProfileStore } from '@/store/userProfileStore';
import React, { createContext, useCallback, useEffect, useState } from 'react';

export type OAuthProvider =
  | 'apple'
  | 'discord'
  | 'facebook'
  | 'google'
  | 'kakao'
  | 'linkedin_oidc'
  | 'twitter'
  | 'twitch';

type SupabaseAuth = {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isSignedIn: boolean;
  isGooglePlaySignedIn: boolean;
  googlePlayUserId: string | null;
  userEmail: string | null;
  initializeSupabaseProfile: () => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithEmailPassword: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  logout: () => Promise<void>;
  deleteAccountAndData: () => Promise<void>;
  signInWithGooglePlay: () => Promise<void>;
  signInWithOAuth: (provider: OAuthProvider) => Promise<void>;
};

export const SupabaseAuthContext = createContext<SupabaseAuth>({
  user: null,
  session: null,
  isLoading: true,
  isSignedIn: false,
  isGooglePlaySignedIn: false,
  googlePlayUserId: null,
  userEmail: null,
  initializeSupabaseProfile: async () => {},
  signUp: async () => {},
  signIn: async () => {},
  signInWithEmailPassword: async () => {},
  signOut: async () => {},
  logout: async () => {},
  deleteAccountAndData: async () => {},
  signInWithGooglePlay: async () => {},
  signInWithOAuth: async () => {},
});

export function SupabaseAuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [googlePlayUserId, setGooglePlayUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const { clearProfile, initializeProfileForUser } = useUserProfile();
  const { clearUserState, initializeUserStateForUser } = useUserState();

  const syncProfileEmail = useCallback(async (email: string) => {
    const normalized = normalizeUserEmail(email);
    const profile = useUserProfileStore.getState().profile;
    if (profile?.email?.trim()) return;
    await useUserProfileStore.getState().updateProfile({ email: normalized });
  }, []);

  const applySignedInEmail = useCallback(async (email: string | null | undefined) => {
    if (!email?.trim()) return;
    const normalized = normalizeUserEmail(email);
    await persistUserEmail(normalized);
    setUserEmail(normalized);
  }, []);

  const applySignedInStoragePathKey = useCallback(
    async (pathKey: string | null | undefined) => {
      if (!pathKey?.trim()) return;
      await persistSavedataPathKey(pathKey);
      setUserEmail(pathKey.trim());
    },
    [],
  );

  const initializeSupabaseProfile = async () => {
    const loadLocalProfile = async () => {
      const storedGooglePlayUserId = await getStoredGooglePlayUserId();
      let storedPathKey = await getStoredSavedataPathKey();
      if (storedPathKey && isStaleMockDevIdentity(null, storedPathKey)) {
        await clearStoredUserEmail();
        storedPathKey = null;
      }
      if (storedGooglePlayUserId) {
        setGooglePlayUserId(storedGooglePlayUserId);
        setUserEmail(storedPathKey);
        await Promise.all([
          initializeProfileForUser(storedGooglePlayUserId),
          initializeUserStateForUser(storedGooglePlayUserId),
        ]);
        if (storedPathKey?.includes('@')) {
          await syncProfileEmail(storedPathKey);
        }
        return;
      }

      if (await isGuestMode()) {
        const guestId = await getGuestUserId();
        await Promise.all([
          initializeProfileForUser(guestId),
          initializeUserStateForUser(guestId),
        ]);
      } else {
        await Promise.all([
          initializeProfileForUser(null),
          initializeUserStateForUser(null),
        ]);
      }
    };

    try {
      const {
        data: { session: initialSession },
      } = await runWithTimeout(() => supabase.auth.getSession(), 1000);
      setSession(initialSession);
      setUser(initialSession?.user ?? null);

      if (initialSession?.user) {
        if (
          isStaleMockDevIdentity(
            initialSession.user.id,
            initialSession.user.email,
          )
        ) {
          console.warn(
            'Clearing stale mock Supabase session while USE_MOCK_DATA is disabled',
          );
          await supabase.auth.signOut();
          await clearStoredUserEmail();
          setSession(null);
          setUser(null);
          await loadLocalProfile();
        } else {
          const uid = initialSession.user.id;
          await applySignedInEmail(initialSession.user.email);
          await runWithTimeout(
            () =>
              Promise.all([
                initializeProfileForUser(uid),
                initializeUserStateForUser(uid),
              ]),
            8000,
          );
          if (initialSession.user.email) {
            await syncProfileEmail(initialSession.user.email);
          }
        }
      } else {
        await loadLocalProfile();
      }

      console.log('Initial Supabase session:', initialSession);
    } catch (error) {
      console.error('Error initializing session / profile:', error);
      await loadLocalProfile();
    } finally {
      console.log('Supabase auth loading complete');
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
      setIsLoading(false);

      if (event === 'SIGNED_IN' && newSession?.user) {
        const uid = newSession.user.id;
        if (isStaleMockDevIdentity(uid, newSession.user.email)) {
          console.warn(
            'Ignoring stale mock Supabase session while USE_MOCK_DATA is disabled',
          );
          await supabase.auth.signOut();
          return;
        }
        try {
          await clearGuestMode();
          await applySignedInEmail(newSession.user.email);
          await Promise.all([
            initializeProfileForUser(uid),
            initializeUserStateForUser(uid),
          ]);
          if (newSession.user.email) {
            await syncProfileEmail(newSession.user.email);
          }
        } catch (error) {
          console.error('Error loading user profile / state:', error);
        }
      } else if (event === 'SIGNED_OUT') {
        setSession(null);
        setUser(null);
        await Promise.all([clearProfile(), clearUserState(), clearGuestMode()]);
        await Promise.all([
          initializeProfileForUser(null),
          initializeUserStateForUser(null),
        ]);
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, [
    initializeProfileForUser,
    clearProfile,
    initializeUserStateForUser,
    clearUserState,
    applySignedInEmail,
    syncProfileEmail,
  ]);

  const signUp = useCallback(async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });
      if (error) throw error;
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    }
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    await clearGuestMode();
    await signOutGooglePlay();
    setGooglePlayUserId(null);
    setUserEmail(null);
    await clearStoredUserEmail();

    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Sign out error:', error);
      }
    } catch (error) {
      console.error('Sign out error:', error);
    }

    setSession(null);
    setUser(null);

    await Promise.all([clearProfile(), clearUserState()]);
    await Promise.all([
      initializeProfileForUser(null),
      initializeUserStateForUser(null),
    ]);

    if (await isGuestMode()) {
      throw new Error('Guest mode still active after logout');
    }

    if (await getStoredGooglePlayUserId()) {
      throw new Error('Google Play session still active after logout');
    }
  }, [
    clearProfile,
    clearUserState,
    initializeProfileForUser,
    initializeUserStateForUser,
  ]);

  const deleteAccountAndData = useCallback(async () => {
    const storedGooglePlayUserId = googlePlayUserId ?? (await getStoredGooglePlayUserId());
    const supabaseUserId = session?.user?.id ?? null;
    const guestUserId = (await isGuestMode()) ? await getGuestUserId() : null;
    const storedPathKey = userEmail ?? (await getStoredSavedataPathKey());
    const googleAccountId = fromGooglePlayUserId(storedGooglePlayUserId);

    await deleteRemoteUserData({
      googlePlayUserId: storedGooglePlayUserId,
      supabaseUserId,
      guestUserId,
      userEmail: storedPathKey,
    });

    resetSavedataSync();
    await clearGuestMode();
    await signOutGooglePlay();
    if (googleAccountId) {
      await clearGooglePlayPathMapping(googleAccountId);
    }
    setGooglePlayUserId(null);
    setUserEmail(null);
    await clearStoredUserEmail();

    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Sign out error during account deletion:', error);
      }
    } catch (error) {
      console.error('Sign out error during account deletion:', error);
    }

    setSession(null);
    setUser(null);

    await Promise.all([clearProfile(), clearUserState()]);
    await Promise.all([
      initializeProfileForUser(null),
      initializeUserStateForUser(null),
    ]);

    if (await isGuestMode()) {
      throw new Error('Guest mode still active after account deletion');
    }

    if (await getStoredGooglePlayUserId()) {
      throw new Error('Google Play session still active after account deletion');
    }
  }, [
    clearProfile,
    clearUserState,
    googlePlayUserId,
    userEmail,
    initializeProfileForUser,
    initializeUserStateForUser,
    session?.user?.id,
  ]);

  const signInWithEmailPassword = useCallback(
    async (email: string, password: string) => {
      await clearGuestMode();
      await signOutGooglePlay();
      setGooglePlayUserId(null);
      setUserEmail(null);
      await clearStoredUserEmail();
      await Promise.all([clearProfile(), clearUserState()]);

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;

      const nextSession = data.session;
      const uid = nextSession?.user?.id;
      if (!uid) {
        throw new Error('No user id returned after email sign-in');
      }

      await applySignedInEmail(nextSession.user.email ?? email);

      setSession(nextSession);
      setUser(nextSession.user);
      setIsLoading(false);

      await Promise.all([
        initializeProfileForUser(uid),
        initializeUserStateForUser(uid),
      ]);
      await syncProfileEmail(nextSession.user.email ?? email);
    },
    [
      applySignedInEmail,
      clearProfile,
      clearUserState,
      initializeProfileForUser,
      initializeUserStateForUser,
      syncProfileEmail,
    ],
  );

  const signInWithGooglePlay = useCallback(async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Supabase sign out before Google Play sign-in:', error);
    }
    setSession(null);
    setUser(null);

    const { userId, storagePathKey } = await performGooglePlaySignIn();
    setGooglePlayUserId(userId);
    await applySignedInStoragePathKey(storagePathKey);
    setIsLoading(false);
    await clearGuestMode();
    await Promise.all([
      initializeProfileForUser(userId),
      initializeUserStateForUser(userId),
    ]);
  }, [
    applySignedInStoragePathKey,
    initializeProfileForUser,
    initializeUserStateForUser,
  ]);

  const signInWithOAuth = useCallback(async (provider: OAuthProvider) => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: provider as any,
      });
      if (error) throw error;
    } catch (error) {
      console.error(`OAuth sign in error (${provider}):`, error);
      throw error;
    }
  }, []);

  const value: SupabaseAuth = {
    user,
    session,
    isLoading,
    isSignedIn: !!session,
    isGooglePlaySignedIn: !!googlePlayUserId,
    googlePlayUserId,
    userEmail,
    initializeSupabaseProfile,
    signUp,
    signIn,
    signInWithEmailPassword,
    signOut,
    logout,
    deleteAccountAndData,
    signInWithGooglePlay,
    signInWithOAuth,
  };

  return (
    <SupabaseAuthContext.Provider value={value}>
      {children}
    </SupabaseAuthContext.Provider>
  );
}
