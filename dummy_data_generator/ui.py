"""
HTML UI Generator for UAV Dummy Data Control Panel.
Served directly by the FastAPI backend at /control, /generator, and /generator-ui.
"""

GENERATOR_HTML_CONTENT = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>MALE UAV • Live Telemetry & Scenario Generator Control</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700&family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" />
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body { font-family: 'Inter', sans-serif; background-color: #0d1117; color: #e6edf3; }
    .font-mono { font-family: 'JetBrains Mono', monospace; }
    input[type=range] {
      -webkit-appearance: none;
      width: 100%;
      background: #21262d;
      height: 6px;
      border-radius: 9999px;
      outline: none;
    }
    input[type=range]::-webkit-slider-thumb {
      -webkit-appearance: none;
      appearance: none;
      width: 18px;
      height: 18px;
      border-radius: 50%;
      background: #58a6ff;
      cursor: pointer;
      border: 2px solid #ffffff;
      box-shadow: 0 0 8px rgba(88,166,255,0.6);
      transition: all 0.15s ease;
    }
    input[type=range]::-webkit-slider-thumb:hover {
      transform: scale(1.2);
      background: #79c0ff;
    }
    .redline-input::-webkit-slider-thumb {
      background: #f85149 !important;
      box-shadow: 0 0 10px rgba(248,81,73,0.8) !important;
    }
    .glass-panel {
      background: rgba(22, 27, 34, 0.85);
      backdrop-filter: blur(12px);
      border: 1px solid #30363d;
    }
  </style>
</head>
<body class="min-h-screen p-4 lg:p-8 flex flex-col items-center">

  <div class="w-full max-w-[1440px] space-y-6">

    <!-- Top Header -->
    <header class="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-5 rounded-2xl glass-panel border border-slate-700/60 shadow-xl">
      <div class="flex items-center gap-3.5">
        <div class="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
          <span class="material-symbols-outlined text-2xl">tune</span>
        </div>
        <div>
          <div class="flex items-center gap-2.5">
            <h1 class="text-lg font-bold tracking-tight text-white">TAPAS DRDO UAV • Telemetry Data Generator</h1>
            <span id="stream-badge" class="text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-semibold">
              LIVE STREAM ACTIVE
            </span>
          </div>
          <p class="text-xs text-slate-400">Interactive parameter slider control & TAPAS DRDO redline safety envelope injector</p>
        </div>
      </div>

      <div class="flex items-center gap-3">
        <div class="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700 text-xs font-mono">
          <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span class="text-slate-400">Target Dashboard:</span>
          <a href="http://127.0.0.1:5173" target="_blank" class="text-blue-400 hover:underline font-semibold flex items-center gap-1">
            localhost:5173 <span class="material-symbols-outlined text-[14px]">open_in_new</span>
          </a>
        </div>
        <button id="btn-toggle-mode" onclick="toggleControlMode()" class="px-4 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20 flex items-center gap-2">
          <span class="material-symbols-outlined text-[16px]">toggle_on</span>
          <span id="mode-text">Mode: MANUAL OVERRIDE</span>
        </button>
      </div>
    </header>

    <!-- TAPAS DRDO Redline Envelope Status Banner -->
    <div id="tapas-alert-banner" class="hidden p-4 rounded-2xl bg-red-950/70 border border-red-500/60 shadow-lg shadow-red-900/30 flex flex-wrap items-center justify-between gap-3 animate-pulse">
      <div class="flex items-center gap-3">
        <div class="w-9 h-9 rounded-lg bg-red-600 flex items-center justify-center text-white font-bold">
          <span class="material-symbols-outlined text-xl">warning</span>
        </div>
        <div>
          <div class="text-xs font-bold text-red-400 tracking-wider font-mono uppercase">TAPAS DRDO SPECIFICATION LIMIT EXCEEDED</div>
          <div id="tapas-alert-msg" class="text-sm font-semibold text-white">Critical temperature excursion</div>
        </div>
      </div>
      <button onclick="resetToNormal()" class="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-md">
        <span class="material-symbols-outlined text-[16px]">check_circle</span>
        TURN OFF ALARM / RESET
      </button>
    </div>

    <!-- Quick Presets Grid -->
    <div class="p-5 rounded-2xl glass-panel space-y-3">
      <div class="flex items-center justify-between">
        <span class="text-xs font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <span class="material-symbols-outlined text-[16px] text-blue-400">bolt</span> Quick Scenario & TAPAS Test Presets
        </span>
        <button onclick="resetToNormal()" class="text-xs text-emerald-400 hover:text-emerald-300 font-mono font-semibold flex items-center gap-1">
          <span class="material-symbols-outlined text-[14px]">restart_alt</span> Reset to Nominal
        </button>
      </div>

      <!-- Prominent Test Alarm vs Turn Off / Reset Actions -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-3 pb-2">
        <button onclick="applyPreset('FULL_AIRFRAME_ALERT')" class="p-3.5 rounded-xl bg-gradient-to-r from-red-950 via-rose-900 to-red-950 hover:from-red-900 hover:to-rose-800 border-2 border-red-500 text-left transition shadow-lg shadow-red-900/40">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2.5">
              <span class="material-symbols-outlined text-red-400 text-2xl animate-pulse">crisis_alert</span>
              <div>
                <div class="font-extrabold text-sm text-white tracking-wide">🚨 TRIGGER CRITICAL ALARM</div>
                <div class="text-[11px] text-red-200/90 font-mono">Glows Wingtips, Engine Exhaust & Tail Fins</div>
              </div>
            </div>
            <span class="px-3 py-1 rounded-full bg-red-600 text-white font-mono text-xs font-black uppercase">
              TEST ALARM
            </span>
          </div>
        </button>

        <button onclick="resetToNormal()" class="p-3.5 rounded-xl bg-gradient-to-r from-emerald-950 via-teal-900 to-emerald-950 hover:from-emerald-900 hover:to-teal-800 border-2 border-emerald-500 text-left transition shadow-lg shadow-emerald-900/40">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2.5">
              <span class="material-symbols-outlined text-emerald-400 text-2xl">check_circle</span>
              <div>
                <div class="font-extrabold text-sm text-white tracking-wide">🟢 TURN OFF ALARMS & RESET</div>
                <div class="text-[11px] text-emerald-200/90 font-mono">Restores healthy cruise & turns off all red glows</div>
              </div>
            </div>
            <span class="px-3 py-1 rounded-full bg-emerald-500 text-white font-mono text-xs font-black uppercase">
              TURN OFF
            </span>
          </div>
        </button>
      </div>

      <!-- Individual Fault Glow Points Section -->
      <div class="pt-2 border-t border-slate-800/80 space-y-2">
        <span class="text-xs font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <span class="material-symbols-outlined text-[16px] text-rose-400">colorize</span> Specific 3D Fault Glow Points (Single Component Trigger)
        </span>
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
          <button onclick="applyPreset('PROPELLER_OVERSPEED')" class="p-2.5 rounded-xl bg-red-950/40 hover:bg-red-900/60 border border-red-500/50 text-left transition text-xs">
            <div class="font-bold text-red-400 flex items-center gap-1">
              <span>🌀 Propeller End</span>
            </div>
            <div class="text-[10px] text-slate-300 font-mono">Aft Pusher Hub Glow</div>
          </button>

          <button onclick="applyPreset('MOTOR_STRESS_VIBRATION')" class="p-2.5 rounded-xl bg-orange-950/40 hover:bg-orange-900/60 border border-orange-500/50 text-left transition text-xs">
            <div class="font-bold text-orange-400 flex items-center gap-1">
              <span>⚙️ Motor / Middle</span>
            </div>
            <div class="text-[10px] text-slate-300 font-mono">Engine Bay Stress Glow</div>
          </button>

          <button onclick="applyPreset('WING_STRUCTURAL_STRESS')" class="p-2.5 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 border border-rose-500/50 text-left transition text-xs">
            <div class="font-bold text-rose-400 flex items-center gap-1">
              <span>✈️ Wings Outer</span>
            </div>
            <div class="text-[10px] text-slate-300 font-mono">Left & Right Wings Glow</div>
          </button>

          <button onclick="applyPreset('MISSILE_HARDPOINT_FAULT')" class="p-2.5 rounded-xl bg-purple-950/40 hover:bg-purple-900/60 border border-purple-500/50 text-left transition text-xs">
            <div class="font-bold text-purple-400 flex items-center gap-1">
              <span>🚀 Missiles Bottom</span>
            </div>
            <div class="text-[10px] text-slate-300 font-mono">Underwing Pylons Glow</div>
          </button>

          <button onclick="applyPreset('AVIONICS_RADAR_FAILURE')" class="p-2.5 rounded-xl bg-cyan-950/40 hover:bg-cyan-900/60 border border-cyan-500/50 text-left transition text-xs">
            <div class="font-bold text-cyan-400 flex items-center gap-1">
              <span>📡 Front Head</span>
            </div>
            <div class="text-[10px] text-slate-300 font-mono">Nose Radome / Pitot Glow</div>
          </button>

          <button onclick="applyPreset('HIGH_ALTITUDE_ICING')" class="p-2.5 rounded-xl bg-sky-950/50 hover:bg-sky-900/70 border-2 border-sky-400 text-left transition text-xs shadow-md shadow-sky-900/40">
            <div class="font-bold text-sky-300 flex items-center gap-1">
              <span>❄️ Sub-Zero Icing</span>
            </div>
            <div class="text-[10px] text-sky-200 font-mono font-semibold">Cold Blue Glow (-45°C)</div>
          </button>
        </div>
      </div>

      <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
        <button onclick="applyPreset('CRUISE_NOMINAL')" class="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-left transition text-xs">
          <div class="font-semibold text-emerald-400">TAPAS Cruise</div>
          <div class="text-[10px] text-slate-400 font-mono">2850 RPM • Nominal</div>
        </button>
        <button onclick="applyPreset('TAKEOFF_POWER')" class="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-left transition text-xs">
          <div class="font-semibold text-amber-400">Takeoff Max Power</div>
          <div class="text-[10px] text-slate-400 font-mono">5500 RPM • 42 L/h</div>
        </button>
        <button onclick="applyPreset('CRITICAL_OVERHEAT')" class="p-2.5 rounded-xl bg-red-950/40 hover:bg-red-900/60 border border-red-600/50 text-left transition text-xs">
          <div class="font-semibold text-red-400">🔥 CHT Excursion</div>
          <div class="text-[10px] text-red-300/80 font-mono">CHT 235°C (Limit: 215)</div>
        </button>
        <button onclick="applyPreset('LOW_OIL_PRESSURE')" class="p-2.5 rounded-xl bg-red-950/40 hover:bg-red-900/60 border border-red-600/50 text-left transition text-xs">
          <div class="font-semibold text-red-400">🛢️ Low Oil Press</div>
          <div class="text-[10px] text-red-300/80 font-mono">1.6 bar (Limit: 2.5)</div>
        </button>
        <button onclick="applyPreset('OVERSPEED_REDLINE')" class="p-2.5 rounded-xl bg-red-950/40 hover:bg-red-900/60 border border-red-600/50 text-left transition text-xs">
          <div class="font-semibold text-red-400">⚡ Engine Overspeed</div>
          <div class="text-[10px] text-red-300/80 font-mono">5950 RPM (Redline: 5800)</div>
        </button>
        <button onclick="applyPreset('SEVERE_VIBRATION')" class="p-2.5 rounded-xl bg-amber-950/40 hover:bg-amber-900/60 border border-amber-600/50 text-left transition text-xs">
          <div class="font-semibold text-amber-400">📳 Severe Vibration</div>
          <div class="text-[10px] text-amber-300/80 font-mono">8.4 mm/s (Limit: 7.5)</div>
        </button>
        <button onclick="applyPreset('INJECTOR_FAULT')" class="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-left transition text-xs">
          <div class="font-semibold text-blue-400">⛽ Injector C3 Bias</div>
          <div class="text-[10px] text-slate-400 font-mono">EGT C3 delta -120°C</div>
        </button>
        <button onclick="applyPreset('MISFIRE_CYL2')" class="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-left transition text-xs">
          <div class="font-semibold text-purple-400">💥 Cylinder 2 Misfire</div>
          <div class="text-[10px] text-slate-400 font-mono">EGT drop + vib surge</div>
        </button>
        <button onclick="applyPreset('SENSOR_DRIFT')" class="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-left transition text-xs">
          <div class="font-semibold text-teal-400">📡 Sensor Drift C1</div>
          <div class="text-[10px] text-slate-400 font-mono">+80°C Bias Drift</div>
        </button>
        <button onclick="applyPreset('SENSOR_FAIL')" class="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-left transition text-xs">
          <div class="font-semibold text-rose-400">🚫 Sensor Open Circuit</div>
          <div class="text-[10px] text-slate-400 font-mono">EGT C1 = 0°C (Invalid)</div>
        </button>
      </div>
    </div>

    <!-- Main Sliders Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">

      <!-- Column 1: Core Mechanics & Dynamics -->
      <div class="p-5 rounded-2xl glass-panel space-y-4">
        <h2 class="text-xs font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-800 pb-2">
          <span class="material-symbols-outlined text-[16px] text-blue-400">speed</span> Engine Mechanics & Fuel
        </h2>

        <!-- RPM -->
        <div class="space-y-1.5">
          <div class="flex justify-between text-xs">
            <span class="font-medium text-slate-300">Engine Speed (RPM)</span>
            <span class="font-mono font-bold text-blue-400" id="val-rpm">2850 RPM</span>
          </div>
          <input type="range" id="input-rpm" min="1000" max="6200" step="50" value="2850" oninput="updateParam('rpm', this.value)">
          <div class="flex justify-between text-[10px] text-slate-500 font-mono">
            <span>1000 Idle</span>
            <span class="text-amber-400">5500 Takeoff</span>
            <span class="text-red-400">5800 Redline</span>
          </div>
        </div>

        <!-- MAP -->
        <div class="space-y-1.5">
          <div class="flex justify-between text-xs">
            <span class="font-medium text-slate-300">Manifold Absolute Pressure (MAP)</span>
            <span class="font-mono font-bold text-blue-400" id="val-map">0.98 bar</span>
          </div>
          <input type="range" id="input-map" min="0.30" max="1.70" step="0.02" value="0.98" oninput="updateParam('map', this.value)">
          <div class="flex justify-between text-[10px] text-slate-500 font-mono">
            <span>0.30 Idle</span>
            <span>1.35 Takeoff</span>
            <span class="text-red-400">>1.45 Overboost</span>
          </div>
        </div>

        <!-- Fuel Flow -->
        <div class="space-y-1.5">
          <div class="flex justify-between text-xs">
            <span class="font-medium text-slate-300">Fuel Flow Rate</span>
            <span class="font-mono font-bold text-blue-400" id="val-fuel_flow">21.0 L/h</span>
          </div>
          <input type="range" id="input-fuel_flow" min="5.0" max="55.0" step="0.5" value="21.0" oninput="updateParam('fuel_flow', this.value)">
          <div class="flex justify-between text-[10px] text-slate-500 font-mono">
            <span>8 L/h Idle</span>
            <span>42 L/h Takeoff</span>
            <span class="text-red-400">>48 L/h Extreme</span>
          </div>
        </div>

        <!-- Vibration -->
        <div class="space-y-1.5">
          <div class="flex justify-between text-xs">
            <span class="font-medium text-slate-300">Airframe/Engine Vibration</span>
            <span class="font-mono font-bold text-blue-400" id="val-vibration">2.20 mm/s</span>
          </div>
          <input type="range" id="input-vibration" min="0.5" max="12.0" step="0.1" value="2.2" oninput="updateParam('vibration', this.value)">
          <div class="flex justify-between text-[10px] text-slate-500 font-mono">
            <span>&lt;3.5 Normal</span>
            <span class="text-amber-400">&gt;5.0 Warn</span>
            <span class="text-red-400">&gt;7.5 Critical</span>
          </div>
        </div>

        <!-- Battery & Electrical -->
        <div class="space-y-1.5">
          <div class="flex justify-between text-xs">
            <span class="font-medium text-slate-300">Battery System Voltage</span>
            <span class="font-mono font-bold text-blue-400" id="val-battery_voltage">28.2 V</span>
          </div>
          <input type="range" id="input-battery_voltage" min="20.0" max="32.0" step="0.2" value="28.2" oninput="updateParam('battery_voltage', this.value)">
          <div class="flex justify-between text-[10px] text-slate-500 font-mono">
            <span class="text-red-400">&lt;24V Low</span>
            <span>28.0V Nom</span>
            <span class="text-red-400">&gt;30V High</span>
          </div>
        </div>

      </div>

      <!-- Column 2: Hydraulics & 4-Cylinder Head Temps (CHT) -->
      <div class="p-5 rounded-2xl glass-panel space-y-4">
        <h2 class="text-xs font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-800 pb-2">
          <span class="material-symbols-outlined text-[16px] text-amber-400">thermostat</span> Hydraulics & CHT Thermals
        </h2>

        <!-- Oil Pressure -->
        <div class="space-y-1.5">
          <div class="flex justify-between text-xs">
            <span class="font-medium text-slate-300">Oil Pressure</span>
            <span class="font-mono font-bold text-blue-400" id="val-oil_pressure">4.20 bar</span>
          </div>
          <input type="range" id="input-oil_pressure" min="0.5" max="6.5" step="0.05" value="4.20" oninput="updateParam('oil_pressure', this.value)">
          <div class="flex justify-between text-[10px] text-slate-500 font-mono">
            <span class="text-red-400">&lt;2.5 Crit Low</span>
            <span>3.5 - 5.0 Nom</span>
            <span class="text-red-400">&gt;6.0 Overpress</span>
          </div>
        </div>

        <!-- Oil Temp -->
        <div class="space-y-1.5">
          <div class="flex justify-between text-xs">
            <span class="font-medium text-slate-300">Oil Sump Temperature</span>
            <span class="font-mono font-bold text-blue-400" id="val-oil_temperature">92.0 °C</span>
          </div>
          <input type="range" id="input-oil_temperature" min="60.0" max="150.0" step="1.0" value="92.0" oninput="updateParam('oil_temperature', this.value)">
          <div class="flex justify-between text-[10px] text-slate-500 font-mono">
            <span>80 - 105 Nom</span>
            <span class="text-amber-400">&gt;115 Warn</span>
            <span class="text-red-400">&gt;125 Crit</span>
          </div>
        </div>

        <!-- CHT Cylinders 1 - 4 -->
        <div class="pt-2 border-t border-slate-800/80 space-y-3">
          <div class="text-[11px] font-mono font-semibold text-slate-400 uppercase">Cylinder Head Temperatures (CHT) — Redline: 215°C</div>

          <div class="grid grid-cols-2 gap-3">
            <div class="space-y-1">
              <div class="flex justify-between text-[11px]">
                <span class="text-slate-400">Cyl 1 CHT</span>
                <span class="font-mono font-bold text-blue-400" id="val-cht-0">176.5°C</span>
              </div>
              <input type="range" id="input-cht-0" min="100" max="250" step="1" value="176.5" oninput="updateCht(0, this.value)">
            </div>
            <div class="space-y-1">
              <div class="flex justify-between text-[11px]">
                <span class="text-slate-400">Cyl 2 CHT</span>
                <span class="font-mono font-bold text-blue-400" id="val-cht-1">180.2°C</span>
              </div>
              <input type="range" id="input-cht-1" min="100" max="250" step="1" value="180.2" oninput="updateCht(1, this.value)">
            </div>
            <div class="space-y-1">
              <div class="flex justify-between text-[11px]">
                <span class="text-slate-400">Cyl 3 CHT</span>
                <span class="font-mono font-bold text-blue-400" id="val-cht-2">179.8°C</span>
              </div>
              <input type="range" id="input-cht-2" min="100" max="250" step="1" value="179.8" oninput="updateCht(2, this.value)">
            </div>
            <div class="space-y-1">
              <div class="flex justify-between text-[11px]">
                <span class="text-slate-400">Cyl 4 CHT</span>
                <span class="font-mono font-bold text-blue-400" id="val-cht-3">175.5°C</span>
              </div>
              <input type="range" id="input-cht-3" min="100" max="250" step="1" value="175.5" oninput="updateCht(3, this.value)">
            </div>
          </div>
        </div>

      </div>

      <!-- Column 3: 4-Cylinder Exhaust Gas Temps (EGT) & Flight State -->
      <div class="p-5 rounded-2xl glass-panel space-y-4">
        <h2 class="text-xs font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-800 pb-2">
          <span class="material-symbols-outlined text-[16px] text-rose-400">local_fire_department</span> EGT Thermals & Flight Context
        </h2>

        <!-- EGT Cylinders 1 - 4 -->
        <div class="space-y-3">
          <div class="text-[11px] font-mono font-semibold text-slate-400 uppercase">Exhaust Gas Temperatures (EGT) — Redline: 780°C</div>

          <div class="grid grid-cols-2 gap-3">
            <div class="space-y-1">
              <div class="flex justify-between text-[11px]">
                <span class="text-slate-400">Cyl 1 EGT</span>
                <span class="font-mono font-bold text-blue-400" id="val-egt-0">681.0°C</span>
              </div>
              <input type="range" id="input-egt-0" min="0" max="900" step="2" value="681" oninput="updateEgt(0, this.value)">
            </div>
            <div class="space-y-1">
              <div class="flex justify-between text-[11px]">
                <span class="text-slate-400">Cyl 2 EGT</span>
                <span class="font-mono font-bold text-blue-400" id="val-egt-1">690.5°C</span>
              </div>
              <input type="range" id="input-egt-1" min="0" max="900" step="2" value="690.5" oninput="updateEgt(1, this.value)">
            </div>
            <div class="space-y-1">
              <div class="flex justify-between text-[11px]">
                <span class="text-slate-400">Cyl 3 EGT</span>
                <span class="font-mono font-bold text-blue-400" id="val-egt-2">688.0°C</span>
              </div>
              <input type="range" id="input-egt-2" min="0" max="900" step="2" value="688" oninput="updateEgt(2, this.value)">
            </div>
            <div class="space-y-1">
              <div class="flex justify-between text-[11px]">
                <span class="text-slate-400">Cyl 4 EGT</span>
                <span class="font-mono font-bold text-blue-400" id="val-egt-3">680.5°C</span>
              </div>
              <input type="range" id="input-egt-3" min="0" max="900" step="2" value="680.5" oninput="updateEgt(3, this.value)">
            </div>
          </div>
        </div>

        <!-- Altitude & Airspeed -->
        <div class="pt-2 border-t border-slate-800/80 space-y-3">
          <div class="space-y-1.5">
            <div class="flex justify-between text-xs">
              <span class="font-medium text-slate-300">Flight Altitude</span>
              <span class="font-mono font-bold text-blue-400" id="val-altitude_m">8467 m</span>
            </div>
            <input type="range" id="input-altitude_m" min="0" max="10000" step="50" value="8467" oninput="updateParam('altitude_m', this.value)">
          </div>

          <div class="space-y-1.5">
            <div class="flex justify-between text-xs">
              <span class="font-medium text-slate-300">Airspeed (IAS)</span>
              <span class="font-mono font-bold text-blue-400" id="val-airspeed_kmh">195 km/h</span>
            </div>
            <input type="range" id="input-airspeed_kmh" min="0" max="300" step="5" value="195" oninput="updateParam('airspeed_kmh', this.value)">
          </div>
        </div>

      </div>

    </div>

    <!-- Live Monitor Stream Log -->
    <div class="p-5 rounded-2xl glass-panel space-y-2">
      <div class="flex items-center justify-between text-xs font-mono text-slate-400">
        <span class="flex items-center gap-1.5">
          <span class="w-2 h-2 rounded-full bg-emerald-400"></span> Active Telemetry Frame Broadcast:
        </span>
        <span id="frame-counter" class="text-white font-bold">Frame #0</span>
      </div>
      <div id="live-stream-box" class="p-3 rounded-xl bg-black/60 border border-slate-800 font-mono text-xs text-slate-300 overflow-x-auto whitespace-pre">Connecting to live stream...</div>
    </div>

  </div>

  <script>
    let isManualMode = true;
    let ws = null;
    let currentCht = [176.5, 180.2, 179.8, 175.5];
    let currentEgt = [681.0, 690.5, 688.0, 680.5];

    function initWebSocket() {
      const wsUrl = `ws://${window.location.host}/ws/telemetry`;
      ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        document.getElementById('stream-badge').innerText = 'LIVE STREAM CONNECTED';
        document.getElementById('stream-badge').className = 'text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-semibold';
      };

      ws.onmessage = (event) => {
        try {
          const frame = JSON.parse(event.data);
          const t = frame.telemetry;
          const h = frame.health;
          const d = frame.diagnostics;

          document.getElementById('frame-counter').innerText = `Frame #${t.frame_id} • Timestamp: ${t.timestamp.split('T')[1].split('.')[0]} UTC`;
          document.getElementById('live-stream-box').innerText = 
            `RPM: ${t.rpm.toFixed(1)} | MAP: ${t.map.toFixed(2)}b | CHT Avg: ${(t.cht.reduce((a,b)=>a+b,0)/4).toFixed(1)}°C | EGT Avg: ${(t.egt.reduce((a,b)=>a+b,0)/4).toFixed(1)}°C | OilP: ${t.oil_pressure.toFixed(2)}b | Vib: ${t.vibration.toFixed(2)}mm/s | Health: ${h.index.toFixed(1)}% | Fault: ${d.primary_fault} | Severity: ${d.severity}`;

          // Check TAPAS DRDO limits and show banner
          const isCritical = d.severity === 'CRITICAL' || d.severity === 'HIGH';
          const banner = document.getElementById('tapas-alert-banner');
          if (isCritical) {
            banner.classList.remove('hidden');
            const alertText = d.evidence && d.evidence.length > 0 ? d.evidence[0] : `Critical Fault: ${d.primary_fault}`;
            document.getElementById('tapas-alert-msg').innerText = alertText;
          } else {
            banner.classList.add('hidden');
          }
        } catch(e){}
      };

      ws.onclose = () => {
        document.getElementById('stream-badge').innerText = 'STREAM RECONNECTING...';
        document.getElementById('stream-badge').className = 'text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 font-semibold';
        setTimeout(initWebSocket, 2000);
      };
    }

    function toggleControlMode() {
      isManualMode = !isManualMode;
      const text = document.getElementById('mode-text');
      const btn = document.getElementById('btn-toggle-mode');
      if (isManualMode) {
        text.innerText = 'Mode: MANUAL OVERRIDE';
        btn.className = 'px-4 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20 flex items-center gap-2';
        fetch('/api/manual-control', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({ manual_override: true })
        });
      } else {
        text.innerText = 'Mode: AUTO SIMULATION';
        btn.className = 'px-4 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all bg-slate-700 hover:bg-slate-600 text-slate-200 border border-slate-600 flex items-center gap-2';
        fetch('/api/manual-control', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({ manual_override: false })
        });
      }
    }

    function updateParam(key, value) {
      const num = parseFloat(value);
      const label = document.getElementById(`val-${key}`);
      if (key === 'rpm') label.innerText = `${Math.round(num)} RPM`;
      else if (key === 'map') label.innerText = `${num.toFixed(2)} bar`;
      else if (key === 'fuel_flow') label.innerText = `${num.toFixed(1)} L/h`;
      else if (key === 'vibration') label.innerText = `${num.toFixed(2)} mm/s`;
      else if (key === 'oil_pressure') label.innerText = `${num.toFixed(2)} bar`;
      else if (key === 'oil_temperature') label.innerText = `${num.toFixed(1)} °C`;
      else if (key === 'battery_voltage') label.innerText = `${num.toFixed(1)} V`;
      else if (key === 'altitude_m') label.innerText = `${Math.round(num)} m`;
      else if (key === 'airspeed_kmh') label.innerText = `${Math.round(num)} km/h`;

      fetch('/api/manual-control/param', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ key, value: num })
      });
    }

    function updateCht(idx, val) {
      currentCht[idx] = parseFloat(val);
      document.getElementById(`val-cht-${idx}`).innerText = `${currentCht[idx].toFixed(1)}°C`;
      fetch('/api/manual-control/param', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ key: 'cht', value: currentCht })
      });
    }

    function updateEgt(idx, val) {
      currentEgt[idx] = parseFloat(val);
      document.getElementById(`val-egt-${idx}`).innerText = `${currentEgt[idx].toFixed(1)}°C`;
      fetch('/api/manual-control/param', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ key: 'egt', value: currentEgt })
      });
    }

    function applyPreset(preset) {
      isManualMode = true;
      document.getElementById('mode-text').innerText = 'Mode: MANUAL OVERRIDE';

      if (preset === 'PROPELLER_OVERSPEED') {
        fetch('/api/scenarios/start', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({ scenario_id: 'PROPELLER_OVERSPEED', duration_s: 120 })
        });
        setAllValues({ rpm: 5900, map: 1.45, fuel_flow: 46.0, vibration: 4.8, oil_pressure: 4.8, oil_temperature: 104.0, cht: [195, 198, 196, 192], egt: [760, 768, 765, 755], altitude_m: 6000, airspeed_kmh: 215 });
      } else if (preset === 'MOTOR_STRESS_VIBRATION') {
        fetch('/api/scenarios/start', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({ scenario_id: 'MOTOR_STRESS_VIBRATION', duration_s: 120 })
        });
        setAllValues({ rpm: 3400, map: 1.10, fuel_flow: 26.0, vibration: 6.8, oil_pressure: 2.1, oil_temperature: 128.0, cht: [224, 230, 226, 220], egt: [750, 760, 755, 745], altitude_m: 7500, airspeed_kmh: 185 });
      } else if (preset === 'WING_STRUCTURAL_STRESS') {
        fetch('/api/scenarios/start', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({ scenario_id: 'WING_STRUCTURAL_STRESS', duration_s: 120 })
        });
        setAllValues({ rpm: 2850, map: 0.98, fuel_flow: 21.0, vibration: 8.2, oil_pressure: 4.2, oil_temperature: 92.0, cht: [176.5, 180.2, 179.8, 175.5], egt: [681, 690.5, 688, 680.5], altitude_m: 8500, airspeed_kmh: 275 });
      } else if (preset === 'MISSILE_HARDPOINT_FAULT') {
        fetch('/api/scenarios/start', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({ scenario_id: 'MISSILE_HARDPOINT_FAULT', duration_s: 120 })
        });
        setAllValues({ rpm: 2850, map: 0.98, fuel_flow: 21.0, vibration: 3.5, oil_pressure: 4.2, oil_temperature: 92.0, battery_voltage: 22.5, cht: [176.5, 180.2, 179.8, 175.5], egt: [681, 690.5, 688, 680.5], altitude_m: 7000, airspeed_kmh: 190 });
      } else if (preset === 'AVIONICS_RADAR_FAILURE') {
        fetch('/api/scenarios/start', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({ scenario_id: 'AVIONICS_RADAR_FAILURE', duration_s: 120 })
        });
        setAllValues({ rpm: 2850, map: 0.98, fuel_flow: 21.0, vibration: 2.2, oil_pressure: 4.2, oil_temperature: 92.0, battery_voltage: 23.8, cht: [176.5, 180.2, 179.8, 175.5], egt: [681, 690.5, 688, 680.5], altitude_m: 4000, airspeed_kmh: 0 });
      } else if (preset === 'HIGH_ALTITUDE_ICING') {
        fetch('/api/scenarios/start', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({ scenario_id: 'HIGH_ALTITUDE_ICING', duration_s: 120 })
        });
        setAllValues({ rpm: 2850, map: 0.98, fuel_flow: 21.0, vibration: 4.2, oil_pressure: 2.2, oil_temperature: 58.0, battery_voltage: 23.5, cht: [135.0, 140.0, 138.0, 132.0], egt: [640, 650, 645, 638], altitude_m: 9500, airspeed_kmh: 185 });
      } else if (preset === 'FULL_AIRFRAME_ALERT') {
        fetch('/api/scenarios/start', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({ scenario_id: 'FULL_AIRFRAME_ALERT', duration_s: 120 })
        });
        setAllValues({ rpm: 6000, map: 1.55, fuel_flow: 52.0, vibration: 9.5, oil_pressure: 1.4, oil_temperature: 135.0, cht: [242, 248, 245, 240], egt: [820, 835, 830, 815], altitude_m: 3200, airspeed_kmh: 220 });
      } else if (preset === 'CRUISE_NOMINAL') {
        setAllValues({ rpm: 2850, map: 0.98, fuel_flow: 21.0, vibration: 2.2, oil_pressure: 4.2, oil_temperature: 92.0, cht: [176.5, 180.2, 179.8, 175.5], egt: [681, 690.5, 688, 680.5], altitude_m: 8467, airspeed_kmh: 195 });
      } else if (preset === 'TAKEOFF_POWER') {
        setAllValues({ rpm: 5500, map: 1.35, fuel_flow: 42.0, vibration: 3.4, oil_pressure: 4.8, oil_temperature: 98.0, cht: [205, 208, 207, 204], egt: [750, 760, 755, 748], altitude_m: 450, airspeed_kmh: 145 });
      } else if (preset === 'CRITICAL_OVERHEAT') {
        setAllValues({ rpm: 5400, map: 1.30, fuel_flow: 40.0, vibration: 4.5, oil_pressure: 3.4, oil_temperature: 122.0, cht: [228, 235, 232, 226], egt: [795, 810, 805, 790], altitude_m: 3500, airspeed_kmh: 160 });
      } else if (preset === 'LOW_OIL_PRESSURE') {
        setAllValues({ rpm: 2800, map: 0.95, fuel_flow: 20.0, vibration: 4.2, oil_pressure: 1.65, oil_temperature: 132.0, cht: [185, 188, 186, 184], egt: [690, 700, 695, 688], altitude_m: 7200, airspeed_kmh: 185 });
      } else if (preset === 'OVERSPEED_REDLINE') {
        setAllValues({ rpm: 5950, map: 1.48, fuel_flow: 48.0, vibration: 6.8, oil_pressure: 5.2, oil_temperature: 108.0, cht: [218, 222, 220, 216], egt: [785, 792, 790, 782], altitude_m: 2000, airspeed_kmh: 210 });
      } else if (preset === 'SEVERE_VIBRATION') {
        setAllValues({ rpm: 2850, map: 0.98, fuel_flow: 21.0, vibration: 8.8, oil_pressure: 4.0, oil_temperature: 96.0, cht: [180, 184, 182, 178], egt: [685, 695, 690, 682], altitude_m: 5000, airspeed_kmh: 175 });
      } else if (preset === 'INJECTOR_FAULT') {
        setAllValues({ rpm: 2750, map: 0.94, fuel_flow: 18.5, vibration: 4.8, oil_pressure: 4.1, oil_temperature: 94.0, cht: [178, 182, 145, 177], egt: [688, 695, 540, 685], altitude_m: 8000, airspeed_kmh: 190 });
      } else if (preset === 'MISFIRE_CYL2') {
        setAllValues({ rpm: 2700, map: 0.92, fuel_flow: 17.5, vibration: 6.2, oil_pressure: 4.0, oil_temperature: 93.0, cht: [176, 138, 178, 175], egt: [682, 510, 686, 680], altitude_m: 6500, airspeed_kmh: 180 });
      } else if (preset === 'SENSOR_DRIFT') {
        setAllValues({ rpm: 2850, map: 0.98, fuel_flow: 21.0, vibration: 2.2, oil_pressure: 4.2, oil_temperature: 92.0, cht: [176.5, 180.2, 179.8, 175.5], egt: [765, 690.5, 688, 680.5], altitude_m: 8467, airspeed_kmh: 195 });
      } else if (preset === 'SENSOR_FAIL') {
        setAllValues({ rpm: 2850, map: 0.98, fuel_flow: 21.0, vibration: 2.2, oil_pressure: 4.2, oil_temperature: 92.0, cht: [176.5, 180.2, 179.8, 175.5], egt: [0, 690.5, 688, 680.5], altitude_m: 8467, airspeed_kmh: 195 });
      }
    }

    function setAllValues(vals) {
      for (const [k, v] of Object.entries(vals)) {
        if (k === 'cht') {
          currentCht = [...v];
          v.forEach((val, idx) => {
            document.getElementById(`input-cht-${idx}`).value = val;
            document.getElementById(`val-cht-${idx}`).innerText = `${val.toFixed(1)}°C`;
          });
        } else if (k === 'egt') {
          currentEgt = [...v];
          v.forEach((val, idx) => {
            document.getElementById(`input-egt-${idx}`).value = val;
            document.getElementById(`val-egt-${idx}`).innerText = `${val.toFixed(1)}°C`;
          });
        } else {
          const input = document.getElementById(`input-${k}`);
          if (input) input.value = v;
          updateParamLabel(k, v);
        }
      }

      fetch('/api/manual-control', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ manual_override: true, values: vals })
      });
    }

    function updateParamLabel(key, num) {
      const label = document.getElementById(`val-${key}`);
      if (!label) return;
      if (key === 'rpm') label.innerText = `${Math.round(num)} RPM`;
      else if (key === 'map') label.innerText = `${num.toFixed(2)} bar`;
      else if (key === 'fuel_flow') label.innerText = `${num.toFixed(1)} L/h`;
      else if (key === 'vibration') label.innerText = `${num.toFixed(2)} mm/s`;
      else if (key === 'oil_pressure') label.innerText = `${num.toFixed(2)} bar`;
      else if (key === 'oil_temperature') label.innerText = `${num.toFixed(1)} °C`;
      else if (key === 'battery_voltage') label.innerText = `${num.toFixed(1)} V`;
      else if (key === 'altitude_m') label.innerText = `${Math.round(num)} m`;
      else if (key === 'airspeed_kmh') label.innerText = `${Math.round(num)} km/h`;
    }

    function resetToNormal() {
      fetch('/api/scenarios/stop', { method: 'POST' });
      fetch('/api/manual-control', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ manual_override: false })
      });
      applyPreset('CRUISE_NOMINAL');
    }


    window.onload = initWebSocket;
  </script>
</body>
</html>
"""
