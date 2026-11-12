
export default function Lighting() {
  return (
    <>
      <ambientLight intensity={0.55} />

      <directionalLight
        position={[4, 6, 3]}
        intensity={2.2}
        color="#e6f2ff"
        castShadow={false}
      />

      <directionalLight
        position={[-3, 2, -4]}
        intensity={0.85}
        color="#b6d4f2"
      />

      <pointLight
        position={[0, 1.5, 2]}
        intensity={0.55}
        color="#b9dfff"
      />
    </>
  );
}
