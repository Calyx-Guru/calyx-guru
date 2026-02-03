import { AppAppearanceContext } from '@/contexts/AppAppearanceContext';
import { OAuthProvider } from '@/contexts/SupabaseAuthContext';
import { useContext } from 'react';
import {
    ActivityIndicator,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';
import { BodyText } from '../typography/BodyText';

type OAuthButtonProps = {
  provider: OAuthProvider;
  onPress: (provider: OAuthProvider) => void;
  isLoading?: boolean;
  disabled?: boolean;
};

const providerIcons: Record<OAuthProvider, string> = {
  apple: '🍎',
  google: '🔍',
  facebook: 'f',
  twitter: '𝕏',
  discord: '💬',
  kakao: '☺️',
  linkedin_oidc: '💼',
  twitch: '▶️',
};

const providerLabels: Record<OAuthProvider, string> = {
  apple: 'auth.signInApple',
  google: 'auth.signInGoogle',
  facebook: 'auth.signInFacebook',
  twitter: 'auth.signInTwitter',
  discord: 'auth.signInDiscord',
  kakao: 'auth.signInKakao',
  linkedin_oidc: 'auth.signInLinkedIn',
  twitch: 'auth.signInTwitch',
};

export function OAuthButton({
  provider,
  onPress,
  isLoading = false,
  disabled = false,
}: OAuthButtonProps) {
  const { colors, spacing } = useContext(AppAppearanceContext);

  return (
    <TouchableOpacity
      style={[
        styles.button,
        {
          backgroundColor: colors.secondary,
          opacity: disabled || isLoading ? 0.6 : 1,
        },
      ]}
      onPress={() => onPress(provider)}
      disabled={disabled || isLoading}
    >
      <View style={styles.content}>
        {isLoading ? (
          <ActivityIndicator color={colors.light} size="small" />
        ) : (
          <>
            <BodyText
              color="light"
              size="lg"
              translate={false}
              children={providerIcons[provider]}
            />
            <BodyText
              color="light"
              size="md"
              translate={true}
              children={providerLabels[provider]}
            />
          </>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginVertical: 6,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
});
