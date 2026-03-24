import { useVideoPlayer, VideoView } from 'expo-video';
import { StyleSheet, View } from 'react-native';

import { SpriteAnimation } from '@/components/animation/SpriteAnimation';
import { ATLAS_REGISTRY } from '@/constants/registries';

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

         <SpriteAnimation
            source={ATLAS_REGISTRY.meditating}
            fps={12}
            loop
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
