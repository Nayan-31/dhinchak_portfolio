import { useEffect, useMemo, useRef } from "react";
import { useAnimations, useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const ROCKS_URL = "/models/All_172_Rocks_TEXTURED_FINAL_v1.glb";
const FISH_URL = "/models/Ocean_Fish_V13_ANIM_TEST.glb";
const MANTA_URL = "/models/Manta_Rays_FIXED_v2.glb";

function AnimatedModel({
  url,
  position = [0, 0, 0],
  scale = 1,
  scrollProgress = 0,
  revealStart = 0.38,
  revealEnd = 0.46,
}) {
  const root = useRef(null);
  const gltf = useGLTF(url);
  const object = useMemo(() => gltf.scene.clone(true), [gltf.scene]);
  const { actions } = useAnimations(gltf.animations, root);

  useEffect(() => {
    Object.values(actions).forEach((action) =>
      action?.reset().setEffectiveTimeScale(0.7).fadeIn(0.6).play()
    );

    return () => {
      Object.values(actions).forEach((action) => action?.stop());
    };
  }, [actions]);

  useFrame(() => {
    if (!root.current) return;

    const t = THREE.MathUtils.clamp(
      (scrollProgress - revealStart) / (revealEnd - revealStart),
      0,
      1
    );
    const reveal = t * t * (3 - 2 * t);
    root.current.visible = reveal > 0.001;
    root.current.scale.setScalar(scale * reveal);
  });

  return (
    <group ref={root} position={position} scale={scale}>
      <primitive object={object} />
    </group>
  );
}

export default function UnderwaterEnvironment({ scrollProgress = 0 }) {
  const rocks = useGLTF(ROCKS_URL);
  const rockScene = useMemo(() => rocks.scene.clone(true), [rocks.scene]);
  return (
    <>
      {/* Blender's reef shelf sits just below its ocean surface. */}
      <primitive object={rockScene} position={[0, 5.65, 0]} />
      <AnimatedModel
        url={FISH_URL}
        position={[0, 11, 0]}
        scale={0.9}
        scrollProgress={scrollProgress}
        revealStart={0.38}
        revealEnd={0.46}
      />
      <AnimatedModel
        url={MANTA_URL}
        position={[0, 9.5, 0]}
        scale={0.85}
        scrollProgress={scrollProgress}
        revealStart={0.5}
        revealEnd={0.58}
      />
    </>
  );
}

useGLTF.preload(ROCKS_URL);
useGLTF.preload(FISH_URL);
useGLTF.preload(MANTA_URL);
