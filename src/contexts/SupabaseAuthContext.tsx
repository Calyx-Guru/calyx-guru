import { useUserProfile } from '@/hooks/useUserProfile';
import { useUserState } from '@/hooks/useUserState';
import { runWithTimeout } from '@/lib/app/helper';
import {
  clearGuestMode,
  enableGuestMode,
  getGuestUserId,
  isGuestMode,
} from '@/lib/app/guestMode';
import {
  clearStoredUserEmail,
  getStoredSavedataPathKey,
  normalizeUserEmail,
  persistUserEmail,
} from '@/lib/auth/userEmailStorage';
import {
  GoogleSignInCancelledError,
  signInWithGoogleAccount,
} from '@/lib/auth/googleSignIn';
import { isGoogleEmailUserId } from '@/lib/auth/savedataUserId';
import { SKIP_SIGN_IN_SCREEN } from '@/constants/config';
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

type GoogleAuthUser = {
  id: string;
  email: string;
};

function createGoogleAuthUser(email: string): User {
  const normalized = normalizeUserEmail(email);
  return {
    id: normalized,
    email: normalized,
    app_metadata: {},
    user_metadata: {},
    aud: 'google',
    created_at: new Date().toISOString(),
  } as User;
}

type SupabaseAuth = {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isSignedIn: boolean;
  userEmail: string | null;
  initializeSupabaseProfile: () => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithEmailPassword: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  logout: () => Promise<void>;
  deleteAccountAndData: () => Promise<void>;
  signInWithOAuth: (provider: OAuthProvider) => Promise<void>;
};

export const SupabaseAuthContext = createContext<SupabaseAuth>({
  user: null,
  session: null,
  isLoading: true,
  isSignedIn: false,
  userEmail: null,
  initializeSupabaseProfile: async () => {},
  signUp: async () => {},
  signIn: async () => {},
  signInWithEmailPassword: async () => {},
  signInWithGoogle: async () => {},
  signOut: async () => {},
  logout: async () => {},
  deleteAccountAndData: async () => {},
  signInWithOAuth: async () => {},
});

export function SupabaseAuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [googleUser, setGoogleUser] = useState<GoogleAuthUser | null>(null);
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

  const restoreGoogleSession = useCallback(
    async (email: string) => {
      const normalized = normalizeUserEmail(email);
      setGoogleUser({ id: normalized, email: normalized });
      setUserEmail(normalized);
      await Promise.all([
        initializeProfileForUser(normalized),
        initializeUserStateForUser(normalized),
      ]);
      await syncProfileEmail(normalized);
    },
    [initializeProfileForUser, initializeUserStateForUser, syncProfileEmail],
  );

  const ensureGuestSession = useCallback(async () => {
    if (!(await isGuestMode())) {
      await enableGuestMode();
    }
    const guestId = await getGuestUserId();
    await Promise.all([
      initializeProfileForUser(guestId),
      initializeUserStateForUser(guestId),
    ]);
  }, [initializeProfileForUser, initializeUserStateForUser]);

  const initializeSupabaseProfile = async () => {
    if (SKIP_SIGN_IN_SCREEN) {
      try {
        await ensureGuestSession();
      } catch (error) {
        console.error('Error initializing guest session:', error);
      } finally {
        setIsLoading(false);
      }
      return;
    }

    const loadLocalProfile = async () => {
      let storedPathKey = await getStoredSavedataPathKey();
      if (storedPathKey && isStaleMockDevIdentity(null, storedPathKey)) {
        await clearStoredUserEmail();
        storedPathKey = null;
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
        const storedPathKey = await getStoredSavedataPathKey();
        if (storedPathKey && isGoogleEmailUserId(storedPathKey)) {
          await restoreGoogleSession(storedPathKey);
        } else {
          await loadLocalProfile();
        }
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
    setUserEmail(null);
    setGoogleUser(null);
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

    if (SKIP_SIGN_IN_SCREEN) {
      await ensureGuestSession();
      return;
    }

    await Promise.all([
      initializeProfileForUser(null),
      initializeUserStateForUser(null),
    ]);

    if (await isGuestMode()) {
      throw new Error('Guest mode still active after logout');
    }
  }, [
    clearProfile,
    clearUserState,
    ensureGuestSession,
    initializeProfileForUser,
    initializeUserStateForUser,
  ]);

  const deleteAccountAndData = useCallback(async () => {
    const supabaseUserId = session?.user?.id ?? googleUser?.id ?? null;
    const guestUserId = (await isGuestMode()) ? await getGuestUserId() : null;
    const storedPathKey = userEmail ?? (await getStoredSavedataPathKey());

    await deleteRemoteUserData({
      supabaseUserId,
      guestUserId,
      userEmail: storedPathKey,
    });

    resetSavedataSync();
    await clearGuestMode();
    setUserEmail(null);
    setGoogleUser(null);
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

    if (SKIP_SIGN_IN_SCREEN) {
      await ensureGuestSession();
      return;
    }

    await Promise.all([
      initializeProfileForUser(null),
      initializeUserStateForUser(null),
    ]);

    if (await isGuestMode()) {
      throw new Error('Guest mode still active after account deletion');
    }
  }, [
    clearProfile,
    clearUserState,
    ensureGuestSession,
    userEmail,
    initializeProfileForUser,
    initializeUserStateForUser,
    session?.user?.id,
    googleUser?.id,
  ]);

  const signInWithEmailPassword = useCallback(
    async (email: string, password: string) => {
      await clearGuestMode();
      setGoogleUser(null);
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

  const signInWithGoogle = useCallback(async () => {
    await clearGuestMode();
    setGoogleUser(null);
    setUserEmail(null);
    await clearStoredUserEmail();
    await Promise.all([clearProfile(), clearUserState()]);

    let result;
    try {
      result = await signInWithGoogleAccount();
    } catch (error) {
      if (error instanceof GoogleSignInCancelledError) {
        return;
      }
      throw error;
    }

    const email = result.email;
    await applySignedInEmail(email);
    setGoogleUser({ id: email, email });
    setIsLoading(false);

    await Promise.all([
      initializeProfileForUser(email),
      initializeUserStateForUser(email),
    ]);
    await syncProfileEmail(email);

    const profileUpdates: {
      email: string;
      full_name?: string;
      avatar_url?: string;
    } = { email };
    if (result.name?.trim()) {
      profileUpdates.full_name = result.name.trim();
    }
    if (result.photoUrl?.trim()) {
      profileUpdates.avatar_url = result.photoUrl.trim();
    }
    await useUserProfileStore.getState().updateProfile(profileUpdates);
  }, [
    applySignedInEmail,
    clearProfile,
    clearUserState,
    initializeProfileForUser,
    initializeUserStateForUser,
    syncProfileEmail,
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
    user: user ?? (googleUser ? createGoogleAuthUser(googleUser.email) : null),
    session,
    isLoading,
    isSignedIn: !!session || !!googleUser,
    userEmail,
    initializeSupabaseProfile,
    signUp,
    signIn,
    signInWithEmailPassword,
    signInWithGoogle,
    signOut,
    logout,
    deleteAccountAndData,
    signInWithOAuth,
  };

  return (
    <SupabaseAuthContext.Provider value={value}>
      {children}
    </SupabaseAuthContext.Provider>
  );
}
