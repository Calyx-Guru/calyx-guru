# Zustand Store - Code Examples

## Basic Usage Examples

### Example 1: Display User Profile

```tsx
import { useUserProfile } from '@/hooks/useUserProfile';
import { View, Text, ActivityIndicator } from 'react-native';

export function UserProfileScreen() {
  const { profile, isLoading } = useUserProfile();

  if (isLoading) {
    return <ActivityIndicator size="large" />;
  }

  if (!profile) {
    return <Text>No profile found</Text>;
  }

  return (
    <View style={{ padding: 16 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold' }}>
        {profile.full_name || 'User'}
      </Text>
      <Text style={{ color: '#666' }}>@{profile.username}</Text>
      {profile.bio && <Text style={{ marginTop: 8 }}>{profile.bio}</Text>}
    </View>
  );
}
```

### Example 2: Update Profile

```tsx
import { useUserProfile } from '@/hooks/useUserProfile';
import { View, TextInput, Button, Alert } from 'react-native';
import { useState } from 'react';

export function EditProfileScreen() {
  const { profile, isLoading, error, updateProfile } = useUserProfile();
  const [bio, setBio] = useState(profile?.bio || '');

  const handleSave = async () => {
    try {
      await updateProfile({ bio });
      Alert.alert('Success', 'Profile updated!');
    } catch (err) {
      Alert.alert('Error', error || 'Failed to update profile');
    }
  };

  return (
    <View style={{ padding: 16, gap: 12 }}>
      <TextInput
        value={bio}
        onChangeText={setBio}
        placeholder="Enter your bio"
        editable={!isLoading}
      />
      <Button
        title={isLoading ? 'Saving...' : 'Save'}
        onPress={handleSave}
        disabled={isLoading}
      />
    </View>
  );
}
```

### Example 3: Load Profile on Component Mount

```tsx
import { useUserProfile } from '@/hooks/useUserProfile';
import { useEffect } from 'react';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';

export function ProfileDetailScreen() {
  const { user } = useSupabaseAuth();
  const { profile, loadProfile } = useUserProfile();

  useEffect(() => {
    if (user && !profile) {
      // Load profile if not already loaded
      loadProfile(user.id);
    }
  }, [user, profile, loadProfile]);

  return (
    <View>
      {profile ? (
        <Text>Profile: {profile.full_name}</Text>
      ) : (
        <Text>Loading...</Text>
      )}
    </View>
  );
}
```

### Example 4: Handle Errors Gracefully

```tsx
import { useUserProfile } from '@/hooks/useUserProfile';
import { View, Text, TouchableOpacity } from 'react-native';

export function ProfileWithErrorHandling() {
  const { profile, isLoading, error, loadProfile, clearProfile } =
    useUserProfile();

  if (error) {
    return (
      <View style={{ padding: 16, backgroundColor: '#fee', borderRadius: 8 }}>
        <Text style={{ color: '#c00', fontWeight: 'bold' }}>Error</Text>
        <Text style={{ color: '#c00', marginTop: 8 }}>{error}</Text>
        <TouchableOpacity
          style={{
            marginTop: 12,
            padding: 8,
            backgroundColor: '#c00',
            borderRadius: 4,
          }}
          onPress={() => loadProfile(profile?.id || '')}
        >
          <Text style={{ color: '#fff' }}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (isLoading) {
    return <Text>Loading profile...</Text>;
  }

  return (
    <View>
      <Text>{profile?.full_name}</Text>
    </View>
  );
}
```

### Example 5: Direct Store Access (without hook)

```tsx
import { useUserProfileStore } from '@/store/userProfileStore';
import { View, Text } from 'react-native';

export function SimpleProfileDisplay() {
  // Access specific store values using selector
  const profile = useUserProfileStore((state) => state.profile);
  const isLoading = useUserProfileStore((state) => state.isLoading);

  return (
    <View>
      <Text>{profile?.full_name || 'Loading...'}</Text>
    </View>
  );
}

// Or access entire store
export function FullStoreAccess() {
  const store = useUserProfileStore();

  return (
    <View>
      <Text>Name: {store.profile?.full_name}</Text>
      <Text>Loading: {store.isLoading}</Text>
      <Text>Error: {store.error || 'None'}</Text>
    </View>
  );
}
```

### Example 6: Real-Time Profile Updates

```tsx
import { useUserProfile } from '@/hooks/useUserProfile';
import { View, Text } from 'react-native';
import { useEffect, useState } from 'react';

export function RealtimeProfileDisplay() {
  const { profile } = useUserProfile();
  const [updateCount, setUpdateCount] = useState(0);

  useEffect(() => {
    // Profile changes automatically tracked via postgres_changes subscription
    setUpdateCount((prev) => prev + 1);
  }, [profile?.modified_at]); // Re-run when profile is updated

  return (
    <View>
      <Text>{profile?.full_name}</Text>
      <Text style={{ fontSize: 12, color: '#666' }}>
        Profile updated {updateCount} times
      </Text>
    </View>
  );
}
```

### Example 7: Conditional Rendering Based on Profile

