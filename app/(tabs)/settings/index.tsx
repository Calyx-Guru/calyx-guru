import FloatingHeader from '@/components/home/FloatingHeader';
import { BodyText } from '@/components/typography/BodyText';
import { ThemedButton } from '@/components/typography/ThemedButton';
import { AppAppearanceContext } from '@/contexts/AppAppearanceContext';
import { useContext } from 'react';
import { View } from 'react-native';

export default function SettingsScreen() {
  const { colors } = useContext(AppAppearanceContext);

  return (
    <FloatingHeader title="Settings">
      <View
        style={{
          flex: 1,
          padding: 16,
          backgroundColor: colors.background,
        }}
      >
        <BodyText>Welcome to Settings Screen</BodyText>
        <ThemedButton>Appearance</ThemedButton>
        <ThemedButton>Language</ThemedButton>
        <ThemedButton>Account</ThemedButton>
      </View>
    </FloatingHeader>
  );
}
