import { BodyText } from '@/components/typography/BodyText';
import { SelectInput } from '@/components/typography/SelectInput';
import { TextInput } from '@/components/typography/TextInput';
import { ThemedButton } from '@/components/typography/ThemedButton';
import { AppAppearanceContext } from '@/contexts/AppAppearanceContext';
import { SupabaseAuthContext } from '@/contexts/SupabaseAuthContext';
import { useUserProfile } from '@/hooks/useUserProfile';
import supabase from '@/lib/supabase/client';
import DateTimePicker from '@react-native-community/datetimepicker';
import { router } from 'expo-router';
import { useContext, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { HeadingText } from '../typography/HeadingText';

type SignUpFormData = {
  username: string;
  password: string;
  confirmPassword: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other' | '';
};

type FormErrors = Partial<SignUpFormData>;

export function SignUpForm() {
  const { signUp } = useContext(SupabaseAuthContext);
  const { loadProfileFromRemote } = useUserProfile();
  const {
    colors,
    spacing,
    fontRegistry,
    fontsLoaded,
    fallbackFontRegistry,
    fontSize,
  } = useContext(AppAppearanceContext);

  const [formData, setFormData] = useState<SignUpFormData>({
    username: '',
    password: '',
    confirmPassword: '',
    dateOfBirth: '',
    gender: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [generalError, setGeneralError] = useState<string>('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    formData.dateOfBirth ? new Date(formData.dateOfBirth) : undefined,
  );

  const fontRegistryToUse = fontsLoaded ? fontRegistry : fallbackFontRegistry;

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Username validation
    if (!formData.username) {
      newErrors.username = 'forms.errors.usernameRequired';
    } else if (formData.username.length < 3) {
      newErrors.username = 'forms.errors.usernameTooShort';
    } else if (!/^[a-zA-Z0-9_-]+$/.test(formData.username)) {
      newErrors.username = 'forms.errors.usernameInvalid';
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
      const dateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:/;
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
      // Generate dummy email from username
      const dummyEmail = `${formData.username}@nomail.local`;

      // Sign up with Supabase Auth
      await signUp(dummyEmail, formData.password);

      // Store user profile data if provided
      const user = (await supabase.auth.getUser()).data.user;

      if (user) {
        await loadProfileFromRemote(user.id);
      }

      // Navigate to home or verification screen
      router.replace('/(tabs)/home');
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
          <HeadingText
            size="2xl"
            style={{
              marginBottom: spacing.layout.md,
            }}
          >
            Create Account
          </HeadingText>
          <BodyText size="md" color="onSurface" translate={false}>
            Enter your details to get started
          </BodyText>
        </View>

        {/* General Error */}
        {generalError && (
          <View
            style={[
              styles.errorBox,
              {
                backgroundColor: colors.error + '20',
                marginBottom: spacing.layout.md,
              },
            ]}
          >
            <Text
              style={{
                fontFamily: fontRegistryToUse.body,
                fontSize: fontSize.sm,
                color: colors.error,
              }}
            >
              {generalError}
            </Text>
          </View>
        )}

        {/* Required Fields Section */}
        <View>
          <TextInput
            label="forms.labels.username"
            placeholder="forms.placeholders.username"
            value={formData.username}
            onChangeText={(text) => {
              setFormData({ ...formData, username: text });
              if (errors.username) {
                setErrors({ ...errors, username: undefined });
              }
            }}
            error={errors.username}
            autoCapitalize="none"
            editable={!isLoading}
            helperText="3+ characters, letters, numbers, hyphens, underscores"
          />

          <TextInput
            label="forms.labels.password"
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

          <View>
            <Text
              style={{
                fontFamily: fontRegistryToUse.body,
                fontSize: fontSize.md,
                color: colors.onBackground,
                marginBottom: spacing.dense.sm,
              }}
            >
              Date of Birth
            </Text>
            <Pressable
              style={[
                styles.dateTimeButton,
                {
                  borderColor: errors.dateOfBirth
                    ? colors.error
                    : colors.outline,
                  backgroundColor: colors.surface,
                  borderWidth: 1,
                  borderRadius: 8,
                  paddingHorizontal: spacing.layout.md,
                  paddingVertical: spacing.layout.sm,
                },
              ]}
              onPress={() => setShowDatePicker(true)}
              disabled={isLoading}
            >
              <Text
                style={{
                  fontFamily: fontRegistryToUse.body,
                  fontSize: fontSize.md,
                  color: selectedDate
                    ? colors.onSurface
                    : colors.onSurfaceVariant,
                }}
              >
                {selectedDate
                  ? selectedDate.toLocaleString('en-US', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : 'Select date and time'}
              </Text>
            </Pressable>
            {errors.dateOfBirth && (
              <Text
                style={{
                  fontFamily: fontRegistryToUse.body,
                  fontSize: fontSize.xs,
                  color: colors.error,
                  marginTop: spacing.dense.xs,
                }}
              >
                {errors.dateOfBirth}
              </Text>
            )}
          </View>

          {showDatePicker && (
            <DateTimePicker
              value={selectedDate || new Date()}
              mode="date"
              display="default"
              onChange={(event, date) => {
                setShowDatePicker(false);
                if (date) {
                  setSelectedDate(date);
                  setShowTimePicker(true);
                }
              }}
            />
          )}

          {showTimePicker && (
            <DateTimePicker
              value={selectedDate || new Date()}
              mode="time"
              display="default"
              onChange={(event, date) => {
                setShowTimePicker(false);
                if (date) {
                  setSelectedDate(date);
                  // Format as ISO string with time
                  const isoString = date.toISOString().split('.')[0];
                  setFormData({ ...formData, dateOfBirth: isoString });
                  if (errors.dateOfBirth) {
                    setErrors({ ...errors, dateOfBirth: undefined });
                  }
                }
              }}
            />
          )}

          <SelectInput
            label="Gender"
            placeholder="forms.placeholders.gender"
            value={formData.gender}
            options={[
              { label: 'Male', value: 'male' },
              { label: 'Female', value: 'female' },
            ]}
            onValueChange={(value) =>
              setFormData({
                ...formData,
                gender: value as 'male' | 'female' | 'other' | '',
              })
            }
            translateLabel={false}
            translatePlaceholder={true}
            translateOptions={true}
          />
        </View>

        {/* Sign Up Button */}
        <ThemedButton
          onPress={handleSignUp}
          size="md"
          background="primary"
          labelColor="onSurface"
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
  dateTimeButton: {
    justifyContent: 'center',
    marginBottom: 16,
  },
});
