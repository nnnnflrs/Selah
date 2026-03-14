"use client";

import { useCallback, RefObject } from "react";
import { MapRef } from "react-map-gl/mapbox";
import { useRecordings } from "@/hooks/useRecordings";
import { useMapStore } from "@/stores/mapStore";
import { sileo } from "sileo";

interface RandomListenButtonProps {
  mapRef: RefObject<MapRef | null>;
}

export function RandomListenButton({ mapRef }: RandomListenButtonProps) {
  const { recordings } = useRecordings();
  const pushRandomRecording = useMapStore((s) => s.pushRandomRecording);

  const handleClick = useCallback(() => {
    if (recordings.length === 0) {
      sileo.info({ title: "No recordings available yet" });
      return;
    }

    const random = recordings[Math.floor(Math.random() * recordings.length)];

    mapRef.current?.getMap()?.flyTo({
      center: [random.longitude, random.latitude],
      zoom: 5,
      duration: 1500,
    });

    pushRandomRecording(random.id);
  }, [recordings, mapRef, pushRandomRecording]);

  return (
    <button
      onClick={handleClick}
      className="
        absolute bottom-6 left-4 sm:bottom-8 sm:left-8 z-[1000]
        flex items-center gap-2
        px-3 py-2 sm:px-4 sm:py-2.5 rounded-full
        bg-selah-800/80 border border-selah-600
        text-selah-300 hover:text-white
        hover:bg-selah-700/80 hover:border-selah-500
        shadow-lg shadow-black/20
        transition-all duration-200
        hover:scale-105 active:scale-95
      "
      aria-label="Listen to a random recording"
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="16 3 21 3 21 8" />
        <line x1="4" y1="20" x2="21" y2="3" />
        <polyline points="21 16 21 21 16 21" />
        <line x1="15" y1="15" x2="21" y2="21" />
        <line x1="4" y1="4" x2="9" y2="9" />
      </svg>
      <span className="text-sm font-medium hidden sm:inline">Listen to random story</span>
      <span className="text-sm font-medium sm:hidden">Random</span>
    </button>
  );
}
