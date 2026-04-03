import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { loadFont } from "@remotion/google-fonts/Inter";

const { fontFamily } = loadFont("normal", {
  weights: ["800"],
  subsets: ["latin"],
});

// --- Config ---
const MODERN_MOTION_FPS = 60;
const MODERN_MOTION_DURATION = 420;

export { MODERN_MOTION_FPS, MODERN_MOTION_DURATION };

// --- Palette ---
const PURPLE = "#6c63ff";
const CYAN = "#00d2ff";
const TEXT_COLOR = "#ffffff";
const GLOW_COLOR = "rgba(108, 99, 255, 0.4)";

// --- Timing (frames) ---
const BG_FADE_END = 35;
const SHAPES_START = 8;
const TEXT_APPEAR = 130;
const LINE_START = 155;
const LINE_DRAWN = 220;
const EXIT_START = 300;

// --- Shape definitions ---
type FloatingShape = {
  type: "circle" | "roundedRect";
  color: string;
  width: number;
  height: number;
  blur: number;
  startX: number;
  startY: number;
  restX: number;
  restY: number;
  delay: number;
  driftX: number;
  driftY: number;
};

const SHAPES: FloatingShape[] = [
  {
    type: "circle",
    color: "rgba(108, 99, 255, 0.22)",
    width: 320,
    height: 320,
    blur: 50,
    startX: -300,
    startY: -250,
    restX: 100,
    restY: 80,
    delay: 0,
    driftX: 0.12,
    driftY: 0.06,
  },
  {
    type: "circle",
    color: "rgba(0, 210, 255, 0.18)",
    width: 240,
    height: 240,
    blur: 40,
    startX: 2100,
    startY: 1200,
    restX: 1550,
    restY: 780,
    delay: 8,
    driftX: -0.08,
    driftY: -0.05,
  },
  {
    type: "roundedRect",
    color: "rgba(108, 99, 255, 0.2)",
    width: 180,
    height: 120,
    blur: 30,
    startX: 2100,
    startY: -200,
    restX: 1600,
    restY: 150,
    delay: 15,
    driftX: -0.1,
    driftY: 0.04,
  },
  {
    type: "roundedRect",
    color: "rgba(0, 210, 255, 0.15)",
    width: 280,
    height: 200,
    blur: 45,
    startX: -300,
    startY: 1200,
    restX: 80,
    restY: 720,
    delay: 5,
    driftX: 0.09,
    driftY: -0.07,
  },
  {
    type: "circle",
    color: "rgba(108, 99, 255, 0.18)",
    width: 150,
    height: 150,
    blur: 25,
    startX: -200,
    startY: 540,
    restX: 300,
    restY: 480,
    delay: 20,
    driftX: 0.06,
    driftY: -0.03,
  },
  {
    type: "circle",
    color: "rgba(0, 210, 255, 0.16)",
    width: 200,
    height: 200,
    blur: 35,
    startX: 960,
    startY: -250,
    restX: 900,
    restY: 100,
    delay: 12,
    driftX: -0.04,
    driftY: 0.08,
  },
  {
    type: "roundedRect",
    color: "rgba(108, 99, 255, 0.14)",
    width: 160,
    height: 100,
    blur: 28,
    startX: 960,
    startY: 1200,
    restX: 1100,
    restY: 850,
    delay: 18,
    driftX: 0.05,
    driftY: -0.06,
  },
];

