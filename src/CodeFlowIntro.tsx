import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { loadFont as loadJetBrains } from "@remotion/google-fonts/JetBrainsMono";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";

const { fontFamily: monoFont } = loadJetBrains("normal", {
  weights: ["400"],
  subsets: ["latin"],
});
const { fontFamily: sansFont } = loadInter("normal", {
  weights: ["800"],
  subsets: ["latin"],
});

// --- Config ---
const CODE_FLOW_FPS = 60;
const CODE_FLOW_DURATION = 420;

export { CODE_FLOW_FPS, CODE_FLOW_DURATION };

// --- Palette ---
const BG = "#1a1a2e";
const CODE_GRAY = "#8b949e";
const KEYWORD = "#ff7b72";
const STRING = "#79c0ff";
const FUNC = "#7ee787";
const TEXT_COLOR = "#ffffff";
const GLOW = "rgba(126, 231, 135, 0.3)";

// --- Timing (frames) ---
const TEXT_APPEAR = 130;
const SWEEP_START = 170;
const SWEEP_END = 240;
const EXIT_START = 300;

// --- Code segment helpers ---
type Seg = { t: string; c: string };
const k = (t: string): Seg => ({ t, c: KEYWORD });
const s = (t: string): Seg => ({ t, c: STRING });
const f = (t: string): Seg => ({ t, c: FUNC });
const d = (t: string): Seg => ({ t, c: CODE_GRAY });

type CodeLine = Seg[];

// --- Code content (real React/Next.js snippets) ---
const CODE_SET_A: CodeLine[] = [
  [k("const"), d(" [user, setUser] = "), f("useState"), d("<User>();")],
  [k("const"), d(" router = "), f("useRouter"), d("();")],
  [d("  "), k("const"), d(" { data } = "), f("useSWR"), d("("), s("'/api/posts'"), d(");")],
  [k("export default function"), d(" "), f("Home"), d("() {")],
  [d("  "), k("return"), d(" <main className="), s('"container"'), d(">")],
  [d("    {posts."), f("map"), d("(post => (")],
  [d("      <Card key={post.id} {...post} />")],
  [d("    ))}"), d("")],
  [d("  </main>")],
  [d("}")],
  [k("const"), d(" ref = "), f("useRef"), d("<HTMLDivElement>("), k("null"), d(");")],
  [f("useEffect"), d("(() => {")],
  [d("  "), f("fetchData"), d("().then(setUser);")],
  [d("}, []);")],
  [k("import"), d(" { NextResponse } "), k("from"), d(" "), s("'next/server'"), d(";")],
  [k("const"), d(" session = "), k("await"), d(" "), f("getServerSession"), d("();")],
  [k("if"), d(" (!session) "), f("redirect"), d("("), s("'/login'"), d(");")],
  [k("const"), d(" posts = "), k("await"), d(" db.post."), f("findMany"), d("();")],
];

const CODE_SET_B: CodeLine[] = [
  [s("'use server'"), d(";")],
  [k("async function"), d(" "), f("createPost"), d("(data: FormData) {")],
  [d("  "), k("const"), d(" title = data."), f("get"), d("("), s("'title'"), d(") "), k("as"), d(" string;")],
  [d("  "), k("await"), d(" db.post."), f("create"), d("({ data: { title } });")],
  [d("  "), f("revalidatePath"), d("("), s("'/posts'"), d(");")],
  [d("}")],
  [k("export async function"), d(" "), f("GET"), d("(req: Request) {")],
  [d("  "), k("const"), d(" { searchParams } = "), k("new"), d(" "), f("URL"), d("(req.url);")],
  [d("  "), k("return"), d(" Response."), f("json"), d("({ posts });")],
  [d("}")],
  [k("type"), d(" User = {")],
  [d("  id: string;")],
  [d("  email: string;")],
  [d("  role: "), s("'admin'"), d(" | "), s("'user'"), d(";")],
  [d("};")],
  [k("export const"), d(" config = {")],
  [d("  runtime: "), s("'edge'"), d(",")],
  [d("  regions: ["), s("'iad1'"), d("],")],
  [d("};")],
];

const CODE_SET_C: CodeLine[] = [
  [k("import"), d(" { useState, useEffect } "), k("from"), d(" "), s("'react'"), d(";")],
  [k("const"), d(" [loading, setLoading] = "), f("useState"), d("("), k("true"), d(");")],
  [k("const"), d(" { data, error } = "), f("useSWR"), d("("), s("'/api/data'"), d(");")],
  [k("export const"), d(" revalidate = 3600;")],
  [k("const"), d(" token = "), f("cookies"), d("()."), f("get"), d("("), s("'session'"), d(");")],
  [k("if"), d(" (!token) "), k("return"), d(" "), f("unauthorized"), d("();")],
  [k("const"), d(" user = "), k("await"), d(" "), f("verifyToken"), d("(token);")],
  [k("return"), d(" NextResponse."), f("json"), d("(user);")],
  [k("interface"), d(" PostProps {")],
  [d("  title: string;")],
  [d("  content: string;")],
  [d("  author: User;")],
  [d("}")],
  [k("const"), d(" handler = "), k("async"), d(" (req: Request) => {")],
  [d("  "), k("const"), d(" body = "), k("await"), d(" req."), f("json"), d("();")],
  [d("  "), k("return"), d(" "), f("Response"), d("."), f("json"), d("({ ok: "), k("true"), d(" });")],
  [d("};")],
  [k("export default"), d(" handler;")],
];

