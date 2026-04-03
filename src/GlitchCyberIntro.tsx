import {
  AbsoluteFill,
  Easing,
  interpolate,
  useCurrentFrame,
} from "remotion";
import { loadFont } from "@remotion/google-fonts/Inter";

const { fontFamily } = loadFont("normal", {
  weights: ["900"],
  subsets: ["latin"],
});

// --- Config ---
const GLITCH_CYBER_FPS = 60;
const GLITCH_CYBER_DURATION = 420;

export { GLITCH_CYBER_FPS, GLITCH_CYBER_DURATION };

// --- Palette ---
const BG = "#000000";
const TEXT_COLOR = "#ffffff";
const RED = "#ff0040";
const GREEN = "#00ff88";
const BLUE = "#4040ff";

// --- Timing (frames) ---
const FLASH_START = 18;
const SLAM_IN = 38;
const SETTLED = 75;
const BODY_START = 120;
const EXIT_START = 300;
const SCATTER_START = 315;
const SCATTER_END = 400;

// --- Deterministic pseudo-random ---
const seeded = (seed: number): number => {
  const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
};

// --- Glitch windows during body phase ---
const GLITCH_WINDOWS = [
  { start: 155, duration: 7 },
  { start: 205, duration: 5 },
  { start: 250, duration: 8 },
  { start: 285, duration: 4 },
];

const isInGlitch = (frame: number): boolean =>
  GLITCH_WINDOWS.some((w) => frame >= w.start && frame < w.start + w.duration);

// --- Glitch slice config ---
const NUM_SLICES = 8;
const SLICE_OFFSETS = Array.from({ length: NUM_SLICES }, (_, i) => ({
  offset: (seeded(i * 31 + 7) - 0.5) * 60,
  active: seeded(i * 47 + 3) > 0.35,
}));

// --- Character scatter config ---
const HERO = "RicDev";
const SCATTER_VECTORS = HERO.split("").map((_, i) => {
  const angle = ((i - 2.5) / 6) * Math.PI * 1.2 + (seeded(i * 19) - 0.5) * 0.6;
  return {
    dx: Math.cos(angle) * (600 + seeded(i * 37) * 400),
    dy: Math.sin(angle) * (400 + seeded(i * 53) * 300),
    rotation: (seeded(i * 71) - 0.5) * 540,
  };
});

const GLITCH_CHARS = "!@#$%^&*<>{}[]|/\\~`";
const getCorruptChar = (frame: number, index: number): string => {
  const idx = Math.floor(seeded(frame * 7 + index * 13) * GLITCH_CHARS.length);
  return GLITCH_CHARS[idx] ?? "X";
};

// --- Pre-entry RGB flashes ---
const RGBFlashes: React.FC<{ frame: number }> = ({ frame }) => {
  const flashes: Array<{
    start: number;
    duration: number;
    color: string;
    top: string;
    height: string;
  }> = [
    { start: FLASH_START, duration: 2, color: RED, top: "30%", height: "8%" },
    {
      start: FLASH_START + 5,
      duration: 2,
      color: GREEN,
      top: "55%",
      height: "5%",
    },
    {
      start: FLASH_START + 9,
      duration: 3,
      color: BLUE,
      top: "20%",
      height: "12%",
    },
    {
      start: FLASH_START + 13,
      duration: 2,
      color: TEXT_COLOR,
      top: "45%",
      height: "3%",
    },
  ];

  return (
    <>
      {flashes.map((f, i) =>
        frame >= f.start && frame < f.start + f.duration ? (
          <div
            key={i}
            style={{
              position: "absolute",
              top: f.top,
              left: 0,
              width: "100%",
              height: f.height,
              backgroundColor: f.color,
              opacity: 0.7,
              zIndex: 15,
            }}
          />
        ) : null,
      )}
    </>
  );
};

// --- Noise grain (SVG) ---
const NoiseGrain: React.FC<{ frame: number; opacity: number }> = ({
  frame,
  opacity,
}) => (
  <div
    style={{
      position: "absolute",
      inset: 0,
      opacity,
      pointerEvents: "none",
      zIndex: 20,
    }}
  >
    <svg
      width="100%"
      height="100%"
      style={{ display: "block" }}
      xmlns="http://www.w3.org/2000/svg"
    >
      <filter id="cyber-noise">
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.75"
          numOctaves="4"
          seed={frame % 5}
          stitchTiles="stitch"
        />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width="100%" height="100%" filter="url(#cyber-noise)" />
    </svg>
  </div>
);

// --- Scrolling scanlines ---
const CyberScanlines: React.FC<{ frame: number; opacity: number }> = ({
  frame,
  opacity,
}) => {
  const scrollY = (frame * 0.5) % 4;

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        backgroundImage: `repeating-linear-gradient(
          0deg,
          transparent,
          transparent 2px,
          rgba(255, 255, 255, 0.02) 2px,
          rgba(255, 255, 255, 0.02) 4px
        )`,
        backgroundPositionY: scrollY,
        opacity,
        pointerEvents: "none",
        zIndex: 12,
      }}
    />
  );
};

