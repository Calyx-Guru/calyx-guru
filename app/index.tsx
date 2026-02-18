import { AppAppearanceContext } from '@/contexts/AppAppearanceContext';
import { router } from 'expo-router';
import { useContext, useEffect } from 'react';
import { View } from 'react-native';

export default function Index() {
  const { colors } = useContext(AppAppearanceContext);

  useEffect(() => {
    router.replace('/(tabs)/home');
  }, []);

  return (
    <View
      style={{
        flex: 1,
        padding: 16,
        backgroundColor: colors.background,
      }}
    ></View>
  );
}
