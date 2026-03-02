import "mapbox-gl/dist/mapbox-gl.css";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { useDelayRender } from "remotion";
import mapboxgl, { Map } from "mapbox-gl";
import * as turf from "@turf/turf";

const BOLOGNA: [number, number] = [11.3426, 44.4949];
const ROME: [number, number] = [12.4964, 41.9028];
const LA: [number, number] = [-118.2437, 34.0522];

mapboxgl.accessToken = process.env.REMOTION_MAPBOX_TOKEN as string;

const CLAMP = {
  extrapolateLeft: "clamp" as const,
  extrapolateRight: "clamp" as const,
};

const generateGreatCircleCoords = (): number[][] => {
  const gc = turf.greatCircle(ROME, LA, { npoints: 100 });
  let coords: number[][];
  if (gc.geometry.type === "MultiLineString") {
    coords = gc.geometry.coordinates.flat() as number[][];
  } else {
    coords = gc.geometry.coordinates as number[][];
  }
  coords[0] = [...ROME];
  coords[coords.length - 1] = [...LA];
  return coords;
};

const ROME_TO_LA_COORDS = generateGreatCircleCoords();

export const TripMap: React.FC = () => {
  const ref = useRef<HTMLDivElement>(null);
  const { width, height, fps, durationInFrames } = useVideoConfig();
  const frame = useCurrentFrame();
  const { delayRender, continueRender } = useDelayRender();
  const [handle] = useState(() => delayRender("Loading map..."));
  const [map, setMap] = useState<Map | null>(null);

  const PHASE1_END = 3 * fps;
  const PHASE2_END = 9 * fps;
  const PHASE3_END = durationInFrames;

  const gcMidpoint = useMemo(() => {
    const midIdx = Math.floor(ROME_TO_LA_COORDS.length / 2);
    return ROME_TO_LA_COORDS[midIdx];
  }, []);

  useEffect(() => {
    const _map = new Map({
      container: ref.current!,
      zoom: 14,
      center: BOLOGNA,
      pitch: 0,
      bearing: 0,
      style: "mapbox://styles/mapbox/standard",
      interactive: false,
      fadeDuration: 0,
    });

    _map.on("style.load", () => {
      const hideFeatures = [
        "showRoadsAndTransit",
        "showRoads",
        "showTransit",
        "showPedestrianRoads",
        "showRoadLabels",
        "showTransitLabels",
        "showPlaceLabels",
        "showPointOfInterestLabels",
        "showPointsOfInterest",
        "showAdminBoundaries",
        "showLandmarkIcons",
        "showLandmarkIconLabels",
        "show3dObjects",
        "show3dBuildings",
        "show3dTrees",
        "show3dLandmarks",
        "show3dFacades",
      ];
      for (const feature of hideFeatures) {
        _map.setConfigProperty("basemap", feature, false);
      }
      _map.setConfigProperty("basemap", "colorMotorways", "transparent");
      _map.setConfigProperty("basemap", "colorRoads", "transparent");
      _map.setConfigProperty("basemap", "colorTrunks", "transparent");

      _map.addSource("route-europe", {
        type: "geojson",
        data: {
          type: "Feature",
          properties: {},
          geometry: {
            type: "LineString",
            coordinates: [BOLOGNA, BOLOGNA],
          },
        },
      });

      _map.addSource("route-transatlantic", {
        type: "geojson",
        data: {
          type: "Feature",
          properties: {},
          geometry: {
            type: "LineString",
            coordinates: [ROME, ROME],
          },
        },
      });

      _map.addLayer({
        id: "route-europe-line",
        type: "line",
        source: "route-europe",
        paint: {
          "line-color": "#FF4444",
          "line-width": 5,
        },
        layout: {
          "line-cap": "round",
          "line-join": "round",
        },
      });

      _map.addLayer({
        id: "route-transatlantic-line",
        type: "line",
        source: "route-transatlantic",
        paint: {
          "line-color": "#FF4444",
          "line-width": 5,
        },
        layout: {
          "line-cap": "round",
          "line-join": "round",
        },
      });

      _map.addSource("markers", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: [
            {
              type: "Feature",
              properties: { name: "Bologna" },
              geometry: { type: "Point", coordinates: BOLOGNA },
            },
            {
              type: "Feature",
              properties: { name: "Roma" },
              geometry: { type: "Point", coordinates: ROME },
            },
            {
              type: "Feature",
              properties: { name: "Los Angeles" },
              geometry: { type: "Point", coordinates: LA },
            },
          ],
        },
      });

      _map.addLayer({
        id: "city-markers",
        type: "circle",
        source: "markers",
        paint: {
          "circle-radius": 10,
          "circle-color": "#FF4444",
          "circle-stroke-width": 3,
          "circle-stroke-color": "#FFFFFF",
        },
      });

      _map.addLayer({
        id: "city-labels",
        type: "symbol",
        source: "markers",
        layout: {
          "text-field": ["get", "name"],
          "text-font": ["DIN Pro Bold", "Arial Unicode MS Bold"],
          "text-size": 40,
          "text-offset": [0, 0.5],
          "text-anchor": "top",
        },
        paint: {
          "text-color": "#FFFFFF",
          "text-halo-color": "#000000",
          "text-halo-width": 2,
        },
      });
    });

    _map.on("load", () => {
      continueRender(handle);
      setMap(_map);
    });
  }, [handle, continueRender]);

  useEffect(() => {
    if (!map) return;
    const animHandle = delayRender("Animating map...");

    // --- Camera calculations ---
    let zoom: number;
    let centerLng: number;
    let centerLat: number;

    if (frame < PHASE1_END) {
      // Phase 1: Zoom out from Bologna
      zoom = interpolate(frame, [0, PHASE1_END], [14, 6], {
        ...CLAMP,
        easing: Easing.out(Easing.quad),
      });
      centerLng = BOLOGNA[0];
      centerLat = BOLOGNA[1];
    } else if (frame < PHASE2_END) {
      // Phase 2: Camera follows line from Bologna to Rome
      const p2 = interpolate(frame, [PHASE1_END, PHASE2_END], [0, 1], {
        ...CLAMP,
        easing: Easing.inOut(Easing.quad),
      });
      zoom = interpolate(frame, [PHASE1_END, PHASE2_END], [6, 5], CLAMP);
      centerLng = BOLOGNA[0] + (ROME[0] - BOLOGNA[0]) * p2;
      centerLat = BOLOGNA[1] + (ROME[1] - BOLOGNA[1]) * p2;
    } else {
      // Phase 3: Camera follows great circle from Rome to LA, dramatic zoom out
      const p3 = interpolate(frame, [PHASE2_END, PHASE3_END], [0, 1], {
        ...CLAMP,
        easing: Easing.inOut(Easing.quad),
      });
      zoom = interpolate(frame, [PHASE2_END, PHASE3_END], [5, 1.5], {
        ...CLAMP,
        easing: Easing.inOut(Easing.quad),
      });
      centerLng = interpolate(p3, [0, 1], [ROME[0], gcMidpoint[0]]);
      centerLat = interpolate(p3, [0, 1], [ROME[1], gcMidpoint[1]]);
    }

    // --- Line updates ---

    // Europe line (Bologna → Rome)
    if (frame >= PHASE1_END) {
      const lineProgress = interpolate(
        frame,
        [PHASE1_END, PHASE2_END],
        [0, 1],
        { ...CLAMP, easing: Easing.inOut(Easing.quad) },
      );
      const headLng =
        BOLOGNA[0] + (ROME[0] - BOLOGNA[0]) * lineProgress;
      const headLat =
        BOLOGNA[1] + (ROME[1] - BOLOGNA[1]) * lineProgress;

      const europeSource = map.getSource(
        "route-europe",
      ) as mapboxgl.GeoJSONSource;
      if (europeSource) {
        europeSource.setData({
          type: "Feature",
          properties: {},
          geometry: {
            type: "LineString",
            coordinates: [BOLOGNA, [headLng, headLat]],
          },
        });
      }
    }

    // Transatlantic line (Rome → LA great circle)
    if (frame >= PHASE2_END) {
      const lineProgress = interpolate(
        frame,
        [PHASE2_END, PHASE3_END],
        [0, 1],
        { ...CLAMP, easing: Easing.inOut(Easing.quad) },
      );
      const currentIdx = Math.max(
        1,
        Math.floor(lineProgress * (ROME_TO_LA_COORDS.length - 1)),
      );
      const visibleCoords = ROME_TO_LA_COORDS.slice(0, currentIdx + 1);

      const transSource = map.getSource(
        "route-transatlantic",
      ) as mapboxgl.GeoJSONSource;
      if (transSource) {
        transSource.setData({
          type: "Feature",
          properties: {},
          geometry: {
            type: "LineString",
            coordinates: visibleCoords,
          },
        });
      }
    }

    map.jumpTo({
      center: [centerLng, centerLat],
      zoom,
    });

    map.once("idle", () => continueRender(animHandle));
  }, [
    frame,
    map,
    fps,
    PHASE1_END,
    PHASE2_END,
    PHASE3_END,
    delayRender,
    continueRender,
    gcMidpoint,
  ]);

  const style: React.CSSProperties = useMemo(
    () => ({ width, height, position: "absolute" }),
    [width, height],
  );

  return <AbsoluteFill ref={ref} style={style} />;
};
