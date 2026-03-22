import FloatingHeader from '@/components/home/FloatingHeader';
import { AppAppearanceContext } from '@/contexts/AppAppearanceContext';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { router } from 'expo-router';
import { useCallback, useContext, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Image as ExpoImage } from 'expo-image';

type PalmReadingResult = {
  lines: string[];
  characteristics: string[];
  interpretation: string;
};

const PALM_READING_RESULTS: PalmReadingResult[] = [
  {
    lines: ['Clear life line', 'Long heart line'],
    characteristics: ['Strong vitality', 'Compassionate nature'],
    interpretation:
      'You possess strong physical health and emotional resilience. Your compassionate nature attracts people to you, and you have the potential for deep, meaningful relationships. Focus on channeling your energy toward goals that align with your values.',
  },
  {
    lines: ['Curved heart line', 'Prominent head line'],
    characteristics: ['Romantic', 'Analytical mind'],
    interpretation:
      'You balance emotion with logic beautifully. Your analytical mind helps you navigate complex situations, while your romantic nature ensures you do not lose sight of what matters most. Trust your intuition when making important decisions.',
  },
  {
    lines: ['Fate line present', 'Creative hand shape'],
    characteristics: ['Determined', 'Artistic'],
    interpretation:
      'You are driven by a sense of destiny and purpose. Your creative abilities are a gift—use them to express yourself and impact the world. Career satisfaction comes when you align your work with your creative vision.',
  },
  {
    lines: ['Multiple fine lines', 'Responsive hand'],
    characteristics: ['Sensitive', 'Adaptable'],
    interpretation:
      'You are highly sensitive to the energies around you. This gift allows you to understand others deeply, but remember to protect your own emotional well-being. Your adaptability is your superpower; use it wisely.',
  },
];

