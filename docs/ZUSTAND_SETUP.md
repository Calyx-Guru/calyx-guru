# User Profile Store (Zustand) Documentation

## Overview

This project uses **Zustand** for state management, starting with a user profile store. The store handles:

- Loading user profiles from Supabase on app initialization
- Updating the store when auth state changes
- Real-time synchronization of profile updates
- Clearing profile data on sign out

## File Structure

```
src/
├── store/
│   └── userProfileStore.ts          # Zustand store definition
├── types/
│   └── profile.ts                   # UserProfile type definition
├── lib/supabase/
│   └── userProfileService.ts        # Supabase profile operations
├── hooks/
│   └── useUserProfile.ts            # Custom hook for profile management
├── contexts/
│   └── SupabaseAuthContext.tsx      # Integration with auth flow
└── lib/app/
    └── initialization.ts             # App initialization logic
```

## Store Definition

The store is defined in [src/store/userProfileStore.ts](src/store/userProfileStore.ts) and provides:

### State

- `profile`: The user's profile data (`UserProfile | null`)
- `isLoading`: Loading indicator for async operations
- `error`: Error message from failed operations

### Actions

- `setProfile(profile)`: Set the entire profile
- `updateProfile(updates)`: Update specific profile fields
- `clearProfile()`: Clear profile data (used on sign out)
- `setLoading(loading)`: Set loading state
- `setError(error)`: Set error message

### Initialization

The store is initialized with `devtools` middleware for debugging in Zustand DevTools.

## Usage

### In Components

Using the custom hook (recommended):

```tsx
import { useUserProfile } from '@/hooks/useUserProfile';

function MyComponent() {
  const { profile, isLoading, error, updateProfile } = useUserProfile();

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;
  if (!profile) return <NotLoggedIn />;

  return (
    <View>
      <Text>{profile.full_name}</Text>
      <Button
        title="Update Profile"
        onPress={() => updateProfile({ bio: 'New bio' })}
      />
    </View>
  );
}
```

### Direct Store Access

For cases where you don't need to load/update:

```tsx
import { useUserProfileStore } from '@/store/userProfileStore';

function MyComponent() {
  const profile = useUserProfileStore((state) => state.profile);
  return <Text>{profile?.full_name}</Text>;
}
```

## Integration with Auth Flow

### App Initialization

When the app starts, the `initializeApp()` function (called before the splash screen hides):

1. Checks if a session exists
2. If user is logged in, loads their profile from Supabase
3. Sets the profile in the store

See [src/lib/app/initialization.ts](src/lib/app/initialization.ts)

### Auth State Changes

The `SupabaseAuthContext` listens for auth state changes and:

- Loads profile on `SIGNED_IN` event
- Clears profile on `SIGNED_OUT` event

See [src/contexts/SupabaseAuthContext.tsx](src/contexts/SupabaseAuthContext.tsx)

### Real-time Updates

The `useUserProfile` hook automatically subscribes to real-time changes when a profile is loaded, using Supabase's `postgres_changes` channel. Updates are pushed to the store immediately.

## Service Layer

The [src/lib/supabase/userProfileService.ts](src/lib/supabase/userProfileService.ts) file provides:

- `fetchUserProfile(userId)`: Fetch a user's profile from Supabase
- `updateUserProfile(userId, updates)`: Update profile data
- `subscribeToProfileChangesV2(userId, callback)`: Subscribe to real-time changes

## Type Safety

The `UserProfile` type in [src/types/profile.ts](src/types/profile.ts) matches the Supabase `profiles` table schema exactly, ensuring type safety throughout the app.

## Best Practices

1. **Use the custom hook**: Always prefer `useUserProfile()` over direct store access
2. **Handle loading states**: Check `isLoading` when performing async operations
3. **Handle errors**: Display error messages to users when operations fail
4. **Don't store sensitive data**: The profile store stores public profile data; never store passwords or sensitive tokens
5. **Real-time sync**: Profile changes are automatically synced via the `postgres_changes` subscription

## Adding More Stores

To add additional Zustand stores:

1. Create a new store file in `src/store/` (e.g., `userSettingsStore.ts`)
2. Define your store using `create()` with `devtools` middleware
3. Create a custom hook in `src/hooks/` if needed
4. Follow the same patterns used in the user profile store

Example:

```tsx
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface UserSettings {
  theme: 'light' | 'dark';
  language: string;
  // ...
}

interface UserSettingsStore {
  settings: UserSettings | null;
  updateSettings: (updates: Partial<UserSettings>) => void;
}

export const useUserSettingsStore = create<UserSettingsStore>()(
  devtools(
    (set) => ({
      settings: null,
      updateSettings: (updates) =>
        set((state) => ({
          settings: state.settings ? { ...state.settings, ...updates } : null,
        })),
    }),
    { name: 'UserSettingsStore' },
  ),
);
```

## Debugging

Use the [Zustand DevTools browser extension](https://github.com/react-native-community/browser-devtools) to inspect store state and actions during development.

The store is automatically registered with DevTools as `UserProfileStore`.
