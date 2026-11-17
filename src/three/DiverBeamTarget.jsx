import { useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

const TRAVEL_STOPS = [
  [0, 0.25],
  [0.2, 2.35],
  [0.4, -2.35],
  [0.6, 0.25],
  [0.78, 2.25],
  [0.93, -1.8],
  [1, 0],
];

function getModelX(progress, charge) {
  let x = TRAVEL_STOPS.at(-1)[1];
  for (let index = 0; index < TRAVEL_STOPS.length - 1; index += 1) {
    const [start, from] = TRAVEL_STOPS[index];
    const [end, to] = TRAVEL_STOPS[index + 1];
    if (progress <= end) {
      x = THREE.MathUtils.lerp(
        from,
        to,
        THREE.MathUtils.smoothstep(progress, start, end)
      );
      break;
    }
  }
  return THREE.MathUtils.lerp(x, 0, charge);
}

export default function DiverBeamTarget({
  scrollProgress = 0,
  buildupProgress = 0,
  swimmerRef,
  beamRef,
}) {
  const { camera, size } = useThree();
  const projectedModel = useMemo(() => new THREE.Vector3(), []);

  useFrame(({ clock }) => {
    const beam = beamRef?.current;
    const swimmer = swimmerRef?.current;
    if (!beam || !swimmer || scrollProgress < 0.38) {
      if (beam) beam.style.opacity = "0";
      return;
    }

    const dive = THREE.MathUtils.smoothstep(scrollProgress, 0.04, 0.42);
    const charge = THREE.MathUtils.smoothstep(buildupProgress, 0.05, 0.95);
    const acquisition = THREE.MathUtils.smoothstep(charge, 0.04, 0.5);
    if (acquisition > 0.001) {
      beam.style.opacity = "0";
      return;
    }
    const targetY = THREE.MathUtils.lerp(4.2, -7.5, dive);
    const modelY = THREE.MathUtils.lerp(
      targetY,
      -7.5,
      THREE.MathUtils.smoothstep(charge, 0.04, 0.5)
    );
    const modelX = getModelX(scrollProgress, charge);

    projectedModel.set(modelX, modelY - 0.9, 0).project(camera);
    const targetX = (projectedModel.x * 0.5 + 0.5) * size.width;
    const targetYpx = (-projectedModel.y * 0.5 + 0.5) * size.height;
    const bounds = swimmer.getBoundingClientRect();
    const sourceX = bounds.left + bounds.width * 0.065;
    const sourceY = bounds.top + bounds.height * 0.22;

    const distance = Math.hypot(targetX - sourceX, targetYpx - sourceY);
    const beamScale = THREE.MathUtils.smoothstep(distance, 150, 950);
    const targetHalfWidth = THREE.MathUtils.lerp(8, 54, beamScale);
    const dx = targetX - sourceX;
    const dy = targetYpx - sourceY;
    const inverseLength = 1 / Math.max(distance, 1);
    const normalX = -dy * inverseLength;
    const normalY = dx * inverseLength;
    const makeConePoints = (originHalfWidth, targetWidth) => {
      const points = [
        [sourceX + normalX * originHalfWidth, sourceY + normalY * originHalfWidth],
        [targetX + normalX * targetWidth, targetYpx + normalY * targetWidth],
        [targetX - normalX * targetWidth, targetYpx - normalY * targetWidth],
        [sourceX - normalX * originHalfWidth, sourceY - normalY * originHalfWidth],
      ];
      return points.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
    };
    const [glow, core] = beam.children;
    glow?.setAttribute("points", makeConePoints(2.5, targetHalfWidth * 1.5));
    core?.setAttribute("points", makeConePoints(1, targetHalfWidth * 0.58));
    beam.style.opacity = String(0.76 + Math.sin(clock.getElapsedTime() * 2.4) * 0.08);
  });

  return null;
}
