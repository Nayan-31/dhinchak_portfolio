
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export const WATER_LEVEL = -1.25;
export const OCEAN_Y = WATER_LEVEL;
export const IMPACT_AT = 0.36;

export default function Ocean({ scrollProgress = 0 }) {
  const material = useRef();

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uProgress: { value: 0 },
      uImpact: { value: IMPACT_AT },
    }),
    []
  );

  useFrame(({ clock }) => {
    if (!material.current) return;
    material.current.uniforms.uTime.value =
      clock.getElapsedTime();

    material.current.uniforms.uProgress.value =
      scrollProgress;
  });

  return (
    <mesh
      position={[0, WATER_LEVEL, 0]}
      rotation={[-Math.PI / 2, 0, 0]}
    >
      <planeGeometry args={[120, 120, 180, 180]} />

      <shaderMaterial
        ref={material}
        uniforms={uniforms}
        side={THREE.DoubleSide}
        transparent
        depthWrite={false}
        vertexShader={`
          uniform float uTime;
          uniform float uProgress;
          uniform float uImpact;

          varying float vHeight;
          varying vec3 vNormalLocal;
          varying vec3 vWorldPos;

          float getWave(vec2 p) {
            float wave1 =
              sin(p.x * 0.42 + uTime * 0.85) *
              cos(p.y * 0.31 - uTime * 0.58) * 0.19;

            float wave2 =
              sin(p.x * 0.95 - p.y * 0.55 +
                  uTime * 1.25) * 0.075;

            float wave3 =
              cos(p.y * 1.65 + p.x * 0.35 -
                  uTime * 1.75) * 0.025;

            // Rock impacts the water near the middle
            float age = (uProgress - uImpact) * 7.0;
            float impact = 0.0;

            if (age > 0.0) {
              float r = length(p);
              float radius = age * 2.2;
              float difference = r - radius;

              float ring =
                sin(difference * 10.0) *
                exp(-difference * difference * 1.6);

              float secondary =
                sin((r - radius * 0.7) * 7.0) *
                exp(-pow(r - radius * 0.7, 2.0));

              float fade = exp(-age * 0.65);

              impact =
                (ring * 0.36 + secondary * 0.13)
                * fade;
            }

            return wave1 + wave2 + wave3 + impact;
          }

          void main() {
            vec3 p = position;
            float h = getWave(p.xy);
            p.z = h;

            float e = 0.06;
            float dx =
              (getWave(p.xy + vec2(e, 0.0)) -
               getWave(p.xy - vec2(e, 0.0))) /
              (2.0 * e);

            float dy =
              (getWave(p.xy + vec2(0.0, e)) -
               getWave(p.xy - vec2(0.0, e))) /
              (2.0 * e);

            vNormalLocal = normalize(
              vec3(-dx, -dy, 1.0)
            );
            vHeight = h;

            vec4 world = modelMatrix * vec4(p, 1.0);
            vWorldPos = world.xyz;

            gl_Position =
              projectionMatrix *
              viewMatrix *
              world;
          }
        `}
        fragmentShader={`
          varying float vHeight;
          varying vec3 vNormalLocal;
          varying vec3 vWorldPos;

          void main() {
          
vec3 deep = vec3(0.001, 0.004, 0.014);
vec3 mid = vec3(0.003, 0.012, 0.038);
vec3 highlight = vec3(0.025, 0.10, 0.22);


            float crest = smoothstep(
              -0.22, 0.27, vHeight
            );

            vec3 color = mix(deep, mid, crest);

            vec3 lightDir = normalize(
              vec3(-0.35, 0.45, 0.82)
            );

            float lighting = pow(
              max(dot(normalize(vNormalLocal),
                      lightDir), 0.0),
              14.0
            );

            color += highlight * lighting * 0.12;

            // Subtle energy-blue reflection near impact
            float distance = length(vWorldPos.xz);
            float glow = exp(-distance * 0.23);
            color += vec3(0.012, 0.045, 0.085)
                     * glow * 0.35;

            gl_FragColor = vec4(color, 0.93);
          }
        `}
      />
    </mesh>
  );
}
