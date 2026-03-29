import { useVideoPlayer, VideoView } from "expo-video";
import { StyleSheet } from "react-native";

interface Properties {
  url: string;
  loop?: boolean;
  muted?: boolean;
  contentFit?: "cover" | "contain" | "fill";
}

export function NormalVideo(properties: Properties) {
  const { url, loop = true, muted = true, contentFit = "cover" } = properties;

  const videoPlayer = useVideoPlayer(url, (player) => {
    player.loop = loop;
    player.muted = muted;

    player.play();
  });

  return (
    <VideoView
      style={StyleSheet.absoluteFill}
      player={videoPlayer}
      contentFit={contentFit}
      nativeControls={false}
      pointerEvents="none"
      fullscreenOptions={{
        enable: false,
      }}
    />
  );
}
