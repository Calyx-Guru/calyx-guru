import { AccentText } from '@/components/typography/AccentText';
import { StyleSheet, View } from 'react-native';

type HeaderComponentProps = {
  style?: object;
};

export default function HeaderComponent({ style }: HeaderComponentProps) {
  return (
    <View style={[styles.headerContent, style]}>
      <AccentText size="md">Frequency: 85%</AccentText>
      <AccentText size="md">Lunar Solar</AccentText>
    </View>
  );
}

const styles = StyleSheet.create({
  headerContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
