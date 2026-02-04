import { BodyText } from '@/components/typography/BodyText';
import { TextInput } from '@/components/typography/TextInput';
import { ThemedButton } from '@/components/typography/ThemedButton';
import { AppAppearanceContext } from '@/contexts/AppAppearanceContext';
import {
  OAuthProvider,
  SupabaseAuthContext,
} from '@/contexts/SupabaseAuthContext';
import { router } from 'expo-router';
import { useContext, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { OAuthButton } from './OAuthButton';

export function SignInForm() {
  const { signIn, signInWithOAuth } = useContext(SupabaseAuthContext);
  const { colors, spacing } = useContext(AppAppearanceContext);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [loadingProvider, setLoadingProvider] = useState<OAuthProvider | null>(
    null,
  );
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
  }>({});

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    if (!email.trim()) {
      newErrors.email = 'forms.errors.emailRequired';
    } else if (!email.includes('@')) {
      newErrors.email = 'forms.errors.emailInvalid';
    }

    if (!password) {
      newErrors.password = 'forms.errors.passwordRequired';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleEmailSignIn = async () => {
    if (!validateForm()) return;

    setIsSigningIn(true);
    try {
      await signIn(email, password);
      router.replace('/');
    } catch (error: any) {
      Alert.alert(
        'Sign In Failed',
        error.message || 'An error occurred during sign in. Please try again.',
      );
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleOAuthSignIn = async (provider: OAuthProvider) => {
    setLoadingProvider(provider);
    try {
      await signInWithOAuth(provider);
      // Note: OAuth redirect will be handled by Supabase
    } catch (error: any) {
      Alert.alert(
        `${provider} Sign In Failed`,
        error.message ||
          `Failed to sign in with ${provider}. Please try again.`,
      );
    } finally {
      setLoadingProvider(null);
    }
  };

  const handleSignUpPress = () => {
    router.push('/(auth)/SignUp');
  };

  return (
    <ScrollView
      contentContainerStyle={[
        styles.container,
        { backgroundColor: colors.background },
      ]}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={[styles.header, { paddingTop: spacing.layout.xl }]}>
        <BodyText size="3xl" color="light" translate={true}>
          auth.welcome
        </BodyText>
        <BodyText
          size="md"
          color="grey"
          translate={true}
          style={{ marginTop: spacing.layout.md }}
        >
          auth.signInDescription
        </BodyText>
      </View>

      {/* Email/Password Form */}
      <View
        style={[styles.formSection, { paddingHorizontal: spacing.layout.lg }]}
      >
        <TextInput
          label="forms.labels.email"
          placeholder="forms.placeholders.email"
          value={email}
          onChangeText={setEmail}
          error={errors.email}
          editable={!isSigningIn && !loadingProvider}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <TextInput
          label="forms.labels.password"
          placeholder="forms.placeholders.password"
          value={password}
          onChangeText={setPassword}
          error={errors.password}
          editable={!isSigningIn && !loadingProvider}
          secureTextEntry
          style={{ marginTop: spacing.layout.md }}
        />

        <ThemedButton
          onPress={handleEmailSignIn}
          background="primary"
          labelColor="light"
          size="md"
          translate={true}
          style={{
            marginTop: spacing.layout.xl,
            opacity: isSigningIn || loadingProvider ? 0.6 : 1,
          }}
        >
          {isSigningIn ? (
            <ActivityIndicator color={colors.light} />
          ) : (
            'auth.signIn'
          )}
        </ThemedButton>
      </View>

      {/* Divider */}
      <View
        style={[
          styles.divider,
          {
            marginVertical: spacing.layout.lg,
            borderColor: colors.border,
            marginHorizontal: spacing.layout.lg,
          },
        ]}
      >
        <View style={{ flex: 1, height: 1, backgroundColor: colors.border }} />
        <BodyText
          color="grey"
          size="sm"
          translate={true}
          style={{ marginHorizontal: spacing.layout.md }}
        >
          auth.orContinueWith
        </BodyText>
        <View style={{ flex: 1, height: 1, backgroundColor: colors.border }} />
      </View>

      {/* OAuth Providers */}
      <View
        style={[styles.oauthSection, { paddingHorizontal: spacing.layout.lg }]}
      >
        <OAuthButton
          provider="google"
          onPress={handleOAuthSignIn}
          isLoading={loadingProvider === 'google'}
          disabled={
            isSigningIn ||
            (loadingProvider !== null && loadingProvider !== 'google')
          }
        />
        <OAuthButton
          provider="apple"
          onPress={handleOAuthSignIn}
          isLoading={loadingProvider === 'apple'}
          disabled={
            isSigningIn ||
            (loadingProvider !== null && loadingProvider !== 'apple')
          }
        />
        <OAuthButton
          provider="facebook"
          onPress={handleOAuthSignIn}
          isLoading={loadingProvider === 'facebook'}
          disabled={
            isSigningIn ||
            (loadingProvider !== null && loadingProvider !== 'facebook')
          }
        />
        <OAuthButton
          provider="twitter"
          onPress={handleOAuthSignIn}
          isLoading={loadingProvider === 'twitter'}
          disabled={
            isSigningIn ||
            (loadingProvider !== null && loadingProvider !== 'twitter')
          }
        />
        <OAuthButton
          provider="discord"
          onPress={handleOAuthSignIn}
          isLoading={loadingProvider === 'discord'}
          disabled={
            isSigningIn ||
            (loadingProvider !== null && loadingProvider !== 'discord')
          }
        />
        <OAuthButton
          provider="kakao"
          onPress={handleOAuthSignIn}
          isLoading={loadingProvider === 'kakao'}
          disabled={
            isSigningIn ||
            (loadingProvider !== null && loadingProvider !== 'kakao')
          }
        />
        <OAuthButton
          provider="linkedin_oidc"
          onPress={handleOAuthSignIn}
          isLoading={loadingProvider === 'linkedin_oidc'}
          disabled={
            isSigningIn ||
            (loadingProvider !== null && loadingProvider !== 'linkedin_oidc')
          }
        />
        <OAuthButton
          provider="twitch"
          onPress={handleOAuthSignIn}
          isLoading={loadingProvider === 'twitch'}
          disabled={
            isSigningIn ||
            (loadingProvider !== null && loadingProvider !== 'twitch')
          }
        />
      </View>

      {/* Sign Up Link */}
      <View
        style={[
          styles.signUpSection,
          {
            marginTop: spacing.layout.xl,
            paddingBottom: spacing.layout.xl,
          },
        ]}
      >
        <BodyText color="grey" size="md" translate={true}>
          auth.noAccount
        </BodyText>
        <ThemedButton
          onPress={handleSignUpPress}
          background="dark"
          border="primary"
          labelColor="primary"
          size="md"
          translate={true}
          style={{ marginTop: spacing.layout.md }}
        >
          auth.signUp
        </ThemedButton>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'flex-start',
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  formSection: {
    marginVertical: 20,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  oauthSection: {
    marginVertical: 20,
  },
  signUpSection: {
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
});