// --- RGB Text Layer ---
const RGBTextLayer: React.FC<{
  text: string;
  color: string;
  offsetX: number;
  offsetY?: number;
  fontSize: number;
}> = ({ text, color, offsetX, offsetY = 0, fontSize }) => (
  <div
    style={{
      position: "absolute",
      color,
      fontSize,
      fontWeight: 900,
      fontFamily,
      letterSpacing: 12,
      transform: `translate(${offsetX}px, ${offsetY}px)`,
      mixBlendMode: "screen",
      whiteSpace: "nowrap",
    }}
  >
    {text}
  </div>
);

// --- Glitch sliced text ---
const GlitchSlicedText: React.FC<{
  text: string;
  fontSize: number;
  intensity: number;
}> = ({ text, fontSize, intensity }) => {
  const slicePercent = 100 / NUM_SLICES;

  return (
    <>
      {SLICE_OFFSETS.map((slice, i) => {
        const xOffset = slice.active ? slice.offset * intensity : 0;

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              color: TEXT_COLOR,
              fontSize,
              fontWeight: 900,
              fontFamily,
              letterSpacing: 12,
              whiteSpace: "nowrap",
              clipPath: `inset(${i * slicePercent}% 0 ${100 - (i + 1) * slicePercent}% 0)`,
              transform: `translateX(${xOffset}px)`,
            }}
          >
            {text}
          </div>
        );
      })}
    </>
  );
};

