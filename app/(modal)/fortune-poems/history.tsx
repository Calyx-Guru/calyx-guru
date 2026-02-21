import FloatingHeader from '@/components/home/FloatingHeader';
import { AppAppearanceContext } from '@/contexts/AppAppearanceContext';
import {
    FortuneTellingHistoryEntry,
    getTodayFortuneTellingHistoryEntries,
} from '@/lib/app/fortuneTellingsHistory';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useContext, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export default function FortunePoemsHistoryScreen() {
  const { colors, fontRegistry, fallbackFontRegistry, fontsLoaded, fontSize } =
    useContext(AppAppearanceContext);
  const fontRegistryToUse = fontsLoaded ? fontRegistry : fallbackFontRegistry;
  const [entries, setEntries] = useState<FortuneTellingHistoryEntry[]>([]);

  const loadEntries = useCallback(async () => {
    const todayEntries = await getTodayFortuneTellingHistoryEntries();
    setEntries(todayEntries);
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadEntries();
    }, [loadEntries]),
  );

  return (
    <FloatingHeader
      title="Today Tellings"
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
      <View style={styles.content}>
        {entries.length === 0 ? (
          <Text
            style={{
              color: colors.onSurfaceVariant,
              fontFamily: fontRegistryToUse.body,
              fontSize: fontSize.md,
              textAlign: 'center',
            }}
          >
            No tellings for today yet.
          </Text>
        ) : (
          entries.map((entry) => (
            <View
              key={entry.id}
              style={[
                styles.card,
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
                  fontSize: fontSize.md,
                }}
              >
                {entry.interest}
              </Text>
              <Text
                style={{
                  color: colors.onSurfaceVariant,
                  fontFamily: fontRegistryToUse.body,
                  fontSize: fontSize.sm,
                }}
              >
                {new Date(entry.toldAt).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
              <Text
                style={{
                  color: colors.onSurface,
                  fontFamily: fontRegistryToUse.body,
                  fontSize: fontSize.md,
                }}
              >
                {entry.resultText}
              </Text>
            </View>
          ))
        )}
      </View>
    </FloatingHeader>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
  },
  card: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    gap: 8,
  },
});
