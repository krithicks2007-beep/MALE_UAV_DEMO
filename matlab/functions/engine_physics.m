function state = engine_physics(inputs, cfg)
% ENGINE_PHYSICS
% SIH26 Digital Twin - Engine Physics V1
%
% Inputs:
%   inputs - current engine/environment operating conditions
%   cfg    - engine configuration from engine_config()
%
% Output:
%   state  - predicted engine state

%% Input validation
arguments
    inputs struct
    cfg struct
end

%% Initialize output state
state = struct();

%% Operating conditions

% Manifold Absolute Pressure (MAP)
% V1 simplified throttle model.
% throttle = 0  -> low manifold pressure
% throttle = 1  -> ambient manifold pressure

throttle = max(0, min(1, inputs.throttle));

state.map = inputs.ambient_pressure * throttle;
%% Model metadata
state.model_version = cfg.model_version;
%% Air mass flow

R_air = 287.05;       % J/(kg*K)
volumetric_efficiency = 0.80;

displacement = cfg.geometry.displacement_m3;
rpm = max(0, inputs.rpm);
intake_temperature = inputs.ambient_temperature;

state.air_mass_flow = ...
    (state.map * displacement / (R_air * intake_temperature)) ...
    * (rpm / 120) ...
    * volumetric_efficiency;
%% Fuel flow

air_fuel_ratio = cfg.fuel.target_air_fuel_ratio;
combustion_efficiency = cfg.fuel.combustion_efficiency;

state.fuel_flow = ...
    (state.air_mass_flow / air_fuel_ratio) ...
    * combustion_efficiency;
%% Combustion and mechanical output

fuel_energy_rate = ...
    state.fuel_flow * cfg.combustion.lower_heating_value_J_per_kg;

%% Injection timing effect

injection_timing_error = ...
    inputs.injection_timing ...
    - cfg.combustion.optimal_injection_timing_deg;

timing_efficiency = ...
    max(0, 1 - cfg.combustion.injection_timing_sensitivity ...
    * injection_timing_error^2);

indicated_power = ...
    fuel_energy_rate ...
    * cfg.combustion.indicated_efficiency ...
    * timing_efficiency;

%% Load effect

engine_load = max(0, min(1, inputs.engine_load));

state.power = ...
    indicated_power ...
    * cfg.combustion.mechanical_efficiency ...
    * engine_load;
%% Torque

rpm_for_torque = max(rpm, 1);

omega = 2 * pi * rpm_for_torque / 60;

state.torque = state.power / omega;

%% Torque

rpm_for_torque = max(rpm, 1);

omega = 2 * pi * rpm_for_torque / 60;

state.torque = state.power / omega;

end