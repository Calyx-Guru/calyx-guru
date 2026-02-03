import { SignInForm } from '@/components/home/SignInForm';
import {
  OAuthProvider,
  SupabaseAuthContext,
} from '@/contexts/SupabaseAuthContext';
import { useRouter } from 'expo-router';
import { useContext, useState } from 'react';
import { Alert } from 'react-native';

export default function SignIn() {
  const { signIn, signInWithOAuth, isLoading } =
    useContext(SupabaseAuthContext);
  const router = useRouter();

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
    <SignInForm
      email={email}
      password={password}
      isSigningIn={isSigningIn}
      loadingProvider={loadingProvider}
      errors={errors}
      onEmailChange={setEmail}
      onPasswordChange={setPassword}
      onEmailSignIn={handleEmailSignIn}
      onOAuthSignIn={handleOAuthSignIn}
      onSignUpPress={handleSignUpPress}
    />
  );
}
