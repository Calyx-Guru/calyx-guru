import FloatingHeader from '@/components/home/FloatingHeader';
import { AppAppearanceContext } from '@/contexts/AppAppearanceContext';
import { router } from 'expo-router';
import { Magnetometer } from 'expo-sensors';
import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

const SCREEN_WIDTH = Dimensions.get('window').width;
const COMPASS_SIZE = SCREEN_WIDTH - 32;
const NEEDLE_SIZE = COMPASS_SIZE * 0.12;

type CompassError = 'no-gyro' | null;

export default function FengShuiScreen() {
  const { colors, fontRegistry, fallbackFontRegistry, fontsLoaded, fontSize } =
    useContext(AppAppearanceContext);
  const fontRegistryToUse = fontsLoaded ? fontRegistry : fallbackFontRegistry;

  const [heading, setHeading] = useState(0);
  const [error, setError] = useState<CompassError>(null);
  const [isAvailable, setIsAvailable] = useState(false);
  const rotationAnim = useRef(new Animated.Value(0)).current;

  // Check if magnetometer is available
  useEffect(() => {
    const checkMagnetometerAvailability = async () => {
      try {
        const isAvail = await Magnetometer.isAvailableAsync();
        setIsAvailable(isAvail);
        if (!isAvail) {
          setError('no-gyro');
        }
      } catch (err) {
        console.error('Error checking magnetometer:', err);
        setError('no-gyro');
      }
    };

    checkMagnetometerAvailability();
  }, []);

  // Subscribe to magnetometer updates
  useEffect(() => {
    if (error === 'no-gyro' || !isAvailable) {
      return;
    }

    const subscription = Magnetometer.addListener(({ x, y, z }) => {
      // Calculate heading from magnetometer data
      // atan2(y, x) gives angle in radians, convert to degrees
      let angle = Math.atan2(y, x) * (180 / Math.PI);

      // Adjust for magnetic declination (this is often device-specific)
      // For now, we normalize to 0-360 range where 0 is North
      if (angle < 0) {
        angle += 360;
      }

      // The compass points opposite to calculated angle
      const compassHeading = (360 - angle) % 360;

      setHeading(compassHeading);

      // Animate the rotation
      Animated.timing(rotationAnim, {
        toValue: compassHeading,
        duration: 200,
        useNativeDriver: true,
      }).start();
    });

    return () => {
      subscription.remove();
    };
  }, [isAvailable, error, rotationAnim]);

  const headingDegrees = rotationAnim.interpolate({
    inputRange: [0, 360],
    outputRange: ['0deg', '360deg'],
  });

  const handleGoBack = useCallback(() => {
    router.back();
  }, []);

  if (error === 'no-gyro') {
    return (
      <FloatingHeader
        title="Feng Shui Compass"
        leftButton={
          <Pressable onPress={handleGoBack}>
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
        <View
          style={[
            styles.errorContainer,
            { backgroundColor: colors.background },
          ]}
        >
          <Text
            style={{
              color: colors.onBackground,
              fontFamily: fontRegistryToUse.heading,
              fontSize: fontSize.lg,
              textAlign: 'center',
              marginBottom: 16,
            }}
          >
            Gyroscope Not Available
          </Text>
          <Text
            style={{
              color: colors.onSurfaceVariant,
              fontFamily: fontRegistryToUse.body,
              fontSize: fontSize.md,
              textAlign: 'center',
            }}
          >
            This device does not have a gyroscope or magnetometer sensor. Feng
            Shui compass requires motion sensors to function.
          </Text>
          <Pressable
            onPress={handleGoBack}
            style={[styles.errorButton, { backgroundColor: colors.primary }]}
          >
            <Text
              style={{
                color: colors.onPrimary,
                fontFamily: fontRegistryToUse.heading,
                fontSize: fontSize.md,
              }}
            >
              Go Back
            </Text>
          </Pressable>
        </View>
      </FloatingHeader>
    );
  }

  return (
    <FloatingHeader
      title="Feng Shui Compass"
      leftButton={
        <Pressable onPress={handleGoBack}>
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
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.compassWrapper}>
          <Animated.View
            style={[
              styles.compass,
              {
                width: COMPASS_SIZE,
                height: COMPASS_SIZE,
              },
              {
                transform: [
                  {
                    rotate: headingDegrees,
                  },
                ],
              },
            ]}
          >
            <Image
              source={require('@/assets/images/feng-shui/luo_pan_sm.png')}
              style={styles.compassImage}
              resizeMode="contain"
            />
          </Animated.View>

          {/* Needle pointer (stays fixed, compass rotates underneath) */}
          <Image
            source={require('@/assets/images/feng-shui/needle.png')}
            style={styles.needleImage}
            resizeMode="contain"
          />

          {/* Bubble overlay */}
          <Image
            source={require('@/assets/images/feng-shui/bubble.png')}
            style={styles.bubbleImage}
            resizeMode="contain"
          />
        </View>

        <View style={styles.info}>
          <Text
            style={{
              color: colors.onBackground,
              fontFamily: fontRegistryToUse.heading,
              fontSize: fontSize.lg,
              textAlign: 'center',
              marginBottom: 8,
            }}
          >
            Heading
          </Text>
          <Text
            style={{
              color: colors.primary,
              fontFamily: fontRegistryToUse.body,
              fontSize: fontSize.xl || fontSize.lg,
              textAlign: 'center',
              fontWeight: 'bold',
            }}
          >
            {Math.round(heading)}°
          </Text>
        </View>
      </View>
    </FloatingHeader>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 32,
    gap: 32,
  },
  compassWrapper: {
    position: 'relative',
    width: COMPASS_SIZE,
    height: COMPASS_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  compass: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  compassImage: {
    width: COMPASS_SIZE,
    height: COMPASS_SIZE,
  },
  needleImage: {
    position: 'absolute',
    width: NEEDLE_SIZE,
    height: NEEDLE_SIZE,
    zIndex: 10,
  },
  bubbleImage: {
    position: 'absolute',
    width: NEEDLE_SIZE,
    height: NEEDLE_SIZE,
    zIndex: 11,
  },
  info: {
    alignItems: 'center',
    gap: 8,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    gap: 24,
  },
  errorButton: {
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
    marginTop: 16,
  },
});
