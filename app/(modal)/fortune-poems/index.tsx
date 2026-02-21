import FloatingHeader from '@/components/home/FloatingHeader';
import { AppAppearanceContext } from '@/contexts/AppAppearanceContext';
import { useEventListener } from 'expo';
import { router } from 'expo-router';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useContext, useMemo, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

const INTERESTS = ['Love', 'Career', 'Travel', 'Luck'] as const;

type Interest = (typeof INTERESTS)[number];

const FORTUNE_RESULTS: Record<Interest, string> = {
  Love: 'Your heart is opening to a gentle but meaningful connection. Be honest about what you truly want, and love will move closer to you.',
  Career:
    'A new opportunity is approaching through your consistency. Keep showing your strengths, and someone important will notice your effort soon.',
  Travel:
    'A refreshing journey is ahead, bringing useful encounters and fresh ideas. Stay flexible with plans, because a surprise route brings the best luck.',
  Luck: 'Your luck is rising steadily. Small positive choices today create a strong wave of good fortune over the next few days.',
};

const FORTUNE_VIDEO = require('../../../src/assets/videos/Mascot_Fortune_Telling_Video_Generation.mp4');

export default function FortunePoemsScreen() {
  const { colors, fontRegistry, fallbackFontRegistry, fontsLoaded, fontSize } =
    useContext(AppAppearanceContext);
  const fontRegistryToUse = fontsLoaded ? fontRegistry : fallbackFontRegistry;

  const [selectedInterest, setSelectedInterest] = useState<Interest | null>(
    null,
  );
  const [showResultModal, setShowResultModal] = useState(false);

  const player = useVideoPlayer(FORTUNE_VIDEO, (videoPlayer) => {
    videoPlayer.loop = false;
  });

  useEventListener(player, 'playToEnd', () => {
    setShowResultModal(true);
  });

  const resultText = useMemo(() => {
    if (!selectedInterest) {
      return '';
    }

    return FORTUNE_RESULTS[selectedInterest];
  }, [selectedInterest]);

  const handleSelectInterest = (interest: Interest) => {
    setSelectedInterest(interest);
    setShowResultModal(false);
    player.currentTime = 0;
    player.play();
  };

  return (
    <FloatingHeader
      title="Fortune Poems"
      leftButton={
        <Pressable
          onPress={() => {
            player.pause();
            router.back();
          }}
        >
          <Text
            style={{
              color: colors.onPrimary,
              fontFamily: fontRegistryToUse.body,
              fontSize: fontSize.md,
            }}
          >
            Back
          </Text>
        </Pressable>
      }
      style={{ backgroundColor: colors.background }}
    >
      <View style={styles.content}>
        <Text
          style={[
            styles.title,
            {
              color: colors.onBackground,
              fontFamily: fontRegistryToUse.heading,
              fontSize: fontSize.lg,
            },
          ]}
        >
          Select your interest
        </Text>

        <View style={styles.buttonList}>
          {INTERESTS.map((interest) => (
            <Pressable
              key={interest}
              style={[
                styles.interestButton,
                {
                  backgroundColor:
                    selectedInterest === interest
                      ? colors.primary
                      : colors.surfaceVariant,
                },
              ]}
              onPress={() => handleSelectInterest(interest)}
            >
              <Text
                style={[
                  styles.interestText,
                  {
                    color:
                      selectedInterest === interest
                        ? colors.onPrimary
                        : colors.onSurface,
                    fontFamily: fontRegistryToUse.body,
                    fontSize: fontSize.md,
                  },
                ]}
              >
                {interest}
              </Text>
            </Pressable>
          ))}
        </View>

        <Modal
          visible={Boolean(selectedInterest)}
          animationType="fade"
          presentationStyle="fullScreen"
          onRequestClose={() => {
            player.pause();
            setSelectedInterest(null);
          }}
        >
          <View
            style={[
              styles.videoFullscreenContainer,
              { backgroundColor: colors.background },
            ]}
          >
            <VideoView
              player={player}
              style={styles.videoFullscreen}
              nativeControls
              contentFit="cover"
            />
          </View>
        </Modal>

        <Modal
          transparent
          visible={showResultModal}
          animationType="fade"
          onRequestClose={() => setShowResultModal(false)}
        >
          <View
            style={[
              styles.modalBackdrop,
              { backgroundColor: colors.transparentInverse3 },
            ]}
          >
            <View
              style={[
                styles.modalCard,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.outline,
                },
              ]}
            >
              <Text
                style={[
                  styles.modalTitle,
                  {
                    color: colors.onSurface,
                    fontFamily: fontRegistryToUse.heading,
                    fontSize: fontSize.lg,
                  },
                ]}
              >
                Your Fortune Result
              </Text>
              <Text
                style={[
                  styles.modalText,
                  {
                    color: colors.onSurfaceVariant,
                    fontFamily: fontRegistryToUse.body,
                    fontSize: fontSize.md,
                  },
                ]}
              >
                {resultText}
              </Text>
              <Pressable
                style={[
                  styles.closeButton,
                  { backgroundColor: colors.primary },
                ]}
                onPress={() => {
                  setShowResultModal(false);
                  player.pause();
                  setSelectedInterest(null);
                }}
              >
                <Text
                  style={{
                    color: colors.onPrimary,
                    fontFamily: fontRegistryToUse.heading,
                    fontSize: fontSize.md,
                  }}
                >
                  Close
                </Text>
              </Pressable>
            </View>
          </View>
        </Modal>
      </View>
    </FloatingHeader>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 16,
  },
  title: {
    textAlign: 'center',
  },
  buttonList: {
    gap: 12,
  },
  interestButton: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  interestText: {
    textAlign: 'center',
  },
  videoFullscreenContainer: {
    flex: 1,
  },
  videoFullscreen: {
    flex: 1,
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  modalCard: {
    width: '100%',
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    gap: 14,
  },
  modalTitle: {
    textAlign: 'center',
  },
  modalText: {
    lineHeight: 22,
    textAlign: 'center',
  },
  closeButton: {
    alignSelf: 'center',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
});
