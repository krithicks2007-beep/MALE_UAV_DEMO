import { useTwinStore } from '../../stores/twinStore';
import { TwinCanvas } from './TwinCanvas';

export function TwinStagePanel() {
  const { twinState, modelMode, setModelMode, toggleModelMode } = useTwinStore();
  const isLive = twinState?.twin_sync_status === 'SYNCED';

  return (
    <section className="lg:col-span-6 flex flex-col items-center justify-between rounded-3xl p-6 bg-[#f4f7f4]/80 border border-[#dce4de] shadow-stage relative overflow-hidden min-h-[620px]">

      {/* Twin Status Header & Model Toggle Switch */}
      <div className="w-full flex flex-wrap items-center justify-between gap-2 z-20">
        <div className="flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/90 border border-[#d6e0d8] shadow-sm">
          <span className={`w-2 h-2 rounded-full ${isLive ? 'bg-sage-600 animate-ping' : 'bg-amber-400 animate-pulse'}`} />
          <span className="font-mono text-xs font-semibold tracking-wider text-charcoal uppercase">
            Twin Status —{' '}
            <span className="text-sage-700 font-bold">
              {isLive ? 'LIVE / SYNCHRONIZED' : twinState?.twin_sync_status ?? 'CONNECTING'}
            </span>
          </span>
        </div>

        {/* Dual Model Switch: PBR Solid vs Wireframe */}
        <div className="flex items-center bg-white/90 p-1 rounded-full border border-[#d6e0d8] shadow-sm">
          <button
            type="button"
            onClick={() => setModelMode('SOLID')}
            className={`px-3 py-1 text-xs font-mono font-semibold rounded-full transition-all flex items-center gap-1.5 ${
              modelMode === 'SOLID'
                ? 'bg-charcoal text-white shadow-xs'
                : 'text-sage-700 hover:text-charcoal hover:bg-sage-100/60'
            }`}
          >
            <span className="material-symbols-outlined text-[14px]">view_in_ar</span>
            <span>Solid PBR</span>
          </button>
          <button
            type="button"
            onClick={() => setModelMode('WIREFRAME')}
            className={`px-3 py-1 text-xs font-mono font-semibold rounded-full transition-all flex items-center gap-1.5 ${
              modelMode === 'WIREFRAME'
                ? 'bg-sage-700 text-white shadow-xs'
                : 'text-sage-700 hover:text-charcoal hover:bg-sage-100/60'
            }`}
          >
            <span className="material-symbols-outlined text-[14px]">grid_3x3</span>
            <span>Wireframe</span>
          </button>
        </div>
      </div>

      {/* Radial pod disc + Three.js */}
      <div className="relative w-full flex-1 my-4 flex items-center justify-center">
        {/* Concentric ring backdrop */}
        <div className="absolute w-[420px] h-[420px] rounded-full radial-pod-gradient opacity-90 shadow-2xl pointer-events-none flex items-center justify-center">
          <div className="w-[410px] h-[410px] rounded-full border border-dashed border-[#8ea895]/60 absolute" />
          <div className="w-[340px] h-[340px] rounded-full border border-[#9cb2a2]/40 absolute" />
          {/* Pod labels */}
          <div className="absolute -top-3 -left-4 px-3 py-1.5 rounded-full bg-white/80 border border-[#d2ddd5] text-[10px] font-mono text-charcoal shadow-sm flex items-center gap-1">
            <span className={`w-1.5 h-1.5 rounded-full ${modelMode === 'WIREFRAME' ? 'bg-cyan-500' : 'bg-sage-500'}`} />
            {modelMode === 'WIREFRAME' ? 'TAPAS-01 • Wireframe' : `MALE-01 • ${twinState ? Math.round(twinState.health_index) : '--'}%`}
          </div>
          <div className="absolute bottom-6 -right-3 px-3 py-1.5 rounded-full bg-white/80 border border-[#d2ddd5] text-[10px] font-mono text-charcoal shadow-sm">
            FADEC Pod • {twinState?.engine_state ?? '--'}
          </div>
          <div className="absolute -left-7 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded-full bg-white/60 border border-[#d2ddd5] text-[9px] font-mono text-sage-700">
            Node #1
          </div>
        </div>

        {/* Right-side view controls */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex flex-col gap-2 z-20">
          <button
            type="button"
            title="Toggle Solid / Wireframe Model"
            onClick={toggleModelMode}
            className={`w-10 h-10 rounded-2xl border shadow-sm flex items-center justify-center transition-all ${
              modelMode === 'WIREFRAME'
                ? 'bg-sage-700 text-white border-sage-800'
                : 'bg-white/90 hover:bg-white text-sage-800 border-[#d3ded5]'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">
              {modelMode === 'WIREFRAME' ? 'grid_3x3' : 'view_in_ar'}
            </span>
          </button>
        </div>

        {/* Three.js Canvas */}
        <div className="relative z-10 w-full h-[500px]">
          <TwinCanvas twinState={twinState} />
        </div>
      </div>

      {/* Bottom dock bar */}
      <div className="w-full flex items-center justify-between z-20 pt-2 border-t border-[#d8e2da]">
        <span className="flex items-center gap-1.5 text-xs font-mono text-sage-700">
          <span className="material-symbols-outlined text-[14px]">3d_rotation</span>
          Drag to orbit • Mode: <span className="font-semibold text-charcoal">{modelMode}</span>
        </span>
        <div className="flex items-center gap-1.5 p-1.5 rounded-full bg-white/80 border border-[#d2ded5] shadow-sm">
          <button
            type="button"
            onClick={() => setModelMode('SOLID')}
            title="Solid PBR Model"
            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs transition-colors ${modelMode === 'SOLID' ? 'bg-charcoal text-white' : 'hover:bg-sage-100 text-charcoal'}`}
          >
            <span className="material-symbols-outlined text-[16px]">view_in_ar</span>
          </button>
          <button
            type="button"
            onClick={() => setModelMode('WIREFRAME')}
            title="Wireframe Cyber Model"
            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs transition-colors ${modelMode === 'WIREFRAME' ? 'bg-charcoal text-white' : 'hover:bg-sage-100 text-charcoal'}`}
          >
            <span className="material-symbols-outlined text-[16px]">grid_3x3</span>
          </button>
        </div>
        <span className="px-3.5 py-1 rounded-full bg-white border border-[#d2ded5] text-charcoal font-medium text-xs font-mono shadow-sm">
          {modelMode === 'WIREFRAME' ? 'TAPAS WIREFRAME MESH' : 'MALE-01 PBR TWIN'}
        </span>
      </div>
    </section>
  );
}
