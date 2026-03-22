import FloatingHeader from '@/components/home/FloatingHeader';
import { BodyText } from '@/components/typography/BodyText';
import { ThemedButton } from '@/components/typography/ThemedButton';
import { AppAppearanceContext } from '@/contexts/AppAppearanceContext';
import { useContext } from 'react';
import { View } from 'react-native';

export default function ProfileScreen() {
  const { colors } = useContext(AppAppearanceContext);

  return (
    <FloatingHeader title="Profile">
      <View
        style={{
          flex: 1,
          padding: 16,
          backgroundColor: colors.background,
        }}
      >
        <BodyText>Welcome to Profile Screen</BodyText>
        <ThemedButton>Edit Profile</ThemedButton>
        <ThemedButton>View History</ThemedButton>
      </View>
    </FloatingHeader>
  );
}
