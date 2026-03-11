"use client";

import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { WaveformVisualizer } from "@/components/recording/WaveformVisualizer";
import { AudioPlayer } from "@/components/recording/AudioPlayer";
import { EmotionSelector } from "@/components/recording/EmotionSelector";
import { LocationAutocomplete } from "@/components/recording/LocationAutocomplete";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useMapStore } from "@/stores/mapStore";
import { useRecorderStore } from "@/stores/recorderStore";
import { useRecordings } from "@/hooks/useRecordings";
import { useMediaRecorder } from "@/hooks/useMediaRecorder";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useDeviceId } from "@/hooks/useDeviceFingerprint";
import { sileo } from "sileo";
import { generateAnonymousName } from "@/lib/utils/names";
import { formatDuration } from "@/lib/utils/time";
import { MAX_DURATION } from "@/lib/constants";
import { Emotion } from "@/types/emotion";

export function UploadModal() {
  const { isUploadModalOpen, closeUploadModal } = useMapStore();
  const resetRecorder = useRecorderStore((s) => s.reset);
  const { refetch } = useRecordings();
  const { phase, duration, blob, analyserNode, start, stop, cancel } =
    useMediaRecorder();
  const {
    latitude,
    longitude,
    isLoading: geoLoading,
    error: geoError,
    requestLocation,
    setCoordinates,
  } = useGeolocation();
  const fingerprint = useDeviceId();

  const [emotion, setEmotion] = useState<Emotion | null>(null);
  const [name, setName] = useState(() => generateAnonymousName());
  const [locationText, setLocationText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [audioBlobUrl, setAudioBlobUrl] = useState("");

  // Create/revoke blob URL when recording finishes
  useEffect(() => {
    if (blob) {
      const url = URL.createObjectURL(blob);
      setAudioBlobUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setAudioBlobUrl("");
    }
  }, [blob]);

  const handleClose = () => {
    cancel();
    resetRecorder();
    setEmotion(null);
    setName(generateAnonymousName());
    setLocationText("");
    setAudioBlobUrl("");
    closeUploadModal();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!blob) {
      sileo.error({ title: "Please record audio first" });
      return;
    }

    if (!emotion) {
      sileo.error({ title: "Please select an emotion" });
      return;
    }

    if (latitude === null || longitude === null) {
      sileo.error({ title: "Please provide your location" });
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("audio", blob, "recording.webm");
      formData.append(
        "metadata",
        JSON.stringify({
          anonymous_name: name.trim(),
          emotion,
          latitude,
          longitude,
          location_text: locationText.trim(),
          duration: Math.floor(duration),
          device_fingerprint: fingerprint,
        })
      );

      const res = await fetch("/api/recordings", {
        method: "POST",
        body: formData,
      });

      if (res.status === 429) {
        sileo.error({ title: "You can only post one recording per hour" });
        return;
      }

      if (!res.ok) {
        const { error } = await res.json();
        throw new Error(error || "Upload failed");
      }

      sileo.success({ title: "Recording shared with the world!" });
      handleClose();
      refetch();
    } catch (err) {
      sileo.error({
        title: err instanceof Error ? err.message : "Upload failed",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasRecording = phase === "stopped" && blob;

  return (
    <Modal isOpen={isUploadModalOpen} onClose={handleClose}>
      <form onSubmit={handleSubmit} className="p-6 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium text-white">
            Share a Recording
          </h2>
          <button
            type="button"
            onClick={handleClose}
            className="text-selah-400 hover:text-white transition-colors"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Audio Section */}
        <div className="space-y-3">
          <label className="block text-sm text-selah-300">Audio</label>

          {hasRecording ? (
            <div className="space-y-2">
              <AudioPlayer src={audioBlobUrl} fallbackDuration={duration} />
              <button
                type="button"
                onClick={() => {
                  cancel();
                  resetRecorder();
                  setAudioBlobUrl("");
                }}
                className="text-xs text-selah-400 hover:text-white transition-colors"
              >
                Re-record
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Timer */}
              <div className="text-center">
                <div className="text-3xl font-mono text-white tabular-nums">
                  {formatDuration(duration)}
                </div>
                <div className="text-xs text-selah-500 mt-0.5">
                  {formatDuration(MAX_DURATION)} max
                </div>
              </div>

              {/* Waveform */}
              <WaveformVisualizer
                analyserNode={analyserNode}
                isActive={phase === "recording"}
                color="#00f0ff"
                height={60}
              />

              {phase === "error" && (
                <p className="text-red-400 text-sm text-center">
                  Could not access microphone. Please allow microphone access.
                </p>
              )}

              {/* Record controls */}
              <div className="flex justify-center gap-3">
                {phase === "idle" || phase === "error" ? (
                  <Button type="button" onClick={start}>
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <circle cx="12" cy="12" r="8" />
                    </svg>
                    Record
                  </Button>
                ) : phase === "requesting" ? (
                  <Button type="button" isLoading disabled>
                    Requesting microphone...
                  </Button>
                ) : phase === "recording" ? (
                  <Button type="button" variant="danger" onClick={stop}>
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <rect x="6" y="6" width="12" height="12" rx="2" />
                    </svg>
                    Stop
                  </Button>
                ) : null}
              </div>
            </div>
          )}
        </div>

        {/* Emotion */}
        <EmotionSelector value={emotion} onChange={setEmotion} />

        {/* Name */}
        <Input
          label="Anonymous name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={50}
          placeholder="e.g. Drifting Owl #4291"
        />

        {/* Location */}
        <div className="space-y-2">
          <label className="block text-sm text-selah-300">Location</label>
          <LocationAutocomplete
            value={locationText}
            onChange={setLocationText}
            onSelect={(place, lat, lng) => {
              setLocationText(place);
              setCoordinates(lat, lng);
            }}
          />
          {latitude !== null && longitude !== null ? (
            <div className="text-xs text-glow-grateful">
              Location set ({latitude.toFixed(4)}, {longitude.toFixed(4)})
            </div>
          ) : (
            <Button
              type="button"
              variant="secondary"
              onClick={requestLocation}
              isLoading={geoLoading}
            >
              <svg
                width="14"
                height="14"
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
              Or use my GPS location
            </Button>
          )}
          {geoError && (
            <p className="text-xs text-red-400">{geoError}</p>
          )}
        </div>

        {/* Submit */}
        <div className="pt-2">
          <Button
            type="submit"
            isLoading={isSubmitting}
            disabled={
              !hasRecording ||
              !emotion ||
              latitude === null ||
              longitude === null
            }
            className="w-full"
          >
            Share Recording
          </Button>
        </div>
      </form>
    </Modal>
  );
}
