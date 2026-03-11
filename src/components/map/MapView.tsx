"use client";

import { useRef, useCallback, useEffect } from "react";
import Map, { Marker, MapRef } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import { useMapStore } from "@/stores/mapStore";
import { useRecordings } from "@/hooks/useRecordings";
import { MapControls } from "./MapControls";
import { RandomListenButton } from "@/components/layout/RandomListenButton";
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

  const selectRecording = useMapStore((s) => s.selectRecording);
  const isAutoRotating = useMapStore((s) => s.isAutoRotating);
  const setAutoRotating = useMapStore((s) => s.setAutoRotating);

  const { recordings } = useRecordings();

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
  }, []);

  return (
    <div className="h-full w-full relative">
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
              anchor="center"
              onClick={(e) => {
                e.originalEvent.stopPropagation();
                selectRecording(rec.id);
              }}
            >
              <div
                className="marker-glow cursor-pointer"
                style={{ "--glow-color": color } as React.CSSProperties}
              >
                <div
                  className="marker-glow-inner"
                  style={{ background: color }}
                />
              </div>
            </Marker>
          );
        })}

        <MapControls mapRef={mapRef} />
      </Map>
      <RandomListenButton mapRef={mapRef} />
    </div>
  );
}
