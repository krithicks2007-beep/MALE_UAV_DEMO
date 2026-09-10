"""
HTML UI Generator for UAV Dummy Data Control Panel.
Served directly by the FastAPI backend at /control, /generator, and /generator-ui.
Features a deep aerospace forest-and-sage green dark glassmorphism theme that is comfortable and non-glare.
"""

GENERATOR_HTML_CONTENT = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>MALE UAV • Telemetry Data Generator & Scenario Control</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" />
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    :root {
      --color-canvas:         #0c140f;
      --color-surface:        #14221a;
      --color-surface-card:   #182a20;
      --color-surface-sage:   #1f3629;
      
      --sage-50:  #f0f6f2;
      --sage-100: #dceae0;
      --sage-200: #bcd7c3;
      --sage-300: #93bfa0;
      --sage-400: #6ca57c;
      --sage-500: #4e8a5f;
      --sage-600: #3b6e4b;
      --sage-700: #30573c;
      --sage-800: #264531;
      --sage-900: #193021;
      --sage-950: #0d1a12;

      --emerald-accent: #10b981;
      --emerald-glow:   #34d399;
      --mint-text:      #a7f3d0;
      --sage-text:      #d1e7d8;
      --sage-muted:     #7fa88d;
      
      --border-forest:  rgba(78, 138, 95, 0.28);
      --border-bright:  rgba(52, 211, 153, 0.40);
    }

    * { box-sizing: border-box; }
    ::-webkit-scrollbar { display: none; }
    * { scrollbar-width: none; }

    body {
      font-family: 'Manrope', sans-serif;
      background-color: var(--color-canvas);
      background-image: 
        radial-gradient(circle at 50% 0%, rgba(38, 69, 49, 0.45) 0%, transparent 65%),
        radial-gradient(circle at 10% 40%, rgba(20, 48, 30, 0.35) 0%, transparent 50%),
        radial-gradient(circle at 90% 80%, rgba(25, 60, 38, 0.30) 0%, transparent 50%);
      background-attachment: fixed;
      color: var(--sage-text);
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      min-height: 100vh;
    }

    .font-mono { font-family: 'JetBrains Mono', monospace; }

    .glass-forest {
      background: rgba(20, 34, 26, 0.85);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border: 1px solid var(--border-forest);
      box-shadow: 0 14px 40px -10px rgba(4, 12, 7, 0.6);
    }

    .glass-forest-subtle {
      background: rgba(16, 28, 21, 0.75);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border: 1px solid rgba(78, 138, 95, 0.22);
    }

    .glass-sage-deep {
      background: rgba(27, 47, 36, 0.85);
      backdrop-filter: blur(24px);
      -webkit-backdrop-filter: blur(24px);
      border: 1px solid rgba(110, 175, 130, 0.35);
      box-shadow: 0 14px 40px -10px rgba(4, 12, 7, 0.6);
    }

    .glass-dark-terminal {
      background: rgba(10, 18, 13, 0.95);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border: 1px solid rgba(48, 87, 60, 0.45);
      box-shadow: 0 14px 36px -10px rgba(0, 0, 0, 0.7);
    }

    .card-hover {
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .card-hover:hover {
      box-shadow: 0 14px 36px -8px rgba(16, 185, 129, 0.18);
      border-color: rgba(52, 211, 153, 0.5);
      transform: translateY(-2px);
    }

    .pill-btn-emerald {
      background: linear-gradient(135deg, #059669 0%, #047857 100%);
      color: #f0fdf4;
      border-radius: 9999px;
      border: 1px solid rgba(110, 231, 183, 0.35);
      box-shadow: 0 4px 14px rgba(5, 150, 105, 0.35);
      transition: all 0.15s ease;
    }
    .pill-btn-emerald:hover {
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      box-shadow: 0 6px 20px rgba(16, 185, 129, 0.45);
      transform: scale(1.02);
    }

    .section-heading {
      font-size: 0.68rem;
      font-weight: 700;
      letter-spacing: 0.09em;
      text-transform: uppercase;
      color: #6ee7b7;
    }

    .label-mono {
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.65rem;
      font-weight: 600;
      letter-spacing: 0.07em;
      text-transform: uppercase;
    }

    .display-num {
      font-family: 'Manrope', sans-serif;
      font-weight: 500;
      letter-spacing: -0.02em;
    }

    /* Custom Deep Green Range Sliders */
    input[type=range] {
      -webkit-appearance: none;
      width: 100%;
      background: #16271e;
      height: 7px;
      border-radius: 9999px;
      outline: none;
      border: 1px solid rgba(78, 138, 95, 0.35);
      transition: background 0.2s, border-color 0.2s;
    }
    input[type=range]:hover {
      background: #1d3528;
      border-color: rgba(52, 211, 153, 0.5);
    }
    input[type=range]::-webkit-slider-thumb {
      -webkit-appearance: none;
      appearance: none;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: #10b981;
      cursor: pointer;
      border: 2.5px solid #d1fae5;
      box-shadow: 0 0 10px rgba(16, 185, 129, 0.65);
      transition: all 0.15s ease;
    }
    input[type=range]::-webkit-slider-thumb:hover {
      transform: scale(1.22);
      background: #34d399;
      box-shadow: 0 0 16px rgba(52, 211, 153, 0.85);
    }
  </style>
</head>
<body class="min-h-screen p-4 lg:p-8 flex flex-col items-center">

  <div class="w-full max-w-[1560px] space-y-6">

    <!-- Top Navigation Header -->
    <header class="w-full sticky top-0 z-50 glass-forest rounded-3xl p-4 border border-emerald-900/50 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
      
      <!-- Brand Section -->
      <div class="flex items-center gap-3.5">
        <div class="w-11 h-11 rounded-full flex items-center justify-center bg-emerald-950/90 shadow-md border border-emerald-500/40 text-emerald-400">
          <span class="material-symbols-outlined text-[22px]">flight</span>
        </div>
        <div>
          <div class="flex items-center gap-2.5">
            <h1 class="text-base font-bold tracking-tight text-white">MALE UAV</h1>
            <span class="text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 font-semibold tracking-wider border border-emerald-500/40">
              Digital Twin
            </span>
            <span id="stream-badge" class="text-[10px] font-mono uppercase px-3 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/60 font-bold shadow-xs">
              LIVE STREAM ACTIVE
            </span>
          </div>
          <p class="text-xs text-sage-300 font-medium">
            Telemetry Data Generator & Scenario Control Console • SIH 2026
          </p>
        </div>
      </div>

      <!-- System Status Pills & Actions -->
      <div class="flex flex-wrap items-center gap-3">
        
        <div class="hidden lg:flex items-center gap-2 p-1.5 rounded-full bg-[#111e16]/90 border border-emerald-900/60 shadow-sm text-xs font-mono">
          <div class="flex items-center gap-2 px-3 py-1 rounded-full bg-[#16271e] border border-emerald-900/40">
            <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span class="text-sage-400 font-medium">ECU:</span>
            <span class="text-white font-semibold">Online</span>
          </div>
          <div class="flex items-center gap-2 px-3 py-1 rounded-full bg-[#16271e] border border-emerald-900/40">
            <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span class="text-sage-400 font-medium">CAN:</span>
            <span class="text-white font-semibold">Connected</span>
          </div>
          <div class="flex items-center gap-2 px-3 py-1 rounded-full bg-[#16271e] border border-emerald-900/40">
            <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span class="text-sage-400 font-medium">Sensors:</span>
            <span class="text-white font-semibold">Normal</span>
          </div>
          <div class="flex items-center gap-2 px-3.5 py-1 rounded-full text-white bg-emerald-800 border border-emerald-600/40 shadow-xs">
            <span class="w-2 h-2 rounded-full bg-white animate-ping"></span>
            <span class="font-medium text-emerald-100">Source:</span>
            <span class="font-bold">Generator</span>
          </div>
        </div>

        <a href="http://127.0.0.1:5173" target="_blank" class="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-emerald-900/90 hover:bg-emerald-800 text-emerald-200 hover:text-white border border-emerald-500/40 text-xs font-mono font-medium shadow-sm transition">
          <span class="material-symbols-outlined text-[16px]">dashboard</span>
          <span>Open Main Dashboard</span>
          <span class="material-symbols-outlined text-[14px]">open_in_new</span>
        </a>

        <button id="btn-toggle-mode" onclick="toggleControlMode()" class="pill-btn-emerald px-4 py-2 text-xs font-mono font-semibold tracking-wide flex items-center gap-2 shadow-sm">
          <span class="material-symbols-outlined text-[16px]">tune</span>
          <span id="mode-text">Mode: MANUAL OVERRIDE</span>
        </button>
      </div>
    </header>

    <!-- Quick Presets Panel -->
    <div class="glass-forest rounded-3xl p-6 border border-emerald-900/50 shadow-xl space-y-4">
      <div class="flex items-center justify-between border-b border-emerald-900/50 pb-3">
        <div class="flex items-center gap-2">
          <div class="w-7 h-7 rounded-full bg-emerald-950 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <span class="material-symbols-outlined text-[16px]">bolt</span>
          </div>
          <span class="section-heading">Quick Scenario & TAPAS Test Presets</span>
        </div>
        <button onclick="resetToNormal()" class="text-xs text-emerald-400 hover:text-emerald-300 font-mono font-semibold flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-950/70 border border-emerald-600/40 transition">
          <span class="material-symbols-outlined text-[14px]">restart_alt</span> Reset to Nominal
        </button>
      </div>

      <!-- Prominent Test Alarm vs Turn Off Actions -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        <button onclick="applyPreset('FULL_AIRFRAME_ALERT')" class="p-4 rounded-2xl bg-gradient-to-r from-red-950/80 via-rose-950/70 to-red-950/80 hover:from-red-900 hover:to-rose-900 border-2 border-red-500/60 text-left transition shadow-md card-hover">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <span class="material-symbols-outlined text-red-400 text-2xl animate-pulse">crisis_alert</span>
              <div>
                <div class="font-bold text-sm text-white tracking-wide">🚨 TRIGGER FULL AIRFRAME ALARM</div>
                <div class="text-[11px] text-red-300 font-mono">Glows Wingtips, Pusher Propeller, Engine & Tail Fins</div>
              </div>
            </div>
            <span class="px-3 py-1 rounded-full bg-red-600 text-white font-mono text-xs font-black uppercase shadow-sm">
              TEST ALARM
            </span>
          </div>
        </button>

        <button onclick="resetToNormal()" class="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/80 via-teal-950/70 to-emerald-950/80 hover:from-emerald-900 hover:to-teal-900 border-2 border-emerald-500/60 text-left transition shadow-md card-hover">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <span class="material-symbols-outlined text-emerald-400 text-2xl">check_circle</span>
              <div>
                <div class="font-bold text-sm text-white tracking-wide">🟢 TURN OFF ALARMS & RESET</div>
                <div class="text-[11px] text-emerald-300 font-mono">Restores clean cruise & turns off all 3D alarm glows</div>
              </div>
            </div>
            <span class="px-3 py-1 rounded-full bg-emerald-600 text-white font-mono text-xs font-black uppercase shadow-sm">
              RESET NOMINAL
            </span>
          </div>
        </button>
      </div>

      <!-- Row 1: Single Component Fault Glow Points -->
      <div class="pt-2 border-t border-emerald-900/50 space-y-2.5">
        <span class="label-mono text-sage-400 flex items-center gap-1.5">
          <span class="material-symbols-outlined text-[15px] text-emerald-400">colorize</span> Specific 3D Fault Glow Points (Single Component Trigger)
        </span>
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-7 gap-2.5">
          <button onclick="applyPreset('PROPELLER_OVERSPEED')" class="p-3 rounded-2xl glass-forest-subtle hover:bg-emerald-950/90 border border-emerald-900/60 hover:border-red-500/50 text-left transition card-hover">
            <div class="font-bold text-red-400 flex items-center gap-1 text-xs">
              <span>🌀 Propeller End</span>
            </div>
            <div class="text-[10px] text-sage-400 font-mono">Aft Pusher Hub Glow</div>
          </button>

          <button onclick="applyPreset('MOTOR_STRESS_VIBRATION')" class="p-3 rounded-2xl glass-forest-subtle hover:bg-emerald-950/90 border border-emerald-900/60 hover:border-orange-500/50 text-left transition card-hover">
            <div class="font-bold text-orange-400 flex items-center gap-1 text-xs">
              <span>⚙️ Motor / Middle</span>
            </div>
            <div class="text-[10px] text-sage-400 font-mono">Engine Bay Glow</div>
          </button>

          <button onclick="applyPreset('WING_STRUCTURAL_STRESS')" class="p-3 rounded-2xl glass-forest-subtle hover:bg-emerald-950/90 border border-emerald-900/60 hover:border-rose-500/50 text-left transition card-hover">
            <div class="font-bold text-rose-400 flex items-center gap-1 text-xs">
              <span>✈️ Wings Outer</span>
            </div>
            <div class="text-[10px] text-sage-400 font-mono">Left & Right Wings</div>
          </button>

          <button onclick="applyPreset('MISSILE_HARDPOINT_FAULT')" class="p-3 rounded-2xl glass-forest-subtle hover:bg-emerald-950/90 border border-emerald-900/60 hover:border-purple-500/50 text-left transition card-hover">
            <div class="font-bold text-purple-400 flex items-center gap-1 text-xs">
              <span>🚀 Missiles Bottom</span>
            </div>
            <div class="text-[10px] text-sage-400 font-mono">Underwing Pylons</div>
          </button>

          <button onclick="applyPreset('AVIONICS_RADAR_FAILURE')" class="p-3 rounded-2xl glass-forest-subtle hover:bg-emerald-950/90 border border-emerald-900/60 hover:border-cyan-500/50 text-left transition card-hover">
            <div class="font-bold text-cyan-400 flex items-center gap-1 text-xs">
              <span>📡 Front Head</span>
            </div>
            <div class="text-[10px] text-sage-400 font-mono">Nose Radome / FLIR</div>
          </button>

          <button onclick="applyPreset('HIGH_ALTITUDE_ICING')" class="p-3 rounded-2xl glass-forest-subtle hover:bg-sky-950/80 border border-sky-500/40 text-left transition card-hover">
            <div class="font-bold text-sky-300 flex items-center gap-1 text-xs">
              <span>❄️ Airframe Icing</span>
            </div>
            <div class="text-[10px] text-sky-200 font-mono font-semibold">Sub-Zero (-45°C)</div>
          </button>

          <button onclick="applyPreset('PROPELLER_ICING')" class="p-3 rounded-2xl glass-forest-subtle hover:bg-sky-950/80 border-2 border-sky-400/60 text-left transition card-hover">
            <div class="font-bold text-sky-300 flex items-center gap-1 text-xs">
              <span>❄️ Propeller Icing</span>
            </div>
            <div class="text-[10px] text-sky-200 font-mono font-bold">Only Propeller Blue</div>
          </button>
        </div>
      </div>

      <!-- Row 2: 10 Operational & Flight Envelope Presets -->
      <div class="pt-2 border-t border-emerald-900/50 space-y-2.5">
        <span class="label-mono text-sage-400 flex items-center gap-1.5">
          <span class="material-symbols-outlined text-[15px] text-emerald-400">tune</span> Operational Envelopes & Diagnostic Fault Injections
        </span>
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
          <button onclick="applyPreset('CRUISE_NOMINAL')" class="p-3 rounded-2xl glass-forest-subtle hover:bg-emerald-950/90 border border-emerald-900/60 hover:border-emerald-500/50 text-left transition card-hover">
            <div class="font-bold text-emerald-300 text-xs">TAPAS Cruise</div>
            <div class="text-[10px] text-sage-400 font-mono">2850 RPM • Nominal</div>
          </button>
          <button onclick="applyPreset('TAKEOFF_POWER')" class="p-3 rounded-2xl glass-forest-subtle hover:bg-emerald-950/90 border border-emerald-900/60 hover:border-amber-500/50 text-left transition card-hover">
            <div class="font-bold text-amber-300 text-xs">Takeoff Max Power</div>
            <div class="text-[10px] text-sage-400 font-mono">5500 RPM • 42 L/h</div>
          </button>
          <button onclick="applyPreset('CRITICAL_OVERHEAT')" class="p-3 rounded-2xl glass-forest-subtle hover:bg-red-950/80 border border-emerald-900/60 hover:border-red-500/50 text-left transition card-hover">
            <div class="font-bold text-red-400 text-xs">🔥 CHT Excursion</div>
            <div class="text-[10px] text-red-300 font-mono">CHT 235°C (Limit: 215)</div>
          </button>
          <button onclick="applyPreset('LOW_OIL_PRESSURE')" class="p-3 rounded-2xl glass-forest-subtle hover:bg-red-950/80 border border-emerald-900/60 hover:border-red-500/50 text-left transition card-hover">
            <div class="font-bold text-red-400 text-xs">🛢️ Low Oil Press</div>
            <div class="text-[10px] text-red-300 font-mono">1.6 bar (Limit: 2.5)</div>
          </button>
          <button onclick="applyPreset('OVERSPEED_REDLINE')" class="p-3 rounded-2xl glass-forest-subtle hover:bg-red-950/80 border border-emerald-900/60 hover:border-red-500/50 text-left transition card-hover">
            <div class="font-bold text-red-400 text-xs">⚡ Engine Overspeed</div>
            <div class="text-[10px] text-red-300 font-mono">5950 RPM (Redline: 5800)</div>
          </button>
          <button onclick="applyPreset('SEVERE_VIBRATION')" class="p-3 rounded-2xl glass-forest-subtle hover:bg-amber-950/80 border border-emerald-900/60 hover:border-amber-500/50 text-left transition card-hover">
            <div class="font-bold text-amber-300 text-xs">📳 Severe Vibration</div>
            <div class="text-[10px] text-amber-200 font-mono">8.4 mm/s (Limit: 7.5)</div>
          </button>
          <button onclick="applyPreset('INJECTOR_FAULT')" class="p-3 rounded-2xl glass-forest-subtle hover:bg-emerald-950/90 border border-emerald-900/60 hover:border-blue-500/50 text-left transition card-hover">
            <div class="font-bold text-blue-300 text-xs">⛽ Injector C3 Bias</div>
            <div class="text-[10px] text-sage-400 font-mono">EGT C3 delta -120°C</div>
          </button>
          <button onclick="applyPreset('MISFIRE_CYL2')" class="p-3 rounded-2xl glass-forest-subtle hover:bg-emerald-950/90 border border-emerald-900/60 hover:border-purple-500/50 text-left transition card-hover">
            <div class="font-bold text-purple-300 text-xs">💥 Cylinder 2 Misfire</div>
            <div class="text-[10px] text-sage-400 font-mono">EGT drop + vib surge</div>
          </button>
          <button onclick="applyPreset('SENSOR_DRIFT')" class="p-3 rounded-2xl glass-forest-subtle hover:bg-emerald-950/90 border border-emerald-900/60 hover:border-teal-500/50 text-left transition card-hover">
            <div class="font-bold text-teal-300 text-xs">📡 Sensor Drift C1</div>
            <div class="text-[10px] text-sage-400 font-mono">+80°C Bias Drift</div>
          </button>
          <button onclick="applyPreset('SENSOR_FAIL')" class="p-3 rounded-2xl glass-forest-subtle hover:bg-emerald-950/90 border border-emerald-900/60 hover:border-rose-500/50 text-left transition card-hover">
            <div class="font-bold text-rose-400 text-xs">🚫 Sensor Open Circuit</div>
            <div class="text-[10px] text-sage-400 font-mono">EGT C1 = 0°C (Invalid)</div>
          </button>
        </div>
      </div>
    </div>

    <!-- Main Sliders 3-Column Bento Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">

      <!-- Column 1: Core Mechanics & Dynamics -->
      <div class="glass-forest rounded-3xl p-6 border border-emerald-900/50 shadow-xl space-y-5 card-hover flex flex-col justify-between">
        <div>
          <div class="flex items-center gap-2 border-b border-emerald-900/50 pb-3 mb-4">
            <div class="w-7 h-7 rounded-full bg-emerald-950 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <span class="material-symbols-outlined text-[16px]">speed</span>
            </div>
            <h2 class="section-heading">Engine Mechanics & Fuel</h2>
          </div>

          <div class="space-y-4">
            <!-- RPM -->
            <div class="space-y-1.5 glass-forest-subtle p-3.5 rounded-2xl border border-emerald-900/40">
              <div class="flex justify-between items-center text-xs">
                <span class="font-medium text-sage-300">Engine Speed (RPM)</span>
                <span class="font-mono font-bold text-emerald-300 text-sm" id="val-rpm">2850 RPM</span>
              </div>
              <input type="range" id="input-rpm" min="1000" max="6200" step="50" value="2850" oninput="updateParam('rpm', this.value)">
              <div class="flex justify-between text-[10px] text-sage-400 font-mono">
                <span>1000 Idle</span>
                <span class="text-amber-400 font-semibold">5500 Takeoff</span>
                <span class="text-red-400 font-semibold">5800 Redline</span>
              </div>
            </div>

            <!-- MAP -->
            <div class="space-y-1.5 glass-forest-subtle p-3.5 rounded-2xl border border-emerald-900/40">
              <div class="flex justify-between items-center text-xs">
                <span class="font-medium text-sage-300">Manifold Pressure (MAP)</span>
                <span class="font-mono font-bold text-emerald-300 text-sm" id="val-map">0.98 bar</span>
              </div>
              <input type="range" id="input-map" min="0.30" max="1.70" step="0.02" value="0.98" oninput="updateParam('map', this.value)">
              <div class="flex justify-between text-[10px] text-sage-400 font-mono">
                <span>0.30 Idle</span>
                <span>1.35 Takeoff</span>
                <span class="text-red-400 font-semibold">>1.45 Overboost</span>
              </div>
            </div>

            <!-- Fuel Flow -->
            <div class="space-y-1.5 glass-forest-subtle p-3.5 rounded-2xl border border-emerald-900/40">
              <div class="flex justify-between items-center text-xs">
                <span class="font-medium text-sage-300">Fuel Flow Rate</span>
                <span class="font-mono font-bold text-emerald-300 text-sm" id="val-fuel_flow">21.0 L/h</span>
              </div>
              <input type="range" id="input-fuel_flow" min="5.0" max="55.0" step="0.5" value="21.0" oninput="updateParam('fuel_flow', this.value)">
              <div class="flex justify-between text-[10px] text-sage-400 font-mono">
                <span>8 L/h Idle</span>
                <span>42 L/h Takeoff</span>
                <span class="text-red-400 font-semibold">>48 L/h Extreme</span>
              </div>
            </div>

            <!-- Vibration -->
            <div class="space-y-1.5 glass-forest-subtle p-3.5 rounded-2xl border border-emerald-900/40">
              <div class="flex justify-between items-center text-xs">
                <span class="font-medium text-sage-300">Airframe/Engine Vibration</span>
                <span class="font-mono font-bold text-emerald-300 text-sm" id="val-vibration">2.20 mm/s</span>
              </div>
              <input type="range" id="input-vibration" min="0.5" max="12.0" step="0.1" value="2.2" oninput="updateParam('vibration', this.value)">
              <div class="flex justify-between text-[10px] text-sage-400 font-mono">
                <span>&lt;3.5 Normal</span>
                <span class="text-amber-400 font-semibold">&gt;5.0 Warn</span>
                <span class="text-red-400 font-semibold">&gt;7.5 Critical</span>
              </div>
            </div>

            <!-- Battery Voltage -->
            <div class="space-y-1.5 glass-forest-subtle p-3.5 rounded-2xl border border-emerald-900/40">
              <div class="flex justify-between items-center text-xs">
                <span class="font-medium text-sage-300">Battery Voltage</span>
                <span class="font-mono font-bold text-emerald-300 text-sm" id="val-battery_voltage">28.2 V</span>
              </div>
              <input type="range" id="input-battery_voltage" min="20.0" max="32.0" step="0.2" value="28.2" oninput="updateParam('battery_voltage', this.value)">
              <div class="flex justify-between text-[10px] text-sage-400 font-mono">
                <span class="text-red-400 font-semibold">&lt;24V Low</span>
                <span>28.0V Nom</span>
                <span class="text-red-400 font-semibold">&gt;30V High</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Column 2: Hydraulics & 4-Cylinder Head Temps (CHT) -->
      <div class="glass-forest rounded-3xl p-6 border border-emerald-900/50 shadow-xl space-y-5 card-hover flex flex-col justify-between">
        <div>
          <div class="flex items-center gap-2 border-b border-emerald-900/50 pb-3 mb-4">
            <div class="w-7 h-7 rounded-full bg-emerald-950 border border-emerald-500/30 flex items-center justify-center text-amber-400">
              <span class="material-symbols-outlined text-[16px]">thermostat</span>
            </div>
            <h2 class="section-heading">Hydraulics & CHT Thermals</h2>
          </div>

          <div class="space-y-4">
            <!-- Oil Pressure -->
            <div class="space-y-1.5 glass-forest-subtle p-3.5 rounded-2xl border border-emerald-900/40">
              <div class="flex justify-between items-center text-xs">
                <span class="font-medium text-sage-300">Oil Pressure</span>
                <span class="font-mono font-bold text-emerald-300 text-sm" id="val-oil_pressure">4.20 bar</span>
              </div>
              <input type="range" id="input-oil_pressure" min="0.5" max="6.5" step="0.05" value="4.20" oninput="updateParam('oil_pressure', this.value)">
              <div class="flex justify-between text-[10px] text-sage-400 font-mono">
                <span class="text-red-400 font-semibold">&lt;2.5 Crit Low</span>
                <span>3.5 - 5.0 Nom</span>
                <span class="text-red-400 font-semibold">&gt;6.0 Overpress</span>
              </div>
            </div>

            <!-- Oil Temp -->
            <div class="space-y-1.5 glass-forest-subtle p-3.5 rounded-2xl border border-emerald-900/40">
              <div class="flex justify-between items-center text-xs">
                <span class="font-medium text-sage-300">Oil Sump Temperature</span>
                <span class="font-mono font-bold text-emerald-300 text-sm" id="val-oil_temperature">92.0 °C</span>
              </div>
              <input type="range" id="input-oil_temperature" min="60.0" max="150.0" step="1.0" value="92.0" oninput="updateParam('oil_temperature', this.value)">
              <div class="flex justify-between text-[10px] text-sage-400 font-mono">
                <span>80 - 105 Nom</span>
                <span class="text-amber-400 font-semibold">&gt;115 Warn</span>
                <span class="text-red-400 font-semibold">&gt;125 Crit</span>
              </div>
            </div>

            <!-- CHT Cylinders 1 - 4 -->
            <div class="pt-2 border-t border-emerald-900/50 space-y-3">
              <div class="flex items-center justify-between">
                <span class="label-mono text-sage-300">Cylinder Head Temps (CHT)</span>
                <span class="text-[10px] font-mono text-red-400 font-bold">Redline: 215°C</span>
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div class="space-y-1 glass-forest-subtle p-3 rounded-2xl border border-emerald-900/40">
                  <div class="flex justify-between text-[11px]">
                    <span class="text-sage-400 font-medium">Cyl 1 CHT</span>
                    <span class="font-mono font-bold text-emerald-300" id="val-cht-0">176.5°C</span>
                  </div>
                  <input type="range" id="input-cht-0" min="100" max="250" step="1" value="176.5" oninput="updateCht(0, this.value)">
                </div>
                <div class="space-y-1 glass-forest-subtle p-3 rounded-2xl border border-emerald-900/40">
                  <div class="flex justify-between text-[11px]">
                    <span class="text-sage-400 font-medium">Cyl 2 CHT</span>
                    <span class="font-mono font-bold text-emerald-300" id="val-cht-1">180.2°C</span>
                  </div>
                  <input type="range" id="input-cht-1" min="100" max="250" step="1" value="180.2" oninput="updateCht(1, this.value)">
                </div>
                <div class="space-y-1 glass-forest-subtle p-3 rounded-2xl border border-emerald-900/40">
                  <div class="flex justify-between text-[11px]">
                    <span class="text-sage-400 font-medium">Cyl 3 CHT</span>
                    <span class="font-mono font-bold text-emerald-300" id="val-cht-2">179.8°C</span>
                  </div>
                  <input type="range" id="input-cht-2" min="100" max="250" step="1" value="179.8" oninput="updateCht(2, this.value)">
                </div>
                <div class="space-y-1 glass-forest-subtle p-3 rounded-2xl border border-emerald-900/40">
                  <div class="flex justify-between text-[11px]">
                    <span class="text-sage-400 font-medium">Cyl 4 CHT</span>
                    <span class="font-mono font-bold text-emerald-300" id="val-cht-3">175.5°C</span>
                  </div>
                  <input type="range" id="input-cht-3" min="100" max="250" step="1" value="175.5" oninput="updateCht(3, this.value)">
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Column 3: EGT Thermals & Flight Context -->
      <div class="glass-sage-deep rounded-3xl p-6 border border-emerald-500/30 shadow-xl space-y-5 card-hover flex flex-col justify-between">
        <div>
          <div class="flex items-center gap-2 border-b border-emerald-700/40 pb-3 mb-4">
            <div class="w-7 h-7 rounded-full bg-emerald-950 border border-emerald-400/40 flex items-center justify-center text-rose-400 shadow-sm">
              <span class="material-symbols-outlined text-[16px]">local_fire_department</span>
            </div>
            <h2 class="section-heading text-emerald-200">EGT Thermals & Flight Context</h2>
          </div>

          <div class="space-y-4">
            <!-- EGT Cylinders 1 - 4 -->
            <div class="space-y-3">
              <div class="flex items-center justify-between">
                <span class="label-mono text-emerald-200">Exhaust Gas Temps (EGT)</span>
                <span class="text-[10px] font-mono text-red-400 font-bold">Redline: 780°C</span>
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div class="space-y-1 glass-forest-subtle p-3 rounded-2xl border border-emerald-800/40 shadow-xs">
                  <div class="flex justify-between text-[11px]">
                    <span class="text-sage-300 font-medium">Cyl 1 EGT</span>
                    <span class="font-mono font-bold text-emerald-300" id="val-egt-0">681.0°C</span>
                  </div>
                  <input type="range" id="input-egt-0" min="0" max="900" step="2" value="681" oninput="updateEgt(0, this.value)">
                </div>
                <div class="space-y-1 glass-forest-subtle p-3 rounded-2xl border border-emerald-800/40 shadow-xs">
                  <div class="flex justify-between text-[11px]">
                    <span class="text-sage-300 font-medium">Cyl 2 EGT</span>
                    <span class="font-mono font-bold text-emerald-300" id="val-egt-1">690.5°C</span>
                  </div>
                  <input type="range" id="input-egt-1" min="0" max="900" step="2" value="690.5" oninput="updateEgt(1, this.value)">
                </div>
                <div class="space-y-1 glass-forest-subtle p-3 rounded-2xl border border-emerald-800/40 shadow-xs">
                  <div class="flex justify-between text-[11px]">
                    <span class="text-sage-300 font-medium">Cyl 3 EGT</span>
                    <span class="font-mono font-bold text-emerald-300" id="val-egt-2">688.0°C</span>
                  </div>
                  <input type="range" id="input-egt-2" min="0" max="900" step="2" value="688" oninput="updateEgt(2, this.value)">
                </div>
                <div class="space-y-1 glass-forest-subtle p-3 rounded-2xl border border-emerald-800/40 shadow-xs">
                  <div class="flex justify-between text-[11px]">
                    <span class="text-sage-300 font-medium">Cyl 4 EGT</span>
                    <span class="font-mono font-bold text-emerald-300" id="val-egt-3">680.5°C</span>
                  </div>
                  <input type="range" id="input-egt-3" min="0" max="900" step="2" value="680.5" oninput="updateEgt(3, this.value)">
                </div>
              </div>
            </div>

            <!-- Altitude & Atmospheric Physics Coupling -->
            <div class="pt-2 border-t border-emerald-700/40 space-y-3">
              <div class="flex items-center justify-between">
                <span class="label-mono text-emerald-200">Altitude & Atmospheric Physics (ISA)</span>
                <span class="text-[9px] font-mono px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/40 font-bold">Auto-Coupled</span>
              </div>

              <div class="space-y-1.5 glass-forest-subtle p-3.5 rounded-2xl border border-emerald-800/40">
                <div class="flex justify-between items-center text-xs">
                  <span class="font-medium text-sage-300">Flight Altitude (MSL)</span>
                  <span class="font-mono font-bold text-emerald-300 text-sm" id="val-altitude_m">8467 m</span>
                </div>
                <input type="range" id="input-altitude_m" min="0" max="10000" step="50" value="8467" oninput="updateAltitude(this.value)">
                <div class="flex justify-between text-[9px] text-sage-400 font-mono">
                  <span>0m Sea Level</span>
                  <span class="font-bold text-emerald-300">8467m Cruise</span>
                  <span class="text-red-400 font-semibold">10k Ceiling</span>
                </div>
              </div>

              <!-- Quick Altitude Presets -->
              <div class="grid grid-cols-4 gap-1.5">
                <button onclick="setAltitudePreset(120)" class="px-2 py-1.5 rounded-xl glass-forest-subtle hover:bg-emerald-900 text-[10px] font-mono text-emerald-200 border border-emerald-700/40 text-center font-semibold shadow-xs">120m Runway</button>
                <button onclick="setAltitudePreset(2800)" class="px-2 py-1.5 rounded-xl glass-forest-subtle hover:bg-emerald-900 text-[10px] font-mono text-emerald-200 border border-emerald-700/40 text-center font-semibold shadow-xs">2.8k Climb</button>
                <button onclick="setAltitudePreset(8467)" class="px-2 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-[10px] font-mono text-white text-center font-bold shadow-xs">8.5k Cruise</button>
                <button onclick="setAltitudePreset(10000)" class="px-2 py-1.5 rounded-xl bg-red-900 hover:bg-red-800 text-[10px] font-mono text-white text-center font-bold shadow-xs">10k Max</button>
              </div>

              <!-- Real-time Atmospheric Parameters Derived from Altitude -->
              <div class="p-3.5 rounded-2xl bg-[#0c1610]/90 border border-emerald-900/60 space-y-2 text-xs font-mono shadow-xs">
                <div class="flex items-center justify-between text-sage-300">
                  <span>Ambient Temp (T_amb):</span>
                  <span id="val-isa-temp" class="text-white font-bold text-sm">-23.0 °C</span>
                </div>
                <div class="flex items-center justify-between text-sage-300">
                  <span>Barometric Pressure:</span>
                  <span id="val-isa-press" class="text-cyan-300 font-bold">342.5 hPa (34.3 kPa)</span>
                </div>
                <div class="flex items-center justify-between text-sage-300">
                  <span>Air Density (ρ):</span>
                  <span id="val-isa-density" class="text-emerald-400 font-bold">0.477 kg/m³</span>
                </div>
                <div class="flex items-center justify-between text-sage-300">
                  <span>True Airspeed (TAS):</span>
                  <span id="val-isa-tas" class="text-amber-300 font-bold">312 km/h (195 IAS)</span>
                </div>
                <div id="isa-cooling-badge" class="pt-1.5 border-t border-emerald-900/60 text-[10px] text-sky-300 flex items-center gap-1 font-semibold">
                  <span class="material-symbols-outlined text-[14px]">ac_unit</span>
                  <span>Sub-Zero High Altitude Cooling Active (CHT -16.8°C)</span>
                </div>
              </div>

              <!-- Airspeed -->
              <div class="space-y-1.5 glass-forest-subtle p-3 rounded-2xl border border-emerald-800/40">
                <div class="flex justify-between items-center text-xs">
                  <span class="font-medium text-sage-300">Indicated Airspeed (IAS)</span>
                  <span class="font-mono font-bold text-emerald-300 text-sm" id="val-airspeed_kmh">195 km/h</span>
                </div>
                <input type="range" id="input-airspeed_kmh" min="0" max="300" step="5" value="195" oninput="updateParam('airspeed_kmh', this.value)">
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>

    <!-- Live Monitor Stream Log (Dark Technical Forest HUD Panel) -->
    <div class="glass-dark-terminal rounded-3xl p-5 border border-emerald-900/50 text-sage-200 shadow-xl space-y-2.5">
      <div class="flex items-center justify-between text-xs font-mono text-sage-300">
        <span class="flex items-center gap-2">
          <span class="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <span class="font-bold text-emerald-300 tracking-wider">ACTIVE TELEMETRY BROADCAST STREAM:</span>
        </span>
        <span id="frame-counter" class="text-emerald-400 font-bold font-mono">Frame #0</span>
      </div>
      <div id="live-stream-box" class="p-3.5 rounded-2xl bg-black/60 border border-emerald-950 font-mono text-xs text-emerald-200 overflow-x-auto whitespace-pre">Connecting to live stream...</div>
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
        document.getElementById('stream-badge').className = 'text-[10px] font-mono uppercase px-3 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/60 font-bold shadow-xs';
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

        } catch(e){}
      };

      ws.onclose = () => {
        document.getElementById('stream-badge').innerText = 'STREAM RECONNECTING...';
        document.getElementById('stream-badge').className = 'text-[10px] font-mono uppercase px-3 py-0.5 rounded-full bg-amber-950 text-amber-400 border border-amber-500/50 font-bold';
        setTimeout(initWebSocket, 2000);
      };
    }

    function toggleControlMode() {
      isManualMode = !isManualMode;
      const text = document.getElementById('mode-text');
      const btn = document.getElementById('btn-toggle-mode');
      if (isManualMode) {
        text.innerText = 'Mode: MANUAL OVERRIDE';
        btn.className = 'pill-btn-emerald px-4 py-2 text-xs font-mono font-semibold tracking-wide flex items-center gap-2 shadow-sm';
        fetch('/api/manual-control', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({ manual_override: true })
        });
      } else {
        text.innerText = 'Mode: AUTO SIMULATION';
        btn.className = 'px-4 py-2 rounded-full text-xs font-mono font-semibold tracking-wide transition-all bg-[#16271e] hover:bg-[#1f3629] text-emerald-200 border border-emerald-700/50 shadow-sm flex items-center gap-2';
        fetch('/api/manual-control', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({ manual_override: false })
        });
      }
    }

    function updateAltitude(val) {
      const alt = parseFloat(val);
      document.getElementById('val-altitude_m').innerText = `${Math.round(alt)} m`;
      document.getElementById('input-altitude_m').value = alt;

      // ISA Atmospheric Physics calculations:
      const t_amb = Math.max(-56.5, 32.0 - 0.0065 * alt);
      const p_ratio = Math.max(0.1, 1.0 - 2.25577e-5 * alt);
      const p_amb = 1013.25 * Math.pow(p_ratio, 5.25588);
      const t_kelvin = t_amb + 273.15;
      const rho = (p_amb * 100.0) / (287.05 * t_kelvin);

      const ias = parseFloat(document.getElementById('input-airspeed_kmh').value) || 195;
      const tas = ias * Math.sqrt(1.225 / Math.max(0.1, rho));

      const deltaCht = (t_amb - 25.0) * 0.35;

      document.getElementById('val-isa-temp').innerText = `${t_amb.toFixed(1)} °C`;
      document.getElementById('val-isa-press').innerText = `${p_amb.toFixed(1)} hPa (${(p_amb * 0.1).toFixed(1)} kPa)`;
      document.getElementById('val-isa-density').innerText = `${rho.toFixed(3)} kg/m³`;
      document.getElementById('val-isa-tas').innerText = `${Math.round(tas)} km/h (${Math.round(ias)} IAS)`;

      const coolingBadge = document.getElementById('isa-cooling-badge');
      if (t_amb < 0) {
        coolingBadge.innerHTML = `<span class="material-symbols-outlined text-[14px]">ac_unit</span><span>Sub-Zero High Altitude Cooling Active (CHT ${(deltaCht > 0 ? '+' : '') + deltaCht.toFixed(1)}°C)</span>`;
        coolingBadge.className = "pt-1.5 border-t border-emerald-900/60 text-[10px] text-sky-300 flex items-center gap-1 font-semibold";
      } else {
        coolingBadge.innerHTML = `<span class="material-symbols-outlined text-[14px]">wb_sunny</span><span>Standard Atmosphere (${t_amb.toFixed(1)}°C • Delta CHT ${(deltaCht > 0 ? '+' : '') + deltaCht.toFixed(1)}°C)</span>`;
        coolingBadge.className = "pt-1.5 border-t border-emerald-900/60 text-[10px] text-amber-300 flex items-center gap-1 font-semibold";
      }

      fetch('/api/manual-control/param', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ key: 'altitude_m', value: alt })
      });
    }

    function setAltitudePreset(alt) {
      updateAltitude(alt);
    }

    function updateParam(key, value) {
      const num = parseFloat(value);
      const label = document.getElementById(`val-${key}`);
      if (key === 'rpm') {
        if (num > 5800) {
          label.innerText = `${Math.round(num)} RPM 🚨 REDLINE`;
          label.className = 'font-mono font-black text-red-400 text-sm animate-pulse';
        } else if (num > 5500) {
          label.innerText = `${Math.round(num)} RPM ⚠️ TAKEOFF MAX`;
          label.className = 'font-mono font-bold text-amber-300 text-sm';
        } else {
          label.innerText = `${Math.round(num)} RPM`;
          label.className = 'font-mono font-bold text-emerald-300 text-sm';
        }
      }
      else if (key === 'map') label.innerText = `${num.toFixed(2)} bar`;
      else if (key === 'fuel_flow') label.innerText = `${num.toFixed(1)} L/h`;
      else if (key === 'vibration') label.innerText = `${num.toFixed(2)} mm/s`;
      else if (key === 'oil_pressure') label.innerText = `${num.toFixed(2)} bar`;
      else if (key === 'oil_temperature') label.innerText = `${num.toFixed(1)} °C`;
      else if (key === 'battery_voltage') label.innerText = `${num.toFixed(1)} V`;
      else if (key === 'altitude_m') { updateAltitude(num); return; }
      else if (key === 'airspeed_kmh') {
        label.innerText = `${Math.round(num)} km/h`;
        const alt = parseFloat(document.getElementById('input-altitude_m').value) || 8467;
        const t_amb = Math.max(-56.5, 32.0 - 0.0065 * alt);
        const p_ratio = Math.max(0.1, 1.0 - 2.25577e-5 * alt);
        const p_amb = 1013.25 * Math.pow(p_ratio, 5.25588);
        const rho = (p_amb * 100.0) / (287.05 * (t_amb + 273.15));
        const tas = num * Math.sqrt(1.225 / Math.max(0.1, rho));
        document.getElementById('val-isa-tas').innerText = `${Math.round(tas)} km/h (${Math.round(num)} IAS)`;
      }

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
        setAllValues({ rpm: 5900, map: 1.45, fuel_flow: 46.0, vibration: 4.8, oil_pressure: 4.2, oil_temperature: 92.0, cht: [176.5, 180.2, 179.8, 175.5], egt: [681, 690.5, 688, 680.5], altitude_m: 6000, airspeed_kmh: 215 });
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
      } else if (preset === 'PROPELLER_ICING') {
        fetch('/api/scenarios/start', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({ scenario_id: 'PROPELLER_ICING', duration_s: 120 })
        });
        setAllValues({ rpm: 2650, map: 1.05, fuel_flow: 25.0, vibration: 5.8, oil_pressure: 3.8, oil_temperature: 72.0, battery_voltage: 23.4, cht: [158.0, 162.0, 160.0, 155.0], egt: [665, 672, 668, 660], altitude_m: 8800, airspeed_kmh: 165 });
      } else if (preset === 'FULL_AIRFRAME_ALERT') {
        fetch('/api/scenarios/start', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({ scenario_id: 'FULL_AIRFRAME_ALERT', duration_s: 120 })
        });
        setAllValues({ rpm: 6000, map: 1.55, fuel_flow: 52.0, vibration: 9.5, oil_pressure: 1.4, oil_temperature: 135.0, cht: [242, 248, 245, 240], egt: [820, 835, 830, 815], altitude_m: 3200, airspeed_kmh: 220 });
      } else if (preset === 'CRUISE_NOMINAL') {
        fetch('/api/scenarios/start', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({ scenario_id: 'NORMAL', duration_s: 120 })
        });
        fetch('/api/simulation/state', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({ state: 'CRUISE' })
        });
        setAllValues({ rpm: 2850, map: 0.98, fuel_flow: 21.0, vibration: 2.2, oil_pressure: 4.2, oil_temperature: 92.0, cht: [176.5, 180.2, 179.8, 175.5], egt: [681, 690.5, 688, 680.5], altitude_m: 8467, airspeed_kmh: 195 });
      } else if (preset === 'TAKEOFF_POWER') {
        fetch('/api/scenarios/start', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({ scenario_id: 'NORMAL', duration_s: 120 })
        });
        fetch('/api/simulation/state', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({ state: 'TAKEOFF' })
        });
        setAllValues({ rpm: 5500, map: 1.35, fuel_flow: 42.0, vibration: 3.4, oil_pressure: 4.8, oil_temperature: 98.0, cht: [205, 208, 207, 204], egt: [750, 760, 755, 748], altitude_m: 450, airspeed_kmh: 145 });
      } else if (preset === 'CRITICAL_OVERHEAT') {
        fetch('/api/scenarios/start', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({ scenario_id: 'OVERHEATING', duration_s: 120 })
        });
        setAllValues({ rpm: 5400, map: 1.30, fuel_flow: 40.0, vibration: 4.5, oil_pressure: 3.4, oil_temperature: 122.0, cht: [228, 235, 232, 226], egt: [795, 810, 805, 790], altitude_m: 3500, airspeed_kmh: 160 });
      } else if (preset === 'LOW_OIL_PRESSURE') {
        fetch('/api/scenarios/start', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({ scenario_id: 'LUBRICATION_ISSUE', duration_s: 120 })
        });
        setAllValues({ rpm: 2800, map: 0.95, fuel_flow: 20.0, vibration: 4.2, oil_pressure: 1.65, oil_temperature: 132.0, cht: [185, 188, 186, 184], egt: [690, 700, 695, 688], altitude_m: 7200, airspeed_kmh: 185 });
      } else if (preset === 'OVERSPEED_REDLINE') {
        fetch('/api/scenarios/start', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({ scenario_id: 'PROPELLER_OVERSPEED', duration_s: 120 })
        });
        setAllValues({ rpm: 5950, map: 1.48, fuel_flow: 48.0, vibration: 6.8, oil_pressure: 5.2, oil_temperature: 108.0, cht: [218, 222, 220, 216], egt: [785, 792, 790, 782], altitude_m: 2000, airspeed_kmh: 210 });
      } else if (preset === 'SEVERE_VIBRATION') {
        fetch('/api/scenarios/start', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({ scenario_id: 'ABNORMAL_VIBRATION', duration_s: 120 })
        });
        setAllValues({ rpm: 2850, map: 0.98, fuel_flow: 21.0, vibration: 8.8, oil_pressure: 4.0, oil_temperature: 96.0, cht: [180, 184, 182, 178], egt: [685, 695, 690, 682], altitude_m: 5000, airspeed_kmh: 175 });
      } else if (preset === 'INJECTOR_FAULT') {
        fetch('/api/scenarios/start', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({ scenario_id: 'INJECTOR_ABNORMALITY', duration_s: 120 })
        });
        setAllValues({ rpm: 2750, map: 0.94, fuel_flow: 18.5, vibration: 4.8, oil_pressure: 4.1, oil_temperature: 94.0, cht: [178, 182, 145, 177], egt: [688, 695, 540, 685], altitude_m: 8000, airspeed_kmh: 190 });
      } else if (preset === 'MISFIRE_CYL2') {
        fetch('/api/scenarios/start', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({ scenario_id: 'MISFIRE', duration_s: 120 })
        });
        setAllValues({ rpm: 2700, map: 0.92, fuel_flow: 17.5, vibration: 6.2, oil_pressure: 4.0, oil_temperature: 93.0, cht: [176, 138, 178, 175], egt: [682, 510, 686, 680], altitude_m: 6500, airspeed_kmh: 180 });
      } else if (preset === 'SENSOR_DRIFT') {
        fetch('/api/scenarios/start', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({ scenario_id: 'SENSOR_DRIFT', duration_s: 120 })
        });
        setAllValues({ rpm: 2850, map: 0.98, fuel_flow: 21.0, vibration: 2.2, oil_pressure: 4.2, oil_temperature: 92.0, cht: [176.5, 180.2, 179.8, 175.5], egt: [765, 690.5, 688, 680.5], altitude_m: 8467, airspeed_kmh: 195 });
      } else if (preset === 'SENSOR_FAIL') {
        fetch('/api/scenarios/start', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({ scenario_id: 'SENSOR_FAILURE', duration_s: 120 })
        });
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
      if (key === 'rpm') {
        if (num > 5800) {
          label.innerText = `${Math.round(num)} RPM 🚨 REDLINE`;
          label.className = 'font-mono font-black text-red-400 text-sm animate-pulse';
        } else if (num > 5500) {
          label.innerText = `${Math.round(num)} RPM ⚠️ TAKEOFF MAX`;
          label.className = 'font-mono font-bold text-amber-300 text-sm';
        } else {
          label.innerText = `${Math.round(num)} RPM`;
          label.className = 'font-mono font-bold text-emerald-300 text-sm';
        }
      }
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
