import { BodyText } from '@/components/typography/BodyText';
import { ThemedButton } from '@/components/typography/ThemedButton';
import { AppAppearanceContext } from '@/contexts/AppAppearanceContext';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { router } from 'expo-router';
import { useContext } from 'react';
import { View } from 'react-native';

export default function SettingsScreen() {
  const { user } = useSupabaseAuth();
  const { colors } = useContext(AppAppearanceContext);

  const handlePersonalInformationPressed = () => {
    router.navigate('/(modal)/personal-information' as any);
  };

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.background,
      }}
    >
      <View
        style={{
          padding: 16,
        }}
      >
        <BodyText>Welcome to Settings Screen</BodyText>
        <ThemedButton onPress={handlePersonalInformationPressed}>
          Personal Infomation
        </ThemedButton>
        <ThemedButton>Language</ThemedButton>
        <ThemedButton>Account</ThemedButton>
      </View>
    </View>
  );
}
