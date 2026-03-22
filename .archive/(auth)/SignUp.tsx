import { SignUpForm } from '@/components/home/SignUpForm';
import { AppAppearanceContext } from '@/contexts/AppAppearanceContext';
import { useContext } from 'react';
import { View } from 'react-native';

export default function SignUp() {
  const { colors } = useContext(AppAppearanceContext);

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.background,
        height: '100%',
      }}
    >
      <SignUpForm />
    </View>
  );
}
