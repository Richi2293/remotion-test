import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { TripMap } from "./TripMap";
import { LosAngeles3D } from "./LosAngeles3D";

const MAP_DURATION = 450; // 15 seconds at 30fps
const LA_3D_DURATION = 180; // 6 seconds at 30fps
const TRANSITION_DURATION = 30; // 1 second fade

export const TRIP_TOTAL_DURATION =
  MAP_DURATION + LA_3D_DURATION - TRANSITION_DURATION; // 600 frames = 20s

export const TripComposition: React.FC = () => {
  return (
    <TransitionSeries>
      <TransitionSeries.Sequence durationInFrames={MAP_DURATION}>
        <TripMap />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition
        presentation={fade()}
        timing={linearTiming({ durationInFrames: TRANSITION_DURATION })}
      />
      <TransitionSeries.Sequence durationInFrames={LA_3D_DURATION}>
        <LosAngeles3D />
      </TransitionSeries.Sequence>
    </TransitionSeries>
  );
};