// --- Main Component ---
export const GlitchCyberIntro: React.FC = () => {
  const frame = useCurrentFrame();

  const FONT_SIZE = 120;

  // ========== ENTRY (0-2s) ==========

  // Screen flash on slam-in
  const flashOpacity =
    frame >= SLAM_IN - 2 && frame < SLAM_IN + 3
      ? interpolate(frame, [SLAM_IN - 2, SLAM_IN, SLAM_IN + 3], [0, 0.6, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        })
      : 0;

  // Text visibility (appears at slam-in)
  const textVisible = frame >= SLAM_IN;

  // RGB displacement during entry (converges from large offset to 0)
  const entryRgbProgress = interpolate(
    frame,
    [SLAM_IN, SETTLED],
    [1, 0],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.exp),
    },
  );

  // Text scale on slam-in (slight overshoot)
  const entryScale = interpolate(
    frame,
    [SLAM_IN, SLAM_IN + 4, SLAM_IN + 12, SETTLED],
    [1.15, 1.08, 1.02, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    },
  );

  // ========== BODY (2-5s) ==========

  const inGlitch = isInGlitch(frame);

  // RGB offset during body micro-glitches
  const bodyRgbIntensity = inGlitch ? 1 : 0;

  // ========== EXIT (5-7s) ==========

  const isExiting = frame >= EXIT_START;
  const isScattering = frame >= SCATTER_START;

  // Final hard glitch at exit start
  const exitGlitchIntensity =
    frame >= EXIT_START && frame < SCATTER_START
      ? interpolate(frame, [EXIT_START, EXIT_START + 8, SCATTER_START], [0, 1, 0.5], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        })
      : 0;

  // Scatter progress (0 to 1)
  const scatterProgress = interpolate(
    frame,
    [SCATTER_START, SCATTER_END],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.in(Easing.quad) },
  );

  // Character corruption during early scatter
  const corruptionActive =
    frame >= EXIT_START && frame < SCATTER_START + 20;

  // Final fade to black
  const finalFade = interpolate(
    frame,
    [SCATTER_END - 20, SCATTER_END + 15],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  // ========== RGB OFFSET CALCULATION ==========

  const getRgbOffsets = (): { rX: number; gX: number; bX: number; bY: number } => {
    // Entry
    if (frame < BODY_START) {
      return {
        rX: -50 * entryRgbProgress,
        gX: 50 * entryRgbProgress,
        bX: -25 * entryRgbProgress,
        bY: 15 * entryRgbProgress,
      };
    }

    // Body micro-glitch
    if (inGlitch) {
      const glitchSeed = Math.floor(frame / 3);
      const intensity = 20;
      return {
        rX: (seeded(glitchSeed * 11) - 0.5) * intensity * bodyRgbIntensity,
        gX: (seeded(glitchSeed * 23) - 0.5) * intensity * bodyRgbIntensity,
        bX: (seeded(glitchSeed * 37) - 0.5) * intensity * bodyRgbIntensity * 0.5,
        bY: (seeded(glitchSeed * 43) - 0.5) * 8 * bodyRgbIntensity,
      };
    }

    // Exit glitch
    if (isExiting && !isScattering) {
      return {
        rX: -40 * exitGlitchIntensity,
        gX: 40 * exitGlitchIntensity,
        bX: -20 * exitGlitchIntensity,
        bY: 12 * exitGlitchIntensity,
      };
    }

    return { rX: 0, gX: 0, bX: 0, bY: 0 };
  };

  const rgb = getRgbOffsets();
  const hasRgbOffset = rgb.rX !== 0 || rgb.gX !== 0 || rgb.bX !== 0;

  // ========== NOISE & SCANLINES ==========

  const noiseOpacity = interpolate(
    frame,
    [SLAM_IN, BODY_START],
    [0, 0.04],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  const scanlineOpacity = interpolate(
    frame,
    [BODY_START, BODY_START + 30],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  // ========== RENDER ==========

  // Text style shared across layers
  const textBase: React.CSSProperties = {
    fontSize: FONT_SIZE,
    fontWeight: 900,
    fontFamily,
    letterSpacing: 12,
    whiteSpace: "nowrap",
    textTransform: "uppercase" as const,
  };

  // Determine which text rendering mode to use
  const showGlitchSlices = inGlitch && !isScattering;
  const showCharacterScatter = isScattering;
  const showNormalText = textVisible && !showGlitchSlices && !showCharacterScatter;

  return (
    <AbsoluteFill style={{ backgroundColor: BG }}>
      {/* Noise grain */}
      {frame >= SLAM_IN && <NoiseGrain frame={frame} opacity={noiseOpacity} />}

      {/* Scanlines */}
      {frame >= BODY_START && frame < EXIT_START + 60 && (
        <CyberScanlines frame={frame} opacity={scanlineOpacity} />
      )}

      {/* Pre-entry RGB flashes */}
      {frame < SLAM_IN + 5 && <RGBFlashes frame={frame} />}

      {/* Screen flash */}
      {flashOpacity > 0 && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundColor: TEXT_COLOR,
            opacity: flashOpacity,
            zIndex: 25,
          }}
        />
      )}

      {/* Main text container */}
      {textVisible && (
        <AbsoluteFill
          style={{
            justifyContent: "center",
            alignItems: "center",
            zIndex: 15,
            opacity: finalFade,
          }}
        >
          <div
            style={{
              position: "relative",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              transform: frame < BODY_START ? `scale(${entryScale})` : undefined,
            }}
          >
            {/* RGB displacement layers */}
            {hasRgbOffset && (
              <>
                <RGBTextLayer
                  text={HERO}
                  color={RED}
                  offsetX={rgb.rX}
                  fontSize={FONT_SIZE}
                />
                <RGBTextLayer
                  text={HERO}
                  color={GREEN}
                  offsetX={rgb.gX}
                  fontSize={FONT_SIZE}
                />
                <RGBTextLayer
                  text={HERO}
                  color={BLUE}
                  offsetX={rgb.bX}
                  offsetY={rgb.bY}
                  fontSize={FONT_SIZE}
                />
              </>
            )}

            {/* Normal text */}
            {showNormalText && (
              <div style={{ ...textBase, color: TEXT_COLOR }}>{HERO}</div>
            )}

            {/* Glitch sliced text */}
            {showGlitchSlices && (
              <GlitchSlicedText
                text={HERO}
                fontSize={FONT_SIZE}
                intensity={1}
              />
            )}

            {/* Character scatter */}
            {showCharacterScatter && (
              <div style={{ display: "flex" }}>
                {HERO.split("").map((char, i) => {
                  const vec = SCATTER_VECTORS[i];
                  const dx = vec.dx * scatterProgress;
                  const dy = vec.dy * scatterProgress;
                  const rot = vec.rotation * scatterProgress;
                  const charOpacity = interpolate(
                    scatterProgress,
                    [0, 0.15, 0.7],
                    [1, 1, 0],
                    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
                  );

                  const displayChar =
                    corruptionActive && seeded(frame * 3 + i * 17) > 0.5
                      ? getCorruptChar(frame, i)
                      : char;

                  return (
                    <span
                      key={i}
                      style={{
                        ...textBase,
                        color: TEXT_COLOR,
                        display: "inline-block",
                        transform: `translate(${dx}px, ${dy}px) rotate(${rot}deg)`,
                        opacity: charOpacity,
                      }}
                    >
                      {displayChar}
                    </span>
                  );
                })}
              </div>
            )}
          </div>
        </AbsoluteFill>
      )}

      {/* Exit: glitch bars */}
      {frame >= EXIT_START && frame < SCATTER_START + 10 && (
        <>
          {[0, 1, 2].map((i) => {
            const barOpacity = interpolate(
              frame,
              [EXIT_START + i * 3, EXIT_START + i * 3 + 4, SCATTER_START],
              [0, 0.5, 0],
              { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
            );
            const topPercent = 20 + seeded(i * 67) * 60;

            return (
              <div
                key={i}
                style={{
                  position: "absolute",
                  top: `${topPercent}%`,
                  left: 0,
                  width: "100%",
                  height: `${2 + seeded(i * 89) * 4}%`,
                  backgroundColor: [RED, GREEN, BLUE][i],
                  opacity: barOpacity,
                  zIndex: 16,
                }}
              />
            );
          })}
        </>
      )}
    </AbsoluteFill>
  );
};
