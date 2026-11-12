
import { useMemo, useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";

// =========================================
// ORIGINAL MODEL AND CRYSTAL
// =========================================

const MODEL_URL = "/models/Energy_Rock_HERO_REAL_PBR.glb";
const STRANDS_URL = "/models/White_Energy_Strands.glb";

const CRYSTAL_SIZE = 0.85;
const CRYSTAL_POSITION = [0, 0, 0];

const HIDDEN_EFFECTS = [
  "underwater_atmospheric_depth",
  "underwater_volumetric_haze",
  "underwater_depth_atmosphere",
  "underwater_haze",
  // "impact_bloom_bubble",
  // "descent_trail_bubble",
  // "rising_bubble",
  // "foam_arc",
  // "plasma_splash",
  // "surface_wake",
  // "surface_splash",
  // "impact_splash",
  // "dark_animated_ocean",
  // "spray_droplet",
  // "spreading_water_ring",
];

const clamp = (value) =>
  THREE.MathUtils.clamp(value, 0, 1);

// =========================================
// ROCK DETECTION FOR EXPLOSION
// =========================================

function isRockFragment(mesh) {
  if (!mesh.isMesh || !mesh.geometry || !mesh.visible) {
    return false;
  }

  // Ignore children inside hidden GLB effects.
  let parent = mesh.parent;

  while (parent) {
    if (!parent.visible) return false;
    parent = parent.parent;
  }

  const name = mesh.name.toLowerCase();

  if (
    /(bubble|ocean|water|splash|foam|spray|wake|haze|depth|trail|lightning|electric|orbit|ring|crystal|core|beam|glow|plasma|spark|membrane|strand)/.test(
      name
    )
  ) {
    return false;
  }

  const geometry = mesh.geometry;

  if (!geometry.boundingBox) {
    geometry.computeBoundingBox();
  }

  const box = geometry.boundingBox;

  if (!box || box.isEmpty()) return false;

  const size = new THREE.Vector3();
  box.getSize(size);

  const maxSize = Math.max(size.x, size.y, size.z);
  const minSize = Math.min(size.x, size.y, size.z);

  if (
    maxSize < 0.18 ||
    maxSize > 7 ||
    minSize < 0.025
  ) {
    return false;
  }

  const materials = Array.isArray(mesh.material)
    ? mesh.material
    : [mesh.material];

  return materials.some((mat) => {
    if (!mat?.color) return false;

    const brightness = Math.max(
      mat.color.r,
      mat.color.g,
      mat.color.b
    );

    return brightness < 0.98;
  });
}

// =========================================
// ENERGY TRAIL DETECTION
// =========================================


function isEnergyMaterial(mesh, material) {
  if (!material) return false;

  const name = mesh.name.toLowerCase();
  const materialName = (material.name || "").toLowerCase();

  const combinedName = `${name} ${materialName}`;

  // Never treat rocks as glowing energy.
  if (
    /(rock|stone|boulder|fragment|debris|crystal|core)/.test(
      combinedName
    )
  ) {
    return false;
  }

  // Only explicitly named energy effects.
  return /(lightning|electric|plasma|energy_trail|orbit|electric_arc|glowing_line|energy film|membrane|strand)/.test(
    combinedName
  );
}

// =========================================
// MAIN COMPONENT
// =========================================

export default function EnergyRock({
  scrollProgress = 0,
  buildupProgress = 0,
  explosionProgress = 0,
}) {
  const { scene } = useGLTF(MODEL_URL);
  const { scene: sourceStrands } = useGLTF(STRANDS_URL);
  const worldYAxis = useMemo(() => new THREE.Vector3(0, 1, 0), []);
  const strandRig = useMemo(() => {
    const group = sourceStrands.clone(true);
    const materials = new Map();

    group.traverse((object) => {
      if (!object.isMesh) return;
      const originals = Array.isArray(object.material)
        ? object.material
        : [object.material];
      const copies = originals.map((original) => {
        const key = original.name || "energy strand";
        if (!materials.has(key)) {
          const material = original.clone();
          material.color?.set("#ffffff");
          material.emissive?.set("#ffffff");
          if ("emissiveIntensity" in material) {
            material.emissiveIntensity = 0.7;
          }
          material.toneMapped = true;
          material.transparent = true;
          material.opacity = 0.25;
          material.depthWrite = false;
          materials.set(key, material);
        }
        return materials.get(key);
      });
      object.material = Array.isArray(object.material) ? copies : copies[0];
    });

    return { group, materials: [...materials.values()] };
  }, [sourceStrands]);

  const movingRef = useRef(null);
  const spinningRef = useRef(null);
  const crystalRef = useRef(null);

  const buildupLightRef = useRef(null);
  const glowShellRef = useRef(null);
  const glowShellMatRef = useRef(null);

  const ringOneRef = useRef(null);
  const ringTwoRef = useRef(null);

  // =========================================
  // PREPARE ORIGINAL MODEL
  // =========================================

  const {
    model,
    crystal,
    fragments,
    sparks,
    sparkMaterial,
    energyMaterials,
    coreMaterial,
  } = useMemo(() => {
    const rock = scene.clone(true);

 rock.updateMatrixWorld(true);

    // Original hidden water effects.
    rock.traverse((obj) => {
      const name = obj.name.toLowerCase();

      const hide = HIDDEN_EFFECTS.some((effect) =>
        name.includes(effect)
      );

      if (hide) {
        obj.visible = false;
      }
    });

    // -----------------------------------------
    // Collect energy materials safely.
    // Clone them so the original GLB materials
    // are never permanently modified.
    // -----------------------------------------

    const energyMaterialsFound = [];
    const sparkMeshes = [];
    const explosionSparkMaterial = new THREE.MeshBasicMaterial({
      color: "#ffffff",
      toneMapped: false,
      transparent: true,
      opacity: 0,
      depthWrite: false,
    });



    rock.traverse((obj) => {
      if (!obj.isMesh || !obj.material) return;

      if (/plasma spark/i.test(obj.name)) {
        obj.visible = false;
        obj.material = explosionSparkMaterial;
        sparkMeshes.push(obj);
        return;
      }

      const meshMaterials = Array.isArray(obj.material)
        ? obj.material
        : [obj.material];
      const surfaceName = `${obj.name} ${meshMaterials
        .map((material) => material?.name || "")
        .join(" ")}`.toLowerCase();

      // These broad translucent membranes read as pale strips in the
      // browser. Keep the fine energy strands, but remove the membranes.
      if (
        /(energy film|membrane)/.test(surfaceName) &&
        !/strand/.test(surfaceName)
      ) {
        obj.visible = false;
        return;
      }

      let parent = obj;

      while (parent) {
        if (!parent.visible) return;
        parent = parent.parent;
      }

      const originalMaterials = meshMaterials;

      let didChange = false;

      const newMaterials = originalMaterials.map((mat) => {
        if (!isEnergyMaterial(obj, mat)) {
          return mat;
        }

        const copy = mat.clone();
        const materialLabel = (mat.name || "").toLowerCase();
        const materialName = `${obj.name} ${materialLabel}`.toLowerCase();
        const isStrand = /strand/.test(materialLabel);
        const isFilm =
          !isStrand && /(energy film|membrane)/.test(materialName);

        if (isFilm) {
          copy.transparent = true;
          copy.opacity = 0;
          copy.depthWrite = false;
          copy.side = THREE.DoubleSide;
        } else if (isStrand) {
          copy.map = null;
          copy.emissiveMap = null;
          copy.color.set("#ffffff");
          copy.emissive.set("#ffffff");
          copy.emissiveIntensity = 10;
          copy.toneMapped = false;
          copy.depthWrite = false;
          copy.transparent = true;
          copy.opacity = 1;
        }

        didChange = true;

        if (!isFilm) {
          energyMaterialsFound.push({
            material: copy,
            originalEmissive:
              "emissiveIntensity" in copy
                ? copy.emissiveIntensity
                : null,
            originalOpacity: copy.opacity ?? 1,
          });
        }

        return copy;
      });

      if (didChange) {
        obj.material = Array.isArray(obj.material)
          ? newMaterials
          : newMaterials[0];
      }
    });

    // -----------------------------------------
    // Detect original rock meshes.
    // -----------------------------------------

    rock.updateMatrixWorld(true);

    const fragmentsFound = [];

    rock.traverse((obj) => {
      if (!isRockFragment(obj)) return;

      // Average the normals on the rock meshes so their surfaces read
      // as weathered stone instead of sharp, toy-like flat shading.
      obj.geometry = obj.geometry.clone();
      obj.geometry.computeVertexNormals();
      const rockMaterials = (Array.isArray(obj.material)
        ? obj.material
        : [obj.material]
      ).map((material) => material?.clone());
      obj.material = Array.isArray(obj.material)
        ? rockMaterials
        : rockMaterials[0];
      rockMaterials.forEach((material) => {
        if (!material) return;
        material.flatShading = false;
        material.color?.multiplyScalar(1.55);
        material.roughness = Math.max(material.roughness ?? 0, 0.78);
        material.needsUpdate = true;
      });

      const center = new THREE.Vector3();

      obj.geometry.boundingBox.getCenter(center);

      const worldCenter = obj.localToWorld(
        center.clone()
      );

      const modelCenter = rock.worldToLocal(
        worldCenter.clone()
      );

      const direction = modelCenter.clone();
      direction.z *= 0.8;

      const index = fragmentsFound.length;

      if (direction.lengthSq() < 0.001) {
        const seed = index + 1;

        direction.set(
          Math.cos(seed * 2.4),
          Math.sin(seed * 2.4),
          Math.sin(seed * 1.7) * 0.6
        );
      }

      direction.normalize();

      const parentQuaternion = new THREE.Quaternion();

      obj.parent.getWorldQuaternion(parentQuaternion);

      direction.applyQuaternion(
        parentQuaternion.invert()
      );

      fragmentsFound.push({
        mesh: obj,
        basePosition: obj.position.clone(),
        baseRotation: obj.rotation.clone(),
        direction,

        distance: 7 + (index % 7) * 2.1,

        spin: new THREE.Vector3(
          0.35 + (index % 3) * 0.14,
          0.4 + (index % 4) * 0.12,
          0.2 + (index % 5) * 0.1
        ),
      });
    });

    // =========================================
    // ORIGINAL CRYSTAL — UNCHANGED
    // =========================================

    const geometry = new THREE.IcosahedronGeometry(1, 0);

    const material = new THREE.MeshPhysicalMaterial({
      color: "#8bd8ee",

      metalness: 0.28,
      roughness: 0.2,

      flatShading: true,

      clearcoat: 0.9,
      clearcoatRoughness: 0.12,

      emissive: "#17617b",
      emissiveIntensity: 0.42,

      transparent: false,

      depthTest: true,
      depthWrite: true,

      side: THREE.FrontSide,
    });

    const crystalMesh = new THREE.Mesh(
      geometry,
      material
    );

    crystalMesh.name = "CenterBlueCrystal";
    crystalMesh.renderOrder = 1000;

    crystalMesh.castShadow = false;
    crystalMesh.receiveShadow = false;

    crystalMesh.rotation.set(0.15, 0.35, 0.1);

    const crystalHolder = new THREE.Group();
    crystalHolder.add(crystalMesh);

    // Original inner glowing core.
    const innerGeometry = new THREE.IcosahedronGeometry(
      0.48,
      0
    );

    const innerMaterial = new THREE.MeshBasicMaterial({
      color: "#55c9e8",
      transparent: true,
      opacity: 0.2,
      depthWrite: false,
    });

    const glowingCore = new THREE.Mesh(
      innerGeometry,
      innerMaterial
    );

    glowingCore.name = "GlowCore";

    crystalHolder.add(glowingCore);

    crystalHolder.scale.setScalar(CRYSTAL_SIZE);
    crystalHolder.position.set(...CRYSTAL_POSITION);

    return {
      model: rock,
      crystal: crystalHolder,
      fragments: fragmentsFound,
      sparks: sparkMeshes,
      sparkMaterial: explosionSparkMaterial,
      energyMaterials: energyMaterialsFound,
      coreMaterial: innerMaterial,
    };
  }, [scene]);

  // =========================================
  // CLEAN UP ONLY GENERATED MATERIALS
  // =========================================

  useEffect(() => {
    return () => {
      crystal.traverse((obj) => {
        if (!obj.isMesh) return;

        obj.geometry?.dispose();

        if (Array.isArray(obj.material)) {
          obj.material.forEach((mat) => mat.dispose());
        } else {
          obj.material?.dispose();
        }
      });

      energyMaterials.forEach(({ material }) => {
        material.dispose();
      });

      strandRig.materials.forEach((material) => material.dispose());
      sparkMaterial.dispose();

      fragments.forEach(({ mesh }) => {
        mesh.geometry?.dispose();
        (Array.isArray(mesh.material) ? mesh.material : [mesh.material]).forEach(
          (material) => material?.dispose()
        );
      });
    };
  }, [crystal, energyMaterials, fragments, sparkMaterial, strandRig]);

  // =========================================
  // MAIN ANIMATION
  // =========================================

  useFrame(({ clock }, delta) => {
    if (!movingRef.current || !spinningRef.current) {
      return;
    }

    const time = clock.getElapsedTime();

    const p = clamp(scrollProgress);
    const b = clamp(buildupProgress);
    const e = clamp(explosionProgress);

    // Existing section progress.
    const charge = THREE.MathUtils.smoothstep(
      b,
      0.05,
      0.95
    );

    const explode = THREE.MathUtils.smoothstep(
      e,
      0.08,
      0.92
    );

    // Buildup visible only before explosion.
    const chargeVisible = charge * (1 - explode);

    const pulse = Math.sin(time * 2.1) * 0.5 + 0.5;
    const strandFade = 1 - THREE.MathUtils.smoothstep(explode, 0.02, 0.28);
    strandRig.materials.forEach((material) => {
      material.opacity = strandFade * (0.22 + chargeVisible * 0.12);
    });
    strandRig.group.rotation.y = time * 0.055;
    sparkMaterial.opacity = THREE.MathUtils.smoothstep(explode, 0.08, 0.5);
    sparks.forEach((spark) => {
      spark.visible = explode > 0.08;
    });

    // =========================================
    // 01-03: ORIGINAL DIVE AND ROTATION
    // =========================================

    spinningRef.current.rotateOnWorldAxis(worldYAxis, delta * 0.32);

    const submerge = THREE.MathUtils.smoothstep(p, 0.04, 0.42);
    const targetY = THREE.MathUtils.lerp(4.2, -7.5, submerge);

    // =========================================
    // 04-06: RIGHT TO CENTER
    // =========================================

    const travelStops = [
      [0, 0.25],
      [0.2, 2.35],
      [0.4, -2.35],
      [0.6, 0.25],
      [0.78, 2.25],
      [0.93, -1.8],
      [1, 0],
    ];
    let targetX = travelStops[travelStops.length - 1][1];
    for (let i = 0; i < travelStops.length - 1; i += 1) {
      const [start, from] = travelStops[i];
      const [end, to] = travelStops[i + 1];
      if (p <= end) {
        const t = THREE.MathUtils.smoothstep(p, start, end);
        targetX = THREE.MathUtils.lerp(from, to, t);
        break;
      }
    }

    const acquireCenter = THREE.MathUtils.smoothstep(charge, 0.04, 0.5);
    const centeredX = THREE.MathUtils.lerp(targetX, 0, acquireCenter);
    const centeredY = THREE.MathUtils.lerp(targetY, -7.5, acquireCenter);

    movingRef.current.position.x = THREE.MathUtils.damp(
      movingRef.current.position.x,
      centeredX,
      5.5,
      delta
    );

    movingRef.current.position.y = THREE.MathUtils.damp(
      movingRef.current.position.y,
      centeredY,
      5.5,
      delta
    );

    // =========================================
    // VISIBLE BUILDUP SCALE
    // =========================================

    const sizeStops = [
      [0, 1.95],
      [0.16, 2.4],
      [0.34, 1.1],
      [0.54, 1.85],
      [0.72, 1.05],
      [0.88, 2.35],
      [0.96, 2.6],
      [1, 2.0],
    ];
    let scrollScale = sizeStops[sizeStops.length - 1][1];
    for (let i = 0; i < sizeStops.length - 1; i += 1) {
      const [start, from] = sizeStops[i];
      const [end, to] = sizeStops[i + 1];
      if (p <= end) {
        scrollScale = THREE.MathUtils.lerp(
          from,
          to,
          THREE.MathUtils.smoothstep(p, start, end)
        );
        break;
      }
    }
    const targetScale = scrollScale + chargeVisible * 0.16;

    const nextScale = THREE.MathUtils.damp(
      movingRef.current.scale.x,
      targetScale,
      5,
      delta
    );

    movingRef.current.scale.setScalar(nextScale);

    // =========================================
    // BRIGHT BUILDUP LIGHT
    // =========================================

    if (buildupLightRef.current) {
      const lightIntensity =
        chargeVisible * (0.55 + pulse * 0.3) +
        Math.sin(explode * Math.PI) * 3;

      buildupLightRef.current.intensity =
        THREE.MathUtils.damp(
          buildupLightRef.current.intensity,
          lightIntensity,
          6,
          delta
        );
    }

    // =========================================
    // VISIBLE BLUE FRESNEL ENERGY HALO
    // =========================================

    if (glowShellRef.current && glowShellMatRef.current) {
      const haloScale = 1.08 + chargeVisible * 0.04;

      glowShellRef.current.scale.setScalar(haloScale);

      glowShellMatRef.current.uniforms.uCharge.value =
        chargeVisible;

      glowShellMatRef.current.uniforms.uPulse.value =
        pulse;
    }

    // =========================================
    // EXPANDING ENERGY RINGS
    // =========================================

    if (ringOneRef.current) {
      const ring = ringOneRef.current;

      ring.scale.setScalar(
        1.7 + chargeVisible * (0.25 + pulse * 0.35)
      );

      ring.material.opacity =
        chargeVisible * (0.018 + pulse * 0.012);

      ring.rotation.z = time * 0.12;
    }

    if (ringTwoRef.current) {
      const ring = ringTwoRef.current;

      ring.scale.setScalar(
        1.9 + chargeVisible * (0.3 + (1 - pulse) * 0.3)
      );

      ring.material.opacity =
        chargeVisible * (0.012 + (1 - pulse) * 0.01);

      ring.rotation.z = -time * 0.09;
    }

    // =========================================
    // EXISTING WHITE ENERGY TRAILS
    // =========================================

    energyMaterials.forEach((entry) => {
      const mat = entry.material;

      // Raise only the materials that support emission.
      // Restore their own original values outside buildup.
      if (entry.originalEmissive !== null) {
        const extraEmission =
          chargeVisible * (0.55 + pulse * 0.35);

        const targetEmission =
          entry.originalEmissive + extraEmission;

        mat.emissiveIntensity = THREE.MathUtils.damp(
          mat.emissiveIntensity,
          targetEmission,
          5,
          delta
        );
      }

      // Preserve each trail's original transparency.
      // Do not make the entire scene opaque.
      if (mat.transparent) {
        const targetOpacity = THREE.MathUtils.lerp(
          entry.originalOpacity,
          Math.min(1, entry.originalOpacity + 0.25),
          chargeVisible
        );

        mat.opacity = THREE.MathUtils.damp(
          mat.opacity,
          targetOpacity,
          5,
          delta
        );
      }
    });

    // =========================================
    // GLOWING INNER CORE
    // =========================================

    coreMaterial.opacity = THREE.MathUtils.damp(
      coreMaterial.opacity,
        0.16 +
        chargeVisible * 0.2 +
        pulse * chargeVisible * 0.06,
      5,
      delta
    );

    // =========================================
    // 07: ORIGINAL ROCK FRAGMENT EXPLOSION
    // =========================================

    fragments.forEach((fragment) => {
      const { mesh } = fragment;
      const outward = explode * fragment.distance;

      mesh.position
        .copy(fragment.basePosition)
        .addScaledVector(
          fragment.direction,
          outward
        );

      mesh.rotation.set(
        fragment.baseRotation.x +
          explode * fragment.spin.x * 2.2,
        fragment.baseRotation.y +
          explode * fragment.spin.y * 2.2,
        fragment.baseRotation.z +
          explode * fragment.spin.z * 2.2
      );
    });

    // =========================================
    // ORIGINAL CRYSTAL ANIMATION
    // =========================================

    if (crystalRef.current) {
      crystalRef.current.rotation.y = time * 0.08;

      crystalRef.current.position.y =
        Math.sin(time * 1.2) * 0.045;

      // Slight pulse without changing crystal material.
      const crystalPulse =
        1 + chargeVisible * (0.06 + pulse * 0.1);

      // Crystal disappears only during explosion.
      crystalRef.current.scale.setScalar(
        Math.max(0.001, (1 - explode) * crystalPulse)
      );
    }
  });

  // =========================================
  // RENDER
  // =========================================

  return (
    <group ref={movingRef} position={[0, 4.2, 0]}>
      <group ref={spinningRef}>
        {/* ORIGINAL BLENDER ENERGY ROCK */}
        <primitive object={model} />

        {/* Original strands exported from the Blender model. */}
        <primitive object={strandRig.group} />

        {/* ORIGINAL CRYSTAL */}
        <group ref={crystalRef}>
          <primitive object={crystal} />
        </group>

        {/* BUILDUP ENERGY HALO */}
        <mesh ref={glowShellRef}>
          <sphereGeometry args={[1, 32, 24]} />

          <shaderMaterial
            ref={glowShellMatRef}
            transparent
            depthWrite={false}
            depthTest={true}
            side={THREE.DoubleSide}
            blending={THREE.AdditiveBlending}
            uniforms={{
              uCharge: { value: 0 },
              uPulse: { value: 0 },
              uColor: {
                value: new THREE.Color("#b9efff"),
              },
            }}
            vertexShader={`
              varying vec3 vWorldNormal;
              varying vec3 vWorldPosition;

              void main() {
                vec4 worldPos = modelMatrix * vec4(position, 1.0);

                vWorldPosition = worldPos.xyz;
                vWorldNormal = normalize(
                  mat3(modelMatrix) * normal
                );

                gl_Position =
                  projectionMatrix *
                  viewMatrix *
                  worldPos;
              }
            `}
            fragmentShader={`
              uniform float uCharge;
              uniform float uPulse;
              uniform vec3 uColor;

              varying vec3 vWorldNormal;
              varying vec3 vWorldPosition;

              void main() {
                vec3 viewDirection = normalize(
                  cameraPosition - vWorldPosition
                );

                float fresnel = pow(
                  1.0 - abs(dot(
                    normalize(vWorldNormal),
                    viewDirection
                  )),
                  3.0
                );

                float glow =
                  fresnel *
                  uCharge *
                  (0.08 + uPulse * 0.05);

                gl_FragColor = vec4(
                  uColor,
                  glow
                );
              }
            `}
          />
        </mesh>

        {/* BUILDUP ENERGY RING ONE */}
        <mesh
          ref={ringOneRef}
          rotation={[0.35, 0.2, 0]}
        >
          <torusGeometry args={[1, 0.012, 8, 100]} />

          <meshBasicMaterial
            color="#d8f7ff"
            transparent
            opacity={0}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </mesh>

        {/* BUILDUP ENERGY RING TWO */}
        <mesh
          ref={ringTwoRef}
          rotation={[1.2, -0.3, 0]}
        >
          <torusGeometry args={[1, 0.01, 8, 100]} />

          <meshBasicMaterial
            color="#b9efff"
            transparent
            opacity={0}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      </group>

      {/* ENERGY BUILDUP LIGHT */}
      <pointLight
        ref={buildupLightRef}
        position={[0, 0, 1.4]}
        color="#b9efff"
        intensity={0}
        distance={8}
        decay={2}
      />

      {/* YOUR EXISTING LIGHTING */}
      {/* <ambientLight intensity={0.65} />

      <directionalLight
        position={[3, 5, 5]}
        intensity={1.8}
        color="#ffffff"
      />

      <directionalLight
        position={[-3, 1, 2]}
        intensity={0.5}
        color="#8bc5df"
      /> */}
    </group>
  );
}

useGLTF.preload(MODEL_URL);
useGLTF.preload(STRANDS_URL);
