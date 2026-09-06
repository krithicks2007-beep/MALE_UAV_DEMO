export interface UAVFaultLocation {
  primaryFault: string;
  displayName: string;
  subsystem: string;
  zone: string;
  station: string;
  componentTag: string;
  svgTarget: {
    x: number; // Percentage 0-100 on UAV top-down diagram
    y: number; // Percentage 0-100 on UAV top-down diagram
    label: string;
    radius?: number;
  };
  description: string;
  defaultEvidence: string[];
  recommendedAction: string;
}

export const UAV_FAULT_REGISTRY: Record<string, UAVFaultLocation> = {
  AVIONICS_RADAR_FAILURE: {
    primaryFault: 'AVIONICS_RADAR_FAILURE',
    displayName: 'Avionics Radome & Radar Failure',
    subsystem: 'Avionics & Sensor Suite',
    zone: 'Forward Nose Radome & Sensor Bay',
    station: 'FS 0+00 to FS 35+00',
    componentTag: 'RADOME-SAR-01',
    svgTarget: { x: 50, y: 12, label: 'Nose Radome / SAR' },
    description: 'Loss of transceiver link or power failure in the forward radome synthetic aperture radar, EO/IR sensor turret, or nose pitot-static array.',
    defaultEvidence: [
      'Front head radome radar transceiver signal loss',
      'Nose pitot-static heating element trip',
      'Forward electro-optical sensor pod offline'
    ],
    recommendedAction: 'Switch to backup GPS/INS navigation immediately, isolate forward avionics bus, and initiate return to recovery waypoint.'
  },
  AVIONICS_RADOME_FAULT: {
    primaryFault: 'AVIONICS_RADOME_FAULT',
    displayName: 'Avionics Radome & Sensor Suite Fault',
    subsystem: 'Avionics & Forward Payloads',
    zone: 'Nose Dome & Sensor Fairing',
    station: 'FS 0+00 to FS 35+00',
    componentTag: 'AVIONICS-RADOME',
    svgTarget: { x: 50, y: 12, label: 'Nose Radome' },
    description: 'Avionics nose fairing telemetry bus error and forward sensor suite communication timeout.',
    defaultEvidence: [
      'Front head nose radome & sensor suite failure',
      'Telemetry timeout on forward CAN-Bus node #1',
      'Backup INS initialized'
    ],
    recommendedAction: 'Switch to backup GPS/INS navigation and return to base.'
  },
  ENGINE_OVERHEATING: {
    primaryFault: 'ENGINE_OVERHEATING',
    displayName: 'Engine Thermal Excursion & Overheating',
    subsystem: 'Aero-Piston Propulsion',
    zone: 'Mid-Fuselage Engine Compartment',
    station: 'FS 140+00 to FS 185+00',
    componentTag: 'ENG-THERMAL-CORE',
    svgTarget: { x: 50, y: 55, label: 'Engine Bay (C1-C4)' },
    description: 'Cylinder Head Temperatures (CHT) and Exhaust Gas Temperatures (EGT) exceeding safe continuous flight limits across all 4 cylinders.',
    defaultEvidence: [
      'Peak Cylinder Head Temperature > 210°C',
      'Exhaust gas temperature elevated across all cylinders',
      'Cooling duct differential airflow pressure drop'
    ],
    recommendedAction: 'Reduce throttle to cruise/descent setting, open engine cowl flaps, monitor oil temperature, and descend to cooler air.'
  },
  OVERHEATING: {
    primaryFault: 'OVERHEATING',
    displayName: 'Engine Overheating Excursion',
    subsystem: 'Aero-Piston Propulsion',
    zone: 'Mid-Fuselage Engine Nacelle',
    station: 'FS 140+00 to FS 185+00',
    componentTag: 'ENG-THERMAL-CORE',
    svgTarget: { x: 50, y: 55, label: 'Engine Bay' },
    description: 'Thermal excursion detected in aero-piston cylinder jackets and exhaust manifold.',
    defaultEvidence: [
      'Cylinder Head Temperature exceeding threshold',
      'Thermal health index declining rapidly',
      'Oil temperature elevated'
    ],
    recommendedAction: 'Inspect engine cooling ducts, reduce throttle setting, and monitor thermal recovery.'
  },
  MISFIRE: {
    primaryFault: 'MISFIRE',
    displayName: 'Cylinder #2 Ignition Misfire',
    subsystem: 'Dual-Spark Ignition & Combustion',
    zone: 'Cylinder #2 Combustion Chamber',
    station: 'FS 160+00 (Engine Block Port Side)',
    componentTag: 'CYL-02-IGNITION',
    svgTarget: { x: 45, y: 53, label: 'Cylinder #2 Head' },
    description: 'Incomplete or intermittent combustion cycles detected in Cylinder 2, causing torque pulsation and EGT drop.',
    defaultEvidence: [
      'Cylinder 2 EGT depression relative to bank average',
      'High-frequency crankshaft torque flutter detected',
      'Harmonic vibration surge on cylinder block'
    ],
    recommendedAction: 'Verify dual-spark ignition channel B backup, adjust mixture trim, and inspect spark plug gap upon landing.'
  },
  IGNITION_MISFIRE: {
    primaryFault: 'IGNITION_MISFIRE',
    displayName: 'Ignition Channel Misfire',
    subsystem: 'Ignition Harness & Coils',
    zone: 'Engine Cylinder Head Bank',
    station: 'FS 160+00',
    componentTag: 'IGN-COIL-BANK',
    svgTarget: { x: 45, y: 53, label: 'Ignition Coils' },
    description: 'Repeated misfire events recorded in engine combustion chamber.',
    defaultEvidence: [
      'Repeated misfire events in cylinder combustion chamber',
      'Torque ripple detected on flywheel sensor'
    ],
    recommendedAction: 'Inspect spark plug gap and ignition harness upon turnaround.'
  },
  INJECTOR_ABNORMALITY: {
    primaryFault: 'INJECTOR_ABNORMALITY',
    displayName: 'Fuel Injector Flow Abnormality',
    subsystem: 'FADEC Fuel Rail & Injection',
    zone: 'Engine Intake Manifold / Fuel Rail',
    station: 'FS 155+00',
    componentTag: 'FUEL-INJ-RAIL',
    svgTarget: { x: 54, y: 53, label: 'Fuel Rail & Injectors' },
    description: 'Flow imbalance or solenoid response latency detected in fuel injector nozzle rail, leading to uneven air-fuel ratio.',
    defaultEvidence: [
      'Fuel flow rate mismatch vs FADEC commanded trim',
      'Cylinder 3 EGT delta deviation > 45°C',
      'Manifold pressure fuel oscillation'
    ],
    recommendedAction: 'FADEC closed-loop trim active; monitor fuel pressure and schedule injector ultrasonic cleaning.'
  },
  LUBRICATION_ISSUE: {
    primaryFault: 'LUBRICATION_ISSUE',
    displayName: 'Oil Pressure & Lubrication Loss',
    subsystem: 'Dry-Sump Lubrication System',
    zone: 'Lower Engine Sump & Oil Pump',
    station: 'FS 170+00 (Lower Belly Nacelle)',
    componentTag: 'LUB-SUMP-PUMP',
    svgTarget: { x: 50, y: 63, label: 'Oil Sump & Pump' },
    description: 'Severe oil pressure drop and oil scavenge pump aeration threatening internal bearing oil film.',
    defaultEvidence: [
      'Oil pressure dropped below 2.0 bar minimum limit',
      'Oil reservoir scavenge temperature rising',
      'Main journal friction indicator elevated'
    ],
    recommendedAction: 'Throttle back to reduce crankshaft load, plan emergency landing to prevent catastrophic engine seizure.'
  },
  MOTOR_STRESS_VIBRATION: {
    primaryFault: 'MOTOR_STRESS_VIBRATION',
    displayName: 'Engine Bearing Stress & Mechanical Vibration',
    subsystem: 'Crankshaft & Journal Bearings',
    zone: 'Engine Core & Crankcase',
    station: 'FS 160+00 (Middle Compartment)',
    componentTag: 'CRANK-JOURNAL-01',
    svgTarget: { x: 50, y: 56, label: 'Crankcase Bearings' },
    description: 'Extreme mechanical vibration excursion in engine core bearings indicating abnormal friction or journal wear.',
    defaultEvidence: [
      'Internal engine core friction elevated (Vib > 4.5 mm/s)',
      'Crankcase bearing temperature surge',
      'Oil pressure droop and metal chip detector alert'
    ],
    recommendedAction: 'Inspect engine main bearings and oil circulation pump; restrict engine to continuous safe RPM.'
  },
  PROPELLER_OVERSPEED: {
    primaryFault: 'PROPELLER_OVERSPEED',
    displayName: 'Pusher Propeller Hub & Governor Overspeed',
    subsystem: 'Aft Pusher Propeller & Governor',
    zone: 'Aft Fuselage Tail Hub & Blades',
    station: 'FS 285+00 to FS 310+00',
    componentTag: 'PROP-AFT-GOVERNOR',
    svgTarget: { x: 50, y: 88, label: 'Pusher Propeller Hub' },
    description: 'Propeller governor loss of pitch control leading to aerodynamic overspin and high blade harmonic flutter at the rear of the UAV.',
    defaultEvidence: [
      'Pusher propeller overspeed exceeding RPM redline',
      'Aft hub pitch actuator telemetry mismatch',
      'Blade harmonic flutter detected on aft accelerometer'
    ],
    recommendedAction: 'Reduce throttle immediately to bring RPM below redline and inspect propeller pitch governor actuator.'
  },
  WING_STRUCTURAL_STRESS: {
    primaryFault: 'WING_STRUCTURAL_STRESS',
    displayName: 'Wing Spar Structural Aeroelastic Stress',
    subsystem: 'Carbon Composite Main Airfoil',
    zone: 'Left & Right Main Wing Spars',
    station: 'WS 80 to WS 220 (Port & Starboard)',
    componentTag: 'WING-SPAR-L/R',
    svgTarget: { x: 22, y: 48, label: 'Wing Spars (Port/Stbd)' },
    description: 'Strain gauges on left and right carbon composite wing spars exceeding 85% design limit under high aero buffeting.',
    defaultEvidence: [
      'Left and right wing spar load cell strain exceeds 85% limit',
      'Airframe aero buffeting vibration elevated',
      'Aeroelastic flutter margin compromised'
    ],
    recommendedAction: 'Descend to smooth air and reduce calibrated airspeed to remain well within safe maneuvering envelope.'
  },
  MISSILE_HARDPOINT_FAULT: {
    primaryFault: 'MISSILE_HARDPOINT_FAULT',
    displayName: 'Underwing Weapon Pylon & Hardpoint Fault',
    subsystem: 'Stores Management & Ordnance Pylons',
    zone: 'Underwing Pylons #1 & #2',
    station: 'WS 110 Left & Right (Underwing)',
    componentTag: 'STORES-PYLON-01',
    svgTarget: { x: 33, y: 52, label: 'Underwing Pylons' },
    description: 'Electrical bus disconnect or solenoid fault on underwing weapons release unit pylons.',
    defaultEvidence: [
      'Underwing ordnance pylon #1 & #2 electrical link lost',
      'Weapons rail release actuator solenoid fault',
      'Missile umbilical bus timeout'
    ],
    recommendedAction: 'Perform pylon bus re-poll, safe weapons master arm switch, and check ordnance umbilical harness.'
  },
  HIGH_ALTITUDE_ICING: {
    primaryFault: 'HIGH_ALTITUDE_ICING',
    displayName: 'High Altitude Airframe & Intake Icing',
    subsystem: 'Ice Protection & Engine Intake',
    zone: 'Wing Leading Edges & Engine Intake',
    station: 'WS 50-240 & FS 135',
    componentTag: 'ICE-DEICE-BOOTS',
    svgTarget: { x: 30, y: 44, label: 'Leading Edge / Intake' },
    description: 'Structural ice accumulation detected along carbon wing leading edges and ram air intake duct.',
    defaultEvidence: [
      'Leading-edge ice accretion sensor triggered',
      'Engine intake differential pressure drop',
      'Subsystem thermal load increase'
    ],
    recommendedAction: 'Engage pneumatic de-icing boots, activate intake heating element, and descend to warmer altitude.'
  },
  PROPELLER_ICING: {
    primaryFault: 'PROPELLER_ICING',
    displayName: 'Pusher Propeller Blade Icing',
    subsystem: 'Aft Propeller & Electro-Thermal De-Ice',
    zone: 'Aft Pusher Propeller Blades & Spinner',
    station: 'FS 285+00 to FS 310+00',
    componentTag: 'PROP-DEICE-BLADES',
    svgTarget: { x: 50, y: 88, label: 'Propeller Blades (Icing)' },
    description: 'Severe sub-zero atmospheric ice accretion on pusher propeller blades causing aerodynamic imbalance and thrust degradation.',
    defaultEvidence: [
      'Aft pusher propeller blade leading-edge ice accretion detected',
      'Pusher propeller aerodynamic thrust efficiency reduced by 34%',
      'Propeller de-ice heating element boot failure at aft hub',
      'High-frequency blade rotational aerodynamic imbalance'
    ],
    recommendedAction: 'Activate propeller electro-thermal de-icing boots, cycle governor pitch, and descend to warmer altitude layer.'
  },
  SENSOR_DRIFT: {
    primaryFault: 'SENSOR_DRIFT',
    displayName: 'Cylinder Thermocouple Sensor Drift',
    subsystem: 'Exhaust Instrumentation & CHT Probes',
    zone: 'Engine Exhaust Manifold Sensor Tree',
    station: 'FS 165+00',
    componentTag: 'SENS-TC-EGT1',
    svgTarget: { x: 50, y: 54, label: 'EGT / CHT Probes' },
    description: 'Thermocouple calibration drift detected on Cylinder 1 exhaust probe via cross-cylinder analytical redundancy.',
    defaultEvidence: [
      'Cylinder 1 EGT sensor drift residual (+75°C delta)',
      'Physical thermal and mechanical subsystems remain within nominal bounds',
      'Sensor drift isolated by cross-cylinder correlation analysis'
    ],
    recommendedAction: 'Perform thermocouple calibration check upon next turnaround; digital twin sensor redundancy active.'
  },
  SENSOR_FAILURE: {
    primaryFault: 'SENSOR_FAILURE',
    displayName: 'Exhaust Gas Temperature Sensor Loss',
    subsystem: 'Exhaust Gas Thermocouple Channel 1',
    zone: 'Exhaust Manifold Port #1',
    station: 'FS 165+00',
    componentTag: 'SENS-EGT-01',
    svgTarget: { x: 50, y: 54, label: 'EGT Probe #1' },
    description: 'Open circuit or complete signal loss detected on Cylinder 1 EGT probe.',
    defaultEvidence: [
      'Complete loss of signal on Cylinder 1 EGT sensor',
      'FADEC switching to estimated thermal model for Cylinder 1',
      'Hardware sensor replacement required'
    ],
    recommendedAction: 'Replace Cylinder 1 EGT probe upon post-flight inspection.'
  }
};

