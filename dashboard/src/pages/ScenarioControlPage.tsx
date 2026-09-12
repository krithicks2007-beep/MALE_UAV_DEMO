import React, { useState } from 'react';
import { SCENARIO_DEFINITIONS, ScenarioId } from '../models/engine';
import { injectScenarioWS } from '../adapters/WebSocketAdapter';
import { setScenario } from '../adapters/MockAdapter';
import { useScenarioStore } from '../stores/scenarioStore';
import { Zap, AlertTriangle, CheckCircle, ShieldAlert, Thermometer, Flame, Activity } from 'lucide-react';

const ICON_MAP: Record<ScenarioId, React.ReactNode> = {
  NORMAL: <CheckCircle className="w-6 h-6 text-emerald-700" />,
  MISFIRE: <Flame className="w-6 h-6 text-amber-700" />,
  INJECTOR_ABNORMALITY: <Zap className="w-6 h-6 text-orange-700" />,
  LUBRICATION_ISSUE: <AlertTriangle className="w-6 h-6 text-amber-700" />,
  OVERHEATING: <Thermometer className="w-6 h-6 text-red-700 animate-pulse" />,
  SENSOR_DRIFT: <ShieldAlert className="w-6 h-6 text-sky-700" />,
  ABNORMAL_VIBRATION: <Activity className="w-6 h-6 text-purple-700" />,
};

const SEVERITY_COLORS: Record<string, string> = {
  NONE: 'bg-emerald-100 text-emerald-800 border-emerald-300/80',
  LOW: 'bg-sky-100 text-sky-800 border-sky-300/80',
  MEDIUM: 'bg-amber-100 text-amber-900 border-amber-300/80',
  HIGH: 'bg-orange-100 text-orange-900 border-orange-300/80',
  CRITICAL: 'bg-red-100 text-red-900 border-red-300/80',
};

export function ScenarioControlPage() {
  const { activeScenario, setActiveScenario } = useScenarioStore();
  const [notification, setNotification] = useState<string | null>(null);

  const handleInject = (id: ScenarioId) => {
    // Immediate UI state update
    setActiveScenario(id);
    setScenario(id);

    // Broadcast WebSocket message
    injectScenarioWS(id, 60.0);

    // Non-blocking REST API trigger
    const backendApiUrl = import.meta.env.VITE_BACKEND_API_URL || 'https://maleuav.onrender.com';
    fetch(`${backendApiUrl}/api/scenarios/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scenario_id: id, duration_s: 60.0 }),
    }).catch(() => {});

    setNotification(`Scenario Activated: ${id} — Live DSS Decision Streamed!`);
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  return (
    <main className="max-w-[1560px] mx-auto px-4 lg:px-8 py-8 space-y-8">
      {/* Notification Banner */}
      {notification && (
        <div className="bg-amber-100 border border-amber-300 text-amber-900 px-6 py-3 rounded-2xl flex items-center gap-3 shadow-sm animate-bounce">
          <Zap className="w-5 h-5 text-amber-700" />
          <span className="font-semibold text-sm">{notification}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#dbe3dc] pb-6">
        <div>
          <h1 className="text-2xl font-bold text-charcoal flex items-center gap-3">
            <span className="p-2 rounded-xl bg-emerald-100/80 text-emerald-800 border border-emerald-200">
              <Zap className="w-6 h-6" />
            </span>
            Scenario Control & Demonstration Fault Injector
          </h1>
          <p className="text-sm text-sage-600 mt-1">
            Trigger simulated engine faults to observe real-time Decision Support System (DSS) risk evaluation, RUL drop, and advisories.
          </p>
        </div>

        {/* Active Scenario Indicator */}
        <div className="flex items-center gap-3 bg-white/80 backdrop-blur-md border border-[#dbe3dc] px-4 py-2.5 rounded-2xl shadow-sm">
          <span className="text-xs text-sage-600 font-semibold uppercase tracking-wider">ACTIVE FAULT INJECTION:</span>
          <span className="text-sm font-bold text-amber-900 px-3 py-1 rounded-xl bg-amber-100 border border-amber-300">
            {activeScenario || 'NORMAL'}
          </span>
        </div>
      </div>

      {/* Scenario Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {SCENARIO_DEFINITIONS.map((s) => {
          const isActive = activeScenario === s.id;

          return (
            <div
              key={s.id}
              className={`relative flex flex-col justify-between p-6 rounded-3xl border transition-all duration-200 ${
                isActive
                  ? 'bg-[#f4f8f5] border-amber-500/70 ring-2 ring-amber-400/40 shadow-lg'
                  : 'bg-white/70 backdrop-blur-md border-[#dbe3dc] hover:border-sage-400 hover:bg-white/90 shadow-sm'
              }`}
            >
              <div className="space-y-4">
                {/* Header line */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-2xl bg-sage-100/70 border border-sage-200/80">
                      {ICON_MAP[s.id]}
                    </div>
                    <div>
                      <h3 className="font-bold text-charcoal text-lg">{s.name}</h3>
                      <span className="text-xs font-mono text-sage-600">{s.id}</span>
                    </div>
                  </div>
                  <span
                    className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
                      SEVERITY_COLORS[s.severity] || 'bg-sage-100 text-sage-700 border-sage-200'
                    }`}
                  >
                    {s.severity}
                  </span>
                </div>

                {/* Description */}
                <p className="text-sm text-sage-700 leading-relaxed">{s.description}</p>
              </div>

              {/* Inject Action Button */}
              <div className="mt-6 pt-4 border-t border-[#e2eae4] flex items-center justify-between">
                <span className="text-xs text-sage-600 font-mono">
                  {s.affected_subsystem ? `Subsystem: ${s.affected_subsystem}` : 'Nominal State'}
                </span>
                <button
                  onClick={() => handleInject(s.id)}
                  className={`px-4 py-2 text-xs font-bold rounded-xl border transition-all flex items-center gap-2 ${
                    isActive
                      ? 'bg-amber-500 text-slate-950 border-amber-400 hover:bg-amber-400 shadow-md shadow-amber-500/20'
                      : 'pill-btn-dark border-transparent'
                  }`}
                >
                  {isActive ? (
                    <>
                      <CheckCircle className="w-4 h-4" /> ACTIVE INJECTION
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 text-amber-400" /> INJECT SCENARIO
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}

