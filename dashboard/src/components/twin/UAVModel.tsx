import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import type { TwinVisualizationState } from '../../models/engine';
import { useTwinStore } from '../../stores/twinStore';

interface UAVModelProps {
  twinState: TwinVisualizationState | null;
}

interface ActiveGlowZones {
  glowProp: boolean;
  glowMotor: boolean;
  glowWings: boolean;
  glowMissiles: boolean;
  glowFrontHead: boolean;
  hasAnyGlow: boolean;
  isColdIcing: boolean;
  isPropIcing: boolean;
}

function DroneMesh({
  url,
  isWireframe,
  twinState,
  glowZones,
}: {
  url: string;
  isWireframe: boolean;
  twinState: TwinVisualizationState | null;
  glowZones: ActiveGlowZones;
}) {
  const propRefs = useRef<THREE.Object3D[]>([]);
  const categorizedMeshRefs = useRef<{
    prop: THREE.Mesh[];
    motor: THREE.Mesh[];
    wings: THREE.Mesh[];
    missiles: THREE.Mesh[];
    frontHead: THREE.Mesh[];
  }>({
    prop: [],
    motor: [],
    wings: [],
    missiles: [],
    frontHead: []
  });

  const { scene } = useGLTF(url);

  const clonedScene = useMemo(() => {
    const c = scene.clone(true);
    propRefs.current = [];
    categorizedMeshRefs.current = {
      prop: [],
      motor: [],
      wings: [],
      missiles: [],
      frontHead: []
    };

    // Auto-center and normalize scale
    const box = new THREE.Box3().setFromObject(c);
    const size = new THREE.Vector3();
    box.getSize(size);
    const center = new THREE.Vector3();
    box.getCenter(center);

    // Center model at origin
    c.position.x -= center.x;
    c.position.y -= center.y;
    c.position.z -= center.z;

    const maxDim = Math.max(size.x, size.y, size.z);
    if (maxDim > 0) {
      const targetScale = 22.0 / maxDim;
      c.scale.set(targetScale, targetScale, targetScale);
    }

    // Traverse and categorize meshes into 5 specific fault zones
    c.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = !isWireframe;
        child.receiveShadow = !isWireframe;

        if (child.material) {
          if (Array.isArray(child.material)) {
            child.material = child.material.map((m) => {
              const cloneMat = m.clone();
              if (isWireframe) cloneMat.wireframe = true;
              return cloneMat;
            });
          } else {
            const cloneMat = child.material.clone();
            if (isWireframe) cloneMat.wireframe = true;
            child.material = cloneMat;
          }
        }

        const nameLower = (child.name || '').toLowerCase();
        const posX = Math.abs(child.position.x);
        const posY = child.position.y;
        const posZ = child.position.z;

        const isProp = nameLower.includes('prop') || nameLower.includes('rotor') || nameLower.includes('blade') || nameLower.includes('spinner');
        const isMissile = nameLower.includes('missile') || nameLower.includes('pylon') || nameLower.includes('weapon') || nameLower.includes('rail') || nameLower.includes('bomb') || (posX > 1.8 && posX < 4.8 && posY < -0.1);
        const isFrontHead = nameLower.includes('nose') || nameLower.includes('radome') || nameLower.includes('sensor') || nameLower.includes('camera') || nameLower.includes('gimbal') || nameLower.includes('head') || (posZ > 2.5);
        const isMotor = nameLower.includes('engine') || nameLower.includes('motor') || nameLower.includes('exhaust') || nameLower.includes('nacelle') || (posX < 1.8 && posZ < 0.5 && posZ > -3.2);
        const isWing = nameLower.includes('wing') || nameLower.includes('airfoil') || nameLower.includes('aileron') || (posX >= 4.0);

        if (isProp) {
          propRefs.current.push(child);
          categorizedMeshRefs.current.prop.push(child);
        } else if (isMissile) {
          categorizedMeshRefs.current.missiles.push(child);
        } else if (isFrontHead) {
          categorizedMeshRefs.current.frontHead.push(child);
        } else if (isMotor) {
          categorizedMeshRefs.current.motor.push(child);
        } else if (isWing) {
          categorizedMeshRefs.current.wings.push(child);
        }
      }
    });

    return c;
  }, [scene, isWireframe]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();

    // 1. Spin propeller meshes matching real-time RPM
    const rpm = twinState ? twinState.rpm : 2850;
    const spinDelta = (rpm / 60) * 0.04;
    propRefs.current.forEach((prop) => {
      prop.rotation.z += spinDelta;
    });

    // 2. Smooth pulsating emissive intensity (breathing oscillation at 4.5 Hz)
    const pulse = Math.sin(t * 4.5) * 0.45 + 0.55;
    const glowIntensity = pulse * 3.5 + 1.2;

    const isCold = glowZones.isColdIcing;
    const isPropIce = glowZones.isPropIcing;

    const applyGlowToMeshes = (meshes: THREE.Mesh[], shouldGlow: boolean, colorHex: number) => {
      meshes.forEach((mesh) => {
        if (mesh.material) {
          const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
          mats.forEach((mat: any) => {
            if (shouldGlow && mat.emissive) {
              mat.emissive.setHex(colorHex);
              mat.emissiveIntensity = glowIntensity;
            } else if (mat.emissive) {
              mat.emissive.setHex(0x000000);
              mat.emissiveIntensity = 0;
            }
          });
        }
      });
    };

    // Propeller turns cold ice-blue (0x00d4ff) during propeller icing or general icing, otherwise red/amber on mechanical faults
    const propColorHex = (isPropIce || isCold) ? 0x00d4ff : 0xff0022;

    applyGlowToMeshes(categorizedMeshRefs.current.prop, glowZones.glowProp, propColorHex);
    applyGlowToMeshes(categorizedMeshRefs.current.motor, glowZones.glowMotor, isCold ? 0x00b4d8 : 0xff2200);
    applyGlowToMeshes(categorizedMeshRefs.current.wings, glowZones.glowWings, isCold ? 0x00e5ff : 0xff0033);
    applyGlowToMeshes(categorizedMeshRefs.current.missiles, glowZones.glowMissiles, isCold ? 0x0284c7 : 0xff0044);
    applyGlowToMeshes(categorizedMeshRefs.current.frontHead, glowZones.glowFrontHead, isCold ? 0x38bdf8 : 0xff0022);
  });

  return <primitive object={clonedScene} />;
}

