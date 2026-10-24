
import { useMemo, useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";

// -------------------------------------
// MODEL
// -------------------------------------

const MODEL_URL =
  "/models/Energy_Rock_Web_Export.glb";

// -------------------------------------
// CRYSTAL SETTINGS
// -------------------------------------

const CRYSTAL_SIZE = 0.85;

// Z position keeps crystal visible
// near the front of the energy rock.

const CRYSTAL_POSITION = [0, 0, 0];

// -------------------------------------
// HIDDEN WATER EFFECTS
// -------------------------------------

const HIDDEN_EFFECTS = [
  "underwater_atmospheric_depth",
  "underwater_volumetric_haze",
  "underwater_depth_atmosphere",
  "underwater_haze",
  "impact_bloom_bubble",
  "descent_trail_bubble",
  "rising_bubble",
  "foam_arc",
  "plasma_splash",
  "surface_wake",
  "surface_splash",
  "impact_splash",
  "dark_animated_ocean",
  "spray_droplet",
  "spreading_water_ring",
];

// -------------------------------------
// COMPONENT
// -------------------------------------

export default function EnergyRock({
  scrollProgress = 0,
}) {
  const { scene } = useGLTF(MODEL_URL);

  const movingRef = useRef(null);
  const spinningRef = useRef(null);
  const crystalRef = useRef(null);

  // -------------------------------------
  // CREATE ROCK AND CRYSTAL
  // -------------------------------------

  const { model, crystal } = useMemo(() => {
    // Clone original GLB scene
    const rock = scene.clone(true);

    // Hide unwanted underwater effects
    rock.traverse((obj) => {
      const name = obj.name.toLowerCase();

      const shouldHide = HIDDEN_EFFECTS.some(
        (effect) => name.includes(effect)
      );

      if (shouldHide) {
        obj.visible = false;
      }
    });

    // -------------------------------------
    // LOW-POLY CRYSTAL GEOMETRY
    // -------------------------------------

    // 0 subdivisions = sharp triangular faces.
    // This is a new mesh designed to approximate
    // the target screenshot's crystal shape.

    const geometry =
      new THREE.IcosahedronGeometry(1, 0);

    // -------------------------------------
    // BLUE CRYSTAL MATERIAL
    // -------------------------------------

  const material = new THREE.MeshPhysicalMaterial({
  color: "#3998c421",

  metalness: 0.15,
  roughness: 0.24,

  flatShading: true,

  clearcoat: 0.7,
  clearcoatRoughness: 0.15,

  emissive: "#0879B5",
  emissiveIntensity: 0.22,

  transparent: false,

  depthTest: true,
  depthWrite: true,

  side: THREE.FrontSide,
});

    // -------------------------------------
    // CREATE CRYSTAL MESH
    // -------------------------------------

    const crystalMesh = new THREE.Mesh(
      geometry,
      material
    );

    crystalMesh.name = "CenterBlueCrystal";

    // Keep crystal visible above
    // surrounding energy trails
    crystalMesh.renderOrder = 1000;

    crystalMesh.castShadow = false;
    crystalMesh.receiveShadow = false;

    // -------------------------------------
    // CRYSTAL ORIENTATION
    // -------------------------------------

    // Rotate slightly to expose
    // triangular faces.

    crystalMesh.rotation.set(
      0.15,
      0.35,
      0.1
    );

    // -------------------------------------
    // CRYSTAL HOLDER
    // -------------------------------------

    const crystalHolder = new THREE.Group();

    crystalHolder.add(crystalMesh);
    // Soft glowing inner core
const coreGeometry = new THREE.IcosahedronGeometry(
  0.48,
  0
);

const coreMaterial = new THREE.MeshBasicMaterial({
  color: "#53DFFF",
  transparent: true,
  opacity: 0.16,
  depthWrite: false,
});

const glowingCore = new THREE.Mesh(
  coreGeometry,
  coreMaterial
);

crystalHolder.add(glowingCore);

    crystalHolder.scale.setScalar(
      CRYSTAL_SIZE
    );

    crystalHolder.position.set(
      ...CRYSTAL_POSITION
    );

    return {
      model: rock,
      crystal: crystalHolder,
    };
  }, [scene]);

  // -------------------------------------
  // CLEAN UP GENERATED GEOMETRY
  // -------------------------------------

  useEffect(() => {
    return () => {
      if (!crystal) return;

      crystal.traverse((obj) => {
        if (obj.isMesh) {
          obj.geometry?.dispose();

          if (Array.isArray(obj.material)) {
            obj.material.forEach((mat) =>
              mat.dispose()
            );
          } else {
            obj.material?.dispose();
          }
        }
      });
    };
  }, [crystal]);

  // -------------------------------------
  // ANIMATION
  // -------------------------------------

  useFrame(({ clock }, delta) => {
    if (
      !movingRef.current ||
      !spinningRef.current
    ) {
      return;
    }

    const p = THREE.MathUtils.clamp(
      scrollProgress,
      0,
      1
    );

    // -------------------------------------
    // CONTINUOUS ROCK ROTATION
    // -------------------------------------

    spinningRef.current.rotation.y +=
      delta * 0.17;

    // -------------------------------------
    // SCROLL-BASED X ROTATION
    // -------------------------------------

    const targetRotationX =
      p * Math.PI * 0.55;

    movingRef.current.rotation.x =
      THREE.MathUtils.damp(
        movingRef.current.rotation.x,
        targetRotationX,
        4,
        delta
      );

    // -------------------------------------
    // SMOOTH UNDERWATER DESCENT
    // -------------------------------------

    const dive = THREE.MathUtils.smoothstep(
      p,
      0.08,
      0.86
    );

    const targetY = THREE.MathUtils.lerp(
      1.65,
      -3.65,
      dive
    );

    movingRef.current.position.y =
      THREE.MathUtils.damp(
        movingRef.current.position.y,
        targetY,
        5,
        delta
      );

    // -------------------------------------
    // CRYSTAL ROTATION
    // -------------------------------------

   if (crystalRef.current) {
  const time = clock.getElapsedTime();

  // Gentle rotation
  crystalRef.current.rotation.y = time * 0.08;

  // Very subtle floating
  crystalRef.current.position.y =
    Math.sin(time * 1.2) * 0.045;
}
  });

  // -------------------------------------
  // RENDER
  // -------------------------------------

  return (
    <group
      ref={movingRef}
      position={[0, 1.65, 0]}
    >
      <group ref={spinningRef}>
        {/* Original energy rock */}
        <primitive object={model} />

        {/* Blue faceted crystal */}
        {crystal && (
          <group ref={crystalRef}>
            <primitive object={crystal} />
          </group>
        )}
      </group>

      {/* Crystal lighting */}
      <ambientLight intensity={0.65} />

      <directionalLight
        position={[3, 5, 5]}
        intensity={1.8}
        color="#ffffff"
      />

      <directionalLight
        position={[-3, 1, 2]}
        intensity={0.5}
        color="#8bc5df"
      />
    </group>
  );
}

// -------------------------------------
// PRELOAD MODEL
// -------------------------------------

useGLTF.preload(MODEL_URL);
