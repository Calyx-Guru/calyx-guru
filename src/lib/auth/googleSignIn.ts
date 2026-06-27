import { ENV } from '@/constants';
import { normalizeUserEmail } from '@/lib/auth/userEmailStorage';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { TurboModuleRegistry } from 'react-native';

WebBrowser.maybeCompleteAuthSession();

export type GoogleSignInResult = {
  email: string;
  name?: string | null;
  photoUrl?: string | null;
};

export class GoogleSignInCancelledError extends Error {
  constructor() {
    super('Google sign-in was cancelled');
    this.name = 'GoogleSignInCancelledError';
  }
}

function getGoogleRedirectUri(): string {
  return Linking.createURL('auth/callback');
}

function getParamsFromUrl(url: string): Record<string, string> {
  const params: Record<string, string> = {};

  const queryIndex = url.indexOf('?');
  const hashIndex = url.indexOf('#');
  const query =
    queryIndex >= 0
      ? url.slice(queryIndex + 1, hashIndex >= 0 ? hashIndex : undefined)
      : '';
  const hash = hashIndex >= 0 ? url.slice(hashIndex + 1) : '';

  for (const part of [query, hash]) {
    if (!part) continue;
    const searchParams = new URLSearchParams(part);
    searchParams.forEach((value, key) => {
      params[key] = value;
    });
  }

  return params;
}

function isNativeGoogleSignInAvailable(): boolean {
  return TurboModuleRegistry.get('RNGoogleSignin') != null;
}

async function signInWithNativeGoogle(): Promise<GoogleSignInResult> {
  const {
    GoogleSignin,
    isErrorWithCode,
    isSuccessResponse,
    statusCodes,
  } = await import('@react-native-google-signin/google-signin');

  GoogleSignin.configure({
    webClientId: ENV.GOOGLE_WEB_CLIENT_ID!,
    iosClientId: ENV.GOOGLE_IOS_CLIENT_ID,
    scopes: ['profile', 'email'],
  });

  await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

  try {
    const response = await GoogleSignin.signIn();

    if (!isSuccessResponse(response)) {
      throw new GoogleSignInCancelledError();
    }

    const email = response.data.user.email?.trim();
    if (!email) {
      throw new Error('Google sign-in did not return an email address');
    }

    return {
      email: normalizeUserEmail(email),
      name: response.data.user.name,
      photoUrl: response.data.user.photo,
    };
  } catch (error) {
    if (error instanceof GoogleSignInCancelledError) {
      throw error;
    }

    if (isErrorWithCode(error)) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        throw new GoogleSignInCancelledError();
      }
      if (error.code === statusCodes.IN_PROGRESS) {
        throw new Error('Google sign-in is already in progress');
      }
      if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        throw new Error('Google Play Services is not available on this device');
      }
    }

    throw error;
  }
}

async function fetchGoogleUserInfo(accessToken: string): Promise<GoogleSignInResult> {
  const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    throw new Error('Failed to load Google account details');
  }

  const payload = (await response.json()) as {
    email?: string;
    name?: string;
    picture?: string;
  };

  const email = payload.email?.trim();
  if (!email) {
    throw new Error('Google sign-in did not return an email address');
  }

  return {
    email: normalizeUserEmail(email),
    name: payload.name ?? null,
    photoUrl: payload.picture ?? null,
  };
}

async function signInWithBrowserGoogle(): Promise<GoogleSignInResult> {
  const redirectTo = getGoogleRedirectUri();
  const authUrl =
    `https://accounts.google.com/o/oauth2/v2/auth?${new URLSearchParams({
      client_id: ENV.GOOGLE_WEB_CLIENT_ID!,
      redirect_uri: redirectTo,
      response_type: 'token',
      scope: 'openid profile email',
      include_granted_scopes: 'true',
    }).toString()}`;

  const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectTo);

  if (result.type === 'cancel' || result.type === 'dismiss') {
    throw new GoogleSignInCancelledError();
  }

  if (result.type !== 'success') {
    throw new Error('Google sign-in did not complete');
  }

  const params = getParamsFromUrl(result.url);
  if (params.error) {
    throw new Error(params.error_description ?? params.error);
  }

  const accessToken = params.access_token;
  if (!accessToken) {
    throw new Error('Google sign-in did not return an access token');
  }

  return fetchGoogleUserInfo(accessToken);
}

export async function signInWithGoogleAccount(): Promise<GoogleSignInResult> {
  if (!ENV.GOOGLE_WEB_CLIENT_ID) {
    throw new Error(
      'Google sign-in is not configured. Set EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID.',
    );
  }

  if (isNativeGoogleSignInAvailable()) {
    return signInWithNativeGoogle();
  }

  return signInWithBrowserGoogle();
}
