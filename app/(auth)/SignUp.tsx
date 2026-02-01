import { BodyText } from '@/components/typography/BodyText';
import { AppAppearanceContext } from '@/contexts/AppAppearanceContext';
import { useContext } from 'react';
import { View } from 'react-native';

export default function SignUp() {
  const { colors } = useContext(AppAppearanceContext);

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
      <BodyText>common.hello</BodyText>
    </View>
  );
}
