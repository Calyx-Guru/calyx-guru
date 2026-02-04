# 🎯 START HERE - Zustand Setup Guide

## Welcome! 👋

Your Zustand user profile store is **completely set up** and ready to use. This is your starting point.

## What You Have ✨

A **production-ready** Zustand store that:

- 📦 Stores user profile data
- 🔄 Auto-loads on app initialization
- 📡 Syncs in real-time from Supabase
- 🔐 Fully type-safe
- 🎨 Perfect for your Expo/React Native app

## 5-Minute Quick Start

### 1️⃣ Use the Hook in Your Component

```tsx
import { useUserProfile } from '@/hooks/useUserProfile';

export function ProfileScreen() {
  const { profile, isLoading } = useUserProfile();

  if (isLoading) return <Text>Loading...</Text>;
  if (!profile) return <Text>No profile</Text>;

  return (
    <View>
      <Text>Name: {profile.full_name}</Text>
      <Text>Bio: {profile.bio}</Text>
    </View>
  );
}
```

### 2️⃣ Update Profile

```tsx
const { updateProfile } = useUserProfile();

// Update a single field
await updateProfile({ bio: 'Explorer 🌍' });

// Update multiple fields
await updateProfile({
  full_name: 'John Doe',
  bio: 'Developer',
  location: 'San Francisco',
});
```

### 3️⃣ Handle Errors

```tsx
const { error } = useUserProfile();

if (error) {
  return <Text style={{ color: 'red' }}>Error: {error}</Text>;
}
```

**That's it!** Everything else is automatic.

## How It Works 🔄

```
You open the app
    ↓
Profile loads silently in background (before splash hides)
    ↓
Your components can use useUserProfile()
    ↓
Profile updates happen in real-time
    ↓
Sign out clears the profile automatically
```

## 📚 Documentation Paths

Choose your path based on what you need:

### 🚀 **I Just Want to Use It**

→ [ZUSTAND_QUICK_REFERENCE.md](ZUSTAND_QUICK_REFERENCE.md)

- 2-minute cheat sheet
- All methods and usage patterns
- Common examples

### 💡 **I Want to Understand How It Works**

→ [ZUSTAND_ARCHITECTURE.md](ZUSTAND_ARCHITECTURE.md)

- Data flow diagrams
- Architecture overview
- System design

### 📖 **I Want Complete Details**

→ [ZUSTAND_SETUP.md](ZUSTAND_SETUP.md)

- Full technical guide
- All features explained
- Best practices

### 🎓 **I Learn Best by Example**

→ [ZUSTAND_EXAMPLES.md](ZUSTAND_EXAMPLES.md)

- 10+ real-world examples
- Copy-paste ready code
- Common patterns

### 🗺️ **I'm Lost, Help Me Navigate**

→ [ZUSTAND_INDEX.md](ZUSTAND_INDEX.md)

- Doc index by experience level
- Quick navigation
- Troubleshooting

## Available Docs

| Doc                                                                        | Time   | Best For           |
| -------------------------------------------------------------------------- | ------ | ------------------ |
| [ZUSTAND_QUICK_REFERENCE.md](ZUSTAND_QUICK_REFERENCE.md)                   | 2 min  | Quick lookup       |
| [ZUSTAND_EXAMPLES.md](ZUSTAND_EXAMPLES.md)                                 | 5 min  | See examples       |
| [ZUSTAND_ARCHITECTURE.md](ZUSTAND_ARCHITECTURE.md)                         | 10 min | Understand design  |
| [ZUSTAND_SETUP.md](ZUSTAND_SETUP.md)                                       | 15 min | Full details       |
| [ZUSTAND_INDEX.md](ZUSTAND_INDEX.md)                                       | 5 min  | Find what you need |
| [ZUSTAND_COMPLETE.md](ZUSTAND_COMPLETE.md)                                 | 3 min  | Overview           |
| [ZUSTAND_FILE_STRUCTURE.md](ZUSTAND_FILE_STRUCTURE.md)                     | 5 min  | Visual summary     |
| [ZUSTAND_IMPLEMENTATION_CHECKLIST.md](ZUSTAND_IMPLEMENTATION_CHECKLIST.md) | 10 min | Verify setup       |

## Files in Your Project

### New Files (4)

```
✨ src/store/userProfileStore.ts
✨ src/types/profile.ts
✨ src/lib/supabase/userProfileService.ts
✨ src/hooks/useUserProfile.ts
```

### Updated Files (2)

```
🔧 src/lib/app/initialization.ts
🔧 src/contexts/SupabaseAuthContext.tsx
```

## The Core Hook

Here's all you need to remember:

