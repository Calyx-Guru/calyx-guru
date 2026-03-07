import HealthBar from '@/components/home/HealthBar';
import { useAppAppearance } from '@/contexts/AppAppearanceContext';
import { useMasterData } from '@/hooks/useMasterData';
import { useUserProfileStore } from '@/store/userProfileStore';
import type { FortuneTellingCategory } from '@/types/FortuneTelling';
import { useEventListener } from 'expo';
import { router } from 'expo-router';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useCallback, useMemo, useRef, useState } from 'react';
import { Animated, Modal, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import type { FortunePoem } from './constants';
import {
   BACKGROUND_VIDEOS,
   BAR_COLORS,
   FORTUNE_POEMS,
   INIT_HP,
   MARGIN,
   MAX_TOTAL_HP,
   SUB_BUTTON_LABELS,
} from './constants';

const CATEGORY_MAP: FortuneTellingCategory[] = ['family_friends', 'money', 'love', 'career', 'health'];

export default function HomeScreen() {
   const { colors } = useAppAppearance();
   const profile = useUserProfileStore((s) => s.profile);
   const { fetchRandomFortuneTelling } = useMasterData();
   const { width: screenWidth } = useWindowDimensions();

   // ── Video player ─────────────────────────────────────────
   const [isFortuneMode, setIsFortuneMode] = useState(false);
   const [showResultModal, setShowResultModal] = useState(false);
   const [selectedCategory, setSelectedCategory] = useState('');
   const [drawnPoem, setDrawnPoem] = useState<FortunePoem | null>(null);
   const uiOpacity = useRef(new Animated.Value(1)).current;
   const whiteFlashOpacity = useRef(new Animated.Value(0)).current;
   const blackFadeOpacity = useRef(new Animated.Value(0)).current;

   // ── Health state (declared early so video source can use it) ──
   const [totalHp, setTotalHp] = useState(INIT_HP);

   const bars = useMemo(() => {
      const blue = Math.max(0, Math.min(100, totalHp - 200));
      const yellow = Math.max(0, Math.min(100, totalHp - 100));
      const red = Math.max(0, Math.min(100, totalHp));
      return { blue, yellow, red };
   }, [totalHp]);

   // Derive luck state from HP
   const getLuckState = useCallback((hp: number) => {
      if (hp < 100) return 'unluckiest';
      if (hp > 200) return 'luckiest';
      return 'normal';
   }, []);

   // Background video based on HP state
   const backgroundVideo = useMemo(() => {
      return BACKGROUND_VIDEOS[getLuckState(totalHp)];
   }, [totalHp, getLuckState]);

   const videoSource = isFortuneMode ? BACKGROUND_VIDEOS.drawing_fortune : backgroundVideo;

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
         // Flash white over the video
         Animated.timing(whiteFlashOpacity, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
         }).start(() => {
            // Revert to SAME background video (HP unchanged yet)
            setIsFortuneMode(false);
            // Fade UI back in behind the white
            uiOpacity.setValue(1);
            mainButtonOpacity.setValue(1);
            // Fade out white to reveal UI + show result modal
            Animated.timing(whiteFlashOpacity, {
               toValue: 0,
               duration: 2000,
               useNativeDriver: true,
            }).start(() => {
               setShowResultModal(true);
            });
         });
      }
   });

   // ── Close modal → apply HP → black fade only if luck state changes ──
   const closeModal = useCallback(() => {
      setShowResultModal(false);
      if (!drawnPoem) return;
      const poemHp = drawnPoem.hp;

      setTotalHp((prevHp) => {
         const newHp = Math.max(0, Math.min(MAX_TOTAL_HP, prevHp + poemHp));
         const prevState = getLuckState(prevHp);
         const nextState = getLuckState(newHp);

         if (prevState !== nextState) {
            // Fade video to black → switch happens → fade back in
            Animated.timing(blackFadeOpacity, {
               toValue: 1,
               duration: 600,
               useNativeDriver: true,
            }).start(() => {
               // HP is already applied (returned newHp), video source will switch.
               // Small delay so the new video loads behind the black.
               setTimeout(() => {
                  Animated.timing(blackFadeOpacity, {
                     toValue: 0,
                     duration: 1000,
                     useNativeDriver: true,
                  }).start();
               }, 400);
            });
         }

         return newHp;
      });
   }, [drawnPoem, blackFadeOpacity, getLuckState]);

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
         const categoryLabel = SUB_BUTTON_LABELS[index].replace('\n', ' ');
         setSelectedCategory(categoryLabel);

         // Fetch from Supabase, fall back to local poems
         const category = CATEGORY_MAP[index];
         fetchRandomFortuneTelling(category).then((result) => {
            if (result) {
               setDrawnPoem({ poem: result.text, hp: result.hp });
            } else {
               // Fallback to local hardcoded poems
               const categoryPoems = FORTUNE_POEMS[index] ?? FORTUNE_POEMS[0];
               const randomPoem = categoryPoems[Math.floor(Math.random() * categoryPoems.length)];
               setDrawnPoem(randomPoem);
            }
         });

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
            // Keep main button hidden (don't restore opacity)
            mainButtonOpacity.setValue(0);
            // Fade out UI
            Animated.timing(uiOpacity, {
               toValue: 0,
               duration: 200,
               useNativeDriver: true,
            }).start(() => {
               // Flash white over screen
               Animated.timing(whiteFlashOpacity, {
                  toValue: 1,
                  duration: 500,
                  useNativeDriver: true,
               }).start(() => {
                  // Switch to fortune video while screen is white
                  setIsFortuneMode(true);
                  // Fade out white to reveal fortune video
                  Animated.timing(whiteFlashOpacity, {
                     toValue: 0,
                     duration: 2000,
                     useNativeDriver: true,
                  }).start();
               });
            });
         });
      },
      [fanAnims, mainButtonOpacity, uiOpacity, whiteFlashOpacity, fetchRandomFortuneTelling],
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

         {/* ── Black fade overlay (over video only, below UI) ── */}
         <Animated.View style={[styles.blackFade, { opacity: blackFadeOpacity }]} pointerEvents="none" />

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

         {/* ── White flash overlay ────────────────────────────── */}
         <Animated.View style={[styles.whiteFlash, { opacity: whiteFlashOpacity }]} pointerEvents="none" />

         {/* ── Fortune result modal ──────────────────────────── */}
         <Modal visible={showResultModal} transparent animationType="fade" onRequestClose={closeModal}>
            <View style={styles.modalBackdrop}>
               <View style={[styles.modalCard, { backgroundColor: colors.surface }]}>
                  <Text style={[styles.modalTitle, { color: colors.onSurface }]}>{selectedCategory}</Text>
                  <Text style={[styles.modalBody, { color: colors.onSurfaceVariant }]}>{drawnPoem?.poem ?? ''}</Text>
                  <Pressable onPress={closeModal} style={[styles.modalButton, { backgroundColor: colors.primary }]}>
                     <Text style={[styles.modalButtonText, { color: colors.onPrimary }]}>Close</Text>
                  </Pressable>
               </View>
            </View>
         </Modal>
      </View>
   );
}

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

   /* ── White flash overlay ────────────────────────────────── */
   whiteFlash: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: '#fff',
   },
   /* ── Black fade overlay (luck-state transition) ──────────── */
   blackFade: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: '#000',
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
