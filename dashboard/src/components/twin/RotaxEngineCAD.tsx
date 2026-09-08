import { useRef, useState, useMemo, useEffect } from 'react';
import { useFrame, type ThreeEvent } from '@react-three/fiber';
import { Html, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { useTwinStore } from '../../stores/twinStore';
import { useTelemetryStore } from '../../stores/telemetryStore';

interface SubAssemblyNode {
  name: string;
  mesh: THREE.Mesh;
  origPos: THREE.Vector3;
  explodeVector: THREE.Vector3;
  cylinderIndex?: number;
  category: string;
}

export function RotaxEngineCAD() {
  const groupRef = useRef<THREE.Group>(null!);
  const { scene } = useGLTF('/model_web.glb');

  const storeExplodedFactor = useTwinStore((s) => s.explodedFactor);
  const isAutoExploding = useTwinStore((s) => s.isAutoExploding);
  const setExplodedFactor = useTwinStore((s) => s.setExplodedFactor);
  const selectedPart = useTwinStore((s) => s.selectedPart);
  const setSelectedPart = useTwinStore((s) => s.setSelectedPart);
  const modelMode = useTwinStore((s) => s.modelMode);

  // Live Telemetry
  const telemetry = useTelemetryStore((s) => s.telemetry);
  const chtList = telemetry?.cht ?? [178.2, 182.1, 180.5, 176.8];
  const currentRpm = telemetry?.rpm ?? 2850;

  // Track hover state
  const [hoveredPart, setHoveredPart] = useState<string | null>(null);

  // Clone scene and classify sub-assemblies with explode vectors
  const { clonedScene, parts } = useMemo(() => {
    const cloned = scene.clone(true);
    const partList: SubAssemblyNode[] = [];

    // Calculate overall bounding box to center the model
    const bbox = new THREE.Box3().setFromObject(cloned);
    const center = new THREE.Vector3();
    bbox.getCenter(center);
    const size = new THREE.Vector3();
    bbox.getSize(size);

    // Center the cloned scene
    cloned.position.set(-center.x, -center.y, -center.z);

    // Traverse and assign materials and explosion vectors
    cloned.traverse((obj) => {
      if ((obj as THREE.Mesh).isMesh) {
        const mesh = obj as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        // Clone material so we can independently highlight / adjust wireframe / thermal glow
        if (Array.isArray(mesh.material)) {
          mesh.material = mesh.material.map((m) => m.clone());
        } else if (mesh.material) {
          mesh.material = mesh.material.clone();
        }

        const nameUpper = (mesh.name || obj.parent?.name || '').toUpperCase();
        const worldPos = new THREE.Vector3();
        mesh.getWorldPosition(worldPos);
        const relPos = worldPos.clone().sub(center);

        // Determine explode direction based on component name / assembly role
        const explodeVector = new THREE.Vector3();
        let cylIndex: number | undefined;
        let category = 'GENERAL';

        if (nameUpper.includes('CHASSIS') || nameUpper.includes('TUBE') || nameUpper.includes('TOURILLON') || nameUpper.includes('BOUCHON')) {
          category = 'CHASSIS';
          explodeVector.set(1.2, -0.4, 0).normalize();
        } else if (nameUpper.includes('CYL 1') || nameUpper.includes('CYL N°1') || nameUpper.includes('CYL N?1')) {
          category = 'CYLINDER 1';
          cylIndex = 0;
          explodeVector.set(-0.5, 0.4, 1.2).normalize();
        } else if (nameUpper.includes('CYL 2') || nameUpper.includes('CYL N°2') || nameUpper.includes('CYL N?2')) {
          category = 'CYLINDER 2';
          cylIndex = 1;
          explodeVector.set(-0.5, 0.4, -1.2).normalize();
        } else if (nameUpper.includes('CYL 3') || nameUpper.includes('CYL N°3') || nameUpper.includes('CYL N?3')) {
          category = 'CYLINDER 3';
          cylIndex = 2;
          explodeVector.set(0.5, 0.4, 1.2).normalize();
        } else if (nameUpper.includes('CYL 4') || nameUpper.includes('CYL N°4') || nameUpper.includes('CYL N?4')) {
          category = 'CYLINDER 4';
          cylIndex = 3;
          explodeVector.set(0.5, 0.4, -1.2).normalize();
        } else if (nameUpper.includes('CARBURATEUR') || nameUpper.includes('CARBU')) {
          category = 'CARBURETOR';
          explodeVector.set(0, 1.5, nameUpper.includes('DROIT') ? -0.8 : 0.8).normalize();
        } else if (nameUpper.includes('ECHAPPEMENT') || nameUpper.includes('BRIDE ECHAPPEMENT')) {
          category = 'EXHAUST';
          explodeVector.set(0, -1.4, nameUpper.includes('6446') ? 1.0 : -1.0).normalize();
        } else if (nameUpper.includes('HELICE') || nameUpper.includes('REDUCTEUR') || nameUpper.includes('CARTER REDUCTEUR')) {
          category = 'PROP / REDUCTION GEAR';
          explodeVector.set(-1.8, 0.2, 0).normalize();
        } else if (nameUpper.includes('POMPE') || nameUpper.includes('EAU') || nameUpper.includes('HUILE')) {
          category = 'COOLING / PUMPS';
          explodeVector.set(0, -1.0, 0.6).normalize();
        } else if (nameUpper.includes('ALTERNATEUR')) {
          category = 'ELECTRICAL';
          explodeVector.set(1.0, 0.5, 0.5).normalize();
        } else {
          // Radial explosion from center
          explodeVector.copy(relPos).normalize();
          if (explodeVector.lengthSq() < 0.01) explodeVector.set(0, 1, 0);
        }

        partList.push({
          name: mesh.name || obj.parent?.name || 'Rotax Component',
          mesh,
          origPos: mesh.position.clone(),
          explodeVector,
          cylinderIndex: cylIndex,
          category,
        });
      }
    });

    return { clonedScene: cloned, parts: partList };
  }, [scene]);

  // Update wireframe property when modelMode changes
  useEffect(() => {
    parts.forEach(({ mesh }) => {
      const isWire = modelMode === 'WIREFRAME';
      if (Array.isArray(mesh.material)) {
        mesh.material.forEach((mat) => {
          if ('wireframe' in mat) (mat as THREE.MeshStandardMaterial).wireframe = isWire;
        });
      } else if (mesh.material && 'wireframe' in mesh.material) {
        (mesh.material as THREE.MeshStandardMaterial).wireframe = isWire;
      }
    });
  }, [modelMode, parts]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();

    // Auto-explode breathing oscillation
    let factor = storeExplodedFactor;
    if (isAutoExploding) {
      factor = (Math.sin(t * 0.7) + 1.0) / 2.0;
      setExplodedFactor(factor);
    }

    // Engine crank vibration jitter
    if (groupRef.current && currentRpm > 400) {
      const vib = Math.min(0.04, (currentRpm / 5800) * 0.025);
      groupRef.current.position.y = Math.sin(t * 40.0) * vib;
    }

    // Explode parts along their spatial vectors and update emissive shader state
    const explodeDistance = 3.5;
    parts.forEach((p) => {
      const targetX = p.origPos.x + p.explodeVector.x * factor * explodeDistance;
      const targetY = p.origPos.y + p.explodeVector.y * factor * explodeDistance;
      const targetZ = p.origPos.z + p.explodeVector.z * factor * explodeDistance;

      // Smooth interpolation for smooth 60fps exploded motion
      p.mesh.position.x = THREE.MathUtils.lerp(p.mesh.position.x, targetX, 0.12);
      p.mesh.position.y = THREE.MathUtils.lerp(p.mesh.position.y, targetY, 0.12);
      p.mesh.position.z = THREE.MathUtils.lerp(p.mesh.position.z, targetZ, 0.12);

      // Emissive highlights & live thermal cylinder head shaders
      const mat = (Array.isArray(p.mesh.material) ? p.mesh.material[0] : p.mesh.material) as THREE.MeshStandardMaterial;
      if (!mat || !('emissive' in mat)) return;

      const isSelected = selectedPart === p.name;
      const isHovered = hoveredPart === p.name;

      if (isSelected) {
        mat.emissive.setHex(0x00f5d4);
        mat.emissiveIntensity = 2.4 + Math.sin(t * 6.0) * 0.7;
      } else if (isHovered) {
        mat.emissive.setHex(0x38bdf8);
        mat.emissiveIntensity = 1.3;
      } else if (p.cylinderIndex !== undefined) {
        const cylTemp = chtList[p.cylinderIndex] ?? 180;
        if (cylTemp > 215.0) {
          // Critical overheat pulsing red glow
          mat.emissive.setHex(0xff173d);
          mat.emissiveIntensity = 2.6 + Math.sin(t * 5.0) * 0.9;
        } else if (cylTemp > 200.0) {
          // Warning elevated amber glow
          mat.emissive.setHex(0xf59e0b);
          mat.emissiveIntensity = 1.4;
        } else {
          mat.emissive.setHex(0x000000);
          mat.emissiveIntensity = 0;
        }
      } else {
        mat.emissive.setHex(0x000000);
        mat.emissiveIntensity = 0;
      }
    });
  });

  const handlePointerDown = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    const hitMesh = e.object as THREE.Mesh;
    const partName = hitMesh.name || hitMesh.parent?.name;
    if (partName) {
      setSelectedPart(selectedPart === partName ? null : partName);
    }
  };

  const handlePointerOver = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    const hitMesh = e.object as THREE.Mesh;
    const partName = hitMesh.name || hitMesh.parent?.name;
    if (partName) {
      setHoveredPart(partName);
    }
  };

  const handlePointerOut = () => {
    setHoveredPart(null);
  };

  return (
    <group
      ref={groupRef}
      scale={[14.0, 14.0, 14.0]}
      position={[0, 0, 0]}
      rotation={[0.15, -0.65, 0]}
      onPointerDown={handlePointerDown}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
    >
      <primitive object={clonedScene} />

      {/* Floating Selected CAD Part Tooltip */}
      {selectedPart && (
        <Html position={[0, 0.45, 0]} center distanceFactor={18}>
          <div className="bg-emerald-950/95 text-white border border-emerald-500/80 px-4 py-2 rounded-2xl shadow-2xl font-mono text-xs flex items-center gap-2.5 whitespace-nowrap backdrop-blur-md pointer-events-none animate-fadeIn">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
            <span className="font-bold text-emerald-300">CAD GLB Node:</span>
            <span className="font-semibold text-white">{selectedPart}</span>
          </div>
        </Html>
      )}
    </group>
  );
}

useGLTF.preload('/model_web.glb');