```tsx
import { useUserProfile } from '@/hooks/useUserProfile';

const {
  profile, // UserProfile | null
  isLoading, // boolean
  error, // string | null
  loadProfile, // async function
  updateProfile, // async function
  clearProfile, // sync function
} = useUserProfile();
```

## Real-World Example

```tsx
import { useUserProfile } from '@/hooks/useUserProfile';
import { View, Text, TextInput, Button, ActivityIndicator } from 'react-native';
import { useState } from 'react';

export function EditProfileScreen() {
  const { profile, isLoading, error, updateProfile } = useUserProfile();
  const [bio, setBio] = useState(profile?.bio || '');

  const handleSave = async () => {
    try {
      await updateProfile({ bio });
      alert('Profile updated!');
    } catch (err) {
      alert('Error: ' + error);
    }
  };

  if (isLoading) return <ActivityIndicator />;

  return (
    <View style={{ padding: 16 }}>
      <TextInput value={bio} onChangeText={setBio} placeholder="Your bio" />
      <Button title="Save" onPress={handleSave} disabled={isLoading} />
      {error && <Text style={{ color: 'red' }}>{error}</Text>}
    </View>
  );
}
```

## Common Questions ❓

**Q: Is the profile already loaded?**  
A: Yes! It's loaded on app init (before splash screen hides).

**Q: How do I access it in a component?**  
A: Just use `const { profile } = useUserProfile()`.

**Q: Does it update in real-time?**  
A: Yes, automatically via Supabase subscriptions.

**Q: What if the user isn't logged in?**  
A: `profile` will be `null`, so check for it.

**Q: How do I clear the profile?**  
A: Call `clearProfile()` or it clears automatically on sign-out.

**Q: Is there TypeScript support?**  
A: Yes! Full type safety with `UserProfile` type.

## Next Steps 🚀

1. **Copy one of the examples** from [ZUSTAND_EXAMPLES.md](ZUSTAND_EXAMPLES.md)
2. **Use it in your screen**
3. **Test by signing in/out**
4. **Check Zustand DevTools** (if you install it)

## Troubleshooting 🐛

### Profile not loading?

Check [ZUSTAND_SETUP.md#app-initialization](ZUSTAND_SETUP.md#app-initialization)

### Real-time updates not working?

Check [ZUSTAND_SETUP.md#real-time-updates](ZUSTAND_SETUP.md#real-time-updates)

### TypeScript errors?

Check [ZUSTAND_SETUP.md#type-safety](ZUSTAND_SETUP.md#type-safety)

## Key Concepts 🎯

### The Store

Central state management. Located in `src/store/userProfileStore.ts`.  
Manages: `profile`, `isLoading`, `error`.

### The Hook

Component integration. Located in `src/hooks/useUserProfile.ts`.  
Provides: All you need to use the profile in components.

### The Service

Supabase API. Located in `src/lib/supabase/userProfileService.ts`.  
Does: Fetch, update, real-time sync.

### The Types

Type definitions. Located in `src/types/profile.ts`.  
Provides: Full TypeScript support.

## Features ✨

✅ Automatic loading on app init  
✅ Real-time synchronization  
✅ Type-safe operations  
✅ Error handling  
✅ Loading states  
✅ DevTools support  
✅ Supabase integration  
✅ Easy to extend

## Performance 🚀

- **No polling** - Real-time subscriptions
- **No unnecessary renders** - Selector pattern
- **Automatic cleanup** - Unsubscribe on unmount
- **Efficient** - Only loads what's needed

## You're Ready! 🎉

Start using the hook in your components:

```tsx
const { profile } = useUserProfile();
```

The store will automatically:

- Load profile on app init
- Sync in real-time
- Clear on sign-out
- Handle errors gracefully

No additional setup needed!

---

## Quick Links

| What I Want       | Where to Go                                                                |
| ----------------- | -------------------------------------------------------------------------- |
| Copy-paste code   | [ZUSTAND_EXAMPLES.md](ZUSTAND_EXAMPLES.md)                                 |
| Understand design | [ZUSTAND_ARCHITECTURE.md](ZUSTAND_ARCHITECTURE.md)                         |
| Cheat sheet       | [ZUSTAND_QUICK_REFERENCE.md](ZUSTAND_QUICK_REFERENCE.md)                   |
| Find docs         | [ZUSTAND_INDEX.md](ZUSTAND_INDEX.md)                                       |
| Full guide        | [ZUSTAND_SETUP.md](ZUSTAND_SETUP.md)                                       |
| Verify setup      | [ZUSTAND_IMPLEMENTATION_CHECKLIST.md](ZUSTAND_IMPLEMENTATION_CHECKLIST.md) |

---

**Status:** ✅ Complete and ready to use  
**TypeScript:** ✅ Fully supported  
**Errors:** ✅ Zero  
**Next Step:** Use `useUserProfile()` in your first component!

Happy coding! 🚀
