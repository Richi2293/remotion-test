import { useCurrentFrame, useVideoConfig, AbsoluteFill, spring, interpolate } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";

const BUILDING_COLORS = ["#1e293b", "#334155", "#475569", "#64748b"];

type BuildingData = {
  x: number;
  z: number;
  height: number;
  delay: number;
  color: string;
};

const generateBuildings = (): BuildingData[] => {
  const buildings: BuildingData[] = [];
  const gridSize = 5;
  const spacing = 1.4;

  for (let ix = -gridSize; ix <= gridSize; ix++) {
    for (let iz = -gridSize; iz <= gridSize; iz++) {
      const dist = Math.sqrt(ix * ix + iz * iz);
      const baseHeight = Math.max(0.3, 6 - dist * 0.8);
      const hash =
        Math.abs(Math.sin(ix * 127.1 + iz * 311.7) * 43758.5453) % 1;
      const height = baseHeight * (0.4 + hash * 0.8);
      const delay = Math.floor(dist * 2);
      const colorIdx = Math.floor(hash * BUILDING_COLORS.length) % BUILDING_COLORS.length;

      buildings.push({
        x: ix * spacing,
        z: iz * spacing,
        height,
        delay,
        color: BUILDING_COLORS[colorIdx],
      });
    }
  }
  return buildings;
};

const BUILDINGS = generateBuildings();

const Building: React.FC<BuildingData> = ({ x, z, height, delay, color }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const scale = spring({
    frame,
    fps,
    delay,
    config: { damping: 15, stiffness: 80 },
  });

  const currentHeight = height * scale;

  return (
    <mesh position={[x, currentHeight / 2, z]}>
      <boxGeometry args={[1, currentHeight, 1]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
};

const AnimatedCamera: React.FC = () => {
  const frame = useCurrentFrame();
  const { camera } = useThree();

  const angle = interpolate(frame, [0, 180], [0, Math.PI * 0.4], {
    extrapolateRight: "clamp",
  });
  const radius = 14;
  const cameraY = interpolate(frame, [0, 180], [8, 6], {
    extrapolateRight: "clamp",
  });

  camera.position.set(
    Math.sin(angle) * radius,
    cameraY,
    Math.cos(angle) * radius,
  );
  camera.lookAt(0, 2, 0);
  camera.updateProjectionMatrix();

  return null;
};

export const LosAngeles3D: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();

  const textOpacity = interpolate(frame, [15, 45], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const textScale = spring({
    frame,
    fps,
    delay: 15,
    config: { damping: 200 },
  });

  const subtitleOpacity = interpolate(frame, [40, 70], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(180deg, #0a0a2e 0%, #1a0a3e 50%, #2d1b69 100%)",
      }}
    >
      <ThreeCanvas width={width} height={height}>
        <AnimatedCamera />
        <ambientLight intensity={0.3} />
        <directionalLight
          position={[10, 15, 5]}
          intensity={1}
          color="#ff8800"
        />
        <directionalLight
          position={[-8, 8, -5]}
          intensity={0.4}
          color="#4466ff"
        />
        <pointLight position={[0, 10, 0]} intensity={0.5} color="#ffffff" />

        {BUILDINGS.map((b, i) => (
          <Building key={i} {...b} />
        ))}

        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
          <planeGeometry args={[30, 30]} />
          <meshStandardMaterial color="#0f172a" />
        </mesh>
      </ThreeCanvas>

      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 16,
          }}
        >
          <div
            style={{
              fontSize: 100,
              fontWeight: 900,
              color: "white",
              textShadow:
                "0 0 60px rgba(255, 136, 0, 0.6), 0 4px 20px rgba(0, 0, 0, 0.8)",
              letterSpacing: 16,
              fontFamily: "sans-serif",
              opacity: textOpacity,
              transform: `scale(${textScale})`,
            }}
          >
            LOS ANGELES
          </div>
          <div
            style={{
              fontSize: 36,
              fontWeight: 400,
              color: "rgba(255, 255, 255, 0.7)",
              letterSpacing: 8,
              fontFamily: "sans-serif",
              opacity: subtitleOpacity,
              textShadow: "0 2px 10px rgba(0, 0, 0, 0.6)",
            }}
          >
            FINAL DESTINATION
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
