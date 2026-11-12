import { EffectComposer, Bloom } from "@react-three/postprocessing";

export default function Effects() {
  return (
    <EffectComposer>
      <Bloom
        intensity={0.45}
        luminanceThreshold={0.8}
        luminanceSmoothing={0.25}
        mipmapBlur
      />
    </EffectComposer>
  );
}
