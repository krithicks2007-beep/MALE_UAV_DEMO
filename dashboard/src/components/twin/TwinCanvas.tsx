import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, ContactShadows } from '@react-three/drei';
import { UAVModel } from './UAVModel';
import type { TwinVisualizationState } from '../../models/engine';

interface TwinCanvasProps {
  twinState: TwinVisualizationState | null;
}

export function TwinCanvas({ twinState }: TwinCanvasProps) {
  return (
    <Canvas
      camera={{ position: [20, 13, 24], fov: 45, near: 0.1, far: 1000 }}
      gl={{ alpha: true, antialias: true }}
      style={{ background: 'transparent' }}
      className="twin-canvas w-full h-full"
    >
      <ambientLight intensity={0.9} />
      <directionalLight position={[15, 25, 15]} intensity={1.4} castShadow />
      <directionalLight position={[-10, 10, -10]} intensity={0.6} />
      <hemisphereLight intensity={0.5} groundColor="#1a2520" color="#ffffff" />



      <Suspense fallback={null}>
        <UAVModel twinState={twinState} />
        <ContactShadows
          position={[0, -5, 0]}
          opacity={0.4}
          scale={30}
          blur={2}
          far={10}
        />
      </Suspense>

      <OrbitControls
        enableZoom={true}
        enablePan={false}
        minDistance={8}
        maxDistance={50}
        zoomSpeed={0.7}
        enableDamping={true}
        dampingFactor={0.05}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 2}
        autoRotate={false}
      />
    </Canvas>
  );
}
