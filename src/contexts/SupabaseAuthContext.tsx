import { useUserProfile } from '@/hooks/useUserProfile';
import supabase from '@/lib/supabase/client';
import { fetchUserProfile } from '@/lib/supabase/userProfileService';
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

  const { setProfile, clearProfile, loadProfileFromLocalStorage } =
    useUserProfile();

  // Get initial session on mount and subscribe to changes
  useEffect(() => {
    const getSession = async () => {
      try {
        const {
          data: { session: initialSession },
        } = await supabase.auth.getSession();
        setSession(initialSession);
        setUser(initialSession?.user ?? null);

        // Load user profile if logged in
        if (initialSession?.user) {
          try {
            const userProfile = await fetchUserProfile(initialSession.user.id);
            if (userProfile) {
              setProfile(userProfile);
            }
          } catch (error) {
            console.error('Error loading user profile:', error);
          }
        }
      } catch (error) {
        console.error('Error getting session:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProfileFromLocalStorage();
    getSession();

    // Listen to auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
      setIsLoading(false);

      // Load profile on sign in, clear on sign out
      if (event === 'SIGNED_IN' && newSession?.user) {
        try {
          const userProfile = await fetchUserProfile(newSession.user.id);
          if (userProfile) {
            setProfile(userProfile);
          }
        } catch (error) {
          console.error('Error loading user profile:', error);
        }
      } else if (event === 'SIGNED_OUT') {
        clearProfile();
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

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
