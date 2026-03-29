import { useAppAppearance } from '@/contexts/AppAppearanceContext';
import { useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { SignInForm } from './SignInForm';
import { SignUpForm } from './SignUpForm';

export default function AuthenticateForm() {
  const [isSignIn, setIsSignIn] = useState(true);
  const { colors } = useAppAppearance();

  return (
    <View style={styles.container}>
      {/* Banner Image */}
      <Image
        source={require('@/assets/images/banners/sign-in.png')}
        style={styles.banner}
      />

      {/* Button Bar */}
      <View style={[styles.buttonBar, { backgroundColor: colors.secondary }]}>
        <Pressable
          style={[
            styles.button,
            isSignIn && {
              borderBottomWidth: 2,
              borderBottomColor: colors.onSecondary,
            },
          ]}
          onPress={() => setIsSignIn(true)}
        >
          <Text style={[styles.buttonText, { color: colors.onSecondary }]}>
            Sign In
          </Text>
        </Pressable>
        <Pressable
          style={[
            styles.button,
            !isSignIn && {
              borderBottomWidth: 2,
              borderBottomColor: colors.onSecondary,
            },
          ]}
          onPress={() => setIsSignIn(false)}
        >
          <Text style={[styles.buttonText, { color: colors.onSecondary }]}>
            Sign Up
          </Text>
        </Pressable>
      </View>

      {/* Form Content */}
      <View style={styles.formContainer}>
        {isSignIn ? <SignInForm /> : <SignUpForm />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  banner: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  buttonBar: {
    flexDirection: 'row',
    paddingHorizontal: 0,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  formContainer: {
    flex: 1,
  },
});
