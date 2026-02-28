import HealthBar from '@/components/home/HealthBar';
import { useAppAppearance } from '@/contexts/AppAppearanceContext';
import { useUserProfileStore } from '@/store/userProfileStore';
import { Ionicons } from '@expo/vector-icons';
import { useEventListener } from 'expo';
import { router } from 'expo-router';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useCallback, useMemo, useRef, useState } from 'react';
import { Animated, Modal, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

const BACKGROUND_VIDEO = require('../../../src/assets/videos/luckiest.mp4');
const FORTUNE_VIDEO = require('../../../src/assets/videos/Mascot_Fortune_Telling_Video_Generation.mp4');

/** Total HP across all three real bars (blue + yellow + red). */
const MAX_TOTAL_HP = 300;
const HP_STEP = 25;

const BAR_COLORS = {
   blue: '#3B82F6',
   yellow: '#FACC15',
   red: '#EF4444',
   empty: '#000000',
};

const SUB_BUTTON_LABELS = ['Family &\nFriends', 'Money', 'Love', 'Career', 'Health'];

export default function HomeScreen() {
   const { colors } = useAppAppearance();
   const profile = useUserProfileStore((s) => s.profile);
   const { width: screenWidth } = useWindowDimensions();

   // ── Video player ─────────────────────────────────────────
   const [isFortuneMode, setIsFortuneMode] = useState(false);
   const [showResultModal, setShowResultModal] = useState(false);
   const [selectedCategory, setSelectedCategory] = useState('');
   const uiOpacity = useRef(new Animated.Value(1)).current;

   const videoSource = isFortuneMode ? FORTUNE_VIDEO : BACKGROUND_VIDEO;

   const player = useVideoPlayer(videoSource, (p) => {
      if (isFortuneMode) {
         p.loop = false;
         p.play();
      } else {
         p.loop = true;
         p.play();
      }
   });

   // Listen for fortune video to finish
   useEventListener(player, 'playToEnd', () => {
      if (isFortuneMode) {
         // Revert to background video
         setIsFortuneMode(false);
         // Fade UI back in
         Animated.timing(uiOpacity, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
         }).start(() => {
            // Show result modal
            setShowResultModal(true);
         });
      }
   });

   // ── Health state ─────────────────────────────────────────
   const [totalHp, setTotalHp] = useState(MAX_TOTAL_HP);

   const bars = useMemo(() => {
      // Blue depletes first, then yellow, then red.
      const blue = Math.max(0, Math.min(100, totalHp - 200));
      const yellow = Math.max(0, Math.min(100, totalHp - 100));
      const red = Math.max(0, Math.min(100, totalHp));
      return { blue, yellow, red };
   }, [totalHp]);

   const decreaseHp = useCallback(() => setTotalHp((hp) => Math.max(0, hp - HP_STEP)), []);
   const increaseHp = useCallback(() => setTotalHp((hp) => Math.min(MAX_TOTAL_HP, hp + HP_STEP)), []);

   // ── Drawing fan-out state ────────────────────────────────
   const [isMenuOpen, setIsMenuOpen] = useState(false);
   const mainButtonOpacity = useRef(new Animated.Value(1)).current;
   const fanAnims = useRef(Array.from({ length: 5 }, () => new Animated.Value(0))).current;

   /**
    * Final positions for circles 1-5 relative to center of main button.
    * They form an elliptical upward arc spanning the screen width (with MARGIN).
    *   3 = center (closest to main), 1 & 5 = far edges (highest)
    */
   const SUB_BUTTON_TARGETS = useMemo(() => {
      const SUB_SIZE = 56;
      // Horizontal semi-axis: half the usable width
      const a = (screenWidth - 2 * MARGIN - SUB_SIZE) / 2;
      // Gentle elliptical arc with equal horizontal spacing
      const BASE_Y = 100; // vertical offset at center (button 3)
      const CURVE_Y = 40; // gentle additional rise at edges
      // Equal horizontal spacing: -1, -0.5, 0, 0.5, 1
      return ([-1, -0.5, 0, 0.5, 1] as const).map((t) => ({
         x: t * a,
         y: -(BASE_Y + CURVE_Y * t * t),
      }));
   }, [screenWidth]);

   const openMenu = useCallback(() => {
      setIsMenuOpen(true);
      // Fade out main button first
      Animated.timing(mainButtonOpacity, {
         toValue: 0,
         duration: 200,
         useNativeDriver: true,
      }).start(() => {
         // Then fan out the sub-buttons with stagger
         Animated.stagger(
            60,
            fanAnims.map((anim) =>
               Animated.spring(anim, {
                  toValue: 1,
                  friction: 6,
                  tension: 80,
                  useNativeDriver: true,
               }),
            ),
         ).start();
      });
   }, [mainButtonOpacity, fanAnims]);

   const closeMenu = useCallback(() => {
      // Reverse: collapse sub-buttons then show main
      Animated.stagger(
         40,
         [...fanAnims].reverse().map((anim) =>
            Animated.timing(anim, {
               toValue: 0,
               duration: 180,
               useNativeDriver: true,
            }),
         ),
      ).start(() => {
         Animated.timing(mainButtonOpacity, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
         }).start(() => setIsMenuOpen(false));
      });
   }, [mainButtonOpacity, fanAnims]);

   // ── Fortune drawing handler ──────────────────────────────
   const handleSubButtonPress = useCallback(
      (index: number) => {
         setSelectedCategory(SUB_BUTTON_LABELS[index].replace('\n', ' '));
         // Collapse the menu first
         Animated.stagger(
            40,
            [...fanAnims].reverse().map((anim) =>
               Animated.timing(anim, {
                  toValue: 0,
                  duration: 150,
                  useNativeDriver: true,
               }),
            ),
         ).start(() => {
            setIsMenuOpen(false);
            // Reset main button opacity to 0 (keep it hidden)
            mainButtonOpacity.setValue(1);
            // Fade out entire UI
            Animated.timing(uiOpacity, {
               toValue: 0,
               duration: 300,
               useNativeDriver: true,
            }).start(() => {
               // Switch to fortune video
               setIsFortuneMode(true);
            });
         });
      },
      [fanAnims, mainButtonOpacity, uiOpacity],
   );

   // ── Avatar initials fallback ─────────────────────────────
   const initials = profile?.full_name
      ? profile.full_name
           .split(' ')
           .map((w) => w[0])
           .join('')
           .slice(0, 2)
           .toUpperCase()
      : '?';

   return (
      <View style={styles.root}>
         {/* ── Fullscreen background video ──────────────────── */}
         <VideoView player={player} style={StyleSheet.absoluteFillObject} nativeControls={false} contentFit="cover" />

         {/* ── Content overlay ──────────────────────────────── */}
         <Animated.View
            style={[styles.overlay, { opacity: uiOpacity }]}
            pointerEvents={isFortuneMode ? 'none' : 'auto'}
         >
            {/* ── Header ─────────────────────────────────────── */}
            <View style={[styles.header, { backgroundColor: colors.primary }]}>
               <View style={styles.headerSpacer} />
               <Pressable onPress={() => router.push('/(modal)/personal-information')} style={styles.avatarWrapper}>
                  <View style={[styles.avatar, { backgroundColor: colors.primaryContainer }]}>
                     <Text style={[styles.avatarText, { color: colors.onPrimary }]}>{initials}</Text>
                  </View>
               </Pressable>
            </View>

            {/* ── Health bars ────────────────────────────────── */}
            <View style={styles.healthSection}>
               <View style={styles.healthBars}>
                  {/* Bars stacked bottom-to-top: empty(gray) → red → yellow → blue on top */}
                  <HealthBar value={100} color={BAR_COLORS.empty} />
                  <View style={styles.healthBarAbsolute}>
                     <HealthBar value={bars.red} color={BAR_COLORS.red} />
                  </View>
                  <View style={styles.healthBarAbsolute}>
                     <HealthBar value={bars.yellow} color={BAR_COLORS.yellow} />
                  </View>
                  <View style={styles.healthBarAbsolute}>
                     <HealthBar value={bars.blue} color={BAR_COLORS.blue} />
                  </View>
               </View>

               {/* Test controls */}
               <View style={styles.hpControls}>
                  <Pressable onPress={decreaseHp} style={[styles.hpButton, { backgroundColor: 'rgba(239,68,68,0.8)' }]}>
                     <Ionicons name="remove" size={20} color="#fff" />
                  </Pressable>
                  <Text style={styles.hpLabel}>
                     {totalHp} / {MAX_TOTAL_HP}
                  </Text>
                  <Pressable
                     onPress={increaseHp}
                     style={[styles.hpButton, { backgroundColor: 'rgba(59,130,246,0.8)' }]}
                  >
                     <Ionicons name="add" size={20} color="#fff" />
                  </Pressable>
               </View>
            </View>

            {/* ── Spacer to push button to bottom ────────────── */}
            <View style={styles.spacer} />

            {/* ── Drawing button + fan-out menu ────────────── */}
            <View style={styles.drawingWrapper}>
               {/* Sub-buttons (rendered behind main so they appear from center) */}
               {isMenuOpen &&
                  SUB_BUTTON_TARGETS.map((target, i) => {
                     const anim = fanAnims[i];
                     return (
                        <Animated.View
                           key={i}
                           style={[
                              styles.subButtonContainer,
                              {
                                 opacity: anim,
                                 transform: [
                                    {
                                       translateX: anim.interpolate({
                                          inputRange: [0, 1],
                                          outputRange: [0, target.x],
                                       }),
                                    },
                                    {
                                       translateY: anim.interpolate({
                                          inputRange: [0, 1],
                                          outputRange: [0, target.y],
                                       }),
                                    },
                                    {
                                       scale: anim.interpolate({
                                          inputRange: [0, 1],
                                          outputRange: [0.3, 1],
                                       }),
                                    },
                                 ],
                              },
                           ]}
                        >
                           <Pressable
                              onPress={() => handleSubButtonPress(i)}
                              style={[styles.subButton, { backgroundColor: colors.secondary }]}
                           >
                              <Text style={[styles.subButtonText, { color: colors.onSecondary }]}>
                                 {SUB_BUTTON_LABELS[i]}
                              </Text>
                           </Pressable>
                        </Animated.View>
                     );
                  })}

               {/* Main Drawing button */}
               <Animated.View style={{ opacity: mainButtonOpacity }}>
                  <Pressable
                     onPress={isMenuOpen ? closeMenu : openMenu}
                     style={[styles.drawingButton, { backgroundColor: colors.primary }]}
                  >
                     <Text style={[styles.drawingText, { color: colors.onPrimary }]}>Drawing</Text>
                  </Pressable>
               </Animated.View>

               {/* Invisible tap-target to close menu when it's open */}
               {isMenuOpen && (
                  <Pressable onPress={closeMenu} style={styles.closeTarget}>
                     <Text style={styles.closeTargetText}>✕</Text>
                  </Pressable>
               )}
            </View>
         </Animated.View>

         {/* ── Fortune result modal ──────────────────────────── */}
         <Modal
            visible={showResultModal}
            transparent
            animationType="fade"
            onRequestClose={() => setShowResultModal(false)}
         >
            <View style={styles.modalBackdrop}>
               <View style={[styles.modalCard, { backgroundColor: colors.surface }]}>
                  <Text style={[styles.modalTitle, { color: colors.onSurface }]}>{selectedCategory}</Text>
                  <Text style={[styles.modalBody, { color: colors.onSurfaceVariant }]}>
                     Here&apos;s your fortune teller result
                  </Text>
                  <Pressable
                     onPress={() => setShowResultModal(false)}
                     style={[styles.modalButton, { backgroundColor: colors.primary }]}
                  >
                     <Text style={[styles.modalButtonText, { color: colors.onPrimary }]}>Close</Text>
                  </Pressable>
               </View>
            </View>
         </Modal>
      </View>
   );
}

