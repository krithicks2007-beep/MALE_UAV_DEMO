import React from 'react';
import { Clock } from 'lucide-react';

interface ReplayTimelineProps {
  totalFrames: number;
  currentFrame: number;
  startTimestamp: number | null;
  endTimestamp: number | null;
  currentTimestamp: number | null;
  onScrub: (frameIndex: number) => void;
}

export function ReplayTimeline({
  totalFrames,
  currentFrame,
  startTimestamp,
  endTimestamp,
  currentTimestamp,
  onScrub,
}: ReplayTimelineProps) {
  const disabled = totalFrames <= 1;

  const startText = startTimestamp
    ? new Date(startTimestamp * 1000).toISOString().substring(11, 19)
    : '—';

  const endText = endTimestamp
    ? new Date(endTimestamp * 1000).toISOString().substring(11, 19)
    : '—';

  const currentText = currentTimestamp
    ? new Date(currentTimestamp * 1000).toISOString().substring(11, 19)
    : '—';

  const elapsedTimeSec = startTimestamp && currentTimestamp ? Math.max(0, currentTimestamp - startTimestamp) : 0;
  const totalTimeSec = startTimestamp && endTimestamp ? Math.max(0, endTimestamp - startTimestamp) : 0;

  const elapsedFmt = `${Math.floor(elapsedTimeSec / 60)}m ${Math.floor(elapsedTimeSec % 60)}s`;
  const totalFmt = `${Math.floor(totalTimeSec / 60)}m ${Math.floor(totalTimeSec % 60)}s`;

  return (
    <div className="bg-white/70 backdrop-blur-md p-5 rounded-3xl border border-[#dbe3dc] shadow-sm space-y-3 font-mono">
      <div className="flex items-center justify-between text-xs text-sage-600">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-sage-800" />
          <span className="font-bold text-charcoal uppercase tracking-wider">
            Replay Timeline Scrubber
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span>POSITION: <strong className="text-charcoal">{elapsedFmt}</strong> / {totalFmt}</span>
          <span>TIMESTAMP: <strong className="text-charcoal">{currentText} UTC</strong></span>
        </div>
      </div>

      {/* Scrubber Range Input */}
      <div className="relative pt-1">
        <input
          type="range"
          min={0}
          max={totalFrames > 0 ? totalFrames - 1 : 0}
          value={totalFrames > 0 ? Math.min(currentFrame, totalFrames - 1) : 0}
          disabled={disabled}
          onChange={(e) => onScrub(parseInt(e.target.value, 10))}
          className="w-full h-2.5 bg-sage-200 rounded-lg appearance-none cursor-pointer accent-charcoal disabled:opacity-40 disabled:cursor-not-allowed"
        />

        {/* Start / End Timestamp Markers */}
        <div className="flex justify-between text-[10px] text-sage-600 mt-2 font-semibold">
          <span>START: {startText} UTC (T+0s)</span>
          <span>BUFFER SPAN (~300 FRAMES)</span>
          <span>END: {endText} UTC (+{totalFmt})</span>
        </div>
      </div>
    </div>
  );
}
