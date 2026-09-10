import React from 'react';
import { useConnectionStore } from '../../stores/connectionStore';
import { useScenarioStore } from '../../stores/scenarioStore';
import { useTelemetryStore } from '../../stores/telemetryStore';
import { RotateCcw, Layers, Zap, Clock } from 'lucide-react';

interface MissionReplayHeaderProps {
  totalFrames: number;
  currentFrame: number;
  recordedDurationSeconds: number;
  currentTimestamp: number | null;
}

export function MissionReplayHeader({
  totalFrames,
  currentFrame,
  recordedDurationSeconds,
  currentTimestamp,
}: MissionReplayHeaderProps) {
  const connectionState = useConnectionStore((s) => s.state);
  const dataSource = useConnectionStore((s) => s.dataSource);
  const activeScenario = useScenarioStore((s) => s.activeScenario);
  const scenarioDefinitions = useScenarioStore((s) => s.definitions);
  const context = useTelemetryStore((s) => s.context);

  const activeDef = scenarioDefinitions.find((def) => def.id === activeScenario);

  const durationText = recordedDurationSeconds > 0
    ? `${Math.floor(recordedDurationSeconds / 60)}m ${Math.floor(recordedDurationSeconds % 60)}s`
    : '0s';

  const timestampText = currentTimestamp
    ? new Date(currentTimestamp * 1000).toISOString().substring(11, 19) + ' UTC'
    : '—';

  return (
    <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white/70 backdrop-blur-md p-5 rounded-3xl border border-[#dbe3dc] shadow-sm transition-all duration-300">
      <div className="space-y-1">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-cyan-100/90 text-cyan-800 border border-cyan-200">
            <RotateCcw className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-charcoal tracking-tight flex items-center gap-2">
              Mission Replay
              <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-cyan-100 text-cyan-800 border border-cyan-300">
                TELEMETRY HISTORY BUFFER
              </span>
            </h1>
            <p className="text-xs font-mono text-sage-600">
              Interactive playback scrubber &amp; temporal telemetry frame inspection
            </p>
          </div>
        </div>
      </div>

      {/* Status Badges */}
      <div className="flex flex-wrap items-center gap-2.5">
        {/* Frame Progress */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sage-50 border border-sage-200/80 text-xs font-mono text-sage-700">
          <Layers className="w-3.5 h-3.5 text-sage-600" />
          <span>FRAME: {totalFrames > 0 ? `${currentFrame + 1}/${totalFrames}` : '0/0'}</span>
        </div>

        {/* Duration */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sage-50 border border-sage-200/80 text-xs font-mono text-sage-700">
          <Clock className="w-3.5 h-3.5 text-sage-600" />
          <span>SPAN: {durationText}</span>
        </div>

        {/* Active Scenario */}
        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-mono font-semibold transition-all ${
          activeScenario === 'NORMAL'
            ? 'bg-sage-100 text-sage-800 border-sage-300'
            : 'bg-amber-100 text-amber-900 border-amber-300'
        }`}>
          <Zap className="w-3.5 h-3.5" />
          <span>SCENARIO: {activeDef?.name || activeScenario}</span>
        </div>

        {/* Source State */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-100/90 text-emerald-800 border border-emerald-300 text-xs font-mono font-bold">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>{dataSource} ({connectionState})</span>
        </div>
      </div>
    </header>
  );
}
