
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

export default function CameraRig({
  scrollProgress = 0,
}) {
  const { camera } = useThree();

  useFrame((_, delta) => {
    const p = THREE.MathUtils.clamp(
      scrollProgress, 0, 1
    );

    // Camera starts above water.
    // It follows the dive after the impact.
    const dive = THREE.MathUtils.smoothstep(
      p, 0.25, 0.9
    );

    const targetY = THREE.MathUtils.lerp(
      2.2, -2.3, dive
    );

    camera.position.y = THREE.MathUtils.damp(
      camera.position.y,
      targetY,
      3.2,
      delta
    );

    camera.position.z = THREE.MathUtils.damp(
      camera.position.z,
      11.5,
      3.2,
      delta
    );

    const lookY = THREE.MathUtils.lerp(
      0.1,
      -1.6,
      dive
    );

    camera.lookAt(0, lookY, 0);
  });

  return null;
}
