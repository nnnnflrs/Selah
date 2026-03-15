"use client";

import { useCallback, RefObject } from "react";
import { MapRef } from "react-map-gl/mapbox";
import { useRecordings } from "@/hooks/useRecordings";
import { useMapStore } from "@/stores/mapStore";
import { sileo } from "sileo";
import styles from "./RandomListenButton.module.css";

interface RandomListenButtonProps {
  mapRef: RefObject<MapRef | null>;
}

export function RandomListenButton({ mapRef }: RandomListenButtonProps) {
  const { recordings } = useRecordings();
  const pushRandomRecording = useMapStore((s) => s.pushRandomRecording);
  const isRecordingModalOpen = useMapStore((s) => s.isRecordingModalOpen);
  const isUploadModalOpen = useMapStore((s) => s.isUploadModalOpen);

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

  const hidden = isRecordingModalOpen || isUploadModalOpen;

  return (
    <div className={`${styles.wrapper} ${hidden ? styles.hidden : ''}`}>
      <button
        onClick={handleClick}
        className={styles.button}
        aria-label="Listen to a random recording"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={styles.icon}
        >
          <polyline points="16 3 21 3 21 8" />
          <line x1="4" y1="20" x2="21" y2="3" />
          <polyline points="21 16 21 21 16 21" />
          <line x1="15" y1="15" x2="21" y2="21" />
          <line x1="4" y1="4" x2="9" y2="9" />
        </svg>
        <span className={styles.labelFull}>Listen to random story</span>
        <span className={styles.labelShort}>Random</span>
      </button>
    </div>
  );
}
