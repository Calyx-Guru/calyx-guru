import { useEventListener } from "expo";
import { useVideoPlayer, VideoView } from "expo-video";
import { useEffect, useRef } from "react";
import { StyleSheet } from "react-native";

interface Properties {
  url: string;
  loop?: boolean;
  muted?: boolean;
  contentFit?: "cover" | "contain" | "fill";
  onPlayToEnd?: () => void;
  /** Fired on an interval while the clip plays (see `timeUpdateEventIntervalSec`). */
  onTimeUpdate?: (currentTime: number, duration: number) => void;
  /** Seconds between `onTimeUpdate` calls when `onTimeUpdate` is set. Ignored when `onTimeUpdate` is omitted. */
  timeUpdateEventIntervalSec?: number;
}

export function NormalVideo(properties: Properties) {
  const {
    url,
    loop = true,
    muted = true,
    contentFit = "cover",
    onPlayToEnd,
    onTimeUpdate,
    timeUpdateEventIntervalSec = 0,
  } = properties;

  const onPlayToEndReference = useRef(onPlayToEnd);
  onPlayToEndReference.current = onPlayToEnd;

  const onTimeUpdateReference = useRef(onTimeUpdate);
  onTimeUpdateReference.current = onTimeUpdate;

  const videoPlayer = useVideoPlayer(url, (player) => {
    player.loop = loop;
    player.muted = muted;

    player.play();
  });

  const hasOnTimeUpdate = onTimeUpdate != null;

  useEffect(() => {
    videoPlayer.timeUpdateEventInterval = hasOnTimeUpdate
      ? Math.max(0.04, timeUpdateEventIntervalSec || 0.1)
      : 0;
    // Do not clear `timeUpdateEventInterval` in cleanup: when `url` changes or this
    // component unmounts, `useVideoPlayer` releases the player first; touching the
    // old instance in cleanup throws "cannot use shared object once it was released".
  }, [videoPlayer, hasOnTimeUpdate, timeUpdateEventIntervalSec]);

  useEventListener(videoPlayer, "timeUpdate", ({ currentTime }) => {
    if (!onTimeUpdateReference.current) {
      return;
    }
    let duration: number;
    try {
      duration = videoPlayer.duration;
    } catch {
      return;
    }
    onTimeUpdateReference.current(currentTime, duration);
  });

  useEventListener(videoPlayer, "playToEnd", () => {
    onPlayToEndReference.current?.();
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
