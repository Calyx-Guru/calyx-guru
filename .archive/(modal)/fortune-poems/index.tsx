import FloatingHeader from '@/components/home/FloatingHeader';
import { AppAppearanceContext } from '@/contexts/AppAppearanceContext';
import { addFortuneTellingHistoryEntry } from '@/lib/app/fortuneTellingsHistory';
import { useEventListener } from 'expo';
import { router } from 'expo-router';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useContext, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

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

type FortuneVideoModalProps = {
  backgroundColor: string;
  onPlayToEnd: () => void;
  onRequestClose: () => void;
};

function FortuneVideoModal({
  backgroundColor,
  onPlayToEnd,
  onRequestClose,
}: FortuneVideoModalProps) {
  const player = useVideoPlayer(FORTUNE_VIDEO, (videoPlayer) => {
    videoPlayer.loop = false;
  });
  const fadeOpacity = useRef(new Animated.Value(0)).current;
  const hasStartedFade = useRef(false);

  useEventListener(player, 'playToEnd', onPlayToEnd);

  useEffect(() => {
    const intervalId = setInterval(() => {
      const duration = Number(player.duration);
      const currentTime = Number(player.currentTime);

      if (!Number.isFinite(duration) || !Number.isFinite(currentTime)) {
        return;
      }

      if (duration <= 0) {
        return;
      }

      const remainingSeconds = duration - currentTime;
      if (remainingSeconds <= 1 && !hasStartedFade.current) {
        hasStartedFade.current = true;
        Animated.timing(fadeOpacity, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }).start();
      }
    }, 100);

    return () => {
      clearInterval(intervalId);
      fadeOpacity.stopAnimation();
    };
  }, [fadeOpacity, player]);

  return (
    <Modal
      visible
      animationType="none"
      presentationStyle="fullScreen"
      onShow={() => {
        player.currentTime = 0;
        player.play();
      }}
      onRequestClose={() => {
        player.pause();
        onRequestClose();
      }}
    >
      <View style={[styles.videoFullscreenContainer, { backgroundColor }]}>
        <VideoView
          player={player}
          style={styles.videoFullscreen}
          nativeControls={false}
          contentFit="cover"
        />
        <Animated.View
          pointerEvents="none"
          style={[
            styles.videoFadeOverlay,
            {
              opacity: fadeOpacity,
            },
          ]}
        />
      </View>
    </Modal>
  );
}

export default function FortunePoemsScreen() {
  const { colors, fontRegistry, fallbackFontRegistry, fontsLoaded, fontSize } =
    useContext(AppAppearanceContext);
  const fontRegistryToUse = fontsLoaded ? fontRegistry : fallbackFontRegistry;

  const [selectedInterest, setSelectedInterest] = useState<Interest | null>(
    null,
  );
  const [showResultModal, setShowResultModal] = useState(false);
  const [resultText, setResultText] = useState('');
  const [videoSessionId, setVideoSessionId] = useState(0);

  const handleVideoPlayToEnd = () => {
    if (selectedInterest) {
      const selectedResult = FORTUNE_RESULTS[selectedInterest];
      setResultText(selectedResult);
      void addFortuneTellingHistoryEntry({
        interest: selectedInterest,
        resultText: selectedResult,
      });
    }

    setSelectedInterest(null);
    setShowResultModal(true);
  };

  const handleSelectInterest = (interest: Interest) => {
    setVideoSessionId((prev) => prev + 1);
    setSelectedInterest(interest);
    setShowResultModal(false);
    setResultText('');
  };

  return (
    <FloatingHeader
      title="Fortune Poems"
      leftButton={
        <Pressable
          onPress={() => {
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
      rightButton={
        <Pressable
          onPress={() => {
            router.push('/(modal)/fortune-poems/history' as any);
          }}
        >
          <Text
            style={{
              color: colors.onPrimary,
              fontFamily: fontRegistryToUse.body,
              fontSize: fontSize.md,
            }}
          >
            Today
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

        {selectedInterest ? (
          <FortuneVideoModal
            key={`fortune-video-session-${videoSessionId}`}
            backgroundColor={colors.background}
            onPlayToEnd={handleVideoPlayToEnd}
            onRequestClose={() => {
              setSelectedInterest(null);
            }}
          />
        ) : null}

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
                  setSelectedInterest(null);
                  setResultText('');
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
  videoFadeOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#FFFFFF',
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
