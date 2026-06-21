/**
 * Mock Supabase client for development and testing
 * Simulates Supabase API responses without making actual network requests
 */

import { createMockQueryResponse, mockSession, mockUser } from './mocks';

/**
 * Mock auth object that mirrors Supabase auth interface
 */
export const createMockAuthClient = () => {
  let currentSession: (typeof mockSession.session & { user: typeof mockUser }) | null =
    null;

  return {
    getSession: async () => ({
      data: { session: currentSession },
      error: null,
    }),
    getUser: async () => ({
      data: { user: currentSession?.user ?? null },
      error: null,
    }),
    signInWithPassword: async (_email: string, _password: string) => {
      currentSession = { ...mockSession.session, user: mockUser };
      return {
        data: { session: currentSession, user: mockUser },
        error: null,
      };
    },
    signUp: async (_email: string, _password: string) => {
      currentSession = { ...mockSession.session, user: mockUser };
      return {
        data: { session: currentSession, user: mockUser },
        error: null,
      };
    },
    signOut: async () => {
      currentSession = null;
      return {
        error: null,
      };
    },
    signInWithIdToken: async ({
      provider,
    }: {
      provider: string;
      token: string;
    }) => {
      if (provider !== 'google') {
        return {
          data: { session: null, user: null },
          error: { message: `Unsupported provider: ${provider}` },
        };
      }

      currentSession = { ...mockSession.session, user: mockUser };
      return {
        data: { session: currentSession, user: mockUser },
        error: null,
      };
    },
    onAuthStateChange: (_callback: any) => {
      return {
        data: { subscription: { unsubscribe: () => {} } },
      };
    },
  };
};

/**
 * Mock from object that mirrors Supabase table interface
 */
export const createMockFromClient = () => {
  return {
    select: function (_columns?: string) {
      return {
        eq: function (_column: string, _value: any) {
          return {
            single: async () => createMockQueryResponse(null),
            maybeSingle: async () => createMockQueryResponse(null),
          };
        },
        range: function (_from: number, _to: number) {
          return {
            then: async () => createMockQueryResponse([]),
            catch: () => {},
          };
        },
        then: async () => createMockQueryResponse([]),
        catch: () => {},
      };
    },
    insert: function (_data: any) {
      return {
        select: function () {
          return {
            then: async () => createMockQueryResponse(_data),
            catch: () => {},
          };
        },
        then: async () => createMockQueryResponse(_data),
        catch: () => {},
      };
    },
    update: function (_data: any) {
      return {
        eq: function (_column: string, _value: any) {
          return {
            select: function () {
              return {
                single: async () => createMockQueryResponse(_data),
                maybeSingle: async () => createMockQueryResponse(_data),
                then: async () => createMockQueryResponse(_data),
                catch: () => {},
              };
            },
            then: async () => createMockQueryResponse(_data),
            catch: () => {},
          };
        },
      };
    },
    delete: function () {
      return {
        eq: function (_column: string, _value: any) {
          return {
            then: async () => createMockQueryResponse({}),
            catch: () => {},
          };
        },
      };
    },
  };
};

/**
 * Create a mock Supabase client that mirrors the real client's interface
 */
export const createMockSupabaseClient = () => {
  return {
    auth: createMockAuthClient(),
    from: () => createMockFromClient(),
    rpc: async (_functionName: string, _params?: any) => {
      return createMockQueryResponse({});
    },
  };
};

export default createMockSupabaseClient;
