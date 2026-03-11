"use client";

import { useWaveform } from "@/hooks/useWaveform";

interface WaveformVisualizerProps {
  analyserNode: AnalyserNode | null;
  isActive: boolean;
  color?: string;
  height?: number;
}

export function WaveformVisualizer({
  analyserNode,
  isActive,
  color = "#00f0ff",
  height = 80,
}: WaveformVisualizerProps) {
  const canvasRef = useWaveform({ analyserNode, isActive, color });

  return (
    <div className="w-full rounded-lg bg-selah-900/50 overflow-hidden">
      <canvas
        ref={canvasRef}
        width={400}
        height={height}
        className="w-full"
        style={{ height }}
      />
    </div>
  );
}
