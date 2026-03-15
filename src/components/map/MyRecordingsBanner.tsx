"use client";

import { RefObject, useCallback } from "react";
import { MapRef } from "react-map-gl/mapbox";
import { useMapStore } from "@/stores/mapStore";
import { DEFAULT_MAP_CENTER, DEFAULT_MAP_ZOOM } from "@/lib/constants";

interface MyRecordingsBannerProps {
  mapRef: RefObject<MapRef | null>;
}

export function MyRecordingsBanner({ mapRef }: MyRecordingsBannerProps) {
  const showMyRecordings = useMapStore((s) => s.showMyRecordings);
  const setShowMyRecordings = useMapStore((s) => s.setShowMyRecordings);
  const setAutoRotating = useMapStore((s) => s.setAutoRotating);

  const handleReset = useCallback(() => {
    setShowMyRecordings(false);

    const map = mapRef.current?.getMap();
    if (!map) return;

    setAutoRotating(false);
    map.flyTo({
      center: DEFAULT_MAP_CENTER,
      zoom: DEFAULT_MAP_ZOOM,
      pitch: 0,
      bearing: 0,
      duration: 2500,
      essential: true,
      curve: 1.2,
      speed: 0.8,
    });
    map.once("moveend", () => {
      setAutoRotating(true);
    });
  }, [mapRef, setShowMyRecordings, setAutoRotating]);

  if (!showMyRecordings) return null;

  return (
    <div className="absolute top-20 left-1/2 -translate-x-1/2 z-20 animate-fade-in">
      <div className="flex items-center gap-2 px-4 py-2 bg-selah-900/90 border border-selah-600 rounded-full backdrop-blur-sm shadow-lg">
        <span className="text-sm text-selah-200">Viewing my recordings</span>
        <button
          onClick={handleReset}
          className="text-xs text-selah-400 hover:text-white transition-colors flex items-center gap-1"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
            <path d="M3 3v5h5" />
          </svg>
          Reset
        </button>
      </div>
    </div>
  );
}
