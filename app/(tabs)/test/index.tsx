import { useVideoPlayer, VideoView } from 'expo-video';
import { StyleSheet, View } from 'react-native';

import { TransparentVideo } from '@/components/video/TransparentVideo';

const OVERLAY_SOURCE = require('../../../src/assets/videos/mascot/normal.webm');
const BG_SOURCE = require('../../../src/assets/videos/background/metal.mp4');

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
        style={StyleSheet.absoluteFill}
        contentFit="cover"
        nativeControls={false}
      />

      <TransparentVideo
        source={OVERLAY_SOURCE}
        style={StyleSheet.absoluteFill}
        loop={true}
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
