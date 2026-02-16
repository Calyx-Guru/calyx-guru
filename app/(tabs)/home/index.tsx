import FloatingHeader from '@/components/home/FloatingHeader';
import { BodyText } from '@/components/typography/BodyText';
import { ThemedButton } from '@/components/typography/ThemedButton';
import { AppAppearanceContext } from '@/contexts/AppAppearanceContext';
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
        <ThemedButton>Go to Child Screen 1</ThemedButton>
        <ThemedButton>Go to Child Screen 2</ThemedButton>
      </View>
    </FloatingHeader>
  );
}
