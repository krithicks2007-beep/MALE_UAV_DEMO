import { useRef } from 'react';
import { TwinCanvas, type TwinCanvasRef } from '../components/twin/TwinCanvas';
import { useTwinStore } from '../stores/twinStore';
import { useTelemetryStore } from '../stores/telemetryStore';
import { useHealthStore } from '../stores/healthStore';
import { useDiagnosticsStore } from '../stores/diagnosticsStore';

export function TwinViewPage() {
  const canvasRef = useRef<TwinCanvasRef>(null);

  const {
    twinState,
    modelMode,
    setModelMode,
    twinTarget,
    setTwinTarget,
    explodedFactor,
    setExplodedFactor,
    isAutoExploding,
    setIsAutoExploding,
    selectedPart,
    setSelectedPart,
  } = useTwinStore();

  const telemetry = useTelemetryStore((s) => s.telemetry);
  const health = useHealthStore((s) => s.health);
  const diagnostics = useDiagnosticsStore((s) => s.diagnostics);

  const isEngine = twinTarget === 'ENGINE_STP';

  return (
    <main className="max-w-[1720px] mx-auto px-4 lg:px-8 py-6 space-y-6 animate-fadeIn">
      {/* Top Aerospace Twin Header Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-5 rounded-3xl bg-white/90 border border-[#d6e0d8] shadow-sm">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-charcoal text-white flex items-center justify-center shadow-md">
            <span className="material-symbols-outlined text-[26px]">
              {isEngine ? 'manufacturing' : 'view_in_ar'}
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-lg font-bold text-charcoal tracking-tight">
                {isEngine
                  ? 'ROTAX 912 AERO-PISTON ENGINE CAD TWIN'
                  : 'MALE UAV AIRFRAME DIGITAL TWIN'}
              </h1>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                {isEngine ? 'STP CAD • ISO 10303' : '3D GLB • TELEMETRIC'}
              </span>
              <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-sage-100 text-sage-800 border border-sage-300">
                Health: {health?.index ? `${Math.round(health.index)}%` : '--'}
              </span>
            </div>
            <p className="text-xs text-sage-600 font-mono mt-0.5">
              {isEngine
                ? 'High-Resolution Rotax 912 CAD Assembly with Real-time Multi-Axis Exploded View & Component Isolation'
                : 'Full-airframe structural twin synchronized with 1Hz live telemetry & state-driven shaders'}
            </p>
          </div>
        </div>

        {/* Top Model Switchers (Airframe vs Rotax STP CAD) */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center bg-[#eef3ef] p-1 rounded-2xl border border-[#d2ddd5]">
            <button
              type="button"
              onClick={() => setTwinTarget('ENGINE_STP')}
              className={`px-3.5 py-1.5 text-xs font-mono font-bold rounded-xl transition-all flex items-center gap-1.5 ${
                isEngine
                  ? 'bg-charcoal text-white shadow-sm'
                  : 'text-sage-700 hover:text-charcoal hover:bg-white/70'
              }`}
            >
              <span className="material-symbols-outlined text-[15px]">precision_manufacturing</span>
              <span>Rotax 912 Engine (STP)</span>
            </button>
            <button
              type="button"
              onClick={() => setTwinTarget('AIRFRAME')}
              className={`px-3.5 py-1.5 text-xs font-mono font-bold rounded-xl transition-all flex items-center gap-1.5 ${
                !isEngine
                  ? 'bg-charcoal text-white shadow-sm'
                  : 'text-sage-700 hover:text-charcoal hover:bg-white/70'
              }`}
            >
              <span className="material-symbols-outlined text-[15px]">flight</span>
              <span>UAV Airframe</span>
            </button>
          </div>

          <div className="flex items-center bg-[#eef3ef] p-1 rounded-2xl border border-[#d2ddd5]">
            <button
              type="button"
              onClick={() => setModelMode('SOLID')}
              className={`px-3 py-1.5 text-xs font-mono font-bold rounded-xl transition-all ${
                modelMode === 'SOLID'
                  ? 'bg-sage-700 text-white shadow-xs'
                  : 'text-sage-700 hover:text-charcoal'
              }`}
            >
              PBR Solid
            </button>
            <button
              type="button"
              onClick={() => setModelMode('WIREFRAME')}
              className={`px-3 py-1.5 text-xs font-mono font-bold rounded-xl transition-all ${
                modelMode === 'WIREFRAME'
                  ? 'bg-sage-700 text-white shadow-xs'
                  : 'text-sage-700 hover:text-charcoal'
              }`}
            >
              Wireframe
            </button>
          </div>
        </div>
      </div>

      {/* Main 3D Canvas & Controls Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: 3D Twin Viewport (8 Cols) */}
        <div className="lg:col-span-8 flex flex-col rounded-3xl bg-[#f4f7f4] border border-[#dce4de] shadow-stage relative overflow-hidden min-h-[660px] h-[72vh]">
          
          {/* Top Canvas Status Overlay */}
          <div className="absolute top-4 left-4 z-20 flex flex-wrap items-center gap-2 pointer-events-auto">
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/95 border border-[#d6e0d8] shadow-xs text-xs font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="font-semibold text-charcoal">
                {isEngine ? 'CAD Source: model_web.glb (Rotax 912 + Chassis)' : 'Source: MQ-1 / Tapas UAV'}
              </span>
            </div>
            {isEngine && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-600/40 text-xs font-mono shadow-xs">
                <span className="material-symbols-outlined text-[14px]">call_split</span>
                <span>Exploded View: {Math.round(explodedFactor * 100)}%</span>
              </div>
            )}
          </div>

          {/* Right Floating View Controls */}
          <div className="absolute right-4 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-1.5 bg-white/95 backdrop-blur-md p-2 rounded-2xl border border-[#d3ded5] shadow-md">
            <button
              type="button"
              title="Reset Orbit Camera"
              onClick={() => canvasRef.current?.resetCamera()}
              className="w-9 h-9 rounded-xl hover:bg-sage-100 text-charcoal flex items-center justify-center text-xs transition"
            >
              <span className="material-symbols-outlined text-[18px]">3d_rotation</span>
            </button>
            <button
              type="button"
              title="Top View (Plan)"
              onClick={() => canvasRef.current?.setTopView()}
              className="w-9 h-9 rounded-xl hover:bg-sage-100 text-charcoal flex items-center justify-center text-[10px] font-mono font-bold transition"
            >
              TOP
            </button>
            <button
              type="button"
              title="Bottom View (Chassis / Ventral)"
              onClick={() => canvasRef.current?.setBottomView()}
              className="w-9 h-9 rounded-xl hover:bg-sage-100 text-charcoal flex items-center justify-center text-[10px] font-mono font-bold transition text-amber-800 bg-amber-50"
            >
              BTM
            </button>
            <button
              type="button"
              title="Front View (Prop Hub)"
              onClick={() => canvasRef.current?.setFrontView()}
              className="w-9 h-9 rounded-xl hover:bg-sage-100 text-charcoal flex items-center justify-center text-[10px] font-mono font-bold transition"
            >
              FWD
            </button>
            <button
              type="button"
              title="Aft View (Exhaust / Mounts)"
              onClick={() => canvasRef.current?.setRearView()}
              className="w-9 h-9 rounded-xl hover:bg-sage-100 text-charcoal flex items-center justify-center text-[10px] font-mono font-bold transition"
            >
              AFT
            </button>
          </div>

          {/* 3D Scene */}
          <div className="w-full h-full flex-1">
            <TwinCanvas ref={canvasRef} twinState={twinState} />
          </div>

          {/* Bottom Interactive Exploded View Bar */}
          {isEngine && (
            <div className="p-4 bg-white/95 border-t border-[#dce4de] z-20 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3 w-full md:w-auto">
                <span className="text-xs font-mono font-bold text-charcoal flex items-center gap-1.5 whitespace-nowrap">
                  <span className="material-symbols-outlined text-emerald-600 text-[18px]">unfold_more</span>
                  Exploded View:
                </span>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={explodedFactor}
                  onChange={(e) => {
                    setIsAutoExploding(false);
                    setExplodedFactor(parseFloat(e.target.value));
                  }}
                  className="w-48 sm:w-64 accent-emerald-600 cursor-pointer"
                />
                <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                  {Math.round(explodedFactor * 100)}%
                </span>
              </div>

              {/* Explode Presets & Auto Animation Toggle */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => { setIsAutoExploding(false); setExplodedFactor(0.0); }}
                  className="px-3 py-1 text-xs font-mono font-semibold rounded-lg bg-sage-100 hover:bg-sage-200 text-charcoal transition"
                >
                  Assembled (0%)
                </button>
                <button
                  type="button"
                  onClick={() => { setIsAutoExploding(false); setExplodedFactor(0.5); }}
                  className="px-3 py-1 text-xs font-mono font-semibold rounded-lg bg-sage-100 hover:bg-sage-200 text-charcoal transition"
                >
                  Half (50%)
                </button>
                <button
                  type="button"
                  onClick={() => { setIsAutoExploding(false); setExplodedFactor(1.0); }}
                  className="px-3 py-1 text-xs font-mono font-semibold rounded-lg bg-sage-100 hover:bg-sage-200 text-charcoal transition"
                >
                  Full (100%)
                </button>
                <button
                  type="button"
                  onClick={() => setIsAutoExploding(!isAutoExploding)}
                  className={`px-3 py-1 text-xs font-mono font-bold rounded-lg transition flex items-center gap-1 ${
                    isAutoExploding
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-emerald-950 text-emerald-300 hover:bg-emerald-900'
                  }`}
                >
                  <span className="material-symbols-outlined text-[14px]">
                    {isAutoExploding ? 'pause' : 'play_arrow'}
                  </span>
                  <span>{isAutoExploding ? 'Stop Cycle' : 'Auto Explode'}</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Engine CAD Specs, Component Tree & Diagnostics (4 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* Component Inspection Card */}
          <div className="p-5 rounded-3xl bg-white border border-[#d6e0d8] shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-[#e2eae4] pb-2.5">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-emerald-700 text-xl">manage_search</span>
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-charcoal">
                  CAD Component Inspector
                </h3>
              </div>
              {selectedPart && (
                <button
                  type="button"
                  onClick={() => setSelectedPart(null)}
                  className="text-[11px] font-mono text-sage-600 hover:text-charcoal underline"
                >
                  Clear Selection
                </button>
              )}
            </div>

            {selectedPart ? (
              <div className="space-y-2.5">
                <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200">
                  <div className="text-[10px] font-mono text-emerald-700 uppercase font-bold">Selected Node</div>
                  <div className="text-sm font-bold text-emerald-950 font-mono break-all">{selectedPart}</div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <div className="p-2.5 rounded-xl bg-sage-50 border border-sage-200">
                    <span className="text-[10px] text-sage-600 block">CAD Geometry</span>
                    <span className="font-bold text-charcoal">B-Rep Solid</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-sage-50 border border-sage-200">
                    <span className="text-[10px] text-sage-600 block">Material</span>
                    <span className="font-bold text-charcoal">Aero Alloy</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-sage-50/70 border border-dashed border-sage-300 text-center text-xs font-mono text-sage-600">
                Click any part in the 3D viewport or slide the exploded view slider to isolate and inspect individual engine components.
              </div>
            )}
          </div>

          {/* Rotax 912 Technical Specifications */}
          <div className="p-5 rounded-3xl bg-white border border-[#d6e0d8] shadow-sm space-y-3">
            <div className="flex items-center gap-2 border-b border-[#e2eae4] pb-2.5">
              <span className="material-symbols-outlined text-sage-700 text-xl">info</span>
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-charcoal">
                Rotax 912 Engine Architecture
              </h3>
            </div>
            
            <div className="grid grid-cols-2 gap-2.5 text-xs font-mono">
              <div className="p-3 rounded-2xl bg-[#f7faf8] border border-[#e2ebe4]">
                <span className="text-[10px] text-sage-600 block uppercase">Engine Type</span>
                <span className="font-bold text-charcoal">4-Cyl Boxer Piston</span>
              </div>
              <div className="p-3 rounded-2xl bg-[#f7faf8] border border-[#e2ebe4]">
                <span className="text-[10px] text-sage-600 block uppercase">Displacement</span>
                <span className="font-bold text-charcoal">1,211 cc (73.9 cu in)</span>
              </div>
              <div className="p-3 rounded-2xl bg-[#f7faf8] border border-[#e2ebe4]">
                <span className="text-[10px] text-sage-600 block uppercase">Cooling System</span>
                <span className="font-bold text-charcoal">Liquid Heads / Air Cyl</span>
              </div>
              <div className="p-3 rounded-2xl bg-[#f7faf8] border border-[#e2ebe4]">
                <span className="text-[10px] text-sage-600 block uppercase">Max Takeoff Power</span>
                <span className="font-bold text-charcoal">100 HP @ 5800 RPM</span>
              </div>
              <div className="p-3 rounded-2xl bg-[#f7faf8] border border-[#e2ebe4]">
                <span className="text-[10px] text-sage-600 block uppercase">Reduction Gearbox</span>
                <span className="font-bold text-charcoal">Integrated 1:2.43</span>
              </div>
              <div className="p-3 rounded-2xl bg-[#f7faf8] border border-[#e2ebe4]">
                <span className="text-[10px] text-sage-600 block uppercase">Fuel Delivery</span>
                <span className="font-bold text-charcoal">Dual Carburetor</span>
              </div>
            </div>
          </div>

          {/* Live Cylinder Head Thermals & Engine State */}
          <div className="p-5 rounded-3xl bg-white border border-[#d6e0d8] shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-[#e2eae4] pb-2.5">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-amber-600 text-xl">thermostat</span>
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-charcoal">
                  Live Cylinder Head Thermals
                </h3>
              </div>
              <span className="text-[10px] font-mono text-sage-600">
                {telemetry ? `${Math.round(telemetry.rpm)} RPM` : '--'}
              </span>
            </div>

            <div className="grid grid-cols-4 gap-2 text-center font-mono">
              {(telemetry?.cht ?? [178.2, 182.1, 180.5, 176.8]).map((val, idx) => (
                <div
                  key={idx}
                  className={`p-2.5 rounded-2xl border ${
                    val > 215
                      ? 'bg-red-50 border-red-300 text-red-700'
                      : val > 200
                      ? 'bg-amber-50 border-amber-300 text-amber-700'
                      : 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  }`}
                >
                  <div className="text-[10px] text-sage-600">CYL #{idx + 1}</div>
                  <div className="text-sm font-bold">{val.toFixed(1)}°C</div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}