// --- Column definitions ---
type ColumnConfig = {
  x: number;
  speedMul: number;
  direction: 1 | -1;
  startOffset: number;
  blur: number;
  opacity: number;
  lines: CodeLine[];
};

const COLUMNS: ColumnConfig[] = [
  { x: 30, speedMul: 1.0, direction: -1, startOffset: -200, blur: 3, opacity: 0.18, lines: CODE_SET_A },
  { x: 350, speedMul: 0.7, direction: 1, startOffset: -500, blur: 4, opacity: 0.14, lines: CODE_SET_B },
  { x: 700, speedMul: 1.3, direction: -1, startOffset: -350, blur: 3.5, opacity: 0.16, lines: CODE_SET_C },
  { x: 1100, speedMul: 0.85, direction: 1, startOffset: -100, blur: 4, opacity: 0.15, lines: CODE_SET_A },
  { x: 1480, speedMul: 1.15, direction: -1, startOffset: -450, blur: 3, opacity: 0.17, lines: CODE_SET_B },
];

const LINE_HEIGHT = 26;
const FONT_SIZE = 15;
const REPEATS = 6;

// --- Scroll offset (cumulative by phase) ---
const getScrollOffset = (frame: number): number => {
  const entry = interpolate(frame, [0, 120], [0, 300], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });
  const body = interpolate(frame, [120, 300], [0, 100], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const exit = interpolate(frame, [300, 420], [0, 500], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.in(Easing.quad),
  });
  return entry + body + exit;
};

// --- Code line renderer ---
const CodeLineView: React.FC<{ segments: CodeLine }> = ({ segments }) => (
  <div style={{ whiteSpace: "nowrap", lineHeight: `${LINE_HEIGHT}px`, height: LINE_HEIGHT }}>
    {segments.map((seg, i) => (
      <span key={i} style={{ color: seg.c }}>
        {seg.t}
      </span>
    ))}
  </div>
);

// --- Code column renderer ---
const CodeColumn: React.FC<{
  col: ColumnConfig;
  scrollOffset: number;
}> = ({ col, scrollOffset }) => {
  const y = col.startOffset + scrollOffset * col.speedMul * col.direction;

  return (
    <div
      style={{
        position: "absolute",
        left: col.x,
        top: 0,
        transform: `translateY(${y}px)`,
        filter: `blur(${col.blur}px)`,
        opacity: col.opacity,
        fontFamily: monoFont,
        fontSize: FONT_SIZE,
        lineHeight: `${LINE_HEIGHT}px`,
        width: 380,
        overflow: "hidden",
      }}
    >
      {Array.from({ length: REPEATS }).flatMap((_, rep) =>
        col.lines.map((line, li) => (
          <CodeLineView key={`${rep}-${li}`} segments={line} />
        )),
      )}
    </div>
  );
};

// --- Main Component ---
export const CodeFlowIntro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const scrollOffset = getScrollOffset(frame);

  // ========== TEXT ==========

  // Spring scale from 0
  const textScale = spring({
    frame: frame - TEXT_APPEAR,
    fps,
    config: { damping: 14, stiffness: 80 },
  });

  const textOpacity = interpolate(
    frame,
    [TEXT_APPEAR, TEXT_APPEAR + 15],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  // Glow pulse
  const glowPhase = (frame - TEXT_APPEAR) / fps;
  const glowIntensity =
    frame >= TEXT_APPEAR
      ? interpolate(Math.sin(glowPhase * Math.PI * 0.7), [-1, 1], [0.4, 1])
      : 0;

  const textShadow =
    frame >= TEXT_APPEAR
      ? `0 0 ${25 + glowIntensity * 30}px ${GLOW}, 0 0 ${50 + glowIntensity * 50}px rgba(126, 231, 135, ${0.1 + glowIntensity * 0.12})`
      : "none";

  // Light sweep
  const sweepX = interpolate(frame, [SWEEP_START, SWEEP_END], [-120, 600], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.quad),
  });
  const sweepVisible = frame >= SWEEP_START && frame <= SWEEP_END;

  // Exit fade
  const exitFade = interpolate(frame, [EXIT_START, EXIT_START + 80], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.quad),
  });

  // Code columns fade out on exit
  const codeFade = interpolate(frame, [EXIT_START + 40, EXIT_START + 110], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ backgroundColor: BG }}>
      {/* Code rain columns */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          overflow: "hidden",
          opacity: codeFade,
          zIndex: 1,
        }}
      >
        {COLUMNS.map((col, i) => (
          <CodeColumn key={i} col={col} scrollOffset={scrollOffset} />
        ))}
      </div>

      {/* "RicDev" text */}
      {frame >= TEXT_APPEAR && (
        <AbsoluteFill
          style={{
            justifyContent: "center",
            alignItems: "center",
            zIndex: 10,
            opacity: exitFade,
          }}
        >
          <div
            style={{
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                fontSize: 110,
                fontWeight: 800,
                fontFamily: sansFont,
                letterSpacing: 10,
                color: TEXT_COLOR,
                opacity: textOpacity,
                transform: `scale(${textScale})`,
                textShadow,
                whiteSpace: "nowrap",
                padding: "0 20px",
              }}
            >
              RicDev
            </div>

            {/* Light sweep */}
            {sweepVisible && (
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: sweepX,
                  width: 90,
                  height: "100%",
                  background:
                    "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.15), transparent)",
                  pointerEvents: "none",
                }}
              />
            )}
          </div>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};
