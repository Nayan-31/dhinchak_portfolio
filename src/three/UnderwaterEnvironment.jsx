import { useMemo } from "react";
import { useGLTF } from "@react-three/drei";

const ROCKS_URL = "/models/All_172_Rocks_TEXTURED_FINAL_v1.glb";

export default function UnderwaterEnvironment() {
  const rocks = useGLTF(ROCKS_URL);
  const rockScene = useMemo(() => rocks.scene.clone(true), [rocks.scene]);

  return (
    // Keep the user's authored 172-rock reef in the Home scene.
    <primitive object={rockScene} position={[0, 5.65, 0]} />
  );
}

useGLTF.preload(ROCKS_URL);
