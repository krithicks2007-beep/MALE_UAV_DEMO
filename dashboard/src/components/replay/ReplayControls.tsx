import React from 'react';
import { Play, Pause, SkipBack, SkipForward, Rewind, FastForward } from 'lucide-react';

interface ReplayControlsProps {
  isPlaying: boolean;
  playbackSpeed: number;
  totalFrames: number;
  currentFrame: number;
  onPlayPauseToggle: () => void;
  onStepPrevious: () => void;
  onStepNext: () => void;
  onJumpStart: () => void;
  onJumpEnd: () => void;
  onSpeedChange: (speed: number) => void;
}

export function ReplayControls({
  isPlaying,
  playbackSpeed,
  totalFrames,
  currentFrame,
  onPlayPauseToggle,
  onStepPrevious,
  onStepNext,
  onJumpStart,
  onJumpEnd,
  onSpeedChange,
}: ReplayControlsProps) {
  const disabled = totalFrames === 0;
  const speeds = [0.5, 1, 2, 4];

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/70 backdrop-blur-md p-4 rounded-3xl border border-[#dbe3dc] shadow-sm">
      {/* Primary Transport Controls */}
      <div className="flex items-center gap-2">
        {/* Jump to Start */}
        <button
          onClick={onJumpStart}
          disabled={disabled || currentFrame === 0}
          className="p-2.5 rounded-2xl bg-sage-100/80 hover:bg-sage-200 text-sage-800 transition-colors disabled:opacity-40"
          title="Jump to Start"
        >
          <Rewind className="w-4 h-4" />
        </button>

        {/* Step Previous */}
        <button
          onClick={onStepPrevious}
          disabled={disabled || currentFrame === 0}
          className="p-2.5 rounded-2xl bg-sage-100/80 hover:bg-sage-200 text-sage-800 transition-colors disabled:opacity-40"
          title="Step Backward"
        >
          <SkipBack className="w-4 h-4" />
        </button>

        {/* Play / Pause Toggle */}
        <button
          onClick={onPlayPauseToggle}
          disabled={disabled}
          className={`px-5 py-2.5 rounded-2xl text-white font-mono text-xs font-bold transition-all shadow-sm flex items-center gap-2 ${
            isPlaying ? 'bg-amber-600 hover:bg-amber-700' : 'bg-charcoal hover:bg-charcoal-hover'
          } disabled:opacity-40`}
        >
          {isPlaying ? (
            <>
              <Pause className="w-4 h-4" />
              <span>PAUSE</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4" />
              <span>PLAY REPLAY</span>
            </>
          )}
        </button>

        {/* Step Next */}
        <button
          onClick={onStepNext}
          disabled={disabled || currentFrame >= totalFrames - 1}
          className="p-2.5 rounded-2xl bg-sage-100/80 hover:bg-sage-200 text-sage-800 transition-colors disabled:opacity-40"
          title="Step Forward"
        >
          <SkipForward className="w-4 h-4" />
        </button>

        {/* Jump to End */}
        <button
          onClick={onJumpEnd}
          disabled={disabled || currentFrame >= totalFrames - 1}
          className="p-2.5 rounded-2xl bg-sage-100/80 hover:bg-sage-200 text-sage-800 transition-colors disabled:opacity-40"
          title="Jump to Latest Frame"
        >
          <FastForward className="w-4 h-4" />
        </button>
      </div>

      {/* Playback Speed Controls */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-mono font-bold text-sage-600 uppercase tracking-wider mr-1">
          SPEED:
        </span>
        {speeds.map((s) => (
          <button
            key={s}
            onClick={() => onSpeedChange(s)}
            disabled={disabled}
            className={`px-3 py-1 rounded-xl text-xs font-mono font-bold transition-all ${
              playbackSpeed === s
                ? 'bg-charcoal text-white shadow-sm'
                : 'bg-sage-100/80 text-sage-700 hover:bg-sage-200'
            } disabled:opacity-40`}
          >
            {s}x
          </button>
        ))}
      </div>
    </div>
  );
}
