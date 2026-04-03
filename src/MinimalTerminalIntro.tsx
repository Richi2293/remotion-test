import {
  AbsoluteFill,
  Easing,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { loadFont } from "@remotion/google-fonts/JetBrainsMono";

const { fontFamily } = loadFont("normal", {
  weights: ["400", "700"],
  subsets: ["latin"],
});

// --- Config ---
const MINIMAL_TERMINAL_FPS = 60;
const MINIMAL_TERMINAL_DURATION = 900; // 15s

export { MINIMAL_TERMINAL_FPS, MINIMAL_TERMINAL_DURATION };

// --- Palette ---
const BG = "#0d1117";
const TEXT = "#e6edf3";
const GREEN = "#3fb950";
const BLUE = "#58a6ff";
const MUTED = "#8b949e";

// --- Timing (frames) ---
const PROMPT_IN = 18; // prompt appears
const TYPING_START = 50; // start typing "RicDev"
const BODY_START = 120; // 2s
const NPM_START = 145; // npm line typing starts
const NPM_CHAR_FRAMES = 3;
const COMPILE_START = 240; // "compiling..." appears (~4s)
const COMPILED_START = 390; // "✓ compiled in 1.2s" (~6.5s)
const READY_START = 480; // ready status fades in (~8s)
const WATCHING_START = 570; // "watching for file changes..." (~9.5s)
const EXIT_START = 780; // 13s
const GLITCH_START = EXIT_START - 12;
const GLITCH_FRAMES = 6;
const CURSOR_BLINK_PERIOD = 20;
const PROGRESS_WIDTH = 20;

// --- Text ---
const HERO_TEXT = "RicDev";
const NPM_TEXT = "$ npm run dev";
const COMPILE_TEXT = "compiling";
const COMPILED_TEXT = "✓ compiled in 1.2s";
const READY_TEXT = "ready - started on http://localhost:3000";
const WATCHING_TEXT = "watching for file changes...";

// Pre-computed cumulative frame offsets for non-uniform typing
const HERO_CHAR_OFFSETS = (() => {
  const offsets: number[] = [];
  let total = 0;
  for (let i = 0; i < HERO_TEXT.length; i++) {
    const delay = 8 + Math.round(Math.sin(i * 7.3) * 3);
    total += delay;
    offsets.push(total);
  }
  return offsets;
})();

// --- Cursor ---
const Cursor: React.FC<{ frame: number; opacity?: number }> = ({
  frame,
  opacity: externalOpacity = 1,
}) => {
  const blink = interpolate(
    frame % CURSOR_BLINK_PERIOD,
    [0, CURSOR_BLINK_PERIOD * 0.4, CURSOR_BLINK_PERIOD * 0.5, CURSOR_BLINK_PERIOD],
    [1, 1, 0, 0],
  );

  return (
    <span
      style={{
        color: BLUE,
        opacity: blink * externalOpacity,
        marginLeft: 2,
      }}
    >
      {"\u2588"}
    </span>
  );
};

// --- Scanlines overlay ---
const Scanlines: React.FC<{ opacity: number }> = ({ opacity }) => (
  <div
    style={{
      position: "absolute",
      inset: 0,
      background: `repeating-linear-gradient(
        0deg,
        transparent,
        transparent 2px,
        rgba(0, 0, 0, 0.06) 2px,
        rgba(0, 0, 0, 0.06) 4px
      )`,
      opacity,
      pointerEvents: "none",
      zIndex: 10,
    }}
  />
);

// --- Moving scanline ---
const MovingScanline: React.FC<{ frame: number }> = ({ frame }) => {
  const y = interpolate(frame % 240, [0, 240], [-20, 1100]);

  return (
    <div
      style={{
        position: "absolute",
        top: y,
        left: 0,
        width: "100%",
        height: 3,
        background: `linear-gradient(90deg, transparent 5%, rgba(230, 237, 243, 0.04) 30%, rgba(230, 237, 243, 0.07) 50%, rgba(230, 237, 243, 0.04) 70%, transparent 95%)`,
        pointerEvents: "none",
        zIndex: 11,
      }}
    />
  );
};

// --- Vignette overlay ---
const Vignette: React.FC = () => (
  <div
    style={{
      position: "absolute",
      inset: 0,
      background:
        "radial-gradient(ellipse at center, transparent 50%, rgba(0, 0, 0, 0.6) 100%)",
      pointerEvents: "none",
      zIndex: 12,
    }}
  />
);

// --- Noise overlay ---
const NoiseOverlay: React.FC<{ frame: number }> = ({ frame }) => (
  <svg
    style={{
      position: "absolute",
      inset: 0,
      width: "100%",
      height: "100%",
      pointerEvents: "none",
      zIndex: 13,
      opacity: 0.035,
      mixBlendMode: "screen" as const,
    }}
  >
    <filter id={`noise-${frame}`}>
      <feTurbulence
        type="fractalNoise"
        baseFrequency="0.75"
        numOctaves={4}
        seed={Math.floor(frame / 3)}
      />
    </filter>
    <rect width="100%" height="100%" filter={`url(#noise-${frame})`} />
  </svg>
);

// --- Glitch effect ---
const GlitchEffect: React.FC<{ frame: number }> = ({ frame }) => (
  <>
    <div
      style={{
        position: "absolute",
        inset: 0,
        backgroundColor: `rgba(230, 237, 243, ${0.03 + Math.abs(Math.sin(frame * 17)) * 0.06})`,
        pointerEvents: "none",
        zIndex: 20,
      }}
    />
    <div
      style={{
        position: "absolute",
        top: `${20 + ((frame * 137) % 60)}%`,
        left: 0,
        width: "100%",
        height: 3,
        backgroundColor: "rgba(88, 166, 255, 0.18)",
        transform: `translateX(${Math.round(Math.sin(frame * 11) * 15)}px)`,
        pointerEvents: "none",
        zIndex: 21,
      }}
    />
    <div
      style={{
        position: "absolute",
        top: `${55 + ((frame * 89) % 35)}%`,
        left: 0,
        width: "100%",
        height: 2,
        backgroundColor: "rgba(63, 185, 80, 0.14)",
        transform: `translateX(${Math.round(Math.cos(frame * 9) * 12)}px)`,
        pointerEvents: "none",
        zIndex: 21,
      }}
    />
  </>
);

// --- Main Component ---
export const MinimalTerminalIntro: React.FC = () => {
  const frame = useCurrentFrame();
  useVideoConfig();

  // ========== ENTRY (0-2s) ==========

  // Prompt ">_" appears
  const promptOpacity = interpolate(frame, [PROMPT_IN, PROMPT_IN + 8], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Typing "RicDev" — character by character (non-uniform speed)
  const elapsed = frame - TYPING_START;
  const heroChars = elapsed < 0 ? 0 : HERO_CHAR_OFFSETS.filter((t) => elapsed >= t).length;
  const heroTyped = HERO_TEXT.slice(0, heroChars);
  // Show standalone prompt before typing starts
  const showStandalonePrompt = frame >= PROMPT_IN && frame < TYPING_START;

  // ========== BODY (2-5s) ==========

  // Scanline fade-in
  const scanlineOpacity = interpolate(
    frame,
    [BODY_START, BODY_START + 40],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  // "$ npm run dev" — typed
  const npmProgress = Math.floor((frame - NPM_START) / NPM_CHAR_FRAMES);
  const npmChars = Math.max(0, Math.min(NPM_TEXT.length, npmProgress));
  const npmTyped = NPM_TEXT.slice(0, npmChars);
  const showNpm = frame >= NPM_START;

  // "compiling..." with animated dots
  const showCompile = frame >= COMPILE_START && frame < COMPILED_START;
  const compileOpacity = interpolate(
    frame,
    [COMPILE_START, COMPILE_START + 15],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const dotCount = showCompile
    ? Math.floor(((frame - COMPILE_START) % 40) / 10) + 1
    : 0;
  const compileDots = ".".repeat(dotCount);

  // Progress bar during compile
  const compileProgress = interpolate(
    frame,
    [COMPILE_START + 15, COMPILED_START - 5],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const filledCount = Math.round(compileProgress * PROGRESS_WIDTH);
  const progressBar =
    "\u2588".repeat(filledCount) + "\u2591".repeat(PROGRESS_WIDTH - filledCount);
  const progressPercent = Math.round(compileProgress * 100);
  const showProgress = frame >= COMPILE_START + 15 && frame < COMPILED_START;

  // "✓ compiled in 1.2s"
  const showCompiled = frame >= COMPILED_START;
  const compiledOpacity = interpolate(
    frame,
    [COMPILED_START, COMPILED_START + 12],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  // "ready" status fade-in
  const readyOpacity = interpolate(
    frame,
    [READY_START, READY_START + 20],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const showReady = frame >= READY_START;

  // "watching for file changes..."
  const showWatching = frame >= WATCHING_START;
  const watchingOpacity = interpolate(
    frame,
    [WATCHING_START, WATCHING_START + 20],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  // Subtle glow pulse on "RicDev" during body phase
  const heroGlow =
    frame >= BODY_START && frame < EXIT_START
      ? interpolate(
          frame % 90,
          [0, 45, 90],
          [0, 0.6, 0],
        )
      : 0;

  // ========== EXIT (5-7s) ==========

  // Content fade out
  const contentFade = interpolate(
    frame,
    [EXIT_START, EXIT_START + 80],
    [1, 0],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.inOut(Easing.quad),
    },
  );

  // Cursor: last blinks after content is gone
  const cursorFinalOpacity = interpolate(
    frame,
    [
      EXIT_START + 80,
      EXIT_START + 85,
      EXIT_START + 90,
      EXIT_START + 95,
      EXIT_START + 100,
      EXIT_START + 108,
      EXIT_START + 115,
    ],
    [1, 0, 1, 0, 1, 0, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  const showCursor = frame >= PROMPT_IN && frame < EXIT_START + 115;
  const isExitPhase = frame >= EXIT_START;
  const cursorExternalOpacity = isExitPhase
    ? frame < EXIT_START + 80
      ? contentFade
      : cursorFinalOpacity
    : 1;

  // Global opacity for content (not cursor in final phase)
  const globalOpacity = frame < EXIT_START ? 1 : contentFade;

  // Glitch before exit
  const isGlitching =
    frame >= GLITCH_START && frame < GLITCH_START + GLITCH_FRAMES;
  const glitchOffset = isGlitching
    ? Math.round(Math.sin(frame * 13.7) * 12)
    : 0;

  // Scanlines visible during body and early exit
  const showScanlines = frame >= BODY_START && frame < EXIT_START + 60;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: BG,
        fontFamily,
      }}
    >
      {/* CRT scanlines overlay */}
      {showScanlines && <Scanlines opacity={scanlineOpacity} />}

      {/* Moving scanline */}
      {showScanlines && <MovingScanline frame={frame} />}

      {/* Vignette — always visible */}
      <Vignette />

      {/* Noise grain overlay */}
      <NoiseOverlay frame={frame} />

      {/* Glitch flash before exit */}
      {isGlitching && <GlitchEffect frame={frame} />}

      {/* Main content */}
      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          zIndex: 5,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 0,
            transform: glitchOffset ? `translateX(${glitchOffset}px)` : "none",
          }}
        >
          {/* Hero line: >_ / > RicDev */}
          <div
            style={{
              fontSize: 96,
              fontWeight: 700,
              letterSpacing: 4,
              color: TEXT,
              display: "flex",
              alignItems: "center",
              opacity: globalOpacity,
              minHeight: 120,
            }}
          >
            {/* Standalone prompt before typing */}
            {showStandalonePrompt && (
              <span style={{ opacity: promptOpacity, color: GREEN }}>
                {">"}_
              </span>
            )}

            {/* Prompt + typed text */}
            {frame >= TYPING_START && (
              <>
                <span style={{ color: GREEN }}>{">"}</span>
                <span
                  style={{
                    marginLeft: 16,
                    textShadow: heroGlow > 0
                      ? `0 0 ${12 + heroGlow * 18}px rgba(88, 166, 255, ${heroGlow * 0.5}), 0 0 ${4 + heroGlow * 8}px rgba(63, 185, 80, ${heroGlow * 0.3})`
                      : "none",
                  }}
                >
                  {heroTyped}
                </span>
              </>
            )}

            {/* Cursor */}
            {showCursor && (
              <Cursor frame={frame} opacity={cursorExternalOpacity} />
            )}
          </div>

          {/* Secondary lines */}
          <div
            style={{
              marginTop: 40,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 10,
              opacity: globalOpacity,
            }}
          >
            {/* $ npm run dev */}
            {showNpm && (
              <div
                style={{
                  fontSize: 26,
                  fontWeight: 400,
                  color: MUTED,
                  letterSpacing: 1,
                }}
              >
                {npmTyped}
              </div>
            )}

            {/* compiling... (animated dots, disappears when compiled) */}
            {showCompile && (
              <div
                style={{
                  fontSize: 22,
                  fontWeight: 400,
                  color: BLUE,
                  letterSpacing: 1,
                  opacity: compileOpacity,
                  marginTop: 6,
                }}
              >
                {COMPILE_TEXT}{compileDots}
              </div>
            )}

            {/* Progress bar during compile */}
            {showProgress && (
              <div
                style={{
                  fontSize: 18,
                  fontWeight: 400,
                  color: MUTED,
                  letterSpacing: 2,
                  marginTop: 4,
                  opacity: compileOpacity,
                }}
              >
                [{progressBar}] {progressPercent}%
              </div>
            )}

            {/* ✓ compiled in 1.2s */}
            {showCompiled && (
              <div
                style={{
                  fontSize: 22,
                  fontWeight: 400,
                  color: GREEN,
                  letterSpacing: 1,
                  opacity: compiledOpacity,
                  marginTop: 6,
                }}
              >
                {COMPILED_TEXT}
              </div>
            )}

            {/* ready status */}
            {showReady && (
              <div
                style={{
                  fontSize: 22,
                  fontWeight: 400,
                  color: GREEN,
                  letterSpacing: 1,
                  opacity: readyOpacity,
                }}
              >
                {">"} {READY_TEXT}
              </div>
            )}

            {/* watching for file changes... */}
            {showWatching && (
              <div
                style={{
                  fontSize: 20,
                  fontWeight: 400,
                  color: MUTED,
                  letterSpacing: 1,
                  opacity: watchingOpacity,
                  marginTop: 4,
                }}
              >
                {WATCHING_TEXT}
              </div>
            )}
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
