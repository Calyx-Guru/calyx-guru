import { StyleSheet, View } from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';

import { TransparentVideo } from '@/components/video/TransparentVideo';

const OVERLAY_SOURCE = require('../../../src/assets/videos/mascot/test.webm');
const BG_SOURCE = require('../../../src/assets/videos/mascot/status-gacha.mp4');

export default function TestScreen() {
   const bgPlayer = useVideoPlayer(BG_SOURCE, (p) => {
      p.loop = true;
      p.muted = true;
      p.play();
   });

   return (
      <View style={styles.root}>
         <VideoView
            player={bgPlayer}
            style={StyleSheet.absoluteFillObject}
            contentFit="cover"
            nativeControls={false}
         />

         <TransparentVideo
            source={OVERLAY_SOURCE}
            style={StyleSheet.absoluteFillObject}
         />
      </View>
   );
}

const styles = StyleSheet.create({
   root: {
      flex: 1,
      backgroundColor: '#000',
   },
});
