import { AppAppearanceContext } from '@/contexts/AppAppearanceContext';
import { OAuthProvider } from '@/contexts/SupabaseAuthContext';
import { useContext } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';
import { BodyText } from '../typography/BodyText';
import { TextInput } from '../typography/TextInput';
import { ThemedButton } from '../typography/ThemedButton';
import { OAuthButton } from './OAuthButton';

type SignInFormProps = {
  email: string;
  password: string;
  isSigningIn: boolean;
  loadingProvider: OAuthProvider | null;
  errors: {
    email?: string;
    password?: string;
  };
  onEmailChange: (email: string) => void;
  onPasswordChange: (password: string) => void;
  onEmailSignIn: () => void;
  onOAuthSignIn: (provider: OAuthProvider) => void;
  onSignUpPress: () => void;
};

export function SignInForm({
  email,
  password,
  isSigningIn,
  loadingProvider,
  errors,
  onEmailChange,
  onPasswordChange,
  onEmailSignIn,
  onOAuthSignIn,
  onSignUpPress,
}: SignInFormProps) {
  const { colors, spacing } = useContext(AppAppearanceContext);

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
          onChangeText={onEmailChange}
          error={errors.email}
          editable={!isSigningIn && !loadingProvider}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <TextInput
          label="forms.labels.password"
          placeholder="forms.placeholders.password"
          value={password}
          onChangeText={onPasswordChange}
          error={errors.password}
          editable={!isSigningIn && !loadingProvider}
          secureTextEntry
          style={{ marginTop: spacing.layout.md }}
        />

        <ThemedButton
          onPress={onEmailSignIn}
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
          onPress={onOAuthSignIn}
          isLoading={loadingProvider === 'google'}
          disabled={
            isSigningIn ||
            (loadingProvider !== null && loadingProvider !== 'google')
          }
        />
        <OAuthButton
          provider="apple"
          onPress={onOAuthSignIn}
          isLoading={loadingProvider === 'apple'}
          disabled={
            isSigningIn ||
            (loadingProvider !== null && loadingProvider !== 'apple')
          }
        />
        <OAuthButton
          provider="facebook"
          onPress={onOAuthSignIn}
          isLoading={loadingProvider === 'facebook'}
          disabled={
            isSigningIn ||
            (loadingProvider !== null && loadingProvider !== 'facebook')
          }
        />
        <OAuthButton
          provider="twitter"
          onPress={onOAuthSignIn}
          isLoading={loadingProvider === 'twitter'}
          disabled={
            isSigningIn ||
            (loadingProvider !== null && loadingProvider !== 'twitter')
          }
        />
        <OAuthButton
          provider="discord"
          onPress={onOAuthSignIn}
          isLoading={loadingProvider === 'discord'}
          disabled={
            isSigningIn ||
            (loadingProvider !== null && loadingProvider !== 'discord')
          }
        />
        <OAuthButton
          provider="kakao"
          onPress={onOAuthSignIn}
          isLoading={loadingProvider === 'kakao'}
          disabled={
            isSigningIn ||
            (loadingProvider !== null && loadingProvider !== 'kakao')
          }
        />
        <OAuthButton
          provider="linkedin_oidc"
          onPress={onOAuthSignIn}
          isLoading={loadingProvider === 'linkedin_oidc'}
          disabled={
            isSigningIn ||
            (loadingProvider !== null && loadingProvider !== 'linkedin_oidc')
          }
        />
        <OAuthButton
          provider="twitch"
          onPress={onOAuthSignIn}
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
          onPress={onSignUpPress}
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
