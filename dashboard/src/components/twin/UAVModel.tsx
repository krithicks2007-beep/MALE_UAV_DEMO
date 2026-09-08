import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import type { TwinVisualizationState } from '../../models/engine';
import { useTwinStore } from '../../stores/twinStore';
import { useTelemetryStore } from '../../stores/telemetryStore';
import { useDiagnosticsStore } from '../../stores/diagnosticsStore';
import { useScenarioStore } from '../../stores/scenarioStore';

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
  twinState: _twinState,
  glowZones,
}: {
  url: string;
  isWireframe: boolean;
  twinState: TwinVisualizationState | null;
  glowZones: ActiveGlowZones;
}) {
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

    // Force update matrix so bounding boxes can be evaluated accurately
    c.updateMatrixWorld(true);

    // Traverse and categorize meshes into 5 specific fault zones using exact 3D bounding coordinates
    c.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = !isWireframe;
        child.receiveShadow = !isWireframe;

        if (child.material) {
          const cloneAndInit = (m: THREE.Material) => {
            const cloneMat = m.clone();
            if (isWireframe) (cloneMat as any).wireframe = true;
            // Strict nominal state initialization: zero emissive glow, original authentic texture & color
            if ((cloneMat as any).emissive) {
              (cloneMat as any).emissive.setHex(0x000000);
              (cloneMat as any).emissiveIntensity = 0;
            }
            return cloneMat;
          };

          if (Array.isArray(child.material)) {
            child.material = child.material.map(cloneAndInit);
          } else {
            child.material = cloneAndInit(child.material);
          }
        }

        // Calculate exact mesh center and bounds in 3D scene space
        const childBox = new THREE.Box3().setFromObject(child);
        const childCenter = new THREE.Vector3();
        childBox.getCenter(childCenter);

        const nameLower = (child.name || '').toLowerCase();
        const dimX = childBox.max.x - childBox.min.x;
        const minX = childBox.min.x;
        const maxX = childBox.max.x;
        const posX = Math.abs(childCenter.x);
        const posY = childCenter.y;
        const posZ = childCenter.z;

        // 1. Propeller (Object_19 pusher spinner & blades at aft)
        const isProp =
          child.name === 'Object_19' ||
          nameLower === 'object_19' ||
          (nameLower.includes('prop') && !nameLower.includes('boom')) ||
          nameLower.includes('rotor') ||
          nameLower.includes('spinner') ||
          nameLower.includes('pusher_blade') ||
          (posZ < -3.2 && posX < 0.5 && posY > -0.7 && posY < 0.1);

        // 2. Missiles & Underwing Pylons (Object_15, Object_18)
        const isMissile =
          !isProp &&
          (child.name === 'Object_15' ||
          child.name === 'Object_18' ||
          nameLower === 'object_15' ||
          nameLower === 'object_18' ||
          nameLower.includes('missile') ||
          nameLower.includes('pylon') ||
          nameLower.includes('weapon') ||
          nameLower.includes('rail') ||
          nameLower.includes('bomb') ||
          nameLower.includes('agm') ||
          nameLower.includes('hellfire') ||
          nameLower.includes('payload') ||
          (dimX > 2.0 && dimX < 7.0 && posY < 0.0 && posZ >= -1.0 && posZ <= 1.2));

        // 3. Wings (Outer & Main Wings, Wingtips, Ailerons, Flaps, Span)
        const isWing =
          !isProp &&
          !isMissile &&
          (child.name === 'Object_3' ||
          child.name === 'Object_4' ||
          child.name === 'Object_5' ||
          child.name === 'Object_10' ||
          child.name === 'Object_13' ||
          child.name === 'Object_14' ||
          child.name === 'Object_16' ||
          child.name === 'Object_17' ||
          nameLower === 'object_3' ||
          nameLower === 'object_4' ||
          nameLower === 'object_5' ||
          nameLower === 'object_10' ||
          nameLower === 'object_13' ||
          nameLower === 'object_14' ||
          nameLower === 'object_16' ||
          nameLower === 'object_17' ||
          nameLower.includes('wing') ||
          nameLower.includes('airfoil') ||
          nameLower.includes('aileron') ||
          nameLower.includes('flap') ||
          nameLower.includes('spar') ||
          nameLower.includes('tip') ||
          dimX > 4.5 ||
          minX < -2.5 ||
          maxX > 2.5 ||
          posX > 2.0);

        // 4. Front Head (Radome, Nose, Pitot Probe, Camera/Gimbal Turret at Z > 1.2)
        const isFrontHead =
          !isProp &&
          !isMissile &&
          !isWing &&
          (child.name === 'Object_2' ||
          child.name === 'Object_6' ||
          child.name === 'Object_7' ||
          nameLower.includes('nose') ||
          nameLower.includes('radome') ||
          nameLower.includes('sensor') ||
          nameLower.includes('camera') ||
          nameLower.includes('gimbal') ||
          nameLower.includes('head') ||
          nameLower.includes('front') ||
          nameLower.includes('cockpit') ||
          nameLower.includes('optics') ||
          nameLower.includes('turret') ||
          nameLower.includes('pitot') ||
          (posZ > 1.4 && posX < 1.5));

        // 5. Motor (Central Engine Bay, Cowling, Nacelle, Exhaust, Fuselage Body)
        const isMotor =
          !isProp &&
          !isMissile &&
          !isWing &&
          !isFrontHead;

        if (isProp) {
          categorizedMeshRefs.current.prop.push(child);
        } else if (isFrontHead) {
          categorizedMeshRefs.current.frontHead.push(child);
        } else if (isMissile) {
          categorizedMeshRefs.current.missiles.push(child);
        } else if (isWing) {
          categorizedMeshRefs.current.wings.push(child);
        } else if (isMotor) {
          categorizedMeshRefs.current.motor.push(child);
        }
      }
    });

    return c;
  }, [scene, isWireframe]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();

    // In normal state where no part should glow, guarantee 100% original appearance with zero emissive
    if (!glowZones.hasAnyGlow) {
      const resetMeshes = (meshes: THREE.Mesh[]) => {
        meshes.forEach((mesh) => {
          if (mesh.material) {
            const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
            mats.forEach((mat: any) => {
              if (mat.emissive && (mat.emissive.getHex() !== 0x000000 || mat.emissiveIntensity !== 0)) {
                mat.emissive.setHex(0x000000);
                mat.emissiveIntensity = 0;
              }
            });
          }
        });
      };
      resetMeshes(categorizedMeshRefs.current.prop);
      resetMeshes(categorizedMeshRefs.current.motor);
      resetMeshes(categorizedMeshRefs.current.wings);
      resetMeshes(categorizedMeshRefs.current.missiles);
      resetMeshes(categorizedMeshRefs.current.frontHead);
      return;
    }

    // Smooth pulsating emissive intensity (breathing oscillation at 4.5 Hz) strictly when a fault is active
    const pulse = Math.sin(t * 4.5) * 0.45 + 0.55;
    const glowIntensity = pulse * 3.8 + 1.8;

    const isCold = glowZones.isColdIcing;
    const isPropIce = glowZones.isPropIcing;

    // UNIFORM GLOWING COLOR:
    // Warning Alarm Red = 0xff173d (Identical across Prop, Motor, Wings, Missiles, Front Head)
    // Cold Icing Blue = 0x00d4ff (When icing is selected)
    const UNIFORM_RED_GLOW = 0xff173d;
    const UNIFORM_ICE_GLOW = 0x00d4ff;

    const applyGlowToMeshes = (meshes: THREE.Mesh[], shouldGlow: boolean, colorHex: number) => {
      meshes.forEach((mesh) => {
        if (mesh.material) {
          const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
          mats.forEach((mat: any) => {
            if (shouldGlow) {
              if (mat.emissive) {
                mat.emissive.setHex(colorHex);
                mat.emissiveIntensity = glowIntensity;
              }
            } else if (mat.emissive) {
              mat.emissive.setHex(0x000000);
              mat.emissiveIntensity = 0;
            }
          });
        }
      });
    };

    const propColorHex = (isPropIce || isCold) ? UNIFORM_ICE_GLOW : UNIFORM_RED_GLOW;
    const generalColorHex = isCold ? UNIFORM_ICE_GLOW : UNIFORM_RED_GLOW;

    applyGlowToMeshes(categorizedMeshRefs.current.prop, glowZones.glowProp, propColorHex);
    applyGlowToMeshes(categorizedMeshRefs.current.motor, glowZones.glowMotor, generalColorHex);
    applyGlowToMeshes(categorizedMeshRefs.current.wings, glowZones.glowWings, generalColorHex);
    applyGlowToMeshes(categorizedMeshRefs.current.missiles, glowZones.glowMissiles, generalColorHex);
    applyGlowToMeshes(categorizedMeshRefs.current.frontHead, glowZones.glowFrontHead, generalColorHex);
  });

  return <primitive object={clonedScene} />;
}

