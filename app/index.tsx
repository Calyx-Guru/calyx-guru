import { BodyText } from '@/components/typography/BodyText';
import { View } from 'react-native';

export default function Index() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <BodyText>common.welcome</BodyText>
    </View>
  );
}
