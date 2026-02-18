import { AccentText } from '@/components/typography/AccentText';
import { useAppAppearance } from '@/contexts/AppAppearanceContext';
import { useEffect, useRef } from 'react';
import {
  Animated,
  Platform,
  ScrollView,
  StyleSheet,
  View,
  ViewProps,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type FloatingHeaderProps = ViewProps & {
  children: React.ReactNode;
  title?: string;
  leftButton?: React.ReactNode;
  rightButton?: React.ReactNode;
};

export default function FloatingHeader({
  children,
  title,
  leftButton,
  rightButton,
  style,
}: FloatingHeaderProps) {
  const insets = useSafeAreaInsets();
  const scrollY = useRef(new Animated.Value(0)).current;
  const headerOpacity = useRef(new Animated.Value(1)).current;
  const { colors } = useAppAppearance();

  // Animate header opacity based on scroll position
  useEffect(() => {
    const listener = scrollY.addListener(({ value }) => {
      // Hide header when scrolling down, show when scrolling up
      if (value > 50) {
        Animated.timing(headerOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start();
      } else {
        Animated.timing(headerOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }).start();
      }
    });

    return () => {
      scrollY.removeListener(listener);
    };
  }, [scrollY, headerOpacity]);

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    { useNativeDriver: false },
  );

  return (
    <View style={[styles.container, style]}>
      {/* Floating Header */}
      <Animated.View
        style={[
          styles.floatingHeader,
          {
            opacity: headerOpacity,
            backgroundColor: colors.primary,
          },
        ]}
      >
        <View style={styles.headerLeft}>
          {leftButton && <View>{leftButton}</View>}
        </View>
        <View style={styles.headerCenter}>
          {title && (
            <AccentText color="onPrimary" size="md">
              {title}
            </AccentText>
          )}
        </View>
        <View style={styles.headerRight}>
          {rightButton && <View>{rightButton}</View>}
        </View>
      </Animated.View>

      {/* Scrollable Content */}
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        onScroll={handleScroll}
        scrollEventThrottle={16}
        style={styles.scrollView}
      >
        {children}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  floatingHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 100,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  scrollView: {
    flex: 1,
  },
  headerLeft: {
    width: 50,
    alignItems: 'flex-start',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerRight: {
    width: 50,
    alignItems: 'flex-end',
  },
});
