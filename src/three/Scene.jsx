
import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";

import EnergyRock from "./EnergyRock";
import Ocean from "./Ocean";
import Bubbles from "./Bubbles";
import Lighting from "./Lighting";
import Effects from "./Effects";
import CameraRig from "./CameraRig";
import UnderwaterEnvironment from "./UnderwaterEnvironment";
import DiverBeamTarget from "./DiverBeamTarget";

export default function Scene({
  paused = false,
  scrollProgress = 0,
  buildupProgress = 0,
  explosionProgress = 0,
  swimmerRef,
  swimmerBeamRef,
}) {
  return (
    <Canvas
      frameloop={paused ? "never" : "always"}
      camera={{
        position: [0, 2.8, 15.5],
        fov: 48,
        near: 0.1,
        far: 160,
      }}
      gl={{ antialias: true }}
      dpr={[1, 1.25]}
    >
      <color
        attach="background"
        args={["#030712"]}
      />

      <CameraRig
        scrollProgress={scrollProgress}
      />

      <DiverBeamTarget
        scrollProgress={scrollProgress}
        buildupProgress={buildupProgress}
        swimmerRef={swimmerRef}
        beamRef={swimmerBeamRef}
      />

      <Lighting />

      <Suspense fallback={null}>
        <EnergyRock
          scrollProgress={scrollProgress}
          buildupProgress={buildupProgress}
          explosionProgress={explosionProgress}
        />

        <UnderwaterEnvironment
          scrollProgress={scrollProgress}
        />

        <Ocean
          scrollProgress={scrollProgress}
        />

        <Bubbles
          scrollProgress={scrollProgress}
        />
      </Suspense>

      <Effects />
    </Canvas>
  );
}
