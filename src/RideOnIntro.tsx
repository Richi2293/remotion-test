import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

const RIDE_ON_DURATION = 420;
const RIDE_ON_FPS = 60;

export { RIDE_ON_DURATION, RIDE_ON_FPS };

const buildWavePath = (
  width: number,
  height: number,
  phase: number,
  amplitude: number,
): string => {
  const baseY = height * 0.58;
  const segments = 20;
  let d = `M 0 ${baseY}`;
  for (let i = 0; i <= segments; i++) {
    const x = (i / segments) * (width + 200) - 100;
    const y =
      baseY +
      Math.sin((i / segments) * Math.PI * 3 + phase) * amplitude +
      Math.sin((i / segments) * Math.PI * 1.5 + phase * 0.7) * amplitude * 0.5;
    d += ` L ${x} ${y}`;
  }
  d += ` L ${width + 100} ${height + 50} L -100 ${height + 50} Z`;
  return d;
};

export const RideOnIntro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const wavePhase = interpolate(frame, [0, RIDE_ON_DURATION], [0, Math.PI * 4]);
  const waveAmplitude = interpolate(frame, [0, 60], [0, 30], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const wavePath1 = buildWavePath(width, height, wavePhase, waveAmplitude);
  const wavePath2 = buildWavePath(width, height, wavePhase + 1.2, waveAmplitude * 0.7);

  const logoOpacity = interpolate(frame, [20, 50], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const logoScale = spring({
    frame: frame - 20,
    fps,
    config: { damping: 12, stiffness: 80 },
  });

  const logoY = interpolate(frame, [20, 70], [30, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });

  const logoGlow = interpolate(frame, [50, 100, 160, 220, 280], [0, 1, 0.5, 1, 0.5], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const textOpacity = interpolate(frame, [80, 120], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const textY = interpolate(frame, [80, 140], [25, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });

  const textScale = spring({
    frame: frame - 80,
    fps,
    config: { damping: 14, stiffness: 80 },
  });

  const contentFloat = Math.sin((frame / fps) * Math.PI * 0.8) * 5;

  const fadeOut = interpolate(frame, [360, 420], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        background:
          "linear-gradient(135deg, #330968 0%, #0d0221 60%, #020381 100%)",
        opacity: fadeOut,
      }}
    >
      <svg
        width={width}
        height={height}
        style={{ position: "absolute", top: 0, left: 0, zIndex: 0 }}
      >
        <defs>
          <linearGradient id="waveBack" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="rgba(71, 33, 251, 0.25)" />
            <stop offset="100%" stopColor="rgba(52, 226, 228, 0.15)" />
          </linearGradient>
        </defs>
        <path d={wavePath2} fill="url(#waveBack)" />
      </svg>

      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          zIndex: 1,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 28,
            transform: `translateY(${contentFloat}px)`,
          }}
        >
          <div
            style={{
              opacity: logoOpacity,
              transform: `translateY(${logoY}px) scale(${logoScale})`,
              filter: `drop-shadow(0 0 ${20 + logoGlow * 30}px rgba(246, 167, 66, ${0.3 + logoGlow * 0.3})) drop-shadow(0 0 ${10 + logoGlow * 20}px rgba(93, 193, 211, ${0.2 + logoGlow * 0.2}))`,
            }}
          >
            <Img
              src={staticFile("ride-on-logo.svg")}
              width={220}
              style={{ display: "block" }}
            />
          </div>
          <div
            style={{
              opacity: textOpacity,
              transform: `translateY(${textY}px) scale(${textScale})`,
              fontSize: 68,
              fontWeight: 800,
              color: "#ffffff",
              fontFamily: "sans-serif",
              letterSpacing: 6,
              textShadow:
                "0 0 50px rgba(122, 0, 223, 0.7), 0 0 100px rgba(171, 29, 254, 0.3), 0 2px 8px rgba(0, 0, 0, 0.6)",
            }}
          >
            Ride On Agency
          </div>
        </div>
      </AbsoluteFill>

      <svg
        width={width}
        height={height}
        style={{ position: "absolute", top: 0, left: 0, zIndex: 2 }}
      >
        <defs>
          <linearGradient id="waveFront" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="rgba(122, 0, 223, 0.5)" />
            <stop offset="50%" stopColor="rgba(71, 33, 251, 0.6)" />
            <stop offset="100%" stopColor="rgba(51, 9, 104, 0.9)" />
          </linearGradient>
        </defs>
        <path d={wavePath1} fill="url(#waveFront)" />
      </svg>
    </AbsoluteFill>
  );
};
