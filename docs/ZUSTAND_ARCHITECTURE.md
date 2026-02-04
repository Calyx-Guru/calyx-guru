# Zustand Store Architecture

## Component Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                          React Components                        │
│                    (useUserProfile() hook)                       │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     │ useUserProfile()
                     ↓
┌─────────────────────────────────────────────────────────────────┐
│                    Zustand Store Layer                           │
│        (src/store/userProfileStore.ts)                          │
│                                                                  │
│  State:                   Actions:                              │
│  ├─ profile               ├─ setProfile()                       │
│  ├─ isLoading             ├─ updateProfile()                    │
│  └─ error                 ├─ clearProfile()                     │
│                          ├─ setLoading()                        │
│                          └─ setError()                          │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     │ Custom Hook (src/hooks/useUserProfile.ts)
                     │ ├─ loadProfile()
                     │ ├─ updateProfile()
                     │ └─ Real-time subscription
                     ↓
┌─────────────────────────────────────────────────────────────────┐
│                 Service Layer                                    │
│      (src/lib/supabase/userProfileService.ts)                   │
│                                                                  │
│  ├─ fetchUserProfile()                                          │
│  ├─ updateUserProfile()                                         │
│  └─ subscribeToProfileChangesV2()                               │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     │ Supabase Client
                     ↓
┌─────────────────────────────────────────────────────────────────┐
│                    Supabase                                      │
│                                                                  │
│  ├─ REST API (fetch, update)                                    │
│  └─ postgres_changes (real-time subscription)                   │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow Diagrams

### 1. App Initialization (Before Splash Screen Hides)

```
initializeApp()
├─ initializeLocale()
│  ├─ Load fonts
│  └─ Initialize i18n
│
└─ initializeAuth()
   ├─ Get current session
   │
   └─ IF user logged in:
      ├─ fetchUserProfile(userId)
      │  └─ Supabase: SELECT * FROM profiles WHERE id = userId
      │
      └─ useUserProfileStore.getState().setProfile(profile)
         └─ Store state updated
```

### 2. Sign In Flow

```
User clicks Sign In
    ↓
SupabaseAuthContext.signIn()
    ↓
supabase.auth.signInWithPassword()
    ↓
onAuthStateChange() triggered with SIGNED_IN event
    ├─ setSession(newSession)
    ├─ setUser(newSession.user)
    │
    └─ fetchUserProfile(userId)
       ├─ Supabase query
       └─ useUserProfileStore.getState().setProfile(profile)
```

### 3. Profile Update Flow

```
User calls useUserProfile().updateProfile({ bio: '...' })
    ↓
updateUserProfile(userId, updates)
    ├─ setLoading(true)
    │
    ├─ Supabase: UPDATE profiles SET ... WHERE id = userId
    │
    ├─ useUserProfileStore.getState().setProfile(updatedProfile)
    │
    └─ setLoading(false)

Simultaneously, postgres_changes subscription fires:
    ↓
subscribeToProfileChangesV2 callback triggered
    ↓
useUserProfileStore.getState().setProfile(updatedProfile)
```

### 4. Real-Time Updates (from other clients)

```
Another client updates the profile
    ↓
Supabase postgres_changes event
    ├─ event: 'UPDATE'
    ├─ table: 'profiles'
    ├─ filter: id=eq.{userId}
    │
    └─ Subscription callback fires
       ├─ useUserProfileStore.getState().setProfile(newProfile)
       └─ All components using profile re-render
```

### 5. Sign Out Flow

```
User clicks Sign Out
    ↓
SupabaseAuthContext.signOut()
    ├─ supabase.auth.signOut()
    │
    └─ onAuthStateChange() triggered with SIGNED_OUT event
       ├─ setSession(null)
       ├─ setUser(null)
       │
       └─ useUserProfileStore.getState().clearProfile()
          └─ profile = null
```

## State Updates Timing

### Without Profile

```
Time    App State              Component UI
────────────────────────────────────────────────
0ms     initializing           Splash screen visible
50ms    ...loading locale
100ms   ...fetching session
150ms   ...fetching profile
200ms   profile loaded         Splash screen hides
        (store updated)        Profile data ready
```

### Component Lifecycle

```
Component mounts
    ↓
useUserProfile() hook
    ├─ Get current profile from store
    ├─ Subscribe to real-time changes
    │
    └─ Return:
       ├─ profile
       ├─ isLoading
       ├─ error
       ├─ loadProfile()
       ├─ updateProfile()
       └─ clearProfile()

Component unmounts
    ↓
Unsubscribe from postgres_changes
```

## File Dependencies

```
Components
    ↓
useUserProfile() ──────────────────┐
    ├─ useUserProfileStore        │
    └─ userProfileService ─────────┼─→ Supabase
         ├─ subscribeToProfileChangesV2
         ├─ fetchUserProfile
         └─ updateUserProfile

SupabaseAuthContext ────────────────→ Supabase
    ├─ useUserProfileStore
    └─ userProfileService

initializeApp() ────────────────────→ Supabase
    └─ userProfileService
```

## Store State Shape

```typescript
{
  profile: {
    id: string,
    username: string | null,
    email: string | null,
    full_name: string | null,
    avatar_url: string | null,
    bio: string | null,
    // ... other profile fields
  } | null,

  isLoading: boolean,

  error: string | null
}
```

## Error Handling Flow

```
Operation (fetch/update)
    ├─ setLoading(true)
    │
    ├─ Execute promise
    │
    ├─ On Error:
    │  ├─ setError(errorMessage)
    │  └─ setLoading(false)
    │
    └─ On Success:
       ├─ setProfile(data) or setError(null)
       └─ setLoading(false)
```

## Type Safety Chain

```
Supabase Database Schema
    ↓ (column definitions)
Supabase Types (auto-generated or manual)
    ↓ (maps to)
UserProfile interface (src/types/profile.ts)
    ↓ (used by)
useUserProfileStore (Zustand store)
    ↓ (exposed through)
useUserProfile() hook
    ↓ (consumed by)
React Components
    └─ Full type safety ✓
```
