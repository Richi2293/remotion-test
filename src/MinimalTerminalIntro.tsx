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
const MINIMAL_TERMINAL_DURATION = 420; // 7s

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
const CHAR_FRAMES = 8; // frames per typed character
const BODY_START = 120; // 2s
const NPM_START = 145; // npm line typing starts
const NPM_CHAR_FRAMES = 3;
const READY_START = 210; // ready status fades in
const EXIT_START = 300; // 5s
const CURSOR_BLINK_PERIOD = 20;

// --- Text ---
const HERO_TEXT = "RicDev";
const NPM_TEXT = "$ npm run dev";
const READY_TEXT = "ready - started on http://localhost:3000";

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

  // Typing "RicDev" — character by character
  const typingProgress = Math.floor((frame - TYPING_START) / CHAR_FRAMES);
  const heroChars = Math.max(0, Math.min(HERO_TEXT.length, typingProgress));
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

  // "ready" status fade-in
  const readyOpacity = interpolate(
    frame,
    [READY_START, READY_START + 30],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const showReady = frame >= READY_START;

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
                <span style={{ marginLeft: 16 }}>{heroTyped}</span>
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
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