export function UAVModel({ twinState }: UAVModelProps) {
  const groupRef = useRef<THREE.Group>(null!);
  const modelMode = useTwinStore((s) => s.modelMode);

  // Live Zustand stores for real-time instant reaction across CHT, EGT, presets and faults
  const telemetry = useTelemetryStore((s) => s.telemetry);
  const diagnostics = useDiagnosticsStore((s) => s.diagnostics);
  const activeScenario = useScenarioStore((s) => s.activeScenario);

  // Spatial Point Light references for component illumination
  const propLightRef = useRef<THREE.PointLight>(null!);
  const motorLightRef = useRef<THREE.PointLight>(null!);
  const motorBellyLightRef = useRef<THREE.PointLight>(null!);
  const leftWingLightRef = useRef<THREE.PointLight>(null!);
  const rightWingLightRef = useRef<THREE.PointLight>(null!);
  const leftMissileLightRef = useRef<THREE.PointLight>(null!);
  const rightMissileLightRef = useRef<THREE.PointLight>(null!);
  const frontHeadLightRef = useRef<THREE.PointLight>(null!);
  const frontHeadSecondaryLightRef = useRef<THREE.PointLight>(null!);

  // 1. Live Telemetry Extraction
  const currentRpm = telemetry?.rpm ?? twinState?.rpm ?? 2850;
  const chtList = telemetry?.cht ?? [];
  const maxCht = chtList.length > 0 ? Math.max(...chtList) : 0;
  const egtList = telemetry?.egt ?? [];
  const maxEgt = egtList.length > 0 ? Math.max(...egtList) : 0;
  const currentVib = telemetry?.vibration ?? 2.0;
  const oilPressure = telemetry?.oil_pressure ?? 4.5;

  // 2. Active Fault / Preset / Scenario String Resolution
  const twinFault = (twinState?.active_fault || '').toUpperCase().trim();
  const diagFault = (diagnostics?.primary_fault || '').toUpperCase().trim();
  const scenFault = (activeScenario || '').toUpperCase().trim();
  const fault = `${twinFault} ${diagFault} ${scenFault}`.toUpperCase();

  // 3. Strict Single-Component Presets Detections
  const isWingPreset =
    fault.includes('WING_STRUCTURAL') ||
    fault.includes('WING_STRESS') ||
    fault.includes('WING') ||
    fault.includes('AIRFOIL');

  const isPropPreset =
    fault.includes('PROPELLER_OVERSPEED') ||
    fault.includes('PROP_OVERSPEED') ||
    fault.includes('OVERSPEED_REDLINE') ||
    currentRpm > 5600;

  const isPropIcing =
    fault.includes('PROPELLER_ICING') ||
    fault.includes('PROP_ICING');

  const isMissilePreset =
    fault.includes('MISSILE_HARDPOINT') ||
    fault.includes('PYLON') ||
    fault.includes('HARDPOINT') ||
    fault.includes('MISSILE');

  const isAvionicsPreset =
    fault.includes('AVIONICS_RADAR') ||
    fault.includes('FRONT_NOSE') ||
    fault.includes('RADAR_FAILURE') ||
    fault.includes('RADOME') ||
    fault.includes('SENSOR_DRIFT') ||
    fault.includes('SENSOR_FAIL') ||
    fault.includes('SENSOR_FAILURE');

  const isMotorPreset =
    fault.includes('MOTOR_STRESS') ||
    fault.includes('MOTOR_FRICTION') ||
    fault.includes('LUBRICATION') ||
    fault.includes('LOW_OIL') ||
    fault.includes('INJECTOR') ||
    fault.includes('MISFIRE') ||
    fault.includes('SEVERE_VIBRATION') ||
    fault.includes('ABNORMAL_VIBRATION');

  const isHighAltitudeIcing = fault.includes('HIGH_ALTITUDE_ICING');
  const isFullAirframeAlert = fault.includes('FULL_AIRFRAME');
  const isColdIcing = isHighAltitudeIcing || isPropIcing;

  // 4. CHT and EGT Explicit Excursion Triggers:
  // "for cht the fornt portion and egt the egine portion"
  // Normal cruise CHT is ~175-185°C and EGT is ~680-700°C, so under normal conditions these are strictly FALSE
  const isChtExcursion = maxCht > 200.0 || fault.includes('OVERHEAT') || fault.includes('CRITICAL_OVERHEAT');
  const isEgtExcursion = maxEgt > 750.0;

  let glowProp = false;
  let glowMotor = false;
  let glowWings = false;
  let glowMissiles = false;
  let glowFrontHead = false;

  if (isFullAirframeAlert) {
    // All parts glow synchronously on full airframe emergency
    glowProp = true;
    glowMotor = true;
    glowWings = true;
    glowMissiles = true;
    glowFrontHead = true;
  } else if (isHighAltitudeIcing) {
    // Airframe icing: Propeller, Wings, and Nose Pitot glow cold blue
    glowProp = true;
    glowWings = true;
    glowFrontHead = true;
  } else if (isPropIcing) {
    // Only propeller end glows blue
    glowProp = true;
  } else if (isWingPreset) {
    // ONLY WINGS OUTER GLOW when wings preset is clicked or wing stress occurs
    glowWings = true;
  } else if (isPropPreset) {
    // ONLY PROPELLER END GLOWS when propeller preset is clicked
    glowProp = true;
  } else if (isMissilePreset) {
    // ONLY MISSILES BOTTOM GLOW when missiles preset is clicked
    glowMissiles = true;
  } else if (isAvionicsPreset) {
    // ONLY FRONT END GLOWS when front head preset is clicked
    glowFrontHead = true;
  } else if (isMotorPreset) {
    // ONLY MOTOR REGION GLOWS when motor preset is clicked
    glowMotor = true;
  } else {
    // Dynamic Telemetry Channel Operations (Sliders & Excursions):
    // CHT -> FRONT PORTION ONLY
    if (isChtExcursion) {
      glowFrontHead = true;
    }
    // EGT -> ENGINE / MOTOR PORTION ONLY
    if (isEgtExcursion) {
      glowMotor = true;
    }
    // Oil pressure drop or motor vibration fallback
    if (oilPressure < 3.0 || currentVib > 5.5) {
      glowMotor = true;
    }
  }

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

  // 5. AEROSPACE WOBBLE (Strictly only when a fault or excursion is active)
  let wobbleMultiplier = 0;
  if (hasAnyGlow) {
    wobbleMultiplier = 0.50;
    if (maxCht > 215.0 || maxEgt > 780.0 || isPropPreset || isFullAirframeAlert) {
      wobbleMultiplier = 1.0;
    }
  }

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();

    if (groupRef.current) {
      // Smooth loiter hover on Y axis
      groupRef.current.position.y = Math.sin(t * 1.2) * 0.25;

      // Realistic Multi-Axis Aerodynamic Shudder & Vibration Wobble
      if (wobbleMultiplier > 0) {
        // High-frequency harmonic structural vibration + aerodynamic buffeting
        const vibFreq1 = 30.0;
        const vibFreq2 = 46.0;
        const rollFreq = 26.0;
        const pitchFreq = 20.0;
        const yawFreq = 15.0;

        // Calibrated subtle position jitter amplitudes (0.042 posAmp / 0.024 rotAmp)
        const posAmp = 0.042 * wobbleMultiplier;
        const rotAmp = 0.024 * wobbleMultiplier;

        // 3D Spatial Position Shake
        groupRef.current.position.x = Math.sin(t * vibFreq1) * posAmp + Math.sin(t * vibFreq2) * (posAmp * 0.35);
        groupRef.current.position.z = Math.cos(t * (vibFreq1 * 1.15)) * (posAmp * 0.65);

        // 3D Angular Aerodynamic Flutter (Roll, Pitch, Yaw)
        groupRef.current.rotation.z = Math.sin(t * rollFreq) * rotAmp;
        groupRef.current.rotation.x = 0.2 + Math.cos(t * pitchFreq) * (rotAmp * 0.75);
        groupRef.current.rotation.y = -0.55 + Math.sin(t * yawFreq) * (rotAmp * 0.4);
      } else {
        // Resting nominal stance (perfect smooth flight, zero wobble)
        groupRef.current.position.x = 0;
        groupRef.current.position.z = 0;
        groupRef.current.rotation.x = 0.2;
        groupRef.current.rotation.y = -0.55;
        groupRef.current.rotation.z = 0;
      }
    }

    // Smooth pulse on active spatial point lights strictly when glowing
    if (hasAnyGlow) {
      const lightPulse = Math.sin(t * 4.5) * 0.45 + 0.55;
      const baseLightIntensity = 28 * lightPulse;

      if (propLightRef.current) propLightRef.current.intensity = baseLightIntensity;
      if (motorLightRef.current) motorLightRef.current.intensity = baseLightIntensity * 1.2;
      if (motorBellyLightRef.current) motorBellyLightRef.current.intensity = baseLightIntensity;
      if (leftWingLightRef.current) leftWingLightRef.current.intensity = baseLightIntensity;
      if (rightWingLightRef.current) rightWingLightRef.current.intensity = baseLightIntensity;
      if (leftMissileLightRef.current) leftMissileLightRef.current.intensity = baseLightIntensity;
      if (rightMissileLightRef.current) rightMissileLightRef.current.intensity = baseLightIntensity;
      if (frontHeadLightRef.current) frontHeadLightRef.current.intensity = baseLightIntensity * 1.5;
      if (frontHeadSecondaryLightRef.current) frontHeadSecondaryLightRef.current.intensity = baseLightIntensity;
    }
  });

  // IDENTICAL UNIFORM GLOW COLORS:
  // Universal Warning Red = "#ff173d" across all fault parts
  // Universal Cold Icing Blue = "#00d4ff" across all icing parts
  const UNIFORM_RED_COLOR = "#ff173d";
  const UNIFORM_ICE_COLOR = "#00d4ff";

  const propColor = (isPropIcing || isColdIcing) ? UNIFORM_ICE_COLOR : UNIFORM_RED_COLOR;
  const motorColor = isColdIcing ? UNIFORM_ICE_COLOR : UNIFORM_RED_COLOR;
  const wingColor = isColdIcing ? UNIFORM_ICE_COLOR : UNIFORM_RED_COLOR;
  const missileColor = isColdIcing ? UNIFORM_ICE_COLOR : UNIFORM_RED_COLOR;
  const frontHeadColor = isColdIcing ? UNIFORM_ICE_COLOR : UNIFORM_RED_COLOR;

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

      {/* Point lights rendered strictly when their respective fault zone is active */}
      {/* 1. PROPELLER END FAULT GLOW */}
      {glowProp && (
        <pointLight
          ref={propLightRef}
          position={[0, 1.8, -4.7]}
          color={propColor}
          intensity={28}
          distance={7.0}
        />
      )}

      {/* 2. MOTOR CORE (MIDDLE ENGINE COMPARTMENT - TOP & BELLY) FAULT GLOW */}
      {glowMotor && (
        <>
          <pointLight
            ref={motorLightRef}
            position={[0, 1.4, -0.6]}
            color={motorColor}
            intensity={32}
            distance={8.0}
          />
          <pointLight
            ref={motorBellyLightRef}
            position={[0, -0.7, -0.6]}
            color={motorColor}
            intensity={26}
            distance={6.5}
          />
        </>
      )}

      {/* 3. WINGS (LEFT & RIGHT) FAULT GLOW */}
      {glowWings && (
        <>
          <pointLight
            ref={leftWingLightRef}
            position={[-5.8, 0.7, -0.1]}
            color={wingColor}
            intensity={35}
            distance={14.0}
          />
          <pointLight
            ref={rightWingLightRef}
            position={[5.8, 0.7, -0.1]}
            color={wingColor}
            intensity={35}
            distance={14.0}
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
            intensity={24}
            distance={6.0}
          />
          <pointLight
            ref={rightMissileLightRef}
            position={[3.2, -0.6, 0.1]}
            color={missileColor}
            intensity={24}
            distance={6.0}
          />
        </>
      )}

      {/* 5. FRONT HEAD OF THE DRONE FAULT GLOW */}
      {glowFrontHead && (
        <>
          <pointLight
            ref={frontHeadLightRef}
            position={[0, 0.9, 4.8]}
            color={frontHeadColor}
            intensity={35}
            distance={12.0}
          />
          <pointLight
            ref={frontHeadSecondaryLightRef}
            position={[0, -0.4, 3.2]}
            color={frontHeadColor}
            intensity={24}
            distance={8.0}
          />
        </>
      )}
    </group>
  );
}

useGLTF.preload('/mq-1_predator_uav.glb');
useGLTF.preload('/tapas_drone_wireframe.glb');
