import React from "react";
import { StyleProp, ViewStyle, ImageStyle } from "react-native";
import { Image, ImageContentFit } from "expo-image";
import { useVideoPlayer, VideoView } from "expo-video";

const VIDEO_EXTENSIONS = [".mp4", ".mov", ".webm"];

function isVideoUrl(url: string): boolean {
  const path = url.split("?")[0].toLowerCase();
  return VIDEO_EXTENSIONS.some((ext) => path.endsWith(ext));
}

interface ExerciseMediaProps {
  uri: string;
  style?: StyleProp<ViewStyle>;
  contentFit?: ImageContentFit;
}

/**
 * El catálogo de ejercicios acepta imágenes estáticas y "GIFs" que en
 * realidad son videos .mp4 (mismo efecto visual, mucho más livianos que un
 * GIF real) — se decide cómo renderizar por la extensión del archivo, sin
 * una columna aparte en la base de datos. Los videos se reproducen en loop,
 * mudos y sin controles: son una referencia visual, no contenido con audio.
 */
export function ExerciseMedia({
  uri,
  style,
  contentFit = "cover",
}: ExerciseMediaProps) {
  if (isVideoUrl(uri)) {
    return (
      <ExerciseVideoLoop uri={uri} style={style} contentFit={contentFit} />
    );
  }

  return (
    <Image
      source={{ uri }}
      style={style as StyleProp<ImageStyle>}
      contentFit={contentFit}
      cachePolicy="disk"
      accessibilityIgnoresInvertColors
    />
  );
}

function ExerciseVideoLoop({
  uri,
  style,
  contentFit,
}: Required<Pick<ExerciseMediaProps, "uri" | "contentFit">> &
  Pick<ExerciseMediaProps, "style">) {
  const player = useVideoPlayer(uri, (p) => {
    p.loop = true;
    p.muted = true;
    p.play();
  });

  return (
    <VideoView
      player={player}
      style={style}
      contentFit={contentFit}
      nativeControls={false}
      pointerEvents="none"
    />
  );
}
