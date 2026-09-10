import React from 'react';
import { TwinAnalysisHeader } from '../components/twin-analysis/TwinAnalysisHeader';
import { TwinSummaryCards } from '../components/twin-analysis/TwinSummaryCards';
import { ExpectedVsActualGrid } from '../components/twin-analysis/ExpectedVsActualGrid';
import { ResidualAnalysisTable } from '../components/twin-analysis/ResidualAnalysisTable';
import { ResidualDistributionChart } from '../components/twin-analysis/ResidualDistributionChart';
import { ActualVsPredictedChart } from '../components/twin-analysis/ActualVsPredictedChart';

export function TwinAnalysisPage() {
  return (
    <main className="max-w-[1560px] mx-auto px-4 lg:px-8 py-7 space-y-7 animate-fade-in">
      {/* Header */}
      <TwinAnalysisHeader />

      {/* Summary Cards */}
      <TwinSummaryCards />

      {/* Actual vs Predicted SVG Curve & Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-4 flex flex-col">
          <ActualVsPredictedChart />
        </div>
        <div className="lg:col-span-8 flex flex-col justify-between">
          <ResidualDistributionChart />
        </div>
      </div>

      {/* Expected vs Actual Parameter Cards */}
      <ExpectedVsActualGrid />

      {/* Detailed Residual Analysis Engineering Table */}
      <ResidualAnalysisTable />
    </main>
  );
}
