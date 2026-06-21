import {
  STORAGE_GOOGLE_PLAY_PATH_BY_ACCOUNT_PREFIX,
  STORAGE_GOOGLE_PLAY_USER_ID_KEY,
} from "@/constants/common";
import { ENV } from "@/constants/env";
import { createRandomUuid } from "@/lib/app/helper";
import {
  clearStoredUserEmail,
  persistSavedataPathKey,
} from "@/lib/auth/userEmailStorage";
import { storage } from "@/lib/storage";
import { Platform, TurboModuleRegistry } from "react-native";

const GOOGLE_ID_PREFIX = "google_";
const GOOGLE_SIGN_IN_TURBO_MODULE = "RNGoogleSignin";
const DEFAULT_DISPLAY_NAME = "Player";

export class GoogleSignInCancelledError extends Error {
  constructor() {
    super("Google sign-in was cancelled");
    this.name = "GoogleSignInCancelledError";
  }
}

export class GooglePlaySignInUnavailableError extends Error {
  constructor() {
    super("Google Play sign-in is not available on this device or build");
    this.name = "GooglePlaySignInUnavailableError";
  }
}

function isGoogleSignInNativeModuleAvailable(): boolean {
  if (Platform.OS !== "android") return false;
  try {
    return TurboModuleRegistry.get(GOOGLE_SIGN_IN_TURBO_MODULE) != null;
  } catch {
    return false;
  }
}

export type GooglePlaySignInResult = {
  /** App user id (`google_<Google account id>`). */
  userId: string;
  /** Raw Google account id from the sign-in SDK. */
  googleAccountId: string;
  /** Savedata storage path (`<displayName>_<uuid>`). */
  storagePathKey: string;
  /** Google account display name from sign-in. */
  displayName: string;
};

export function isGooglePlayUserId(userId: string | null | undefined): boolean {
  return !!userId && userId.startsWith(GOOGLE_ID_PREFIX);
}

export function toGooglePlayUserId(googleAccountId: string): string {
  return `${GOOGLE_ID_PREFIX}${googleAccountId}`;
}

export function fromGooglePlayUserId(
  userId: string | null | undefined,
): string | null {
  if (!isGooglePlayUserId(userId)) return null;
  return userId!.slice(GOOGLE_ID_PREFIX.length);
}

function googlePlayPathMappingKey(googleAccountId: string): string {
  return `${STORAGE_GOOGLE_PLAY_PATH_BY_ACCOUNT_PREFIX}${googleAccountId}`;
}

function sanitizeDisplayNameForStoragePath(displayName: string): string {
  const sanitized = displayName
    .trim()
    .replace(/[/\\?%*:|"<>]/g, "_")
    .replace(/\s+/g, " ")
    .slice(0, 64);
  return sanitized || DEFAULT_DISPLAY_NAME;
}

export function buildGooglePlayStoragePathKey(displayName: string): string {
  const safeName = sanitizeDisplayNameForStoragePath(displayName);
  return `${safeName}_${createRandomUuid()}`;
}

async function resolveGooglePlayStoragePathKey(
  googleAccountId: string,
  displayName: string,
): Promise<string> {
  const mappingKey = googlePlayPathMappingKey(googleAccountId);
  const existing = await storage.getItem(mappingKey);
  if (existing?.trim()) return existing.trim();

  const pathKey = buildGooglePlayStoragePathKey(displayName);
  await storage.setItem(mappingKey, pathKey);
  return pathKey;
}

export async function clearGooglePlayPathMapping(
  googleAccountId: string,
): Promise<void> {
  await storage.removeItem(googlePlayPathMappingKey(googleAccountId));
}

export function isGooglePlaySignInAvailable(): boolean {
  if (ENV.USE_MOCK_DATA) return true;
  if (Platform.OS !== "android") return false;
  if (!ENV.GOOGLE_WEB_CLIENT_ID) return false;
  return isGoogleSignInNativeModuleAvailable();
}

export async function getStoredGooglePlayUserId(): Promise<string | null> {
  return storage.getItem(STORAGE_GOOGLE_PLAY_USER_ID_KEY);
}

export async function isGooglePlaySignedIn(): Promise<boolean> {
  return (await getStoredGooglePlayUserId()) != null;
}

async function persistGooglePlayUserId(userId: string): Promise<void> {
  await storage.setItem(STORAGE_GOOGLE_PLAY_USER_ID_KEY, userId);
}

export async function clearGooglePlaySession(): Promise<void> {
  await storage.removeItem(STORAGE_GOOGLE_PLAY_USER_ID_KEY);
  await clearStoredUserEmail();
}

export async function signInWithGooglePlay(): Promise<GooglePlaySignInResult> {
  if (ENV.USE_MOCK_DATA) {
    let googleAccountId = createRandomUuid();
    googleAccountId = "MOCK" + googleAccountId.slice(4);
    const displayName = "MockPlayer";
    const userId = toGooglePlayUserId(googleAccountId);
    const storagePathKey = await resolveGooglePlayStoragePathKey(
      googleAccountId,
      displayName,
    );
    await persistGooglePlayUserId(userId);
    await persistSavedataPathKey(storagePathKey);
    return { userId, googleAccountId, storagePathKey, displayName };
  }

  if (Platform.OS !== "android") {
    throw new Error("Google Play sign-in is only available on Android");
  }

  if (!ENV.GOOGLE_WEB_CLIENT_ID) {
    throw new GooglePlaySignInUnavailableError();
  }

  if (!isGoogleSignInNativeModuleAvailable()) {
    throw new GooglePlaySignInUnavailableError();
  }

  const { GoogleSignin, isCancelledResponse, isSuccessResponse, statusCodes } =
    await import("@react-native-google-signin/google-signin");

  GoogleSignin.configure({
    webClientId: ENV.GOOGLE_WEB_CLIENT_ID,
    offlineAccess: false,
    scopes: ["profile"],
  });

  try {
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    const response = await GoogleSignin.signIn();

    if (isCancelledResponse(response)) {
      throw new GoogleSignInCancelledError();
    }

    if (!isSuccessResponse(response)) {
      throw new Error("Google sign-in did not complete successfully");
    }

    const googleAccountId = response.data.user.id;
    if (!googleAccountId) {
      throw new Error("No Google user id returned from sign-in");
    }

    const displayName =
      response.data.user.name?.trim() ||
      response.data.user.givenName?.trim() ||
      DEFAULT_DISPLAY_NAME;
    const storagePathKey = await resolveGooglePlayStoragePathKey(
      googleAccountId,
      displayName,
    );

    const userId = toGooglePlayUserId(googleAccountId);
    await persistGooglePlayUserId(userId);
    await persistSavedataPathKey(storagePathKey);
    return { userId, googleAccountId, storagePathKey, displayName };
  } catch (error: unknown) {
    const code =
      error && typeof error === "object" && "code" in error
        ? String((error as { code: unknown }).code)
        : undefined;

    if (code === statusCodes.SIGN_IN_CANCELLED) {
      throw new GoogleSignInCancelledError();
    }

    throw error;
  }
}

export async function signOutGooglePlay(): Promise<void> {
  await clearGooglePlaySession();

  if (Platform.OS !== "android" || ENV.USE_MOCK_DATA) return;
  if (!isGoogleSignInNativeModuleAvailable()) return;

  try {
    const { GoogleSignin } =
      await import("@react-native-google-signin/google-signin");
    await GoogleSignin.signOut();
  } catch (error) {
    console.warn("Google Sign-In local sign-out failed:", error);
  }
}
