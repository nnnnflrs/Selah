"use client";

import { useCallback, RefObject } from "react";
import { MapRef } from "react-map-gl/mapbox";
import { IconButton } from "@/components/ui/IconButton";
import { useMapStore } from "@/stores/mapStore";
import { sileo } from "sileo";
import { DEFAULT_MAP_CENTER, DEFAULT_MAP_ZOOM } from "@/lib/constants";

interface MapControlsProps {
  mapRef: RefObject<MapRef | null>;
}

export function MapControls({ mapRef }: MapControlsProps) {
  const setAutoRotating = useMapStore((s) => s.setAutoRotating);

  const handleZoomIn = useCallback(() => {
    mapRef.current?.getMap()?.zoomIn({ duration: 300 });
  }, [mapRef]);

  const handleZoomOut = useCallback(() => {
    mapRef.current?.getMap()?.zoomOut({ duration: 300 });
  }, [mapRef]);

  const handleLocate = useCallback(() => {
    if (!navigator.geolocation) {
      sileo.error({ title: "Geolocation is not supported by your browser" });
      return;
    }
    setAutoRotating(false);
    sileo.info({ title: "Getting your location..." });
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        mapRef.current?.getMap()?.flyTo({
          center: [pos.coords.longitude, pos.coords.latitude],
          zoom: 14,
          duration: 3000,
          essential: true,
          curve: 1.2,
          speed: 0.8,
        });
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          sileo.error({ title: "Location access denied", description: "Please allow location in your browser settings." });
        } else {
          sileo.error({ title: "Could not get your location" });
        }
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, [mapRef, setAutoRotating]);

  const handleReset = useCallback(() => {
    const nativeMap = mapRef.current?.getMap();
    if (!nativeMap) return;

    setAutoRotating(false);
    nativeMap.flyTo({
      center: DEFAULT_MAP_CENTER,
      zoom: DEFAULT_MAP_ZOOM,
      pitch: 0,
      bearing: 0,
      duration: 2500,
      essential: true,
      curve: 1.2,
      speed: 0.8,
    });
    nativeMap.once("moveend", () => {
      setAutoRotating(true);
    });
  }, [mapRef, setAutoRotating]);

  return (
    <div className="absolute bottom-20 right-4 sm:bottom-24 z-[1000] flex flex-col gap-2">
      <IconButton label="Zoom in" onClick={handleZoomIn}>
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </IconButton>

      <IconButton label="Zoom out" onClick={handleZoomOut}>
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </IconButton>

      <IconButton label="My location" onClick={handleLocate}>
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="12" cy="12" r="3" />
          <line x1="12" y1="2" x2="12" y2="5" />
          <line x1="12" y1="19" x2="12" y2="22" />
          <line x1="2" y1="12" x2="5" y2="12" />
          <line x1="19" y1="12" x2="22" y2="12" />
        </svg>
      </IconButton>

      <IconButton label="Reset view" onClick={handleReset}>
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
          <path d="M3 3v5h5" />
        </svg>
      </IconButton>
    </div>
  );
}
