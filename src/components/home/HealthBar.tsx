import React from 'react';
import { StyleSheet, View } from 'react-native';

type HealthBarProps = {
   /** 0–100 fill percentage */
   value: number;
   /** Bar fill color */
   color: string;
   /** Height of this bar segment */
   height?: number;
};

/**
 * A single health-bar segment.
 * `value` controls the fill from 0 % (empty) to 100 % (full).
 */
export default function HealthBar({ value, color, height = 14 }: HealthBarProps) {
   const clampedValue = Math.max(0, Math.min(100, value));

   return (
      <View style={[styles.track, { height, borderRadius: height / 2 }]}>
         <View
            style={[
               styles.fill,
               {
                  width: `${clampedValue}%`,
                  backgroundColor: color,
                  borderRadius: height / 2,
               },
            ]}
         />
      </View>
   );
}

const styles = StyleSheet.create({
   track: {
      width: '100%',
      backgroundColor: 'rgba(255,255,255,0.15)',
      overflow: 'hidden',
   },
   fill: {
      height: '100%',
   },
});
