import { useUserProfile } from '@/hooks/useUserProfile';
import { useUserState } from '@/hooks/useUserState';
import { runWithTimeout } from '@/lib/app/helper';
import {
  clearGuestMode,
  getGuestUserId,
  isGuestMode,
} from '@/lib/app/guestMode';
import {
  getStoredGooglePlayUserId,
  signInWithGooglePlay as performGooglePlaySignIn,
  signOutGooglePlay,
} from '@/lib/auth/googlePlaySignIn';
import supabase from '@/lib/supabase/client';
import { Session, User } from '@supabase/supabase-js';
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
  initializeSupabaseProfile: () => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  logout: () => Promise<void>;
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
  initializeSupabaseProfile: async () => {},
  signUp: async () => {},
  signIn: async () => {},
  signOut: async () => {},
  logout: async () => {},
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
  const [isLoading, setIsLoading] = useState(true);

  const { clearProfile, initializeProfileForUser } = useUserProfile();
  const { clearUserState, initializeUserStateForUser } = useUserState();

  const initializeSupabaseProfile = async () => {
    const loadLocalProfile = async () => {
      const storedGooglePlayUserId = await getStoredGooglePlayUserId();
      if (storedGooglePlayUserId) {
        setGooglePlayUserId(storedGooglePlayUserId);
        await Promise.all([
          initializeProfileForUser(storedGooglePlayUserId),
          initializeUserStateForUser(storedGooglePlayUserId),
        ]);
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
        const uid = initialSession.user.id;
        await runWithTimeout(
          () =>
            Promise.all([
              initializeProfileForUser(uid),
              initializeUserStateForUser(uid),
            ]),
          8000,
        );
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
        try {
          await clearGuestMode();
          await Promise.all([
            initializeProfileForUser(uid),
            initializeUserStateForUser(uid),
          ]);
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

  const signInWithGooglePlay = useCallback(async () => {
    const { userId } = await performGooglePlaySignIn();
    setGooglePlayUserId(userId);
    setIsLoading(false);
    await clearGuestMode();
    await Promise.all([
      initializeProfileForUser(userId),
      initializeUserStateForUser(userId),
    ]);
  }, [initializeProfileForUser, initializeUserStateForUser]);

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
    initializeSupabaseProfile,
    signUp,
    signIn,
    signOut,
    logout,
    signInWithGooglePlay,
    signInWithOAuth,
  };

  return (
    <SupabaseAuthContext.Provider value={value}>
      {children}
    </SupabaseAuthContext.Provider>
  );
}
