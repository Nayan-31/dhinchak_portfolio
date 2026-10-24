
import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";

import EnergyRock from "./EnergyRock";
import Ocean from "./Ocean";
import Bubbles from "./Bubbles";
import Lighting from "./Lighting";
import Effects from "./Effects";
import CameraRig from "./CameraRig";

export default function Scene({
  scrollProgress = 0,
}) {
  return (
    <Canvas
      camera={{
        position: [0, 2.2, 11.5],
        fov: 45,
        near: 0.1,
        far: 160,
      }}
      gl={{ antialias: true }}
      dpr={[1, 2]}
    >
      <color
        attach="background"
        args={["#030712"]}
      />

      <CameraRig scrollProgress={scrollProgress} />
      <Lighting />

      <Suspense fallback={null}>
        <EnergyRock scrollProgress={scrollProgress} />
        <Ocean scrollProgress={scrollProgress} />
        <Bubbles scrollProgress={scrollProgress} />
      </Suspense>

      <Effects />
    </Canvas>
  );
}
