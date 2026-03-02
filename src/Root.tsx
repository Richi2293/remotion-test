import "./index.css";
import { Composition } from "remotion";
import { MyComposition } from "./Composition";
import { TripComposition, TRIP_TOTAL_DURATION } from "./TripComposition";

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
    </>
  );
};
