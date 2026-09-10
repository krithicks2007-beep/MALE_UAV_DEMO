import React from 'react';
import { TelemetryTrendsHeader } from '../components/trends/TelemetryTrendsHeader';
import { PrimaryEngineTrendsGrid } from '../components/trends/PrimaryEngineTrendsGrid';
import { SecondaryHealthTrendsGrid } from '../components/trends/SecondaryHealthTrendsGrid';
import { ElectricalTrendsGrid } from '../components/trends/ElectricalTrendsGrid';

export function TelemetryTrendsPage() {
  return (
    <main className="max-w-[1560px] mx-auto px-4 lg:px-8 py-7 space-y-7 animate-fade-in">
      {/* Header */}
      <TelemetryTrendsHeader />

      {/* Primary Engine Trends */}
      <PrimaryEngineTrendsGrid />

      {/* Secondary Health Trends */}
      <SecondaryHealthTrendsGrid />

      {/* Electrical & Ignition Trends */}
      <ElectricalTrendsGrid />
    </main>
  );
}
