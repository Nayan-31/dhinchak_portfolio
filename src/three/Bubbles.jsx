import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { OCEAN_Y } from "./Ocean";

const COUNT = 95;

function rand(seed) {
  const v = Math.sin(seed * 127.1 + 78.233) * 43758.5453;
  return v - Math.floor(v);
}

export default function Bubbles({ scrollProgress = 0 }) {
  const instances = useRef();
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const bubbles = useMemo(
    () =>
      Array.from({ length: COUNT }, (_, i) => {
        const angle = rand(i + 1) * Math.PI * 2;
        const radius = Math.sqrt(rand(i + 20)) * 2.2;
        return {
          x: Math.cos(angle) * radius,
          z: Math.sin(angle) * radius * 0.55,
          base: rand(i + 120) * 3.1,
          speed: 0.35 + rand(i + 220) * 0.75,
          size: 0.018 + rand(i + 320) * 0.044,
          sway: rand(i + 420) * Math.PI * 2,
        };
      }),
    []
  );

  useFrame(({ clock }) => {
    if (!instances.current) return;

    // bubbles bahut late start hon
 
const start = 0.48;
const end = 0.65;

const active = THREE.MathUtils.smoothstep(
  scrollProgress,
  start,
  end
);


    if (active <= 0.01) {
      instances.current.visible = false;
      return;
    }

    instances.current.visible = true;

    const time = clock.getElapsedTime();

    bubbles.forEach((bubble, i) => {
      const rise = (bubble.base + time * bubble.speed) % 3.5;

      dummy.position.set(
        bubble.x + Math.sin(time * 1.1 + bubble.sway) * 0.12,
        OCEAN_Y - 3.8 + rise,   // thoda aur niche se start
        bubble.z
      );

      const s = bubble.size * active;
      dummy.scale.set(s, s * 1.12, s);
      dummy.updateMatrix();
      instances.current.setMatrixAt(i, dummy.matrix);
    });

    instances.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh
      ref={instances}
      args={[undefined, undefined, COUNT]}
      frustumCulled={false}
    >
      <sphereGeometry args={[1, 8, 6]} />
      <meshBasicMaterial
        color="#7acfff"
        transparent
        opacity={0.45}
        depthWrite={false}
      />
    </instancedMesh>
  );
}