export function getUAVFaultLocation(faultKey?: string | null): UAVFaultLocation {
  if (!faultKey || faultKey === 'NONE' || faultKey === 'NORMAL') {
    return {
      primaryFault: 'NONE',
      displayName: 'All UAV Subsystems Nominal',
      subsystem: 'MALE UAV Integrated Systems',
      zone: 'All Stations Nominal',
      station: 'Full Airframe (FS 0 to 310)',
      componentTag: 'SYS-NOMINAL',
      svgTarget: { x: 50, y: 50, label: 'MALE-01 Nominal' },
      description: 'All engine, avionics, aerodynamic, and electrical subsystems operating within standard flight envelope.',
      defaultEvidence: ['Telemetry stream synchronized', 'Physics model residuals < 2.5%'],
      recommendedAction: 'Continue nominal mission flight profile.'
    };
  }

  // Direct lookup
  const cleanKey = faultKey.toUpperCase().trim();
  if (UAV_FAULT_REGISTRY[cleanKey]) {
    return UAV_FAULT_REGISTRY[cleanKey];
  }

  // Fuzzy match keywords
  if (cleanKey.includes('RADOME') || cleanKey.includes('RADAR') || cleanKey.includes('AVIONIC')) {
    return UAV_FAULT_REGISTRY.AVIONICS_RADAR_FAILURE;
  }
  if (cleanKey.includes('OVERHEAT') || cleanKey.includes('THERMAL')) {
    return UAV_FAULT_REGISTRY.ENGINE_OVERHEATING;
  }
  if (cleanKey.includes('MISFIRE') || cleanKey.includes('IGNITION')) {
    return UAV_FAULT_REGISTRY.MISFIRE;
  }
  if (cleanKey.includes('INJECT') || cleanKey.includes('FUEL')) {
    return UAV_FAULT_REGISTRY.INJECTOR_ABNORMALITY;
  }
  if (cleanKey.includes('LUB') || cleanKey.includes('OIL')) {
    return UAV_FAULT_REGISTRY.LUBRICATION_ISSUE;
  }
  if (cleanKey.includes('PROP') && (cleanKey.includes('ICE') || cleanKey.includes('ICING'))) {
    return UAV_FAULT_REGISTRY.PROPELLER_ICING;
  }
  if (cleanKey.includes('PROP') || cleanKey.includes('SPEED')) {
    return UAV_FAULT_REGISTRY.PROPELLER_OVERSPEED;
  }
  if (cleanKey.includes('VIB') || cleanKey.includes('BEARING') || cleanKey.includes('MOTOR')) {
    return UAV_FAULT_REGISTRY.MOTOR_STRESS_VIBRATION;
  }
  if (cleanKey.includes('WING') || cleanKey.includes('AERO') || cleanKey.includes('STRUCT')) {
    return UAV_FAULT_REGISTRY.WING_STRUCTURAL_STRESS;
  }
  if (cleanKey.includes('MISSILE') || cleanKey.includes('PYLON') || cleanKey.includes('WEAPON')) {
    return UAV_FAULT_REGISTRY.MISSILE_HARDPOINT_FAULT;
  }
  if (cleanKey.includes('ICE') || cleanKey.includes('ICING')) {
    return UAV_FAULT_REGISTRY.HIGH_ALTITUDE_ICING;
  }
  if (cleanKey.includes('DRIFT')) {
    return UAV_FAULT_REGISTRY.SENSOR_DRIFT;
  }
  if (cleanKey.includes('SENSOR')) {
    return UAV_FAULT_REGISTRY.SENSOR_FAILURE;
  }

  // Fallback generic location
  return {
    primaryFault: cleanKey,
    displayName: cleanKey.replace(/_/g, ' '),
    subsystem: 'Aero-Piston Engine & Airframe',
    zone: 'Mid-Fuselage Compartment',
    station: 'FS 150+00',
    componentTag: 'UAV-FAULT-ALERT',
    svgTarget: { x: 50, y: 55, label: cleanKey },
    description: `Active anomaly detected: ${cleanKey.replace(/_/g, ' ')}. Telemetry residual excursions require operator attention.`,
    defaultEvidence: [`Active fault code: ${cleanKey}`],
    recommendedAction: 'Inspect telemetry parameters and cross-verify with digital twin physics models.'
  };
}
