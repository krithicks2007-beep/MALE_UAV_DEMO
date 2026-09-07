import { Suspense, useRef, useImperativeHandle, forwardRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, ContactShadows } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { UAVModel } from './UAVModel';
import type { TwinVisualizationState } from '../../models/engine';

export interface TwinCanvasRef {
  resetCamera: () => void;
  setTopView: () => void;
  setBottomView: () => void;
  setFrontView: () => void;
  setRearView: () => void;
}

interface TwinCanvasProps {
  twinState: TwinVisualizationState | null;
}

export const TwinCanvas = forwardRef<TwinCanvasRef, TwinCanvasProps>(function TwinCanvas(
  { twinState },
  ref
) {
  const controlsRef = useRef<OrbitControlsImpl>(null!);

  useImperativeHandle(ref, () => ({
    resetCamera: () => {
      if (controlsRef.current) {
        controlsRef.current.object.position.set(20, 13, 24);
        controlsRef.current.target.set(0, 0, 0);
        controlsRef.current.update();
      }
    },
    setTopView: () => {
      if (controlsRef.current) {
        controlsRef.current.object.position.set(0, 32, 0.01);
        controlsRef.current.target.set(0, 0, 0);
        controlsRef.current.update();
      }
    },
    setBottomView: () => {
      if (controlsRef.current) {
        controlsRef.current.object.position.set(0, -32, 0.01);
        controlsRef.current.target.set(0, 0, 0);
        controlsRef.current.update();
      }
    },
    setFrontView: () => {
      if (controlsRef.current) {
        controlsRef.current.object.position.set(0, 2, 32);
        controlsRef.current.target.set(0, 0, 0);
        controlsRef.current.update();
      }
    },
    setRearView: () => {
      if (controlsRef.current) {
        controlsRef.current.object.position.set(0, 4, -32);
        controlsRef.current.target.set(0, 0, 0);
        controlsRef.current.update();
      }
    }
  }));

  return (
    <Canvas
      camera={{ position: [20, 13, 24], fov: 45, near: 0.1, far: 1000 }}
      gl={{ alpha: true, antialias: true }}
      style={{ background: 'transparent' }}
      className="twin-canvas w-full h-full"
    >
      {/* Top & Ambient Lighting */}
      <ambientLight intensity={1.1} />
      <directionalLight position={[15, 25, 15]} intensity={1.4} castShadow />
      <directionalLight position={[-10, 10, -10]} intensity={0.8} />
      <hemisphereLight intensity={0.6} groundColor="#1a2520" color="#ffffff" />

      {/* Underside / Bottom Fill Lighting (Illuminates belly, payloads, underwing pylons) */}
      <directionalLight position={[0, -25, 0]} intensity={1.2} />
      <directionalLight position={[-15, -15, 15]} intensity={0.8} />
      <directionalLight position={[15, -15, -15]} intensity={0.8} />

      <Suspense fallback={null}>
        <UAVModel twinState={twinState} />
        <ContactShadows
          position={[0, -5, 0]}
          opacity={0.35}
          scale={32}
          blur={2.2}
          far={12}
        />
      </Suspense>

      {/* Unrestricted 360-degree all-axis orbital navigation */}
      <OrbitControls
        ref={controlsRef}
        enableZoom={true}
        enablePan={true}
        minDistance={3}
        maxDistance={65}
        zoomSpeed={0.8}
        enableDamping={true}
        dampingFactor={0.06}
        minPolarAngle={0}          /* Allows full rotation straight to the top (0°) */
        maxPolarAngle={Math.PI}    /* Allows full rotation straight to the bottom/underside (180°) */
        autoRotate={false}
      />
    </Canvas>
  );
});
