import { useUserProfile } from '@/hooks/useUserProfile';
import { useUserState } from '@/hooks/useUserState';
import { runWithTimeout } from '@/lib/app/helper';
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
  initializeSupabaseProfile: () => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  signInWithOAuth: (provider: OAuthProvider) => Promise<void>;
};

export const SupabaseAuthContext = createContext<SupabaseAuth>({
  user: null,
  session: null,
  isLoading: true,
  isSignedIn: false,
  initializeSupabaseProfile: async () => {},
  signUp: async () => {},
  signIn: async () => {},
  signOut: async () => {},
  signInWithOAuth: async () => {},
});

export function SupabaseAuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const { clearProfile, initializeProfileForUser } = useUserProfile();
  const { clearUserState, initializeUserStateForUser } = useUserState();

  const initializeSupabaseProfile = async () => {
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
        await Promise.all([
          initializeProfileForUser(null),
          initializeUserStateForUser(null),
        ])
      }

      console.log('Initial Supabase session:', initialSession);
    } catch (error) {
      console.error('Error initializing session / profile:', error);
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
          await Promise.all([
            initializeProfileForUser(uid),
            initializeUserStateForUser(uid),
          ]);
        } catch (error) {
          console.error('Error loading user profile / state:', error);
        }
      } else if (event === 'SIGNED_OUT') {
        await Promise.all([clearProfile(), clearUserState()]);
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
    initializeSupabaseProfile,
    signUp,
    signIn,
    signOut,
    signInWithOAuth,
  };

  return (
    <SupabaseAuthContext.Provider value={value}>
      {children}
    </SupabaseAuthContext.Provider>
  );
}
