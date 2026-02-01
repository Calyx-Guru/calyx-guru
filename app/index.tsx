import { BodyText } from '@/components/typography/BodyText';
import { ThemedButton } from '@/components/typography/ThemedButton';
import { AppAppearanceContext } from '@/contexts/AppAppearanceContext';
import { router } from 'expo-router';
import { useContext } from 'react';
import { View } from 'react-native';

export default function Index() {
  const { colors } = useContext(AppAppearanceContext);

  const onButtonPress = () => {
    router.push('/(auth)/SignUp');
  };

  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.background,
        height: '100%',
      }}
    >
      <BodyText>common.welcome</BodyText>
      <ThemedButton onPress={onButtonPress}>common.settings</ThemedButton>
    </View>
  );
}
