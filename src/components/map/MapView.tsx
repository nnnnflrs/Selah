"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import Map, { Marker, MapRef } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import styles from "./MapView.module.css";
import { useMapStore } from "@/stores/mapStore";
import { useRecordings } from "@/hooks/useRecordings";
import { useJournalStore } from "@/stores/journalStore";
import { MapControls } from "./MapControls";
import { RandomListenButton } from "@/components/layout/RandomListenButton";
import { MyRecordingsBanner } from "@/components/map/MyRecordingsBanner";
import {
  EMOTIONS,
  MAPBOX_STYLE,
  DEFAULT_MAP_CENTER,
  DEFAULT_MAP_ZOOM,
  MAP_MIN_ZOOM,
  MAP_MAX_ZOOM,
  MAP_AUTO_ROTATE_SPEED,
} from "@/lib/constants";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

export default function MapView() {
  const mapRef = useRef<MapRef>(null);
  const rotationRef = useRef<number | null>(null);
  const hoveredCountryRef = useRef<string | number | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  const selectRecording = useMapStore((s) => s.selectRecording);
  const isAutoRotating = useMapStore((s) => s.isAutoRotating);
  const setAutoRotating = useMapStore((s) => s.setAutoRotating);
  const selectedRecordingId = useMapStore((s) => s.selectedRecordingId);
  const isRandomMode = useMapStore((s) => s.isRandomMode);
  const showMyRecordings = useMapStore((s) => s.showMyRecordings);

  const { recordings: publicRecordings } = useRecordings();
  const journalRecordings = useJournalStore((s) => s.recordings);

  // When showing my recordings, map journal entries to marker format
  const recordings = showMyRecordings
    ? journalRecordings.map((r) => ({
        id: r.id,
        emotion: r.emotion,
        latitude: r.latitude,
        longitude: r.longitude,
        anonymous_name: r.anonymous_name,
        anonymous_id: r.anonymous_id,
        created_at: r.created_at,
      }))
    : publicRecordings;

  // Fly to recording when navigating in random mode
  useEffect(() => {
    if (!isRandomMode || !selectedRecordingId) return;
    const rec = recordings.find((r) => r.id === selectedRecordingId);
    if (!rec) return;
    mapRef.current?.getMap()?.flyTo({
      center: [rec.longitude, rec.latitude],
      zoom: 5,
      duration: 1500,
    });
  }, [selectedRecordingId, isRandomMode, recordings]);

  // Fit map bounds to journal recordings
  const fitToMyRecordings = useCallback(() => {
    const map = mapRef.current?.getMap();
    const recs = useJournalStore.getState().recordings;
    if (!map || recs.length === 0) return;

    if (recs.length === 1) {
      map.flyTo({
        center: [recs[0].longitude, recs[0].latitude],
        zoom: 8,
        duration: 1500,
      });
      return;
    }

    let minLng = Infinity, maxLng = -Infinity;
    let minLat = Infinity, maxLat = -Infinity;
    for (const r of recs) {
      if (r.longitude < minLng) minLng = r.longitude;
      if (r.longitude > maxLng) maxLng = r.longitude;
      if (r.latitude < minLat) minLat = r.latitude;
      if (r.latitude > maxLat) maxLat = r.latitude;
    }

    const lngSpread = maxLng - minLng;
    const latSpread = maxLat - minLat;
    const padding = lngSpread < 1 && latSpread < 1 ? 80 : 60;

    map.fitBounds(
      [[minLng, minLat], [maxLng, maxLat]],
      { padding, duration: 1500, maxZoom: 12 }
    );
  }, []);

  // Trigger fit when showMyRecordings activates and map is ready
  useEffect(() => {
    if (!showMyRecordings || !mapLoaded) return;
    fitToMyRecordings();
  }, [showMyRecordings, mapLoaded, fitToMyRecordings]);

  // Auto-rotation via requestAnimationFrame
  useEffect(() => {
    if (!isAutoRotating) {
      if (rotationRef.current) {
        cancelAnimationFrame(rotationRef.current);
        rotationRef.current = null;
      }
      return;
    }

    const rotate = () => {
      const map = mapRef.current?.getMap();
      if (map) {
        const center = map.getCenter();
        map.setCenter([center.lng + MAP_AUTO_ROTATE_SPEED, center.lat]);
      }
      rotationRef.current = requestAnimationFrame(rotate);
    };

    rotationRef.current = requestAnimationFrame(rotate);

    return () => {
      if (rotationRef.current) {
        cancelAnimationFrame(rotationRef.current);
        rotationRef.current = null;
      }
    };
  }, [isAutoRotating]);

  // Interaction handlers — rotation only resumes when the reset button is clicked
  const handleInteractionStart = useCallback(() => {
    setAutoRotating(false);
  }, [setAutoRotating]);

  // Configure globe atmosphere + attach input listeners on map load
  const handleMapLoad = useCallback(() => {
    const map = mapRef.current?.getMap();
    if (!map) return;

    map.setFog({
      color: "rgb(5, 5, 16)",
      "high-color": "rgb(10, 10, 40)",
      "horizon-blend": 0.08,
      "space-color": "rgb(5, 5, 16)",
      "star-intensity": 0.6,
    });

    // Stop rotation instantly on pointer/touch so user can freely rotate/tilt
    const stopRotation = () => {
      const state = useMapStore.getState();
      if (state.isAutoRotating) {
        state.setAutoRotating(false);
      }
    };

    const canvas = map.getCanvas();
    canvas.addEventListener("mousedown", stopRotation);
    canvas.addEventListener("touchstart", stopRotation);

    // Country hover highlight
    // Mapbox styles include a "country-boundaries" source; if the current style
    // uses a different source for land, we add our own from the composite tileset.
    if (!map.getSource("country-boundaries")) {
      map.addSource("country-boundaries", {
        type: "vector",
        url: "mapbox://mapbox.country-boundaries-v1",
      });
    }

    map.addLayer(
      {
        id: "country-hover-fill",
        type: "fill",
        source: "country-boundaries",
        "source-layer": "country_boundaries",
        paint: {
          "fill-color": "rgba(100, 130, 255, 0.15)",
          "fill-opacity": [
            "case",
            ["boolean", ["feature-state", "hover"], false],
            1,
            0,
          ],
        },
      },
      // Insert below markers / labels
      map.getStyle().layers?.find((l) => l.type === "symbol")?.id
    );

    map.on("mousemove", "country-hover-fill", (e) => {
      if (e.features && e.features.length > 0) {
        const id = e.features[0].id;
        if (hoveredCountryRef.current !== null && hoveredCountryRef.current !== id) {
          map.setFeatureState(
            { source: "country-boundaries", sourceLayer: "country_boundaries", id: hoveredCountryRef.current },
            { hover: false }
          );
        }
        hoveredCountryRef.current = id ?? null;
        if (id !== undefined) {
          map.setFeatureState(
            { source: "country-boundaries", sourceLayer: "country_boundaries", id },
            { hover: true }
          );
        }
        canvas.style.cursor = "pointer";
      }
    });

    map.on("mouseleave", "country-hover-fill", () => {
      if (hoveredCountryRef.current !== null) {
        map.setFeatureState(
          { source: "country-boundaries", sourceLayer: "country_boundaries", id: hoveredCountryRef.current },
          { hover: false }
        );
        hoveredCountryRef.current = null;
      }
      canvas.style.cursor = "";
    });

    setMapLoaded(true);
  }, [fitToMyRecordings]);

  return (
    <div className={styles.container}>
      <Map
        ref={mapRef}
        id="selah-map"
        mapboxAccessToken={MAPBOX_TOKEN}
        mapStyle={MAPBOX_STYLE}
        projection={{ name: "globe" }}
        initialViewState={{
          longitude: DEFAULT_MAP_CENTER[0],
          latitude: DEFAULT_MAP_CENTER[1],
          zoom: DEFAULT_MAP_ZOOM,
        }}
        minZoom={MAP_MIN_ZOOM}
        maxZoom={MAP_MAX_ZOOM}
        style={{ width: "100%", height: "100%" }}
        onDragStart={handleInteractionStart}
        onZoomStart={handleInteractionStart}
        onLoad={handleMapLoad}
        attributionControl={false}
      >
        {recordings.map((rec) => {
          const color = EMOTIONS[rec.emotion]?.color ?? "#ffffff";
          return (
            <Marker
              key={rec.id}
              longitude={rec.longitude}
              latitude={rec.latitude}
              anchor="bottom"
              onClick={(e) => {
                e.originalEvent.stopPropagation();
                selectRecording(rec.id);
              }}
            >
              <div
                className={`marker-pin ${styles.markerButton}`}
                style={{ "--glow-color": color } as React.CSSProperties}
              >
                <svg width="36" height="46" viewBox="0 0 36 46" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <filter id={`glow-${rec.id}`} x="-50%" y="-50%" width="200%" height="200%">
                      <feGaussianBlur stdDeviation="3" result="blur" />
                      <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                    <radialGradient id={`grad-${rec.id}`} cx="50%" cy="40%" r="60%">
                      <stop offset="0%" stopColor={color} stopOpacity="0.9" />
                      <stop offset="100%" stopColor={color} stopOpacity="0.5" />
                    </radialGradient>
                  </defs>
                  {/* Glow aura */}
                  <ellipse cx="18" cy="18" rx="16" ry="16" fill={color} opacity="0.25" filter={`url(#glow-${rec.id})`} />
                  {/* Pin body */}
                  <path d="M18 44C18 44 32 27 32 18C32 10.268 25.732 4 18 4C10.268 4 4 10.268 4 18C4 27 18 44 18 44Z" fill={`url(#grad-${rec.id})`} stroke={color} strokeWidth="1.5" strokeOpacity="0.6" />
                  {/* Inner dot */}
                  <circle cx="18" cy="18" r="5" fill="white" opacity="0.85" />
                </svg>
              </div>
            </Marker>
          );
        })}

        <MapControls mapRef={mapRef} />
      </Map>
      <RandomListenButton mapRef={mapRef} />
      <MyRecordingsBanner mapRef={mapRef} />
    </div>
  );
}