```tsx
import { useUserProfile } from '@/hooks/useUserProfile';
import { View, Text, TouchableOpacity } from 'react-native';

export function ConditionalProfile() {
  const { profile, clearProfile } = useUserProfile();
  const profileCompletion = profile?.profile_completion || 0;

  if (!profile) {
    return <Text>Please sign in</Text>;
  }

  if (profileCompletion < 50) {
    return (
      <View style={{ padding: 16, backgroundColor: '#ffe' }}>
        <Text>Complete your profile!</Text>
        <Text>Progress: {profileCompletion}%</Text>
      </View>
    );
  }

  return (
    <View>
      <Text>Welcome, {profile.full_name}!</Text>
      <TouchableOpacity onPress={() => clearProfile()}>
        <Text>Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
}
```

### Example 8: Update Multiple Fields

```tsx
import { useUserProfile } from '@/hooks/useUserProfile';
import { View, TextInput, Button } from 'react-native';
import { useState } from 'react';

export function CompleteProfileForm() {
  const { profile, isLoading, updateProfile } = useUserProfile();
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || '',
    bio: profile?.bio || '',
    location: profile?.location || '',
    website: profile?.website || '',
  });

  const handleSubmit = async () => {
    await updateProfile(formData);
  };

  return (
    <View style={{ padding: 16, gap: 12 }}>
      <TextInput
        placeholder="Full Name"
        value={formData.full_name}
        onChangeText={(text) => setFormData({ ...formData, full_name: text })}
      />
      <TextInput
        placeholder="Bio"
        value={formData.bio}
        onChangeText={(text) => setFormData({ ...formData, bio: text })}
        multiline
      />
      <TextInput
        placeholder="Location"
        value={formData.location}
        onChangeText={(text) => setFormData({ ...formData, location: text })}
      />
      <TextInput
        placeholder="Website"
        value={formData.website}
        onChangeText={(text) => setFormData({ ...formData, website: text })}
      />
      <Button
        title={isLoading ? 'Saving...' : 'Save Profile'}
        onPress={handleSubmit}
        disabled={isLoading}
      />
    </View>
  );
}
```

### Example 9: Custom Store Hook Pattern

If you need a more specialized hook:

```tsx
import { useUserProfile } from '@/hooks/useUserProfile';

/**
 * Hook that focuses on user's avatar
 * Useful if you want to abstract profile updates for just avatar
 */
export function useUserAvatar() {
  const { profile, updateProfile } = useUserProfile();

  const updateAvatar = async (avatarUrl: string) => {
    return updateProfile({ avatar_url: avatarUrl });
  };

  return {
    avatar: profile?.avatar_url,
    updateAvatar,
  };
}

// Usage
function AvatarPicker() {
  const { avatar, updateAvatar } = useUserAvatar();

  return (
    <TouchableOpacity onPress={() => updateAvatar('new-url')}>
      <Image source={{ uri: avatar }} />
    </TouchableOpacity>
  );
}
```

### Example 10: Integration with Settings Screen

```tsx
import { useUserProfile } from '@/hooks/useUserProfile';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { View, Text, Button, Switch } from 'react-native';
import { useState } from 'react';

export function SettingsScreen() {
  const { profile, updateProfile } = useUserProfile();
  const { signOut } = useSupabaseAuth();
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(
    profile?.two_factor_enabled || false,
  );

  const handleTwoFactorToggle = async (value: boolean) => {
    setTwoFactorEnabled(value);
    try {
      await updateProfile({ two_factor_enabled: value });
    } catch (error) {
      // Revert on error
      setTwoFactorEnabled(!value);
    }
  };

  return (
    <View style={{ padding: 16, gap: 16 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text>Two-Factor Authentication</Text>
        <Switch
          value={twoFactorEnabled}
          onValueChange={handleTwoFactorToggle}
        />
      </View>

      <Text style={{ marginTop: 16, fontWeight: 'bold' }}>
        Language: {profile?.language || 'English'}
      </Text>

      <Button title="Sign Out" onPress={signOut} color="#f00" />
    </View>
  );
}
```

## Testing Examples

```tsx
import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useUserProfile } from '@/hooks/useUserProfile';
import * as profileService from '@/lib/supabase/userProfileService';

// Mock the service
jest.mock('@/lib/supabase/userProfileService');

describe('useUserProfile', () => {
  it('should load profile successfully', async () => {
    const mockProfile = {
      id: 'user-123',
      full_name: 'John Doe',
      bio: 'Developer',
      // ... other fields
    };

    (profileService.fetchUserProfile as jest.Mock).mockResolvedValue(
      mockProfile,
    );

    const { result } = renderHook(() => useUserProfile());

    await act(async () => {
      await result.current.loadProfile('user-123');
    });

    await waitFor(() => {
      expect(result.current.profile).toEqual(mockProfile);
    });
  });

  it('should handle errors', async () => {
    const error = new Error('Network error');
    (profileService.fetchUserProfile as jest.Mock).mockRejectedValue(error);

    const { result } = renderHook(() => useUserProfile());

    await act(async () => {
      await result.current.loadProfile('user-123');
    });

    await waitFor(() => {
      expect(result.current.error).toBeTruthy();
    });
  });
});
```
