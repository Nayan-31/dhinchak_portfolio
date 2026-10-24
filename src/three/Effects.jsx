
import { EffectComposer, Bloom } from "@react-three/postprocessing";

export default function Effects() {
  return (
    <EffectComposer>
      <Bloom
        intensity={0.9}
        luminanceThreshold={0.8}
        luminanceSmoothing={0.25}
        mipmapBlur
      />
    </EffectComposer>
  );
}