export function UAVModel({ twinState }: UAVModelProps) {
  const groupRef = useRef<THREE.Group>(null!);
  const modelMode = useTwinStore((s) => s.modelMode);

  // Light pulse reference for smooth point light breathing
  const propLightRef = useRef<THREE.PointLight>(null!);
  const motorLightRef = useRef<THREE.PointLight>(null!);
  const leftWingLightRef = useRef<THREE.PointLight>(null!);
  const rightWingLightRef = useRef<THREE.PointLight>(null!);
  const leftMissileLightRef = useRef<THREE.PointLight>(null!);
  const rightMissileLightRef = useRef<THREE.PointLight>(null!);
  const frontHeadLightRef = useRef<THREE.PointLight>(null!);

  // Compute individual active fault glow zones based on real-time telemetry & active scenario
  const fault = (twinState?.active_fault || '').toUpperCase();
  const rpm = twinState?.rpm || 2850;
  const isLubricationFault = twinState?.lubrication_state === 'CRITICAL' || twinState?.lubrication_state === 'DEGRADED';
  const isHighVibration = twinState?.vibration_state === 'HIGH';
  const isHighThermal = twinState?.thermal_state === 'CRITICAL' || twinState?.thermal_state === 'HIGH';

  // Propeller-only Icing: turns ONLY the propeller cold blue and pulses
  const isPropIcing = fault.includes('PROPELLER_ICING') || fault.includes('PROP_ICING') || (fault.includes('PROP') && fault.includes('ICE'));
  
  // General High-Altitude Icing across other components
  const isColdIcing = !isPropIcing && (fault.includes('ICING') || fault.includes('COLD') || fault.includes('FREEZE'));

  const isFullAirframe = fault.includes('FULL_AIRFRAME') || (twinState?.health_index !== undefined && twinState.health_index < 45);

  // 1. Propeller end of the drone (Glows blue when Propeller Icing is active)
  const glowProp = isFullAirframe || isPropIcing || isColdIcing || fault.includes('PROP') || fault.includes('OVERSPEED') || rpm > 5600;

  // 2. Middle of the drone, motor / engine core (Does NOT glow during propeller-only icing)
  const glowMotor = isFullAirframe || isColdIcing || fault.includes('MOTOR') || fault.includes('OVERHEAT') || fault.includes('LUBRICATION') || fault.includes('INJECTOR') || fault.includes('MISFIRE') || isHighThermal || isLubricationFault;

  // 3. Wings (left & right) (Does NOT glow during propeller-only icing)
  const glowWings = isFullAirframe || isColdIcing || fault.includes('WING') || (isHighVibration && !fault.includes('PROP') && !isPropIcing);

  // 4. Missiles in the bottom of the wings (underwing pylons)
  const glowMissiles = isFullAirframe || fault.includes('MISSILE') || fault.includes('HARDPOINT') || fault.includes('PYLON') || fault.includes('WEAPON');

  // 5. Front head of the drone (nose radome & pitot sensor pod) (Does NOT glow during propeller-only icing)
  const glowFrontHead = isFullAirframe || isColdIcing || fault.includes('AVIONICS') || fault.includes('RADAR') || fault.includes('SENSOR') || fault.includes('NOSE') || fault.includes('PITOT');

  const hasAnyGlow = glowProp || glowMotor || glowWings || glowMissiles || glowFrontHead;

  const glowZones: ActiveGlowZones = {
    glowProp,
    glowMotor,
    glowWings,
    glowMissiles,
    glowFrontHead,
    hasAnyGlow,
    isColdIcing,
    isPropIcing
  };

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();

    if (groupRef.current) {
      // Smooth loiter hover
      groupRef.current.position.y = Math.sin(t * 1.2) * 0.25;

      // Real-time vibration harmonic shake when any fault is active
      if (hasAnyGlow) {
        groupRef.current.position.x = Math.sin(t * 26) * 0.08;
        groupRef.current.position.z = Math.cos(t * 30) * 0.05;
        groupRef.current.rotation.z = Math.sin(t * 24) * 0.02;
      } else {
        groupRef.current.position.x = 0;
        groupRef.current.position.z = 0;
        groupRef.current.rotation.z = 0;
      }
    }

    // Smooth pulse on active spatial point lights
    const lightPulse = Math.sin(t * 4.5) * 0.45 + 0.55;
    if (propLightRef.current) propLightRef.current.intensity = 18 * lightPulse;
    if (motorLightRef.current) motorLightRef.current.intensity = 20 * lightPulse;
    if (leftWingLightRef.current) leftWingLightRef.current.intensity = 16 * lightPulse;
    if (rightWingLightRef.current) rightWingLightRef.current.intensity = 16 * lightPulse;
    if (leftMissileLightRef.current) leftMissileLightRef.current.intensity = 16 * lightPulse;
    if (rightMissileLightRef.current) rightMissileLightRef.current.intensity = 16 * lightPulse;
    if (frontHeadLightRef.current) frontHeadLightRef.current.intensity = 18 * lightPulse;
  });

  // Choose light colors: Cold Cyan-Blue (#00d4ff) for propeller/cold icing, vivid Red for mechanical/thermal alerts
  const propColor = (isPropIcing || isColdIcing) ? "#00d4ff" : "#ff0022";
  const motorColor = isColdIcing ? "#00b4d8" : "#ff2200";
  const wingColor = isColdIcing ? "#00e5ff" : "#ff0033";
  const missileColor = isColdIcing ? "#0284c7" : "#ff0044";
  const frontHeadColor = isColdIcing ? "#38bdf8" : "#ff0022";

  return (
    <group ref={groupRef} rotation={[0.2, -0.55, 0]}>
      {modelMode === 'WIREFRAME' ? (
        <DroneMesh
          key="wireframe"
          url="/tapas_drone_wireframe.glb"
          isWireframe={true}
          twinState={twinState}
          glowZones={glowZones}
        />
      ) : (
        <DroneMesh
          key="solid"
          url="/mq-1_predator_uav.glb"
          isWireframe={false}
          twinState={twinState}
          glowZones={glowZones}
        />
      )}

      {/* Point lights mapped exclusively to each individual active fault point with pulsing */}
      {/* 1. PROPELLER END FAULT GLOW */}
      {glowProp && (
        <pointLight
          ref={propLightRef}
          position={[0, 1.8, -4.7]}
          color={propColor}
          intensity={18}
          distance={5.5}
        />
      )}

      {/* 2. MOTOR CORE (MIDDLE OF DRONE) FAULT GLOW */}
      {glowMotor && (
        <pointLight
          ref={motorLightRef}
          position={[0, 1.3, -1.8]}
          color={motorColor}
          intensity={20}
          distance={6.0}
        />
      )}

      {/* 3. WINGS (LEFT & RIGHT) FAULT GLOW */}
      {glowWings && (
        <>
          <pointLight
            ref={leftWingLightRef}
            position={[-7.5, 0.7, -0.2]}
            color={wingColor}
            intensity={16}
            distance={6.5}
          />
          <pointLight
            ref={rightWingLightRef}
            position={[7.5, 0.7, -0.2]}
            color={wingColor}
            intensity={16}
            distance={6.5}
          />
        </>
      )}

      {/* 4. MISSILES AT BOTTOM OF WINGS FAULT GLOW */}
      {glowMissiles && (
        <>
          <pointLight
            ref={leftMissileLightRef}
            position={[-3.2, -0.6, 0.1]}
            color={missileColor}
            intensity={16}
            distance={4.8}
          />
          <pointLight
            ref={rightMissileLightRef}
            position={[3.2, -0.6, 0.1]}
            color={missileColor}
            intensity={16}
            distance={4.8}
          />
        </>
      )}

      {/* 5. FRONT HEAD OF THE DRONE FAULT GLOW */}
      {glowFrontHead && (
        <pointLight
          ref={frontHeadLightRef}
          position={[0, 0.8, 4.2]}
          color={frontHeadColor}
          intensity={18}
          distance={5.5}
        />
      )}
    </group>
  );
}

useGLTF.preload('/mq-1_predator_uav.glb');
useGLTF.preload('/tapas_drone_wireframe.glb');
