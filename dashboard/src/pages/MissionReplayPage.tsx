import React, { useState, useEffect } from 'react';
import { useTelemetryStore } from '../stores/telemetryStore';
import { MissionReplayHeader } from '../components/replay/MissionReplayHeader';
import { ReplayControls } from '../components/replay/ReplayControls';
import { ReplayTimeline } from '../components/replay/ReplayTimeline';
import { ReplayTelemetryGrid } from '../components/replay/ReplayTelemetryGrid';
import { ReplayStatusPanel } from '../components/replay/ReplayStatusPanel';

export function MissionReplayPage() {
  const history = useTelemetryStore((s) => s.history);

  // Compute safe history length across channel arrays
  const minLen = history.length > 0 ? Math.min(...history.map((arr) => arr.length)) : 0;

  const [replayIndex, setReplayIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);

  // Clamp replayIndex if buffer size changes
  useEffect(() => {
    if (minLen > 0 && replayIndex >= minLen) {
      setReplayIndex(minLen - 1);
    }
  }, [minLen, replayIndex]);

  // Playback timer effect
  useEffect(() => {
    if (!isPlaying || minLen <= 1) return;

    const intervalMs = Math.max(100, Math.round(500 / playbackSpeed));
    const timer = setInterval(() => {
      setReplayIndex((prev) => {
        if (prev >= minLen - 1) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, intervalMs);

    return () => clearInterval(timer);
  }, [isPlaying, minLen, playbackSpeed]);

  const startTimestamp = history[0]?.[0]?.t ?? null;
  const endTimestamp = minLen > 0 ? (history[0]?.[minLen - 1]?.t ?? null) : null;
  const currentTimestamp = minLen > 0 && history[0]?.[replayIndex] ? history[0][replayIndex].t : null;

  const recordedDuration = startTimestamp && endTimestamp ? Math.max(0, endTimestamp - startTimestamp) : 0;

  const frameData = minLen > 0 ? {
    rpm: history[0]?.[replayIndex]?.value ?? null,
    map: history[1]?.[replayIndex]?.value ?? null,
    oil_pressure: history[2]?.[replayIndex]?.value ?? null,
    oil_temperature: history[3]?.[replayIndex]?.value ?? null,
    fuel_flow: history[4]?.[replayIndex]?.value ?? null,
    vibration: history[5]?.[replayIndex]?.value ?? null,
    battery_voltage: history[6]?.[replayIndex]?.value ?? null,
    alternator_current: history[7]?.[replayIndex]?.value ?? null,
    injection_timing: history[8]?.[replayIndex]?.value ?? null,
    cht_avg: history[9]?.[replayIndex]?.value ?? null,
    egt_avg: history[10]?.[replayIndex]?.value ?? null,
    timestamp: currentTimestamp,
  } : null;

  return (
    <main className="max-w-[1560px] mx-auto px-4 lg:px-8 py-7 space-y-7 animate-fade-in">
      {/* Header */}
      <MissionReplayHeader
        totalFrames={minLen}
        currentFrame={replayIndex}
        recordedDurationSeconds={recordedDuration}
        currentTimestamp={currentTimestamp}
      />

      {/* Replay Transport Controls */}
      <ReplayControls
        isPlaying={isPlaying}
        playbackSpeed={playbackSpeed}
        totalFrames={minLen}
        currentFrame={replayIndex}
        onPlayPauseToggle={() => setIsPlaying(!isPlaying)}
        onStepPrevious={() => {
          setIsPlaying(false);
          setReplayIndex((prev) => Math.max(0, prev - 1));
        }}
        onStepNext={() => {
          setIsPlaying(false);
          setReplayIndex((prev) => Math.min(minLen - 1, prev + 1));
        }}
        onJumpStart={() => {
          setIsPlaying(false);
          setReplayIndex(0);
        }}
        onJumpEnd={() => {
          setIsPlaying(false);
          setReplayIndex(minLen - 1);
        }}
        onSpeedChange={setPlaybackSpeed}
      />

      {/* Replay Timeline Scrubber */}
      <ReplayTimeline
        totalFrames={minLen}
        currentFrame={replayIndex}
        startTimestamp={startTimestamp}
        endTimestamp={endTimestamp}
        currentTimestamp={currentTimestamp}
        onScrub={(idx) => {
          setIsPlaying(false);
          setReplayIndex(idx);
        }}
      />

      {/* Recorded Telemetry Readouts for Selected Frame */}
      <ReplayTelemetryGrid frameData={frameData} totalFrames={minLen} />

      {/* Replay Metadata & Live System State Distinction Panel */}
      <ReplayStatusPanel
        currentTimestamp={currentTimestamp}
        currentFrame={replayIndex}
        totalFrames={minLen}
      />
    </main>
  );
}
