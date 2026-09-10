import { useMissionStore } from '../../stores/missionStore';
import { useConnectionStore } from '../../stores/connectionStore';
import { SectionCard, CardHeader } from '../common/SectionCard';
import { StatusPill } from '../common/StatusPill';

export function MissionTimeline() {
  const mission = useMissionStore((s) => s.mission);
  const setActiveTab = useConnectionStore((s) => s.setActiveTab);
  if (!mission) return <SectionCard className="animate-pulse min-h-[200px]" />;

  const anomaly = mission.anomaly_events[0];

  return (
    <SectionCard>
      <CardHeader
        title="Mission Timeline & Anomaly Events"
        right={
          <div className="flex items-center gap-2">
            <StatusPill
              label={`PHASE: ${mission.current_phase_label}`}
              variant="muted"
            />
            <button
              onClick={() => setActiveTab('replay')}
              className="px-2.5 py-1 rounded-xl bg-charcoal text-white text-[11px] font-mono hover:bg-black transition-colors flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[14px]">play_circle</span>
              Open Replay
            </button>
          </div>
        }
      />

      <div className="p-5 rounded-2xl bg-sage-50/50 border border-[#e5ede7] flex flex-col justify-between flex-1">
        {/* Waypoint labels */}
        <div className="grid grid-cols-5 text-center text-xs font-mono mb-3">
          {mission.waypoints.map((wp) => (
            <span
              key={wp.id}
              className={`font-medium ${wp.active ? 'text-charcoal font-bold' : wp.completed ? 'text-sage-700' : 'text-sage-400'}`}
            >
              {wp.label}
            </span>
          ))}
        </div>

        {/* Scrubber bar */}
        <div className="relative py-4">
          <div className="h-2 w-full rounded-full bg-[#dbe4dd] relative overflow-hidden">
            <div
              className="h-full rounded-full bg-charcoal transition-all duration-500"
              style={{ width: `${mission.timeline_pct}%` }}
            />
          </div>

          {/* Waypoint dots */}
          {mission.waypoints.map((wp) => (
            <div
              key={wp.id}
              className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 rounded-full border-2 border-white shadow-sm transition-all ${
                wp.active
                  ? 'w-5 h-5 bg-sage-700 flex items-center justify-center'
                  : wp.completed
                  ? 'w-3.5 h-3.5 bg-charcoal'
                  : 'w-3 h-3 bg-[#cbd6cd]'
              }`}
              style={{ left: `${wp.timeline_pct}%` }}
            >
              {wp.active && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
            </div>
          ))}

          {/* Anomaly flag */}
          {anomaly && (
            <div
              className="absolute -top-1 -translate-x-1/2 flex flex-col items-center cursor-pointer"
              style={{ left: `${anomaly.timeline_pct}%` }}
              title={anomaly.description}
            >
              <span className="material-symbols-outlined text-[16px] text-amber-600 animate-bounce">warning</span>
            </div>
          )}
        </div>

        {/* Anomaly event row */}
        {anomaly && (
          <div className="mt-2 pt-3 border-t border-[#d8e2da] flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-2 text-amber-900">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span className="font-bold">
                Anomaly Event (T+{new Date(anomaly.mission_time_s * 1000).toISOString().substring(11, 19)}):
              </span>
              <span className="text-charcoal font-sans text-xs">{anomaly.description}</span>
            </div>
            <span className="text-sage-600 font-mono text-[11px] ml-2 shrink-0">SCRUBBER: LOCKED</span>
          </div>
        )}
      </div>
    </SectionCard>
  );
}