export default function PalmReadingScreen() {
  const { colors, fontRegistry, fallbackFontRegistry, fontsLoaded, fontSize } =
    useContext(AppAppearanceContext);
  const fontRegistryToUse = fontsLoaded ? fontRegistry : fallbackFontRegistry;
  const [permission, requestPermission] = useCameraPermissions();
  const [showCamera, setShowCamera] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [reading, setReading] = useState<PalmReadingResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const cameraRef = useRef<CameraView>(null);

  const handleOpenCamera = useCallback(async () => {
    if (!permission?.granted) {
      const result = await requestPermission();
      if (!result.granted) {
        Alert.alert(
          'Camera Permission Required',
          'We need camera access to capture your palm. Please enable it in settings.',
        );
        return;
      }
    }
    setShowCamera(true);
  }, [permission, requestPermission]);

  const handleTakePicture = useCallback(async () => {
    if (!cameraRef.current) return;

    try {
      setIsProcessing(true);
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
      });

      if (photo) {
        setCapturedImage(photo.uri);
        setShowCamera(false);

        // Simulate processing and generate random reading
        setTimeout(() => {
          const randomReading =
            PALM_READING_RESULTS[
              Math.floor(Math.random() * PALM_READING_RESULTS.length)
            ];
          setReading(randomReading);
          setIsProcessing(false);
        }, 1500);
      }
    } catch (err) {
      console.error('Error taking picture:', err);
      Alert.alert('Error', 'Failed to capture image. Please try again.');
      setIsProcessing(false);
    }
  }, []);

  const handleRetakePhoto = useCallback(() => {
    setCapturedImage(null);
    setReading(null);
    setShowCamera(true);
  }, []);

  const handleReset = useCallback(() => {
    setCapturedImage(null);
    setReading(null);
  }, []);

  return (
    <FloatingHeader
      title="Palm Reading"
      leftButton={
        <Pressable onPress={() => router.back()}>
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
      <ScrollView
        style={[styles.container, { backgroundColor: colors.background }]}
        contentContainerStyle={styles.scrollContent}
      >
        {!capturedImage ? (
          <View style={styles.initialView}>
            <Text
              style={{
                color: colors.onBackground,
                fontFamily: fontRegistryToUse.heading,
                fontSize: fontSize.lg,
                textAlign: 'center',
                marginBottom: 16,
              }}
            >
              Palm Reading
            </Text>
            <Text
              style={{
                color: colors.onSurfaceVariant,
                fontFamily: fontRegistryToUse.body,
                fontSize: fontSize.md,
                textAlign: 'center',
                marginBottom: 24,
              }}
            >
              Place your palm in good lighting and tap the button to capture. We
              will analyze the lines, shape, and characteristics of your hand.
            </Text>
            <Pressable
              onPress={handleOpenCamera}
              style={[
                styles.captureButton,
                { backgroundColor: colors.primary },
              ]}
            >
              <Text
                style={{
                  color: colors.onPrimary,
                  fontFamily: fontRegistryToUse.heading,
                  fontSize: fontSize.lg,
                  fontWeight: 'bold',
                }}
              >
                📸 Capture Palm
              </Text>
            </Pressable>
          </View>
        ) : isProcessing ? (
          <View style={styles.processingView}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text
              style={{
                color: colors.onBackground,
                fontFamily: fontRegistryToUse.body,
                fontSize: fontSize.md,
                marginTop: 16,
              }}
            >
              Analyzing your palm...
            </Text>
          </View>
        ) : reading ? (
          <View style={styles.resultView}>
            {capturedImage && (
              <View
                style={[
                  styles.imageContainer,
                  { borderColor: colors.outline },
                ]}
              >
                <ExpoImage
                  source={{ uri: capturedImage }}
                  style={styles.palmImage}
                />
              </View>
            )}

            <View
              style={[
                styles.readingCard,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.outline,
                },
              ]}
            >
              <Text
                style={{
                  color: colors.onSurface,
                  fontFamily: fontRegistryToUse.heading,
                  fontSize: fontSize.lg,
                  marginBottom: 12,
                  fontWeight: 'bold',
                }}
              >
                Palm Lines Detected
              </Text>
              {reading.lines.map((line, idx) => (
                <Text
                  key={`line-${idx}`}
                  style={{
                    color: colors.onSurfaceVariant,
                    fontFamily: fontRegistryToUse.body,
                    fontSize: fontSize.md,
                    marginBottom: 4,
                  }}
                >
                  • {line}
                </Text>
              ))}
            </View>

            <View
              style={[
                styles.readingCard,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.outline,
                },
              ]}
            >
              <Text
                style={{
                  color: colors.onSurface,
                  fontFamily: fontRegistryToUse.heading,
                  fontSize: fontSize.lg,
                  marginBottom: 12,
                  fontWeight: 'bold',
                }}
              >
                Hand Characteristics
              </Text>
              {reading.characteristics.map((char, idx) => (
                <Text
                  key={`char-${idx}`}
                  style={{
                    color: colors.onSurfaceVariant,
                    fontFamily: fontRegistryToUse.body,
                    fontSize: fontSize.md,
                    marginBottom: 4,
                  }}
                >
                  • {char}
                </Text>
              ))}
            </View>

            <View
              style={[
                styles.readingCard,
                {
                  backgroundColor: colors.primaryContainer,
                  borderColor: colors.primary,
                },
              ]}
            >
              <Text
                style={{
                  color: colors.onPrimaryContainer,
                  fontFamily: fontRegistryToUse.heading,
                  fontSize: fontSize.md,
                  marginBottom: 8,
                  fontWeight: 'bold',
                }}
              >
                Interpretation
              </Text>
              <Text
                style={{
                  color: colors.onPrimaryContainer,
                  fontFamily: fontRegistryToUse.body,
                  fontSize: fontSize.md,
                  lineHeight: 22,
                }}
              >
                {reading.interpretation}
              </Text>
            </View>

            <View style={styles.buttonRow}>
              <Pressable
                onPress={handleRetakePhoto}
                style={[
                  styles.button,
                  styles.secondaryButton,
                  { borderColor: colors.primary },
                ]}
              >
                <Text
                  style={{
                    color: colors.primary,
                    fontFamily: fontRegistryToUse.heading,
                    fontSize: fontSize.md,
                  }}
                >
                  Retake
                </Text>
              </Pressable>
              <Pressable
                onPress={handleReset}
                style={[
                  styles.button,
                  { backgroundColor: colors.primary },
                ]}
              >
                <Text
                  style={{
                    color: colors.onPrimary,
                    fontFamily: fontRegistryToUse.heading,
                    fontSize: fontSize.md,
                  }}
                >
                  New Reading
                </Text>
              </Pressable>
            </View>
          </View>
        ) : null}
      </ScrollView>

      {/* Camera Modal */}
      <Modal
        visible={showCamera}
        onRequestClose={() => setShowCamera(false)}
      >
        <CameraView
          ref={cameraRef}
          style={styles.camera}
          facing="back"
        >
          <View style={styles.cameraOverlay}>
            {/* Close button */}
            <Pressable
              onPress={() => setShowCamera(false)}
              style={styles.closeButton}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </Pressable>

            {/* Capture button */}
            <View style={styles.captureControls}>
              <Pressable
                onPress={handleTakePicture}
                disabled={isProcessing}
                style={[
                  styles.captureButtonLarge,
                  isProcessing && styles.captureButtonDisabled,
                ]}
              >
                {isProcessing ? (
                  <ActivityIndicator size="large" color="#FFF" />
                ) : (
                  <Text style={styles.captureButtonText}>📸</Text>
                )}
              </Pressable>
            </View>
          </View>
        </CameraView>
      </Modal>
    </FloatingHeader>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  initialView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  captureButton: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  processingView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  resultView: {
    gap: 16,
  },
  imageContainer: {
    borderWidth: 1,
    borderRadius: 12,
    overflow: 'hidden',
    aspectRatio: 3 / 4,
  },
  palmImage: {
    width: '100%',
    height: '100%',
  },
  readingCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  secondaryButton: {
    borderWidth: 2,
    backgroundColor: 'transparent',
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'space-between',
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  closeButtonText: {
    color: '#FFF',
    fontSize: 28,
    fontWeight: 'bold',
  },
  captureControls: {
    alignItems: 'center',
    marginBottom: 24,
  },
  captureButtonLarge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButtonDisabled: {
    opacity: 0.6,
  },
  captureButtonText: {
    fontSize: 40,
  },
});
