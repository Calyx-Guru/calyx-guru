/**
 * Mock data and responses for Supabase
 * Used for development and testing when USE_MOCK_DATA is enabled
 */

// Mock user data
export const mockUser = {
  id: 'mock-user-123',
  email: 'test@example.com',
  user_metadata: {
    name: 'Test User',
  },
  created_at: new Date().toISOString(),
};

// Mock auth session
export const mockSession = {
  user: mockUser,
  session: {
    access_token: 'mock-access-token-123',
    refresh_token: 'mock-refresh-token-123',
    expires_in: 3600,
    expires_at: Math.floor(Date.now() / 1000) + 3600,
    token_type: 'bearer',
  },
};

/**
 * Mock Supabase auth response
 */
export const mockAuthResponse = {
  data: mockSession,
  error: null,
};

/**
 * Mock Supabase table query response
 */
export const createMockQueryResponse = <T>(data: T) => ({
  data,
  error: null,
  count: null,
  status: 200,
  statusText: 'OK',
});

/**
 * Mock Supabase error response
 */
export const createMockErrorResponse = (message: string) => ({
  data: null,
  error: {
    message,
    code: 'MOCK_ERROR',
    status: 400,
  },
});
