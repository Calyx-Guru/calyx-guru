import HeaderComponent from '@/components/home/HeaderComponent';
import { AppAppearanceProvider } from '@/contexts/AppAppearanceContext';
import { SupabaseAuthProvider } from '@/contexts/SupabaseAuthContext';
import { Stack } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AuthLayout() {
  return (
    <SupabaseAuthProvider>
      <AppAppearanceProvider>
        <SafeAreaView style={styles.container}>
          {/* Header Component - style it so it will float on top */}
          <HeaderComponent style={styles.headerComponent} />
          <View style={styles.container}>
            <Stack
              screenOptions={{
                headerShown: false,
              }}
            >
              <Stack.Screen name="SignUp" options={{ headerShown: false }} />
            </Stack>
          </View>
        </SafeAreaView>
      </AppAppearanceProvider>
    </SupabaseAuthProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerComponent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
});
