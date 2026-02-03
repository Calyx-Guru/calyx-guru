import { BodyText } from '@/components/typography/BodyText';
import { TextInput } from '@/components/typography/TextInput';
import { ThemedButton } from '@/components/typography/ThemedButton';
import { AppAppearanceContext } from '@/contexts/AppAppearanceContext';
import { SupabaseAuthContext } from '@/contexts/SupabaseAuthContext';
import supabase from '@/lib/supabase/client';
import { router } from 'expo-router';
import { useContext, useState } from 'react';
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';

type SignUpFormData = {
  email: string;
  password: string;
  confirmPassword: string;
  fullName?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other' | '';
  birthPlace?: string;
};

type FormErrors = Partial<SignUpFormData>;

export function SignUpForm() {
  const { signUp } = useContext(SupabaseAuthContext);
  const {
    colors,
    spacing,
    fontRegistry,
    fontsLoaded,
    fallbackFontRegistry,
    fontSize,
  } = useContext(AppAppearanceContext);

  const [formData, setFormData] = useState<SignUpFormData>({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    dateOfBirth: '',
    gender: '',
    birthPlace: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [generalError, setGeneralError] = useState<string>('');

  const fontRegistryToUse = fontsLoaded ? fontRegistry : fallbackFontRegistry;

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Email validation
    if (!formData.email) {
      newErrors.email = 'forms.errors.emailRequired';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'forms.errors.emailInvalid';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'forms.errors.passwordRequired';
    } else if (formData.password.length < 8) {
      newErrors.password = 'forms.errors.passwordTooShort';
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'forms.errors.confirmPasswordRequired';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'forms.errors.passwordMismatch';
    }

    // Optional fields validation
    if (formData.dateOfBirth) {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(formData.dateOfBirth)) {
        newErrors.dateOfBirth = 'forms.errors.dateFormatInvalid';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignUp = async () => {
    setGeneralError('');

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // Sign up with Supabase Auth
      await signUp(formData.email, formData.password);

      // Store user profile data if provided
      const user = (await supabase.auth.getUser()).data.user;

      if (
        user &&
        (formData.fullName ||
          formData.dateOfBirth ||
          formData.gender ||
          formData.birthPlace)
      ) {
        const { error: profileError } = await supabase
          .from('user_profiles')
          .insert({
            id: user.id,
            full_name: formData.fullName || null,
            date_of_birth: formData.dateOfBirth || null,
            gender: formData.gender || null,
            birth_place: formData.birthPlace || null,
          });

        if (profileError) {
          console.error('Error saving user profile:', profileError);
          // Don't fail the signup if profile save fails
        }
      }

      // Navigate to home or verification screen
      router.replace('/');
    } catch (error: any) {
      console.error('Sign up error:', error);
      if (error.message.includes('already registered')) {
        setGeneralError('forms.errors.emailExists');
      } else {
        setGeneralError(error.message || 'forms.errors.signUpFailed');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior="padding">
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingHorizontal: spacing.layout.lg },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text
            style={{
              fontFamily: fontRegistryToUse.heading,
              fontSize: fontSize['2xl'],
              color: colors.primary,
              marginBottom: spacing.layout.md,
            }}
          >
            Create Account
          </Text>
          <BodyText size="md" color="grey" translate={false}>
            Enter your details to get started
          </BodyText>
        </View>

        {/* General Error */}
        {generalError && (
          <View
            style={[
              styles.errorBox,
              {
                backgroundColor: colors.danger + '20',
                marginBottom: spacing.layout.md,
              },
            ]}
          >
            <Text
              style={{
                fontFamily: fontRegistryToUse.body,
                fontSize: fontSize.sm,
                color: colors.danger,
              }}
            >
              {generalError}
            </Text>
          </View>
        )}

        {/* Required Fields Section */}
        <View style={{ marginBottom: spacing.layout.lg }}>
          <Text
            style={{
              fontFamily: fontRegistryToUse.body,
              fontSize: fontSize.sm,
              color: colors.secondary,
              marginBottom: spacing.layout.md,
              fontWeight: 'bold',
            }}
          >
            Required Fields
          </Text>

          <TextInput
            label="Email Address"
            placeholder="forms.placeholders.email"
            value={formData.email}
            onChangeText={(text) => {
              setFormData({ ...formData, email: text });
              if (errors.email) {
                setErrors({ ...errors, email: undefined });
              }
            }}
            error={errors.email}
            keyboardType="email-address"
            autoCapitalize="none"
            editable={!isLoading}
            translateLabel={false}
          />

          <TextInput
            label="Password"
            placeholder="forms.placeholders.password"
            value={formData.password}
            onChangeText={(text) => {
              setFormData({ ...formData, password: text });
              if (errors.password) {
                setErrors({ ...errors, password: undefined });
              }
            }}
            error={errors.password}
            secureTextEntry
            editable={!isLoading}
            helperText="At least 8 characters"
            translateLabel={false}
            translatePlaceholder={true}
          />

          <TextInput
            label="Confirm Password"
            placeholder="forms.placeholders.confirmPassword"
            value={formData.confirmPassword}
            onChangeText={(text) => {
              setFormData({ ...formData, confirmPassword: text });
              if (errors.confirmPassword) {
                setErrors({ ...errors, confirmPassword: undefined });
              }
            }}
            error={errors.confirmPassword}
            secureTextEntry
            editable={!isLoading}
            translateLabel={false}
            translatePlaceholder={true}
          />
        </View>

        {/* Optional Fields Section */}
        <View style={{ marginBottom: spacing.layout.lg }}>
          <Text
            style={{
              fontFamily: fontRegistryToUse.body,
              fontSize: fontSize.sm,
              color: colors.grey,
              marginBottom: spacing.layout.md,
              fontWeight: 'bold',
            }}
          >
            Optional Information
          </Text>

          <TextInput
            label="Full Name"
            placeholder="forms.placeholders.fullName"
            value={formData.fullName}
            onChangeText={(text) =>
              setFormData({ ...formData, fullName: text })
            }
            editable={!isLoading}
            translateLabel={false}
            translatePlaceholder={true}
          />

          <TextInput
            label="Date of Birth"
            placeholder="forms.placeholders.dateOfBirth"
            value={formData.dateOfBirth}
            onChangeText={(text) => {
              setFormData({ ...formData, dateOfBirth: text });
              if (errors.dateOfBirth) {
                setErrors({ ...errors, dateOfBirth: undefined });
              }
            }}
            error={errors.dateOfBirth}
            editable={!isLoading}
            helperText="Format: YYYY-MM-DD"
            translateLabel={false}
            translatePlaceholder={true}
          />

          <TextInput
            label="Gender"
            placeholder="forms.placeholders.gender"
            value={formData.gender}
            onChangeText={(text) =>
              setFormData({
                ...formData,
                gender: text as 'male' | 'female' | 'other' | '',
              })
            }
            editable={!isLoading}
            translateLabel={false}
            translatePlaceholder={true}
          />

          <TextInput
            label="Birth Place"
            placeholder="forms.placeholders.birthPlace"
            value={formData.birthPlace}
            onChangeText={(text) =>
              setFormData({ ...formData, birthPlace: text })
            }
            editable={!isLoading}
            translateLabel={false}
            translatePlaceholder={true}
          />
        </View>

        {/* Sign Up Button */}
        <ThemedButton
          onPress={handleSignUp}
          size="md"
          background="primary"
          labelColor="white"
          translate={false}
        >
          {isLoading ? 'Creating Account...' : 'Sign Up'}
        </ThemedButton>

        {isLoading && (
          <ActivityIndicator
            size="large"
            color={colors.primary}
            style={{ marginTop: spacing.layout.md }}
          />
        )}

        {/* Sign In Link */}
        <View style={{ marginTop: spacing.layout.lg, alignItems: 'center' }}>
          <Text
            style={{
              fontFamily: fontRegistryToUse.body,
              fontSize: fontSize.sm,
              color: colors.grey,
            }}
          >
            Already have an account?{' '}
            <Text
              style={{ color: colors.primary, fontWeight: 'bold' }}
              onPress={() => router.push('/(auth)/SignIn')}
            >
              Sign In
            </Text>
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: 24,
  },
  header: {
    marginBottom: 24,
  },
  errorBox: {
    borderRadius: 8,
    padding: 12,
    borderLeftWidth: 4,
  },
});
