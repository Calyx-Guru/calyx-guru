import { SignInForm } from '@/components/home/SignInForm';
import { AppAppearanceContext } from '@/contexts/AppAppearanceContext';
import { useContext } from 'react';
import { View } from 'react-native';

export default function SignIn() {
  const { colors } = useContext(AppAppearanceContext);

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.background,
        height: '100%',
      }}
    >
      <SignInForm />
    </View>
  );
}
