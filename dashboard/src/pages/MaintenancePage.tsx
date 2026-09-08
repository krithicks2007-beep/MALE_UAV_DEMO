import React from 'react';
import { useAlertStore } from '../stores/alertStore';
import { useDiagnosticsStore } from '../stores/diagnosticsStore';
import { useHealthStore } from '../stores/healthStore';
import { useScenarioStore } from '../stores/scenarioStore';
import { ScenarioId } from '../models/engine';
import { Wrench, ShieldAlert, CheckCircle, AlertOctagon, Activity, FileText, Zap } from 'lucide-react';

interface DSSAdvisoryPreset {
  title: string;
  severity: 'INFO' | 'WARNING' | 'HIGH' | 'CRITICAL';
  priority: 'ROUTINE' | 'PLANNED' | 'HIGH' | 'IMMEDIATE';
  operational: string;
  maintenance: string;
  evidence: string[];
}

const SCENARIO_DSS_ADVISORIES: Record<ScenarioId, DSSAdvisoryPreset> = {
  NORMAL: {
    title: 'DSS Nominal Engine Evaluation',
    severity: 'INFO',
    priority: 'ROUTINE',
    operational: 'Engine operating within nominal physical envelopes. Maintain planned flight path.',
    maintenance: 'ROUTINE: Continue standard engine inspection interval and live telemetry monitoring.',
    evidence: ['All monitored physical channels operate within nominal variance envelopes.', 'Physics residuals (actual - expected) < 2.0%.'],
  },
  OVERHEATING: {
    title: 'DSS Critical Overheating Advisory',
    severity: 'CRITICAL',
    priority: 'IMMEDIATE',
    operational: 'Inspect cooling/thermal system and avoid prolonged high thermal stress where operationally feasible. HIGH RISK: Exercise flight caution.',
    maintenance: 'IMMEDIATE ACTION: Inspect cooling/thermal system, clean heat exchangers, and check coolant lines before next flight.',
    evidence: ['CHT residual delta +42°C above expected physics baseline.', 'EGT thermal gradient elevated across all 4 cylinders.', 'Degradation trend: RAPIDLY_INCREASING.'],
  },
  MISFIRE: {
    title: 'DSS Combustion Misfire Advisory',
    severity: 'HIGH',
    priority: 'HIGH',
    operational: 'Combustion abnormality in Cylinder 2. Avoid continuous high-throttle regimes and rapid throttle shock.',
    maintenance: 'HIGH PRIORITY: Inspect ignition coils, spark plugs, and combustion balance before next mission.',
    evidence: ['Cylinder 2 EGT drop (-65°C) indicating partial combustion failure.', 'Engine vibration magnitude elevated to 4.8 mm/s.'],
  },
  INJECTOR_ABNORMALITY: {
    title: 'DSS Fuel Injector Abnormality Advisory',
    severity: 'HIGH',
    priority: 'HIGH',
    operational: 'Fuel delivery deviation on Cylinder 3. Avoid rapid throttle changes; monitor fuel flow and EGT distribution.',
    maintenance: 'HIGH PRIORITY: Inspect fuel injector delivery on Cylinder 3 and verify ECU pulse width calibrations.',
    evidence: ['EGT thermal variance +56°C on Cylinder 3.', 'Fuel-air ratio imbalance detected by physics residual model.'],
  },
  LUBRICATION_ISSUE: {
    title: 'DSS Lubrication System Advisory',
    severity: 'CRITICAL',
    priority: 'IMMEDIATE',
    operational: 'Oil pressure degradation below safe minimum threshold. Reduce engine load immediately.',
    maintenance: 'IMMEDIATE ACTION: Inspect oil pressure regulator, oil pump, filter assembly, and lubrication fluid level.',
    evidence: ['Oil pressure 1.2 bar below minimum continuous operational limit (3.2 bar).', 'Oil temperature elevated to 118°C.'],
  },
  SENSOR_DRIFT: {
    title: 'DSS Sensor Calibration & Signal Advisory',
    severity: 'WARNING',
    priority: 'PLANNED',
    operational: 'Verify sensor signal, wiring, and calibration. Do not interpret a failed sensor as physical engine breakdown.',
    maintenance: 'PLANNED MAINTENANCE: Re-calibrate EGT sensor channel 1 and check harness wiring during next servicing.',
    evidence: ['EGT Cylinder 1 exhibiting bias drift while physical engine thermals remain balanced.', 'Physics/AI disagreement detected.'],
  },
  ABNORMAL_VIBRATION: {
    title: 'DSS Mechanical Vibration Advisory',
    severity: 'HIGH',
    priority: 'HIGH',
    operational: 'Engine vibration magnitude elevated above baseline. Avoid operating in harmonic vibration resonance bands.',
    maintenance: 'HIGH PRIORITY: Inspect crankshaft bearings, engine shock mounts, and propeller assembly before next mission.',
    evidence: ['Overall vibration magnitude 8.6 mm/s exceeding 5.0 mm/s warning threshold.', 'Mechanical degradation rate elevated.'],
  },
};

