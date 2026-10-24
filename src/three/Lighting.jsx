
export default function Lighting() {
  return (
    <>
      <ambientLight intensity={0.9} />

      <directionalLight
        position={[5, 7, 5]}
        intensity={2.5}
        color="#b9e5ff"
      />

      <pointLight
        position={[-3, 2, 4]}
        intensity={20}
        distance={15}
        color="#48baff"
      />
    </>
  );
}
