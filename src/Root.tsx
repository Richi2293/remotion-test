import "./index.css";
import { Composition } from "remotion";
import { MyComposition } from "./Composition";
import { TripComposition, TRIP_TOTAL_DURATION } from "./TripComposition";
import { SimpleTest, DURATION_FRAMES, FPS } from "./SimpleTest";
import { RideOnIntro, RIDE_ON_DURATION, RIDE_ON_FPS } from "./RideOnIntro";

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
    </>
  );
};
