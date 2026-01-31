import { BodyText } from '@/components/typography/BodyText';
import { AppAppearanceProvider } from '@/contexts/AppAppearanceContext';
import { View } from 'react-native';

export default function Index() {
  return (
    <AppAppearanceProvider>
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <BodyText>common.welcome</BodyText>
      </View>
    </AppAppearanceProvider>
  );
}
