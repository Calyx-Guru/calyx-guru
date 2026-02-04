# Zustand User Profile Store - Setup Summary

## ✅ What Was Created

### 1. **Store Definition** (`src/store/userProfileStore.ts`)

- Zustand store for managing user profile state
- DevTools middleware enabled for debugging
- Actions: `setProfile`, `updateProfile`, `clearProfile`, `setLoading`, `setError`
- State: `profile`, `isLoading`, `error`

### 2. **Type Definition** (`src/types/profile.ts`)

- `UserProfile` interface matching the Supabase `profiles` table schema
- Complete type safety for all profile fields

### 3. **Service Layer** (`src/lib/supabase/userProfileService.ts`)

- `fetchUserProfile()` - Fetch profile from Supabase
- `updateUserProfile()` - Update profile in Supabase
- `subscribeToProfileChangesV2()` - Real-time synchronization with Supabase

### 4. **Custom Hook** (`src/hooks/useUserProfile.ts`)

- Easy-to-use hook for components
- Includes auto-subscription to real-time changes
- Methods: `loadProfile()`, `updateProfile()`, `clearProfile()`
- Handles loading and error states

### 5. **App Initialization** (`src/lib/app/initialization.ts` - Updated)

- Loads user profile before splash screen hides
- Only loads if user is already logged in
- Profile data is available when app is fully initialized

### 6. **Auth Integration** (`src/contexts/SupabaseAuthContext.tsx` - Updated)

- Automatically loads profile on sign in
- Automatically clears profile on sign out
- Integrates with auth state changes

### 7. **Documentation** (`ZUSTAND_SETUP.md`)

- Comprehensive guide on using the store
- Best practices and patterns
- How to add more stores

## 🚀 How It Works

### App Lifecycle

```
App Start
  ↓
initializeApp() runs (splash screen visible)
  ├─ initializeLocale()
  └─ initializeAuth()
       └─ Fetch & load user profile to store
  ↓
Splash screen hides
  ↓
App ready with profile data
```

### Real-time Updates

```
User edits profile in Supabase
  ↓
postgres_changes subscription triggered
  ↓
useUserProfile() hook receives update
  ↓
Store state updated
  ↓
Components re-render automatically
```

### Sign Out Flow

```
User clicks sign out
  ↓
SupabaseAuthContext detects SIGNED_OUT event
  ↓
clearProfile() called
  ↓
Profile removed from store
  ↓
Components using profile data can show default UI
```

## 📝 Quick Usage Example

```tsx
import { useUserProfile } from '@/hooks/useUserProfile';

function ProfileScreen() {
  const { profile, isLoading, error, updateProfile } = useUserProfile();

  if (isLoading) return <ActivityIndicator />;
  if (error) return <Text>Error: {error}</Text>;
  if (!profile) return <Text>No profile found</Text>;

  return (
    <View>
      <Text>Welcome, {profile.full_name}!</Text>
      <Button
        title="Update Bio"
        onPress={() => updateProfile({ bio: 'Adventurer 🌍' })}
      />
    </View>
  );
}
```

## 🔧 Next Steps

1. **Test the setup**:
   - Run the app and verify profile loads on sign in
   - Check Zustand DevTools for store state

2. **Add more stores** following the same pattern:
   - User preferences store
   - User settings store
   - Any other domain-specific stores

3. **Enhance error handling**:
   - Add user-facing error notifications
   - Implement retry logic for failed requests

4. **Add optimistic updates**:
   - Update UI immediately when user makes changes
   - Sync with server in background

## 📚 File Locations

| File                                                                             | Purpose                  |
| -------------------------------------------------------------------------------- | ------------------------ |
| [src/store/userProfileStore.ts](src/store/userProfileStore.ts)                   | Zustand store definition |
| [src/types/profile.ts](src/types/profile.ts)                                     | UserProfile type         |
| [src/lib/supabase/userProfileService.ts](src/lib/supabase/userProfileService.ts) | Supabase operations      |
| [src/hooks/useUserProfile.ts](src/hooks/useUserProfile.ts)                       | Custom hook              |
| [src/lib/app/initialization.ts](src/lib/app/initialization.ts)                   | App startup logic        |
| [src/contexts/SupabaseAuthContext.tsx](src/contexts/SupabaseAuthContext.tsx)     | Auth integration         |
| [ZUSTAND_SETUP.md](ZUSTAND_SETUP.md)                                             | Detailed documentation   |

## 🎯 Key Features

✅ Profile loads automatically when user is logged in  
✅ Real-time synchronization with Supabase  
✅ Automatic cleanup on sign out  
✅ Full type safety  
✅ DevTools support for debugging  
✅ Easy to extend with more stores  
✅ Proper loading and error states  
✅ Clean separation of concerns (store, service, hook)

---

You're all set! The Zustand user profile store is ready to use. Start by running the app and signing in to see it in action.
