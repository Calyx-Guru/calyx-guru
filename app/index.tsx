import { BodyText } from '@/components/typography/BodyText';
import { ThemedButton } from '@/components/typography/ThemedButton';
import { AppAppearanceContext } from '@/contexts/AppAppearanceContext';
import { router } from 'expo-router';
import { useContext } from 'react';
import { View } from 'react-native';

export default function Index() {
  const { colors } = useContext(AppAppearanceContext);

  const onSignUpButtonPress = () => {
    router.push('/(auth)/SignUp');
  };

  const onSignInButtonPress = () => {
    router.push('/(auth)/SignIn');
  };

  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#000',
        height: 1024,
      }}
    >
      <BodyText>common.welcome</BodyText>
      <ThemedButton onPress={onSignUpButtonPress}>common.settings</ThemedButton>
      <ThemedButton onPress={onSignInButtonPress}>common.settings</ThemedButton>
    </View>
  );
}
