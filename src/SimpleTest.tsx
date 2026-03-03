import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

const DURATION_FRAMES = 360;
const FPS = 60;

export { DURATION_FRAMES, FPS };

export const SimpleTest: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const circleOpacity = interpolate(frame, [60, 90], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const circleScale = spring({
    frame: frame - 60,
    fps,
    config: { damping: 12, stiffness: 100 },
  });

  const textOpacity = interpolate(frame, [100, 130], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const textY = interpolate(
    spring({ frame: frame - 100, fps, config: { damping: 200 } }),
    [0, 1],
    [30, 0],
  );

  const fadeOut = interpolate(frame, [300, 360], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const glowPulse = interpolate(frame, [60, 120, 180, 240, 300], [0, 1, 0.6, 1, 0.6], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#000",
        justifyContent: "center",
        alignItems: "center",
        opacity: fadeOut,
      }}
    >
      <div
        style={{
          width: 120,
          height: 120,
          borderRadius: "50%",
          background: "radial-gradient(circle, #00d4ff 0%, #0066ff 50%, transparent 70%)",
          opacity: circleOpacity,
          transform: `scale(${circleScale})`,
          boxShadow: `0 0 ${40 + glowPulse * 40}px ${10 + glowPulse * 20}px rgba(0, 150, 255, ${0.4 + glowPulse * 0.3})`,
        }}
      />
      <div
        style={{
          position: "absolute",
          top: "58%",
          opacity: textOpacity * fadeOut,
          transform: `translateY(${textY}px)`,
          fontSize: 48,
          fontWeight: 700,
          color: "#fff",
          fontFamily: "sans-serif",
          letterSpacing: 6,
          textShadow: "0 0 30px rgba(0, 150, 255, 0.5)",
        }}
      >
        Digital Evolution
      </div>
    </AbsoluteFill>
  );
};