const MARGIN = 24;

const styles = StyleSheet.create({
   root: {
      flex: 1,
      backgroundColor: '#000',
   },
   overlay: {
      ...StyleSheet.absoluteFillObject,
      justifyContent: 'flex-start',
   },

   /* ── Header ──────────────────────────────────────────── */
   header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end',
      paddingHorizontal: 8,
      paddingVertical: 8,
   },
   headerSpacer: {
      flex: 1,
   },
   avatarWrapper: {
      padding: 0,
   },
   avatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
   },
   avatarText: {
      fontSize: 16,
      fontWeight: '700',
   },

   /* ── Health bars ─────────────────────────────────────── */
   healthSection: {
      marginTop: 24,
      marginHorizontal: 24,
   },
   healthBars: {
      position: 'relative',
      height: 14,
      borderRadius: 7,
      overflow: 'hidden',
   },
   healthBarAbsolute: {
      ...StyleSheet.absoluteFillObject,
   },
   hpControls: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 12,
      gap: 16,
   },
   hpButton: {
      width: 32,
      height: 32,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
   },
   hpLabel: {
      color: '#fff',
      fontSize: 14,
      fontWeight: '600',
   },

   /* ── Spacer ──────────────────────────────────────────── */
   spacer: {
      flex: 1,
   },

   /* ── Drawing button ──────────────────────────────────── */
   drawingWrapper: {
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: MARGIN,
      marginHorizontal: MARGIN,
   },
   drawingButton: {
      width: 120,
      height: 120,
      borderRadius: 60,
      alignItems: 'center',
      justifyContent: 'center',
      elevation: 6,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.4,
      shadowRadius: 6,
   },
   drawingText: {
      fontSize: 18,
      fontWeight: '700',
   },

   /* ── Sub-buttons (fan-out) ──────────────────────────────── */
   subButtonContainer: {
      position: 'absolute',
      alignItems: 'center',
      justifyContent: 'center',
   },
   subButton: {
      width: 56,
      height: 56,
      borderRadius: 28,
      alignItems: 'center',
      justifyContent: 'center',
      elevation: 4,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      paddingHorizontal: 4,
   },
   subButtonText: {
      fontSize: 10,
      fontWeight: '700',
      textAlign: 'center',
   },
   closeTarget: {
      position: 'absolute',
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: 'rgba(0,0,0,0.5)',
      alignItems: 'center',
      justifyContent: 'center',
   },
   closeTargetText: {
      color: '#fff',
      fontSize: 20,
      fontWeight: '700',
   },

   /* ── Result modal ───────────────────────────────────────── */
   modalBackdrop: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.6)',
      alignItems: 'center',
      justifyContent: 'center',
      padding: MARGIN,
   },
   modalCard: {
      width: '100%',
      borderRadius: 20,
      padding: 32,
      alignItems: 'center',
      elevation: 10,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
   },
   modalTitle: {
      fontSize: 22,
      fontWeight: '700',
      marginBottom: 16,
   },
   modalBody: {
      fontSize: 16,
      textAlign: 'center',
      lineHeight: 24,
      marginBottom: 24,
   },
   modalButton: {
      paddingHorizontal: 32,
      paddingVertical: 12,
      borderRadius: 24,
   },
   modalButtonText: {
      fontSize: 16,
      fontWeight: '600',
   },
});
