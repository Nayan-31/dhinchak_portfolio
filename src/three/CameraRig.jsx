import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

export default function CameraRig({
  scrollProgress = 0,
}) {
  const { camera } = useThree();

  useFrame((_, delta) => {
    const dive = THREE.MathUtils.smoothstep(
      THREE.MathUtils.clamp(scrollProgress, 0, 1),
      0.04,
      0.42
    );
    camera.position.x = THREE.MathUtils.damp(camera.position.x, 0, 4, delta);
    camera.position.y = THREE.MathUtils.damp(
      camera.position.y,
      THREE.MathUtils.lerp(3.6, -9.5, dive),
      3.4,
      delta
    );
    camera.position.z = THREE.MathUtils.damp(
      camera.position.z,
      16.5,
      4,
      delta
    );
    camera.lookAt(0, THREE.MathUtils.lerp(2, -7.5, dive), 0);
  });

  return null;
}
