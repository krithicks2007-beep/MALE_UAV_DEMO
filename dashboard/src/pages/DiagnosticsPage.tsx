import React from 'react';
import { DiagnosticPipelineFlow } from '../components/diagnostics/DiagnosticPipelineFlow';
import { AnomalyScoreCard } from '../components/diagnostics/AnomalyScoreCard';
import { SubsystemHealthMatrix } from '../components/diagnostics/SubsystemHealthMatrix';
import { FaultEvidenceLog } from '../components/diagnostics/FaultEvidenceLog';
import { DegradationAndRULCard } from '../components/diagnostics/DegradationAndRULCard';
import { MissionFeasibilityCard } from '../components/diagnostics/MissionFeasibilityCard';

export function DiagnosticsPage() {
  return (
    <main className="max-w-[1560px] mx-auto px-4 lg:px-8 py-7 space-y-7 animate-fade-in">
      {/* Top 7-Stage Diagnostic Pipeline Chain Visualizer */}
      <DiagnosticPipelineFlow />

      {/* Main Anomaly & Fault Classification Block */}
      <AnomalyScoreCard />

      {/* Engine Subsystem Diagnostic Health Matrix */}
      <SubsystemHealthMatrix />

      {/* Degradation State & RUL Cards */}
      <DegradationAndRULCard />

      {/* Predictive Mission Feasibility & RTB Safe Return Predictor */}
      <MissionFeasibilityCard />

      {/* Terminal-style Diagnostic Evidence Log */}
      <FaultEvidenceLog />
    </main>
  );
}
