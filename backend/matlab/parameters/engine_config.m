function cfg = engine_config()
% ENGINE_CONFIG
% SIH26 Digital Twin - Engine Configuration Layer
%
% Purpose:
%   Provides a parameterized engine configuration to the Digital Twin.
%
% Architecture principle:
%   Engine-specific values live here.
%   Core physics and diagnostics remain engine-agnostic.

cfg = struct();

%% Configuration metadata

cfg.name = "Rotax_912_iS_Sport_Reference";
cfg.model_version = "0.1.0";
cfg.schema_version = "0.1.0";

cfg.reference = struct();

cfg.reference.engine_family = "Rotax 912";
cfg.reference.engine_variant = "912 iS Sport";
cfg.reference.configuration = "4-cylinder horizontally-opposed spark-ignition aero piston engine";
cfg.reference.status = "Reference configuration for SIH26 prototype";

%% Engine geometry
cfg.geometry = struct();

cfg.geometry.cylinders = 4;
cfg.geometry.displacement_m3 = 1.352e-3;
cfg.geometry.bore_m = 84e-3;
cfg.geometry.stroke_m = 61e-3;

%% Operating limits
cfg.limits = struct();

cfg.limits.max_rpm = 5800;
cfg.limits.max_power_W = 100 * 735.49875;

%% Engine features
cfg.features = struct();

cfg.features.electronic_fuel_injection = true;
cfg.features.electronic_ignition = true;
cfg.features.dry_sump = true;
cfg.features.reduction_gearbox = true;
cfg.mechanical.inertia_kg_m2 = 0.10;
cfg.mechanical.idle_rpm = 1400;
cfg.mechanical.max_rpm = 5800;
%% Fuel and combustion parameters

cfg.fuel = struct();

cfg.fuel.stoich_air_fuel_ratio = 14.7;
cfg.fuel.target_air_fuel_ratio = 14.7;
cfg.fuel.combustion_efficiency = 0.98;
%% Mechanical and combustion model parameters

cfg.combustion = struct();

cfg.combustion.lower_heating_value_J_per_kg = 43e6;
cfg.combustion.indicated_efficiency = 0.30;
cfg.combustion.mechanical_efficiency = 0.85;
cfg.combustion.optimal_injection_timing_deg = 20;
cfg.combustion.injection_timing_sensitivity = 0.001;

%% Environmental inputs
cfg.environment = struct();

cfg.environment.pressure_unit = "Pa";
cfg.environment.temperature_unit = "K";

%% Telemetry units
cfg.telemetry = struct();

cfg.telemetry.rpm_unit = "rpm";
cfg.telemetry.map_unit = "Pa";
cfg.telemetry.cht_unit = "K";
cfg.telemetry.egt_unit = "K";
cfg.telemetry.oil_pressure_unit = "Pa";
cfg.telemetry.oil_temperature_unit = "K";
cfg.telemetry.fuel_flow_unit = "kg/s";
cfg.telemetry.vibration_unit = "m/s^2";
cfg.telemetry.battery_voltage_unit = "V";
cfg.telemetry.alternator_current_unit = "A";
cfg.telemetry.injection_timing_unit = "deg";

end