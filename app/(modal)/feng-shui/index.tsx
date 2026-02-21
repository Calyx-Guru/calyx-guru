import FloatingHeader from '@/components/home/FloatingHeader';
import { AppAppearanceContext } from '@/contexts/AppAppearanceContext';
import { router } from 'expo-router';
import { Magnetometer } from 'expo-sensors';
import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    Pressable,
    StyleSheet,
    Text,
    View
} from 'react-native';

const SCREEN_WIDTH = Dimensions.get('window').width;
const COMPASS_SIZE = Math.min(SCREEN_WIDTH - 32, 300);

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
                borderColor: colors.primary,
                backgroundColor: colors.surface,
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
            {/* Cardinal directions */}
            <View style={[styles.cardinalLabel, styles.north]}>
              <Text
                style={{
                  color: colors.primary,
                  fontFamily: fontRegistryToUse.heading,
                  fontSize: fontSize.lg,
                  fontWeight: 'bold',
                }}
              >
                N
              </Text>
            </View>
            <View style={[styles.cardinalLabel, styles.south]}>
              <Text
                style={{
                  color: colors.onSurface,
                  fontFamily: fontRegistryToUse.body,
                  fontSize: fontSize.md,
                }}
              >
                S
              </Text>
            </View>
            <View style={[styles.cardinalLabel, styles.east]}>
              <Text
                style={{
                  color: colors.onSurface,
                  fontFamily: fontRegistryToUse.body,
                  fontSize: fontSize.md,
                }}
              >
                E
              </Text>
            </View>
            <View style={[styles.cardinalLabel, styles.west]}>
              <Text
                style={{
                  color: colors.onSurface,
                  fontFamily: fontRegistryToUse.body,
                  fontSize: fontSize.md,
                }}
              >
                W
              </Text>
            </View>

            {/* Center dot */}
            <View
              style={[styles.centerDot, { backgroundColor: colors.primary }]}
            />
          </Animated.View>

          {/* Needle pointer (stays fixed, compass rotates underneath) */}
          <View
            style={[
              styles.needle,
              {
                borderLeftColor: colors.primary,
                borderRightColor: colors.primary,
              },
            ]}
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
    borderRadius: COMPASS_SIZE / 2,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardinalLabel: {
    position: 'absolute',
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  north: {
    top: 8,
  },
  south: {
    bottom: 8,
  },
  east: {
    right: 8,
  },
  west: {
    left: 8,
  },
  centerDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  needle: {
    position: 'absolute',
    width: 0,
    height: COMPASS_SIZE * 0.45,
    top: COMPASS_SIZE * 0.05,
    borderLeftWidth: 12,
    borderRightWidth: 12,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    zIndex: 10,
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
