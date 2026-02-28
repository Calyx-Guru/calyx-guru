import HealthBar from '@/components/home/HealthBar';
import { useAppAppearance } from '@/contexts/AppAppearanceContext';
import { useUserProfileStore } from '@/store/userProfileStore';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useCallback, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

const BACKGROUND_VIDEO = require('../../../src/assets/videos/luckiest.mp4');

/** Total HP across all three real bars (blue + yellow + red). */
const MAX_TOTAL_HP = 300;
const HP_STEP = 25;

const BAR_COLORS = {
   blue: '#3B82F6',
   yellow: '#FACC15',
   red: '#EF4444',
   empty: '#1F1F1F',
};

export default function HomeScreen() {
   const { colors } = useAppAppearance();
   const profile = useUserProfileStore((s) => s.profile);

   // ── Video player ─────────────────────────────────────────
   const player = useVideoPlayer(BACKGROUND_VIDEO, (p) => {
      p.loop = true;
      p.play();
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
         <View style={styles.overlay}>
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

            {/* ── Drawing button ─────────────────────────────── */}
            <View style={styles.drawingWrapper}>
               <Pressable style={[styles.drawingButton, { backgroundColor: colors.primary }]}>
                  <Text style={[styles.drawingText, { color: colors.onPrimary }]}>Drawing</Text>
               </Pressable>
            </View>
         </View>
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
});
