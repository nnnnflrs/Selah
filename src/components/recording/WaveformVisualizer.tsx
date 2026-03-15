"use client";

import { useWaveform } from "@/hooks/useWaveform";
import styles from "./WaveformVisualizer.module.css";

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
    <div className={styles.container}>
      <canvas
        ref={canvasRef}
        width={400}
        height={height}
        className={styles.canvas}
        style={{ height }}
      />
    </div>
  );
}
