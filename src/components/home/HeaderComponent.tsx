import { StyleSheet, View } from 'react-native';
import { AccentText } from '../typography/AccentText';

type HeaderComponentProps = {
  style?: object;
};

export default function HeaderComponent({ style }: HeaderComponentProps) {
  return (
    <View style={[styles.headerContainer, style]}>
      <AccentText size="md">Frequency: 85%</AccentText>
      <AccentText size="md">Lunar Solar</AccentText>
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    flex: 1,
  },
});
