import { useState, useEffect, useMemo } from 'react';
import { useAlertStore } from '../../stores/alertStore';
import { useDiagnosticsStore } from '../../stores/diagnosticsStore';
import { useHealthStore } from '../../stores/healthStore';
import { getUAVFaultLocation, type UAVFaultLocation } from './faultLocationMap';
import { PillButton } from '../common/PillButton';

interface AnomalyItem {
  id: string;
  title: string;
  displayName: string;
  faultKey: string;
  severity: 'CRITICAL' | 'HIGH' | 'WARNING' | 'INFO' | 'NOMINAL';
  locationInfo: UAVFaultLocation;
  anomalyScore: number;
  confidence: number;
  degradationStatus: string;
  failureRiskPct: number;
  evidence: string[];
  recommendedAction: string;
  alertId?: string;
  acknowledged?: boolean;
}

export function FloatingAlertModal() {
  const alerts = useAlertStore((s) => s.alerts);
  const acknowledge = useAlertStore((s) => s.acknowledge);
  const diagnostics = useDiagnosticsStore((s) => s.diagnostics);
  const health = useHealthStore((s) => s.health);

  const [isMinimized, setIsMinimized] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);

  const activeAlerts = alerts.filter((a) => a.active && !a.acknowledged);
  const criticalAlerts = activeAlerts.filter((a) => a.severity === 'CRITICAL' || a.severity === 'HIGH');
  const isCritical = criticalAlerts.length > 0 || diagnostics?.severity === 'CRITICAL' || health?.engine_state === 'CRITICAL';
  const isWarning = !isCritical && (activeAlerts.some((a) => a.severity === 'WARNING') || diagnostics?.severity === 'WARNING' || health?.engine_state === 'WARNING');

  const hasAlert = isCritical || isWarning;

  // Build unified anomaly list
  const anomalyList: AnomalyItem[] = useMemo(() => {
    const list: AnomalyItem[] = [];
    const seenKeys = new Set<string>();

    // 1. Map active alerts
    activeAlerts.forEach((alert, idx) => {
      const faultKey = alert.related_parameter || alert.title || 'UAV_FAULT_ALERT';
      const loc = getUAVFaultLocation(faultKey);
      seenKeys.add(loc.primaryFault);
      seenKeys.add(faultKey);

      list.push({
        id: alert.id || `alert-${idx}`,
        title: alert.title || loc.displayName,
        displayName: loc.displayName,
        faultKey,
        severity: alert.severity || (isCritical ? 'CRITICAL' : 'WARNING'),
        locationInfo: loc,
        anomalyScore: diagnostics?.anomaly_score != null ? diagnostics.anomaly_score * 100 : 88.5,
        confidence: diagnostics?.confidence ?? 94.0,
        degradationStatus: diagnostics?.degradation_status ?? 'MODERATE',
        failureRiskPct: diagnostics?.failure_risk_pct ?? (alert.severity === 'CRITICAL' ? 82.5 : 45.0),
        evidence: alert.description
          ? [alert.description, ...(loc.defaultEvidence || [])]
          : (diagnostics?.evidence && diagnostics.evidence.length > 0 ? diagnostics.evidence : loc.defaultEvidence),
        recommendedAction: loc.recommendedAction,
        alertId: alert.id,
        acknowledged: alert.acknowledged,
      });
    });

    // 2. Add diagnostics primary fault if not already covered
    if (diagnostics?.primary_fault && diagnostics.primary_fault !== 'NONE') {
      const loc = getUAVFaultLocation(diagnostics.primary_fault);
      if (!seenKeys.has(loc.primaryFault) && !seenKeys.has(diagnostics.primary_fault)) {
        list.unshift({
          id: `diag-primary-${diagnostics.primary_fault}`,
          title: loc.displayName,
          displayName: loc.displayName,
          faultKey: diagnostics.primary_fault,
          severity: diagnostics.severity === 'NOMINAL' ? 'WARNING' : diagnostics.severity,
          locationInfo: loc,
          anomalyScore: diagnostics.anomaly_score != null ? diagnostics.anomaly_score * 100 : 88.5,
          confidence: diagnostics.confidence ?? 95.0,
          degradationStatus: diagnostics.degradation_status ?? 'MODERATE',
          failureRiskPct: diagnostics.failure_risk_pct ?? 74.2,
          evidence: diagnostics.evidence && diagnostics.evidence.length > 0 ? diagnostics.evidence : loc.defaultEvidence,
          recommendedAction: loc.recommendedAction,
          acknowledged: false,
        });
      }
    }

    // 3. Fallback when active but no alerts listed
    if (list.length === 0 && (isCritical || isWarning)) {
      const fallbackKey = diagnostics?.primary_fault || (isCritical ? 'CRITICAL_ALARM' : 'OPERATIONAL_WARNING');
      const loc = getUAVFaultLocation(fallbackKey);
      list.push({
        id: 'fallback-anomaly-1',
        title: loc.displayName,
        displayName: loc.displayName,
        faultKey: fallbackKey,
        severity: isCritical ? 'CRITICAL' : 'WARNING',
        locationInfo: loc,
        anomalyScore: diagnostics?.anomaly_score != null ? diagnostics.anomaly_score * 100 : 88.5,
        confidence: diagnostics?.confidence ?? 90.0,
        degradationStatus: diagnostics?.degradation_status ?? 'MODERATE',
        failureRiskPct: diagnostics?.failure_risk_pct ?? (isCritical ? 75.0 : 35.0),
        evidence: diagnostics?.evidence && diagnostics.evidence.length > 0 ? diagnostics.evidence : loc.defaultEvidence,
        recommendedAction: loc.recommendedAction,
        acknowledged: false,
      });
    }

    return list;
  }, [activeAlerts, diagnostics, isCritical, isWarning]);

  // Keep page within bounds
  useEffect(() => {
    if (currentPage >= anomalyList.length && anomalyList.length > 0) {
      setCurrentPage(anomalyList.length - 1);
    }
  }, [anomalyList.length, currentPage]);

  // Auto un-dismiss and reset page on new fault
  useEffect(() => {
    if (hasAlert) {
      setIsDismissed(false);
      setCurrentPage(0);
    }
  }, [alerts.length, diagnostics?.primary_fault, isCritical]);

  // Keyboard navigation for pagination (Left / Right Arrow)
  useEffect(() => {
    if (!isDrawerOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        setCurrentPage((p) => Math.max(0, p - 1));
      } else if (e.key === 'ArrowRight') {
        setCurrentPage((p) => Math.min(anomalyList.length - 1, p + 1));
      } else if (e.key === 'Escape') {
        setIsDrawerOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDrawerOpen, anomalyList.length]);

  if (!hasAlert || isDismissed || anomalyList.length === 0) {
    return null;
  }

  const currentAnomaly = anomalyList[currentPage] || anomalyList[0];
  const totalAnomalies = anomalyList.length;
  const isCurrentCritical = currentAnomaly.severity === 'CRITICAL' || currentAnomaly.severity === 'HIGH';
  const locationInfo = currentAnomaly.locationInfo;

  // Minimized Floating HUD Pill
  if (isMinimized && !isDrawerOpen) {
    return (
      <aside 
        aria-label="Active Safety Alert Status"
        className="fixed bottom-6 right-6 z-40 transition-all duration-300 animate-fadeIn"
      >
        <button
          onClick={() => setIsMinimized(false)}
          className={`flex items-center gap-3 px-4 py-2.5 rounded-full shadow-lg border backdrop-blur-xl transition-all duration-200 transform hover:scale-105 cursor-pointer ${
            isCurrentCritical
              ? 'bg-white/95 border-red-300 text-charcoal shadow-red-500/10 ring-2 ring-red-400/30'
              : 'bg-white/95 border-amber-300 text-charcoal shadow-amber-500/10 ring-2 ring-amber-400/30'
          }`}
          title="Click to expand safety alert details"
        >
          <span className={`w-2.5 h-2.5 rounded-full animate-ping ${isCurrentCritical ? 'bg-red-600' : 'bg-amber-600'}`} />
          <span className={`material-symbols-outlined text-[18px] ${isCurrentCritical ? 'text-red-600' : 'text-amber-600'}`}>
            {isCurrentCritical ? 'emergency' : 'warning'}
          </span>
          <div className="flex flex-col text-left">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-mono font-bold tracking-wider text-charcoal">
                {currentAnomaly.displayName.toUpperCase()}
              </span>
              {totalAnomalies > 1 && (
                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded-full bg-sage-200 text-sage-800 font-bold">
                  {currentPage + 1}/{totalAnomalies}
                </span>
              )}
            </div>
            <span className="text-[9px] text-sage-600 font-mono">
              📍 {locationInfo.zone}
            </span>
          </div>
          <span className="text-[10px] bg-sage-100 hover:bg-sage-200 text-sage-800 px-2.5 py-0.5 rounded-full font-mono font-bold ml-1 border border-sage-300">
            Details ↗
          </span>
        </button>
      </aside>
    );
  }

  return (
    <>
      {/* 1. Floating Warning Card (Bottom Right HUD) */}
      <aside
        aria-label="Active Safety Alert Window"
        className="fixed bottom-6 right-6 z-40 w-[400px] max-w-[calc(100vw-2rem)] transition-all duration-300 animate-fadeIn"
      >
        <div
          className={`p-4 rounded-3xl border shadow-card backdrop-blur-xl transition-all duration-300 ${
            isCurrentCritical
              ? 'bg-white/95 border-red-300 shadow-[0_12px_36px_rgba(220,38,38,0.15)] ring-1 ring-red-400/30'
              : 'bg-white/95 border-amber-300 shadow-[0_12px_36px_rgba(217,119,6,0.15)] ring-1 ring-amber-400/30'
          }`}
        >
          {/* Header Bar */}
          <div className="flex items-center justify-between pb-2.5 border-b border-[#dbe3dc]">
            <div className="flex items-center gap-2">
              <span
                className={`w-2.5 h-2.5 rounded-full animate-ping ${
                  isCurrentCritical ? 'bg-red-600' : 'bg-amber-500'
                }`}
              />
              <span
                className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                  isCurrentCritical
                    ? 'bg-red-100 text-red-900 border-red-300'
                    : 'bg-[#faede1] text-amber-900 border-amber-200'
                }`}
              >
                {isCurrentCritical ? 'CRITICAL SAFETY LIMIT' : 'ADVISORY WARNING'}
              </span>

              {/* Quick Anomaly Counter */}
              {totalAnomalies > 1 && (
                <span className="text-[10px] font-mono text-sage-800 bg-sage-100 px-2 py-0.5 rounded-full border border-sage-300 font-bold">
                  {currentPage + 1}/{totalAnomalies}
                </span>
              )}
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsMinimized(true)}
                className="w-7 h-7 rounded-full flex items-center justify-center text-sage-600 hover:text-charcoal hover:bg-sage-100 transition text-xs font-bold"
                title="Minimize to floating pill"
              >
                —
              </button>
              <button
                onClick={() => setIsDismissed(true)}
                className="w-7 h-7 rounded-full flex items-center justify-center text-sage-600 hover:text-charcoal hover:bg-sage-100 transition text-xs font-bold"
                title="Dismiss floating alert"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Quick Pagination Controls on Floating Card (If > 1 Anomaly) */}
          {totalAnomalies > 1 && (
            <div className="mt-2.5 flex items-center justify-between bg-sage-50/80 px-3 py-1.5 rounded-2xl border border-[#dbe3dc] text-xs font-mono">
              <button
                type="button"
                disabled={currentPage === 0}
                onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                className={`flex items-center gap-0.5 font-bold transition ${
                  currentPage === 0 ? 'text-sage-400 cursor-not-allowed' : 'text-charcoal hover:text-emerald-700'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">chevron_left</span>
                <span>Prev</span>
              </button>

              <div className="flex items-center gap-1">
                {anomalyList.map((anom, idx) => (
                  <button
                    key={anom.id}
                    type="button"
                    onClick={() => setCurrentPage(idx)}
                    className={`w-5 h-5 rounded-full text-[10px] font-mono font-bold transition flex items-center justify-center ${
                      idx === currentPage
                        ? anom.severity === 'CRITICAL' || anom.severity === 'HIGH'
                          ? 'bg-red-600 text-white shadow-xs'
                          : 'bg-amber-600 text-white shadow-xs'
                        : 'bg-white text-sage-700 hover:bg-sage-200 border border-sage-300'
                    }`}
                    title={`Go to anomaly #${idx + 1}: ${anom.displayName}`}
                  >
                    {idx + 1}
                  </button>
                ))}
              </div>

              <button
                type="button"
                disabled={currentPage === totalAnomalies - 1}
                onClick={() => setCurrentPage((p) => Math.min(totalAnomalies - 1, p + 1))}
                className={`flex items-center gap-0.5 font-bold transition ${
                  currentPage === totalAnomalies - 1 ? 'text-sage-400 cursor-not-allowed' : 'text-charcoal hover:text-emerald-700'
                }`}
              >
                <span>Next</span>
                <span className="material-symbols-outlined text-[16px]">chevron_right</span>
              </button>
            </div>
          )}

          {/* Primary Issue Name & Location */}
          <div 
            onClick={() => setIsDrawerOpen(true)}
            className="mt-2.5 flex items-center gap-3.5 p-2.5 rounded-2xl bg-sage-50/70 hover:bg-sage-100/80 transition cursor-pointer border border-[#dbe3dc] group"
            title="Click to inspect full issue details and UAV location"
          >
            <div
              className={`w-11 h-11 shrink-0 rounded-2xl flex items-center justify-center font-bold text-white shadow-sm ${
                isCurrentCritical
                  ? 'bg-gradient-to-br from-red-600 to-rose-700'
                  : 'bg-gradient-to-br from-amber-500 to-orange-600'
              }`}
            >
              <span className="material-symbols-outlined text-[24px]">
                {isCurrentCritical ? 'emergency' : 'warning'}
              </span>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-1">
                <span className="text-[10px] font-mono font-bold tracking-wider text-sage-600 uppercase">
                  ACTIVE ANOMALY #{currentPage + 1}
                </span>
                <span className="text-[10px] font-mono text-sage-700 font-bold group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                  View Detail ↗
                </span>
              </div>
              <h4 className="text-sm font-bold tracking-tight text-charcoal line-clamp-1 mt-0.5">
                {currentAnomaly.displayName}
              </h4>
              <div className="mt-0.5 flex items-center gap-1.5 text-[11px] font-mono text-sage-700">
                <span>📍</span>
                <span className="truncate">{locationInfo.zone}</span>
              </div>
            </div>
          </div>

          {/* Footer Bar */}
          <div className="mt-3 pt-2.5 border-t border-[#dbe3dc] flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-[11px] font-mono text-sage-600">
              <span>HEALTH:</span>
              <span
                className={`font-bold ${
                  (health?.index ?? 100) < 50
                    ? 'text-red-600'
                    : (health?.index ?? 100) < 75
                    ? 'text-amber-700'
                    : 'text-emerald-700'
                }`}
              >
                {health?.index != null ? `${Math.round(health.index)}%` : '--'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {currentAnomaly.alertId && !currentAnomaly.acknowledged && (
                <button
                  onClick={() => acknowledge(currentAnomaly.alertId!)}
                  className="px-2.5 py-1 rounded-full bg-sage-100 hover:bg-sage-200 text-charcoal text-[11px] font-mono font-medium border border-sage-300 transition"
                >
                  Acknowledge
                </button>
              )}

              <button
                onClick={() => setIsDrawerOpen(true)}
                className="px-3.5 py-1.5 rounded-full bg-charcoal hover:bg-charcoal-hover text-white text-xs font-medium tracking-wide shadow-pill-dark transition flex items-center gap-1 cursor-pointer"
              >
                <span>View Details</span>
                <span>↗</span>
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* 2. Slide-Out Side Inspection Drawer with Full Pagination */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop overlay */}
          <div
            className="fixed inset-0 bg-charcoal/40 backdrop-blur-xs transition-opacity animate-fadeIn"
            onClick={() => setIsDrawerOpen(false)}
          />

          {/* Side Drawer Panel */}
          <div className="relative w-[540px] max-w-[100vw] h-full bg-[#f0f4f1]/98 border-l border-[#c4d6c8] text-charcoal shadow-stage z-10 flex flex-col overflow-y-auto animate-slide-left backdrop-blur-2xl">
            {/* Drawer Header */}
            <div className="p-5 border-b border-[#c4d6c8] bg-white/85 flex items-start justify-between gap-4 sticky top-0 z-20 backdrop-blur-md shadow-subtle">
              <div className="flex items-center gap-3">
                <div
                  className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-white shadow-md ${
                    isCurrentCritical
                      ? 'bg-gradient-to-br from-red-600 to-rose-700'
                      : 'bg-gradient-to-br from-amber-500 to-orange-600'
                  }`}
                >
                  <span className="material-symbols-outlined text-[24px]">
                    {isCurrentCritical ? 'emergency' : 'warning'}
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[9px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                        isCurrentCritical
                          ? 'bg-red-100 text-red-900 border-red-300'
                          : 'bg-[#faede1] text-amber-900 border-amber-200'
                      }`}
                    >
                      {isCurrentCritical ? 'CRITICAL SAFETY LIMIT' : 'ADVISORY WARNING'}
                    </span>
                    <span className="text-[10px] font-mono text-sage-600 font-bold">
                      TAG: {locationInfo.componentTag}
                    </span>
                  </div>
                  <h2 className="text-base font-bold tracking-tight text-charcoal mt-1">
                    {currentAnomaly.displayName}
                  </h2>
                </div>
              </div>

              <button
                onClick={() => setIsDrawerOpen(false)}
                className="w-8 h-8 rounded-full bg-sage-100 hover:bg-sage-200 text-sage-700 hover:text-charcoal flex items-center justify-center transition font-bold text-sm border border-sage-300"
                title="Close Drawer (Esc)"
              >
                ✕
              </button>
            </div>

            {/* Top Interactive Pagination Bar (Shown when multiple anomalies exist) */}
            {totalAnomalies > 1 && (
              <div className="px-5 py-3 bg-[#e8efe9] border-b border-[#c4d6c8] sticky top-[81px] z-20 backdrop-blur-md flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-charcoal flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-amber-700 text-[18px]">view_carousel</span>
                      Multiple Anomalies Detected:
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-white font-bold text-sage-800 border border-sage-300">
                      Page {currentPage + 1} of {totalAnomalies}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      disabled={currentPage === 0}
                      onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                      className={`px-2.5 py-1 rounded-xl font-bold flex items-center gap-1 text-xs border transition ${
                        currentPage === 0
                          ? 'bg-white/50 text-sage-400 border-sage-200 cursor-not-allowed'
                          : 'bg-white text-charcoal hover:bg-sage-200 border-sage-300 shadow-xs'
                      }`}
                      title="Previous Anomaly (Left Arrow)"
                    >
                      <span className="material-symbols-outlined text-[15px]">arrow_back</span>
                      <span>Prev</span>
                    </button>

                    <button
                      type="button"
                      disabled={currentPage === totalAnomalies - 1}
                      onClick={() => setCurrentPage((p) => Math.min(totalAnomalies - 1, p + 1))}
                      className={`px-2.5 py-1 rounded-xl font-bold flex items-center gap-1 text-xs border transition ${
                        currentPage === totalAnomalies - 1
                          ? 'bg-white/50 text-sage-400 border-sage-200 cursor-not-allowed'
                          : 'bg-white text-charcoal hover:bg-sage-200 border-sage-300 shadow-xs'
                      }`}
                      title="Next Anomaly (Right Arrow)"
                    >
                      <span>Next</span>
                      <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
                    </button>
                  </div>
                </div>

                {/* Direct Jump Anomaly Tab Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-0.5 scrollbar-none">
                  {anomalyList.map((item, idx) => {
                    const isItemCritical = item.severity === 'CRITICAL' || item.severity === 'HIGH';
                    const isSelected = idx === currentPage;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setCurrentPage(idx)}
                        className={`px-3 py-1 rounded-xl text-xs font-mono font-bold whitespace-nowrap flex items-center gap-1.5 transition border ${
                          isSelected
                            ? isItemCritical
                              ? 'bg-red-600 text-white border-red-700 shadow-sm ring-2 ring-red-400/40'
                              : 'bg-amber-600 text-white border-amber-700 shadow-sm ring-2 ring-amber-400/40'
                            : 'bg-white/90 hover:bg-white text-charcoal border-[#c4d6c8]'
                        }`}
                      >
                        <span
                          className={`w-2 h-2 rounded-full ${
                            isSelected
                              ? 'bg-white animate-ping'
                              : isItemCritical
                              ? 'bg-red-500'
                              : 'bg-amber-500'
                          }`}
                        />
                        <span>#{idx + 1} {item.displayName.split(' ')[0]}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Drawer Body Content */}
            <div className="p-5 space-y-5 flex-1">
              {/* SECTION A: MALE UAV AIRFRAME PHYSICAL LOCATION SCHEMATIC */}
              <div className="p-5 rounded-3xl bg-white/85 border border-[#c4d6c8] shadow-sm">
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#dbe3dc]">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px] text-sage-800">radar</span>
                    <span className="text-xs font-bold uppercase tracking-wider text-sage-900">
                      MALE UAV Airframe Location
                    </span>
                  </div>
                  <span className="text-[10px] font-mono bg-sage-100 border border-sage-300 px-2 py-0.5 rounded-full text-sage-800 font-bold">
                    TOP-DOWN TACTICAL RADAR
                  </span>
                </div>

                {/* Tactical UAV Radar Screen */}
                <div className="relative w-full h-64 bg-[#142018] rounded-2xl border border-[#2d4233] flex items-center justify-center overflow-hidden p-2 shadow-inner">
                  {/* Background gridlines */}
                  <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:16px_16px]" />
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-48 h-48 rounded-full border border-emerald-500/20" />
                    <div className="w-32 h-32 rounded-full border border-emerald-500/25" />
                    <div className="w-16 h-16 rounded-full border border-emerald-500/30" />
                  </div>

                  {/* Top-Down MALE UAV Airframe Silhouette */}
                  <svg
                    viewBox="0 0 200 200"
                    className="w-full h-full max-h-56 filter drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]"
                  >
                    <g transform="translate(100, 100)">
                      {/* Main Fuselage */}
                      <path
                        d="M 0 -80 C 8 -75, 10 -40, 10 30 C 10 65, 5 75, 0 80 C -5 75, -10 65, -10 30 C -10 -40, -8 -75, 0 -80 Z"
                        fill="#2a3c30"
                        stroke="#718d79"
                        strokeWidth="1.5"
                      />

                      {/* Nose Radome Cap */}
                      <path
                        d="M -7 -60 C -7 -75, -4 -85, 0 -88 C 4 -85, 7 -75, 7 -60 Z"
                        fill={locationInfo.primaryFault.includes('RADOME') || locationInfo.primaryFault.includes('RADAR') ? '#dc2626' : '#3d5645'}
                        stroke={locationInfo.primaryFault.includes('RADOME') || locationInfo.primaryFault.includes('RADAR') ? '#f87171' : '#8fae96'}
                        strokeWidth="1.5"
                      />

                      {/* Main High-Aspect Wings */}
                      <path
                        d="M -10 -10 L -90 0 L -92 10 L -10 15 Z"
                        fill={locationInfo.primaryFault.includes('WING') ? '#dc2626' : '#2a3c30'}
                        stroke="#718d79"
                        strokeWidth="1.5"
                      />
                      <path
                        d="M 10 -10 L 90 0 L 92 10 L 10 15 Z"
                        fill={locationInfo.primaryFault.includes('WING') ? '#dc2626' : '#2a3c30'}
                        stroke="#718d79"
                        strokeWidth="1.5"
                      />

                      {/* Underwing Ordnance Pylons #1 & #2 */}
                      <rect
                        x="-45"
                        y="2"
                        width="4"
                        height="18"
                        rx="1"
                        fill={locationInfo.primaryFault.includes('MISSILE') || locationInfo.primaryFault.includes('PYLON') ? '#ef4444' : '#4d6854'}
                      />
                      <rect
                        x="41"
                        y="2"
                        width="4"
                        height="18"
                        rx="1"
                        fill={locationInfo.primaryFault.includes('MISSILE') || locationInfo.primaryFault.includes('PYLON') ? '#ef4444' : '#4d6854'}
                      />

                      {/* Engine Nacelle / Core Area */}
                      <rect
                        x="-8"
                        y="10"
                        width="16"
                        height="35"
                        rx="3"
                        fill={
                          locationInfo.primaryFault.includes('OVERHEAT') ||
                          locationInfo.primaryFault.includes('MISFIRE') ||
                          locationInfo.primaryFault.includes('INJECT') ||
                          locationInfo.primaryFault.includes('LUB') ||
                          locationInfo.primaryFault.includes('MOTOR') ||
                          locationInfo.primaryFault.includes('SENSOR')
                            ? '#dc2626'
                            : '#3d5645'
                        }
                        stroke="#a1beaa"
                        strokeWidth="1"
                      />

                      {/* Twin Boom V-Tail Empennage */}
                      <path
                        d="M -6 60 L -35 85 L -38 82 L -7 55 Z"
                        fill="#2a3c30"
                        stroke="#718d79"
                        strokeWidth="1.5"
                      />
                      <path
                        d="M 6 60 L 35 85 L 38 82 L 7 55 Z"
                        fill="#2a3c30"
                        stroke="#718d79"
                        strokeWidth="1.5"
                      />
                      <line x1="-35" y1="85" x2="35" y2="85" stroke="#718d79" strokeWidth="1.5" />

                      {/* Pusher Propeller (Aft) */}
                      <ellipse
                        cx="0"
                        cy="82"
                        rx="24"
                        ry="4"
                        fill={locationInfo.primaryFault.includes('PROP') ? '#dc2626' : '#10b981'}
                        fillOpacity="0.4"
                        stroke={locationInfo.primaryFault.includes('PROP') ? '#f87171' : '#34d399'}
                        strokeWidth="1.5"
                      />
                    </g>
                  </svg>

                  {/* Pulsing Target Pin */}
                  <div
                    className="absolute z-10 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none flex flex-col items-center transition-all duration-500"
                    style={{
                      left: `${locationInfo.svgTarget.x}%`,
                      top: `${locationInfo.svgTarget.y}%`,
                    }}
                  >
                    <div className="relative flex items-center justify-center">
                      <span className="absolute w-8 h-8 rounded-full bg-red-500/40 animate-ping" />
                      <span className="absolute w-5 h-5 rounded-full bg-red-500/80 animate-pulse" />
                      <span className="w-3 h-3 rounded-full bg-white shadow-[0_0_12px_#ef4444]" />
                    </div>
                    <span className="mt-1 px-2.5 py-0.5 rounded-full bg-red-950/90 border border-red-500/80 text-[10px] font-mono font-bold text-white shadow-lg whitespace-nowrap">
                      {locationInfo.svgTarget.label}
                    </span>
                  </div>
                </div>

                {/* Subsystem & Location Details Table */}
                <div className="mt-3.5 grid grid-cols-2 gap-2.5 text-xs font-mono">
                  <div className="p-3 rounded-2xl bg-sage-50/80 border border-[#d3ded6]">
                    <span className="text-[10px] text-sage-600 block uppercase font-medium">Subsystem</span>
                    <span className="font-bold text-charcoal mt-0.5 block">{locationInfo.subsystem}</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-sage-50/80 border border-[#d3ded6]">
                    <span className="text-[10px] text-sage-600 block uppercase font-medium">Airframe Station</span>
                    <span className="font-bold text-amber-800 mt-0.5 block">{locationInfo.station}</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-sage-50/80 border border-[#d3ded6] col-span-2">
                    <span className="text-[10px] text-sage-600 block uppercase font-medium">Physical Zone Description</span>
                    <span className="text-sage-800 mt-0.5 block font-sans">{locationInfo.zone}</span>
                  </div>
                </div>
              </div>

              {/* SECTION B: AI DIAGNOSTICS & TELEMETRY EVIDENCE */}
              <div className="p-5 rounded-3xl bg-white/85 border border-[#c4d6c8] shadow-sm space-y-3.5">
                <div className="flex items-center justify-between pb-2 border-b border-[#dbe3dc]">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px] text-sage-800">psychology</span>
                    <span className="text-xs font-bold uppercase tracking-wider text-sage-900">
                      Diagnostic Evidence & Residuals
                    </span>
                  </div>
                  <span className="text-xs font-mono font-bold text-red-900 bg-red-100 px-2.5 py-0.5 rounded-full border border-red-300">
                    ANOMALY: {currentAnomaly.anomalyScore.toFixed(1)}%
                  </span>
                </div>

                <p className="text-xs text-sage-700 leading-relaxed font-sans">
                  {locationInfo.description}
                </p>

                {/* Evidence bullets */}
                <div className="space-y-1.5 pt-1">
                  <span className="text-[10px] font-mono text-sage-600 uppercase tracking-wider block font-bold">
                    Telemetry Residual Indications:
                  </span>
                  {currentAnomaly.evidence.map((line, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-2 text-xs font-mono text-charcoal bg-sage-50/80 p-2.5 rounded-xl border border-[#dbe3dc]"
                    >
                      <span className="text-red-600 font-bold">›</span>
                      <span>{line}</span>
                    </div>
                  ))}
                </div>

                {/* Confidence & Health Pills */}
                <div className="grid grid-cols-3 gap-2.5 pt-1 font-mono text-center">
                  <div className="p-2.5 rounded-2xl bg-sage-50/80 border border-[#d3ded6]">
                    <span className="text-[10px] text-sage-600 block">AI CONFIDENCE</span>
                    <span className="text-xs font-bold text-sage-900">
                      {currentAnomaly.confidence.toFixed(1)}%
                    </span>
                  </div>
                  <div className="p-2.5 rounded-2xl bg-sage-50/80 border border-[#d3ded6]">
                    <span className="text-[10px] text-sage-600 block">DEGRADATION</span>
                    <span className="text-xs font-bold text-amber-800">
                      {currentAnomaly.degradationStatus}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-2xl bg-sage-50/80 border border-[#d3ded6]">
                    <span className="text-[10px] text-sage-600 block">FAILURE RISK</span>
                    <span className="text-xs font-bold text-red-700">
                      {currentAnomaly.failureRiskPct.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>

              {/* SECTION C: RECOMMENDED ACTION & MAINTENANCE ADVISORY */}
              <div className="p-4 rounded-2xl bg-[#faede1] border border-amber-300 shadow-sm space-y-2">
                <div className="flex items-center gap-2 text-amber-900 text-xs font-bold uppercase tracking-wider">
                  <span className="material-symbols-outlined text-[18px]">build</span>
                  Recommended Operational Advisory
                </div>
                <p className="text-xs text-amber-950 leading-relaxed bg-white/70 p-3 rounded-xl border border-amber-200 font-mono">
                  {currentAnomaly.recommendedAction}
                </p>
              </div>
            </div>

            {/* Drawer Footer Actions */}
            <div className="p-4 border-t border-[#c4d6c8] bg-white/85 flex items-center justify-between gap-3 sticky bottom-0 z-20 backdrop-blur-md">
              {currentAnomaly.alertId && !currentAnomaly.acknowledged ? (
                <PillButton
                  variant="glass"
                  size="sm"
                  onClick={() => acknowledge(currentAnomaly.alertId!)}
                  className="flex-1"
                  right={<span className="material-symbols-outlined text-[16px]">check_circle</span>}
                >
                  Acknowledge Anomaly #{currentPage + 1}
                </PillButton>
              ) : (
                <div className="flex-1 text-xs font-mono font-medium text-emerald-800 flex items-center gap-1.5 px-3">
                  <span className="material-symbols-outlined text-[16px] text-emerald-600">check</span>
                  Status Monitored
                </div>
              )}

              {totalAnomalies > 1 && (
                <PillButton
                  variant="glass"
                  size="sm"
                  onClick={() => {
                    anomalyList.forEach((a) => {
                      if (a.alertId) acknowledge(a.alertId);
                    });
                  }}
                  className="text-xs font-mono"
                >
                  Acknowledge All ({totalAnomalies})
                </PillButton>
              )}

              <PillButton
                variant="dark"
                size="sm"
                onClick={() => setIsDrawerOpen(false)}
                className="px-6"
              >
                Close
              </PillButton>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