// --- Shape component ---
const BokehShape: React.FC<{
  shape: FloatingShape;
  frame: number;
  fps: number;
}> = ({ shape, frame, fps }) => {
  // Entry: spring from off-screen to rest position
  const entryProgress = spring({
    frame: frame - SHAPES_START - shape.delay,
    fps,
    config: { damping: 15, stiffness: 40 },
  });

  // Drift during body
  const driftFrame = Math.max(0, frame - TEXT_APPEAR);
  const driftX = shape.driftX * driftFrame;
  const driftY = shape.driftY * driftFrame;

  // Exit: drift outward toward origin
  const exitProgress = interpolate(
    frame,
    [EXIT_START, EXIT_START + 100],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.in(Easing.quad) },
  );
  const exitDriftX = (shape.startX - shape.restX) * 0.4 * exitProgress;
  const exitDriftY = (shape.startY - shape.restY) * 0.4 * exitProgress;

  // Compose position
  const x =
    interpolate(entryProgress, [0, 1], [shape.startX, shape.restX]) +
    driftX +
    exitDriftX;
  const y =
    interpolate(entryProgress, [0, 1], [shape.startY, shape.restY]) +
    driftY +
    exitDriftY;

  const borderRadius = shape.type === "circle" ? "50%" : 24;

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: shape.width,
        height: shape.height,
        borderRadius,
        backgroundColor: shape.color,
        filter: `blur(${shape.blur}px)`,
      }}
    />
  );
};

// --- Main Component ---
export const ModernMotionIntro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // ========== BACKGROUND ==========

  const bgOpacity = interpolate(frame, [0, BG_FADE_END], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Exit: fade to black
  const exitFade = interpolate(
    frame,
    [EXIT_START + 30, EXIT_START + 110],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.inOut(Easing.quad) },
  );

  // ========== TEXT ==========

  // Spring scale from 0
  const textScale = spring({
    frame: frame - TEXT_APPEAR,
    fps,
    config: { damping: 12, stiffness: 80 },
  });

  // Text opacity
  const textOpacity = interpolate(frame, [TEXT_APPEAR, TEXT_APPEAR + 10], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Glow pulse (cycles during body)
  const glowPhase = (frame - TEXT_APPEAR) / fps;
  const glowIntensity =
    frame >= TEXT_APPEAR
      ? interpolate(
          Math.sin(glowPhase * Math.PI * 0.8),
          [-1, 1],
          [0.3, 0.8],
        )
      : 0;

  const textShadow =
    frame >= TEXT_APPEAR
      ? `0 0 ${30 + glowIntensity * 40}px ${GLOW_COLOR}, 0 0 ${60 + glowIntensity * 60}px rgba(108, 99, 255, ${0.15 + glowIntensity * 0.15})`
      : "none";

  // Exit: scale down
  const exitScale = interpolate(
    frame,
    [EXIT_START, EXIT_START + 80],
    [1, 0.92],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.inOut(Easing.quad) },
  );

  const finalTextScale = frame >= EXIT_START ? textScale * exitScale : textScale;

  // ========== ACCENT LINE ==========

  const lineWidth = interpolate(
    frame,
    [LINE_START, LINE_DRAWN],
    [0, 100],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.quad),
    },
  );

  const lineOpacity = interpolate(
    frame,
    [LINE_START, LINE_START + 15],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  return (
    <AbsoluteFill style={{ backgroundColor: "#000000" }}>
      {/* Gradient background */}
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)",
          opacity: bgOpacity * exitFade,
        }}
      />

      {/* Floating bokeh shapes */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          overflow: "hidden",
          opacity: exitFade,
          zIndex: 1,
        }}
      >
        {SHAPES.map((shape, i) => (
          <BokehShape key={i} shape={shape} frame={frame} fps={fps} />
        ))}
      </div>

      {/* Text + accent line */}
      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          zIndex: 5,
          opacity: exitFade,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 20,
          }}
        >
          {/* "RicDev" text */}
          <div
            style={{
              fontSize: 110,
              fontWeight: 800,
              fontFamily,
              letterSpacing: 14,
              color: TEXT_COLOR,
              opacity: textOpacity,
              transform: `scale(${finalTextScale})`,
              textShadow,
              whiteSpace: "nowrap",
            }}
          >
            RicDev
          </div>

          {/* Accent line */}
          {frame >= LINE_START && (
            <div
              style={{
                width: 380,
                height: 3,
                borderRadius: 2,
                opacity: lineOpacity * exitFade,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${lineWidth}%`,
                  height: "100%",
                  background: `linear-gradient(90deg, ${PURPLE}, ${CYAN})`,
                  borderRadius: 2,
                }}
              />
            </div>
          )}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
