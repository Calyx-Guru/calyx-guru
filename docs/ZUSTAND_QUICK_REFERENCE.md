# Zustand Store - Quick Reference

## Files Created/Modified

| File                                     | Status     | Description                 |
| ---------------------------------------- | ---------- | --------------------------- |
| `src/store/userProfileStore.ts`          | ✨ Created | Main Zustand store          |
| `src/types/profile.ts`                   | ✨ Created | UserProfile TypeScript type |
| `src/lib/supabase/userProfileService.ts` | ✨ Created | Supabase service layer      |
| `src/hooks/useUserProfile.ts`            | ✨ Created | Custom hook for components  |
| `src/lib/app/initialization.ts`          | 🔧 Updated | Load profile on app startup |
| `src/contexts/SupabaseAuthContext.tsx`   | 🔧 Updated | Auth integration            |

## Store Methods Cheat Sheet

### Using the Hook (Recommended)

```tsx
import { useUserProfile } from '@/hooks/useUserProfile';

const {
  profile, // UserProfile | null
  isLoading, // boolean
  error, // string | null
  loadProfile, // (userId: string) => Promise<void>
  updateProfile, // (updates: Partial<UserProfile>) => Promise<void>
  clearProfile, // () => void
} = useUserProfile();
```

### Direct Store Access

```tsx
import { useUserProfileStore } from '@/store/userProfileStore';

// Selector (recommended for performance)
const profile = useUserProfileStore((state) => state.profile);

// Full store
const {
  profile, // UserProfile | null
  isLoading, // boolean
  error, // string | null
  setProfile, // (profile: UserProfile) => void
  updateProfile, // (updates: Partial<UserProfile>) => void
  clearProfile, // () => void
  setLoading, // (loading: boolean) => void
  setError, // (error: string | null) => void
} = useUserProfileStore();
```

## Common Patterns

### Check if User is Logged In

```tsx
const { profile } = useUserProfile();
return profile ? <ProfileContent /> : <LoginScreen />;
```

### Load Profile by ID

```tsx
const { loadProfile } = useUserProfile();

useEffect(() => {
  loadProfile(userId);
}, [userId, loadProfile]);
```

### Update Profile Field

```tsx
const { updateProfile } = useUserProfile();

await updateProfile({
  full_name: 'New Name',
});
```

### Watch for Changes

```tsx
const { profile } = useUserProfile();

useEffect(() => {
  // Real-time subscription is automatic!
  console.log('Profile updated:', profile);
}, [profile]);
```

### Handle Errors

```tsx
const { error, loadProfile } = useUserProfile();

if (error) {
  return (
    <>
      <Text>Error: {error}</Text>
      <Button title="Retry" onPress={() => loadProfile(userId)} />
    </>
  );
}
```

### Optimize with Selectors

```tsx
// Only re-render when these fields change
const fullName = useUserProfileStore((s) => s.profile?.full_name);
const avatar = useUserProfileStore((s) => s.profile?.avatar_url);
```

## Auto-Loaded Scenarios

✅ App initialization (before splash screen hides)  
✅ User signs in  
✅ Auth context loads session

## Auto-Cleared Scenarios

✅ User signs out  
✅ Session expires

## Real-Time Updates

The `useUserProfile()` hook automatically:

1. Subscribes to Supabase `postgres_changes` events
2. Updates store when profile changes on server
3. Unsubscribes when component unmounts

No additional setup needed!

## Error Handling

```tsx
const { isLoading, error } = useUserProfile();

if (isLoading) return <Spinner />;
if (error) return <ErrorView message={error} />;
if (!profile) return <EmptyView />;

return <Content />;
```

## Performance Tips

1. **Use selectors** to avoid unnecessary re-renders:

   ```tsx
   const name = useUserProfileStore((s) => s.profile?.full_name);
   ```

2. **Memoize callbacks** when updating:

   ```tsx
   const handleUpdate = useCallback(() => {
     updateProfile({ bio: '...' });
   }, [updateProfile]);
   ```

3. **Don't fetch in render**:
   ```tsx
   useEffect(() => {
     loadProfile(userId);
   }, [userId]);
   ```

## TypeScript Support

Full type safety with `UserProfile`:

```tsx
// Type-safe field access
const bio: string | null = profile?.bio;

// Type-safe updates
await updateProfile({
  full_name: 'John', // ✅ Valid
  invalid_field: 'x', // ❌ Type error
});
```

## Debugging

### In DevTools

Open Zustand DevTools browser extension to:

- View current store state
- See action history
- Time-travel through actions
- Export/import state

### In Console

```ts
// Access store from console
window.__ZUSTAND_DEVTOOLS__.store.getState();

// Update directly (only for testing!)
useUserProfileStore.setState({
  profile: mockData,
});
```

## Common Questions

**Q: When is the profile loaded?**  
A: On app initialization (before splash hides) if user is logged in.

**Q: Is the profile automatically kept in sync?**  
A: Yes! Real-time updates are automatic via `postgres_changes`.

**Q: What happens on sign out?**  
A: Profile is cleared automatically by the auth context.

**Q: Can I load a different user's profile?**  
A: Currently set up for the logged-in user, but you can extend the service layer.

**Q: Why use Zustand instead of Context?**  
A: Better performance, simpler API, better DevTools support.

## Next Steps

1. ✅ Setup complete - start using `useUserProfile()` in components
2. 📱 Build screens using the profile data
3. 🔌 Add more stores following the same pattern
4. 🎯 Implement error handling and loading states
5. 🧪 Add tests for your store usage

---

**Need help?** Check out:

- [ZUSTAND_SETUP.md](ZUSTAND_SETUP.md) - Detailed guide
- [ZUSTAND_EXAMPLES.md](ZUSTAND_EXAMPLES.md) - Code examples
- [ZUSTAND_ARCHITECTURE.md](ZUSTAND_ARCHITECTURE.md) - Architecture diagrams