export function MaintenancePage() {
  const alerts = useAlertStore((state) => state.alerts);
  const diagnostics = useDiagnosticsStore((state) => state.diagnostics);
  const health = useHealthStore((state) => state.health);
  const activeScenario = useScenarioStore((state) => state.activeScenario) || 'NORMAL';

  const activeAlerts = alerts.filter((a) => a.active);
  const presetAdvisory = SCENARIO_DSS_ADVISORIES[activeScenario] || SCENARIO_DSS_ADVISORIES.NORMAL;

  return (
    <main className="max-w-[1560px] mx-auto px-4 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#dbe3dc] pb-6">
        <div>
          <h1 className="text-2xl font-bold text-charcoal flex items-center gap-3">
            <span className="p-2 rounded-xl bg-cyan-100/80 text-cyan-800 border border-cyan-200">
              <Wrench className="w-6 h-6" />
            </span>
            Maintenance Advisory & Operational Decision Support
          </h1>
          <p className="text-sm text-sage-600 mt-1">
            Real-time engineering recommendations, risk levels, and operational advisories generated by the Decision Support System (DSS).
          </p>
        </div>

        <div className="flex items-center gap-3 bg-white/80 backdrop-blur-md border border-[#dbe3dc] px-4 py-2.5 rounded-2xl shadow-sm">
          <span className="text-xs text-sage-600 font-semibold uppercase tracking-wider">HEALTH INDEX:</span>
          <span className="text-base font-bold text-emerald-700 font-mono">
            {health?.index ? `${health.index.toFixed(1)}%` : 'NOMINAL'}
          </span>
        </div>
      </div>

      {/* Primary DSS Advisory Banner for Active Scenario */}
      <div className="p-6 rounded-3xl bg-white/80 backdrop-blur-md border border-[#dbe3dc] shadow-md space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-amber-100 text-amber-800 border border-amber-300/80">
              <AlertOctagon className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-charcoal">{presetAdvisory.title}</h2>
              <span className="text-xs font-mono text-sage-600">ACTIVE SCENARIO: {activeScenario}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 text-xs font-bold rounded-xl bg-amber-100 text-amber-900 border border-amber-300">
              PRIORITY: {presetAdvisory.priority}
            </span>
            <span className="px-3 py-1 text-xs font-bold rounded-xl bg-red-100 text-red-900 border border-red-300">
              {presetAdvisory.severity}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {/* Operational Guidance */}
          <div className="bg-[#f4f7f4] p-4 rounded-2xl border border-[#dce4de] space-y-1">
            <span className="text-xs text-amber-800 font-bold uppercase tracking-wider block">
              Pilot / Operational Guidance:
            </span>
            <p className="text-sage-900 text-sm font-medium leading-relaxed">{presetAdvisory.operational}</p>
          </div>

          {/* Maintenance Action */}
          <div className="bg-[#f4f7f4] p-4 rounded-2xl border border-[#dce4de] space-y-1">
            <span className="text-xs text-cyan-800 font-bold uppercase tracking-wider block">
              Recommended Maintenance Action:
            </span>
            <p className="text-sage-900 text-sm font-medium leading-relaxed">{presetAdvisory.maintenance}</p>
          </div>
        </div>
      </div>

      {/* Advisory Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Columns: Live Alerts List */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-lg font-bold text-sage-900 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-amber-700" />
            Active Telemetry & Subsystem Alerts ({activeAlerts.length})
          </h2>

          {activeAlerts.length === 0 ? (
            <div className="p-8 rounded-3xl bg-white/70 backdrop-blur-md border border-[#dbe3dc] text-center space-y-3 shadow-sm">
              <CheckCircle className="w-10 h-10 text-emerald-700 mx-auto" />
              <h3 className="text-base font-bold text-charcoal">Subsystem Monitoring Active</h3>
              <p className="text-xs text-sage-600 max-w-md mx-auto">
                No active critical threshold excursions. Primary DSS evaluation is active above.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {activeAlerts.map((adv) => (
                <div
                  key={adv.id}
                  className="p-6 rounded-3xl bg-white/80 backdrop-blur-md border border-[#dbe3dc] shadow-sm space-y-4"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-2xl bg-amber-100 text-amber-800 border border-amber-300">
                        <Zap className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-bold text-charcoal text-base">{adv.title}</h3>
                        <span className="text-xs text-sage-600 font-mono">{adv.timestamp}</span>
                      </div>
                    </div>
                    <span className="px-3 py-1 text-xs font-bold rounded-xl bg-amber-100 text-amber-900 border border-amber-300">
                      {adv.severity}
                    </span>
                  </div>

                  <div className="space-y-2 bg-[#f4f7f4] p-4 rounded-2xl border border-[#dce4de] text-sm">
                    <div>
                      <span className="text-xs text-sage-600 font-bold uppercase tracking-wider block mb-1">
                        Alert Description & Details:
                      </span>
                      <p className="text-sage-900 font-medium">{adv.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right 1 Column: RUL & Decision Evidence */}
        <div className="space-y-6">
          <h2 className="text-lg font-bold text-sage-900 flex items-center gap-2">
            <Activity className="w-5 h-5 text-cyan-700" />
            Remaining Useful Life (RUL)
          </h2>

          <div className="p-6 rounded-3xl bg-white/80 backdrop-blur-md border border-[#dbe3dc] shadow-sm space-y-4">
            <div className="space-y-1">
              <span className="text-xs font-mono text-sage-600 uppercase">Estimated RUL</span>
              <div className="text-3xl font-black text-cyan-700 font-mono">
                {diagnostics?.rul_value ? `${diagnostics.rul_value} HOURS` : '1240 HOURS'}
              </div>
              <span className="text-xs text-sage-600 font-mono">Model-Based Trajectory Estimate</span>
            </div>

            <div className="pt-4 border-t border-[#e2eae4] space-y-2">
              <div className="flex justify-between text-xs text-sage-700">
                <span>RUL Confidence:</span>
                <span className="font-mono text-emerald-700 font-bold">{diagnostics?.rul_confidence || 87}%</span>
              </div>
              <div className="flex justify-between text-xs text-sage-700">
                <span>Uncertainty Margin:</span>
                <span className="font-mono text-amber-800 font-bold">±{diagnostics?.rul_uncertainty || 15} hrs</span>
              </div>
            </div>
          </div>

          {/* Decision Evidence List */}
          <div className="p-6 rounded-3xl bg-white/80 backdrop-blur-md border border-[#dbe3dc] shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-charcoal flex items-center gap-2">
              <FileText className="w-4 h-4 text-sage-600" />
              Decision Evidence & Reason Log
            </h3>
            <ul className="space-y-2 text-xs text-sage-800">
              {presetAdvisory.evidence.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2 bg-[#f4f7f4] p-3 rounded-xl border border-[#dce4de] font-medium">
                  <span className="text-emerald-700 font-bold">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
}
