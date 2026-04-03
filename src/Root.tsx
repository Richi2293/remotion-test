import "./index.css";
import { Composition } from "remotion";
import { MyComposition } from "./Composition";
import { TripComposition, TRIP_TOTAL_DURATION } from "./TripComposition";
import { SimpleTest, DURATION_FRAMES, FPS } from "./SimpleTest";
import { RideOnIntro, RIDE_ON_DURATION, RIDE_ON_FPS } from "./RideOnIntro";
import {
  MinimalTerminalIntro,
  MINIMAL_TERMINAL_DURATION,
  MINIMAL_TERMINAL_FPS,
} from "./MinimalTerminalIntro";
import {
  GlitchCyberIntro,
  GLITCH_CYBER_DURATION,
  GLITCH_CYBER_FPS,
} from "./GlitchCyberIntro";
import {
  ModernMotionIntro,
  MODERN_MOTION_DURATION,
  MODERN_MOTION_FPS,
} from "./ModernMotionIntro";
import {
  CodeFlowIntro,
  CODE_FLOW_DURATION,
  CODE_FLOW_FPS,
} from "./CodeFlowIntro";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="MyComp"
        component={MyComposition}
        durationInFrames={60}
        fps={30}
        width={1280}
        height={720}
      />
      <Composition
        id="TripVideo"
        component={TripComposition}
        durationInFrames={TRIP_TOTAL_DURATION}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="SimpleTest"
        component={SimpleTest}
        durationInFrames={DURATION_FRAMES}
        fps={FPS}
        width={1920}
        height={1080}
      />
      <Composition
        id="RideOnIntro"
        component={RideOnIntro}
        durationInFrames={RIDE_ON_DURATION}
        fps={RIDE_ON_FPS}
        width={1920}
        height={1080}
      />
      <Composition
        id="MinimalTerminalIntro"
        component={MinimalTerminalIntro}
        durationInFrames={MINIMAL_TERMINAL_DURATION}
        fps={MINIMAL_TERMINAL_FPS}
        width={1920}
        height={1080}
      />
      <Composition
        id="GlitchCyberIntro"
        component={GlitchCyberIntro}
        durationInFrames={GLITCH_CYBER_DURATION}
        fps={GLITCH_CYBER_FPS}
        width={1920}
        height={1080}
      />
      <Composition
        id="ModernMotionIntro"
        component={ModernMotionIntro}
        durationInFrames={MODERN_MOTION_DURATION}
        fps={MODERN_MOTION_FPS}
        width={1920}
        height={1080}
      />
      <Composition
        id="CodeFlowIntro"
        component={CodeFlowIntro}
        durationInFrames={CODE_FLOW_DURATION}
        fps={CODE_FLOW_FPS}
        width={1920}
        height={1080}
      />
    </>
  );
};
