import { MaterialCommunityIcons } from '@expo/vector-icons';
import { VideoView, useVideoPlayer } from 'expo-video';

import { useMemo, useState } from 'react';
import { Image, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { LinearGradient } from 'expo-linear-gradient';

import * as elements from '../../../src/assets/images/elements';

function TabHome() {
   const theme = {
      colors: {
         primary: {
            main: '#4a38a5',
            linear: '#6548c3',
         },
         secondary: {
            main: '#226f76',
            linear: '#3eacb2',
         },
      },
   };

   const [dateOfBirth, setDateOfBirth] = useState<Date>(new Date('1990-01-01'));
   const [showDatePicker, setShowDatePicker] = useState(false);

   const player = useVideoPlayer(require('../../../src/assets/videos/mascot/stage-egg.mp4'), (videoPlayer) => {
      videoPlayer.loop = true;
      videoPlayer.play();
   });

   const dateLabel = useMemo(() => {
      if (!dateOfBirth) {
         return 'Choose your date of birth';
      }

      return dateOfBirth.toLocaleDateString('en-GB', {
         day: '2-digit',
         month: '2-digit',
         year: 'numeric',
      });
   }, [dateOfBirth]);

   const handleDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
      if (Platform.OS === 'android') {
         setShowDatePicker(false);
      }

      if (event.type === 'set' && selectedDate) {
         setDateOfBirth(selectedDate);
      }
   };

   return (
      <View style={styles.root}>
         <VideoView
            style={styles.backgroundVideo}
            player={player}
            contentFit="cover"
            nativeControls={false}
            fullscreenOptions={{
               enable: false,
            }}
         />

         <View style={styles.starContainer}>
            <Image source={elements.water} style={[styles.starElement, styles.elementTop]} />
            <Image source={elements.fire} style={[styles.starElement, styles.elementLeft]} />
            <Image source={elements.metal} style={[styles.starElement, styles.elementRight]} />
            <Image source={elements.earth} style={[styles.starElement, styles.elementBottomLeft]} />
            <Image source={elements.wood} style={[styles.starElement, styles.elementBottomRight]} />
         </View>

         <SafeAreaView style={styles.foreground}>
            <LinearGradient
               colors={[theme.colors.primary.main, theme.colors.primary.linear, theme.colors.primary.main]}
               start={{ x: 0, y: 0.5 }}
               end={{ x: 1, y: 0.5 }}
               locations={[0.1, 0.5, 0.9]}
               style={styles.header}
            >
               <Pressable style={styles.fingerprintButton}>
                  <MaterialCommunityIcons name="fingerprint" size={26} color="#4e39a9" />
               </Pressable>
            </LinearGradient>

            <View style={styles.card}>
               <Text style={styles.cardTitle}>Enter your date of birth</Text>

               <Pressable style={styles.dateInput} onPress={() => setShowDatePicker(true)}>
                  <Text style={styles.dateInputText}>{dateLabel}</Text>
               </Pressable>

               <View style={styles.buttonRow}>
                  <Pressable style={styles.confirmButton}>
                     <LinearGradient
                        colors={[
                           theme.colors.secondary.main,
                           theme.colors.secondary.linear,
                           theme.colors.secondary.main,
                        ]}
                        start={{ x: 0, y: 0.5 }}
                        end={{ x: 1, y: 0.5 }}
                        locations={[0.1, 0.5, 0.9]}
                        style={styles.confirmGradient}
                     >
                        <Text style={styles.confirmText}>OK</Text>
                     </LinearGradient>
                  </Pressable>
               </View>
            </View>

            <Pressable style={styles.selfChooseButton}>
               <LinearGradient
                  colors={['#261c23', '#372c31', '#261c23']}
                  start={{ x: 0, y: 0.5 }}
                  end={{ x: 1, y: 0.5 }}
                  locations={[0.1, 0.5, 0.9]}
                  style={styles.selfChooseGradient}
               >
                  <Text style={styles.selfChooseText}>I will choose myself</Text>
               </LinearGradient>
            </Pressable>

            {showDatePicker && (
               <DateTimePicker
                  value={dateOfBirth ?? new Date(2000, 0, 1)}
                  mode="date"
                  display="default"
                  onChange={handleDateChange}
                  maximumDate={new Date()}
               />
            )}
         </SafeAreaView>
      </View>
   );
}

const styles = StyleSheet.create({
   root: {
      flex: 1,
   },
   backgroundVideo: {
      position: 'absolute',
      left: 0,
      right: 0,
      top: 0,
      bottom: -50,
   },
   foreground: {
      flex: 1,
      justifyContent: 'space-between',
      rowGap: 16,
      paddingHorizontal: 16,
   },
   header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end',
      padding: 8,
      borderTopStartRadius: 8,
      borderTopEndRadius: 8,
      overflow: 'hidden',
      elevation: 14,
   },
   fingerprintButton: {
      alignItems: 'center',
      justifyContent: 'center',
      width: 36,
      height: 36,
      backgroundColor: '#1e1e37',
      borderRadius: 4,
      elevation: 8,
   },
   card: {
      position: 'relative',
      rowGap: 8,
      padding: 8,
      backgroundColor: '#161a1e',
      borderWidth: 1,
      borderColor: '#63717e',
      overflow: 'hidden',
   },
   cardTitle: {
      color: '#f2f5f8',
      fontSize: 18,
      fontWeight: '700',
      textAlign: 'center',
   },
   dateInput: {
      position: 'relative',
      justifyContent: 'center',
      padding: 8,
      width: '100%',
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.6)',
      borderRadius: 4,
      overflow: 'hidden',
      elevation: 6,
   },
   dateInputText: {
      color: '#f6f9ff',
      fontSize: 16,
      fontWeight: '500',
      textAlign: 'center',
   },
   buttonRow: {
      position: 'relative',
      flexDirection: 'row',
      justifyContent: 'flex-end',
      alignItems: 'flex-end',
   },
   confirmButton: {
      position: 'relative',
      width: '40%',
      overflow: 'hidden',
   },
   confirmGradient: {
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 4,
   },
   confirmText: {
      paddingVertical: 8,
      color: '#f5feff',
      fontSize: 16,
      fontWeight: '700',
      textTransform: 'uppercase',
   },
   selfChooseButton: {
      position: 'relative',
      marginTop: 'auto',
      marginHorizontal: 'auto',
      width: '60%',
      overflow: 'hidden',
   },
   selfChooseGradient: {
      justifyContent: 'center',
      alignItems: 'center',
   },
   selfChooseText: {
      paddingVertical: 18,
      color: '#ffffff',
      fontSize: 16,
      fontWeight: '700',
   },
   starContainer: {
      position: 'absolute',
      top: '50%',
      left: '50%',
      width: 300,
      height: 300,
      marginLeft: -150,
      marginTop: -150,
   },
   starElement: {
      position: 'absolute',
      width: 100,
      height: 100,
   },
   elementTop: {
      top: -50,
      left: '50%',
      marginLeft: -50,
   },
   elementLeft: {
      top: 50,
      left: -25,
   },
   elementRight: {
      top: 50,
      right: -25,
   },
   elementBottomRight: {
      bottom: -50,
      right: 0,
   },
   elementBottomLeft: {
      bottom: -50,
      left: 0,
   },
});

export default TabHome;
