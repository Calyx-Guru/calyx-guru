import { AccentText } from '@/components/typography/AccentText';
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
};

export default function FloatingHeader({
  children,
  title,
  style,
}: FloatingHeaderProps) {
  const insets = useSafeAreaInsets();
  const scrollY = useRef(new Animated.Value(0)).current;
  const headerOpacity = useRef(new Animated.Value(1)).current;

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
            paddingTop: insets.top,
            opacity: headerOpacity,
          },
        ]}
      >
        {title && <AccentText size="md">{title}</AccentText>}
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
});
