"use client";

import { useRef, useState, useEffect } from "react";
import { formatDuration } from "@/lib/utils/time";

interface AudioPlayerProps {
  src: string;
  fallbackDuration?: number;
}

export function AudioPlayer({ src, fallbackDuration }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(fallbackDuration ?? 0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onDuration = () => {
      if (isFinite(audio.duration) && audio.duration > 0) {
        setDuration(audio.duration);
      }
    };
    const onEnded = () => setIsPlaying(false);

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("loadedmetadata", onDuration);
    audio.addEventListener("durationchange", onDuration);
    audio.addEventListener("ended", onEnded);

    return () => {
      audio.pause();
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("loadedmetadata", onDuration);
      audio.removeEventListener("durationchange", onDuration);
      audio.removeEventListener("ended", onEnded);
    };
  }, []);

  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      try {
        await audio.play();
        setIsPlaying(true);
      } catch {
        // Autoplay blocked or src error
      }
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio || !duration) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const pct = x / rect.width;
    audio.currentTime = pct * duration;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="flex items-center gap-3">
      <audio ref={audioRef} src={src} preload="metadata" />

      <button
        onClick={togglePlay}
        className="w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-full bg-selah-700 hover:bg-selah-600 border border-selah-500 transition-colors"
      >
        {isPlaying ? (
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="text-white"
          >
            <rect x="6" y="4" width="4" height="16" rx="1" />
            <rect x="14" y="4" width="4" height="16" rx="1" />
          </svg>
        ) : (
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="text-white ml-0.5"
          >
            <polygon points="5,3 19,12 5,21" />
          </svg>
        )}
      </button>

      <div className="flex-1 space-y-1">
        <div
          className="h-2 bg-selah-800 rounded-full cursor-pointer overflow-hidden"
          onClick={handleSeek}
        >
          <div
            className="h-full bg-gradient-to-r from-glow-grateful to-glow-hopeful rounded-full transition-[width] duration-100"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-selah-400 tabular-nums">
          <span>{formatDuration(currentTime)}</span>
          <span>{formatDuration(duration)}</span>
        </div>
      </div>
    </div>
  );
}
