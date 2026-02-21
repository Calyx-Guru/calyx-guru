import FloatingHeader from '@/components/home/FloatingHeader';
import { BodyText } from '@/components/typography/BodyText';
import { ThemedButton } from '@/components/typography/ThemedButton';
import { AppAppearanceContext } from '@/contexts/AppAppearanceContext';
import { router } from 'expo-router';
import { useContext } from 'react';
import { View } from 'react-native';

export default function HomeScreen() {
  const { colors } = useContext(AppAppearanceContext);

  return (
    <FloatingHeader title="Home">
      <View
        style={{
          flex: 1,
          padding: 16,
          backgroundColor: colors.background,
        }}
      >
        <BodyText>Welcome to Home Screen</BodyText>
        <ThemedButton onPress={() => router.push('/(modal)/fortune-poems')}>
          Go to Fortune Poems
        </ThemedButton>
        <ThemedButton onPress={() => router.push('/(modal)/palm-reading')}>
          Go to Palm Reading
        </ThemedButton>
        <ThemedButton onPress={() => router.push('/(modal)/feng-shui')}>
          Go to Feng Shui Compass
        </ThemedButton>
      </View>
    </FloatingHeader>
  );
}
