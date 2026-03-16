"use client";

import { useState, useEffect, useRef } from "react";
import { Modal } from "@/components/ui/Modal";
import { WaveformVisualizer } from "@/components/recording/WaveformVisualizer";
import { AudioPlayer } from "@/components/recording/AudioPlayer";
import { EmotionSelector } from "@/components/recording/EmotionSelector";
import { LocationAutocomplete } from "@/components/recording/LocationAutocomplete";
import { PublicPrivateToggle } from "@/components/journal/PublicPrivateToggle";
import { SignInButton } from "@/components/auth/SignInButton";
import { Button } from "@/components/ui/Button";
import { useMapStore } from "@/stores/mapStore";
import { useRecorderStore } from "@/stores/recorderStore";
import { useAuthStore } from "@/stores/authStore";
import { useRecordings } from "@/hooks/useRecordings";
import { useJournalStore } from "@/stores/journalStore";
import { useMediaRecorder } from "@/hooks/useMediaRecorder";
import { useGeolocation } from "@/hooks/useGeolocation";
import { sileo } from "sileo";
import { formatDuration } from "@/lib/utils/time";
import { MAX_DURATION } from "@/lib/constants";
import { Emotion } from "@/types/emotion";
import { compressImage, isHeicFile } from "@/lib/utils/image";
import styles from "./UploadModal.module.css";

export function UploadModal() {
  const { isUploadModalOpen, closeUploadModal } = useMapStore();
  const resetRecorder = useRecorderStore((s) => s.reset);
  const { isAuthenticated } = useAuthStore();
  const { refetch } = useRecordings();
  const resetJournal = useJournalStore((s) => s.reset);
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

  const [emotion, setEmotion] = useState<Emotion | null>(null);
  const [locationText, setLocationText] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [audioBlobUrl, setAudioBlobUrl] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  const [isCompressing, setIsCompressing] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);

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

  // Create/revoke image preview URL (HEIC can't be previewed in browser)
  useEffect(() => {
    if (imageFile) {
      if (isHeicFile(imageFile)) {
        setImagePreview("heic");
        return;
      }
      const url = URL.createObjectURL(imageFile);
      setImagePreview(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setImagePreview("");
    }
  }, [imageFile]);

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Some browsers report HEIC with empty type — allow by extension too
    const ext = file.name.toLowerCase().split(".").pop();
    const isImage = file.type.startsWith("image/") || ext === "heic" || ext === "heif";
    if (!isImage) {
      sileo.error({ title: "Please select an image file" });
      return;
    }

    setIsCompressing(true);
    try {
      const compressed = await compressImage(file);
      // HEIC files are sent raw — preserve original name/type for server processing
      const compressedFile = isHeicFile(file)
        ? new File([compressed], file.name, { type: file.type || "image/heic" })
        : new File([compressed], "image.jpg", { type: "image/jpeg" });
      setImageFile(compressedFile);
    } catch {
      sileo.error({ title: "Failed to process image" });
    } finally {
      setIsCompressing(false);
      // Reset input so the same file can be re-selected
      if (imageInputRef.current) imageInputRef.current.value = "";
    }
  };

  const handleClose = () => {
    cancel();
    resetRecorder();
    setEmotion(null);
    setLocationText("");
    setIsPublic(true);
    setAudioBlobUrl("");
    setImageFile(null);
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
      const localDate = new Intl.DateTimeFormat("en-CA").format(new Date());

      const formData = new FormData();
      formData.append("audio", blob, "recording.webm");
      if (imageFile) {
        formData.append("image", imageFile, "image.jpg");
      }
      formData.append(
        "metadata",
        JSON.stringify({
          emotion,
          latitude,
          longitude,
          location_text: locationText.trim(),
          duration: Math.floor(duration),
          is_public: isPublic,
          local_date: localDate,
        })
      );

      const res = await fetch("/api/recordings", {
        method: "POST",
        body: formData,
      });

      if (res.status === 429) {
        sileo.error({
          title: "You've already recorded today. Come back tomorrow.",
        });
        return;
      }

      if (res.status === 401) {
        sileo.error({ title: "Please sign in to share a recording" });
        return;
      }

      if (!res.ok) {
        const { error } = await res.json();
        throw new Error(error || "Upload failed");
      }

      sileo.success({
        title: isPublic
          ? "Recording shared with the world!"
          : "Recording saved to your journal!",
      });
      handleClose();
      refetch();
      resetJournal();
    } catch (err) {
      sileo.error({
        title: err instanceof Error ? err.message : "Upload failed",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasRecording = phase === "stopped" && blob;

  // Show sign-in prompt if not authenticated
  if (isUploadModalOpen && !isAuthenticated) {
    return (
      <Modal isOpen={isUploadModalOpen} onClose={handleClose}>
        <div className={styles.signInContainer}>
          <div className={styles.signInIcon}>
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#050510"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              <line x1="12" y1="19" x2="12" y2="23" />
              <line x1="8" y1="23" x2="16" y2="23" />
            </svg>
          </div>
          <h2 className={styles.signInTitle}>
            Sign in to record
          </h2>
          <p className={styles.signInDescription}>
            Sign in with Google to share your voice with the world. Your
            recordings remain completely anonymous.
          </p>
          <SignInButton />
        </div>
      </Modal>
    );
  }

  return (
    <Modal isOpen={isUploadModalOpen} onClose={handleClose}>
      <form onSubmit={handleSubmit} className={styles.form}>
        {/* Header */}
        <div className={styles.formHeader}>
          <h2 className={styles.formTitle}>
            Share a Recording
          </h2>
          <button
            type="button"
            onClick={handleClose}
            className={styles.closeButton}
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
        <div className={styles.audioSection}>
          <label className={styles.audioLabel}>Audio</label>

          {hasRecording ? (
            <div className={styles.recordingPreview}>
              <AudioPlayer src={audioBlobUrl} fallbackDuration={duration} />
              <button
                type="button"
                onClick={() => {
                  cancel();
                  resetRecorder();
                  setAudioBlobUrl("");
                }}
                className={styles.reRecordButton}
              >
                Re-record
              </button>
            </div>
          ) : (
            <div className={styles.recordSection}>
              {/* Timer */}
              <div className={styles.timerContainer}>
                <div className={styles.timer}>
                  {formatDuration(duration)}
                </div>
                <div className={styles.timerMax}>
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
                <p className={styles.micError}>
                  Could not access microphone. Please allow microphone access.
                </p>
              )}

              {/* Record controls */}
              <div className={styles.recordControls}>
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

        {/* Visibility Toggle */}
        <PublicPrivateToggle isPublic={isPublic} onChange={setIsPublic} />

        {/* Image (optional) */}
        <div className={styles.imageSection}>
          <label className={styles.imageLabel}>
            Photo <span className={styles.imageOptional}>(optional)</span>
          </label>
          <input
            ref={imageInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/heic,image/heif,.heic,.heif"
            onChange={handleImageSelect}
            className={styles.imageInput}
          />
          {imagePreview ? (
            <div className={styles.imagePreviewContainer}>
              {imagePreview === "heic" ? (
                <div className={styles.heicPlaceholder}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21 15 16 10 5 21" />
                  </svg>
                  <span>HEIC photo attached</span>
                </div>
              ) : (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className={styles.imagePreview}
                  />
                </>
              )}
              <button
                type="button"
                onClick={() => setImageFile(null)}
                className={styles.imageRemoveButton}
                aria-label="Remove image"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => imageInputRef.current?.click()}
              className={styles.imagePickerButton}
              disabled={isCompressing}
            >
              {isCompressing ? (
                "Processing..."
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21 15 16 10 5 21" />
                  </svg>
                  Add a photo
                </>
              )}
            </button>
          )}
        </div>

        {/* Location */}
        <div className={styles.locationSection}>
          <label className={styles.locationLabel}>Location</label>
          <LocationAutocomplete
            value={locationText}
            onChange={setLocationText}
            onSelect={(place, lat, lng) => {
              setLocationText(place);
              setCoordinates(lat, lng);
            }}
          />
          {latitude !== null && longitude !== null ? (
            <div className={styles.locationSet}>
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
            <p className={styles.geoError}>{geoError}</p>
          )}
        </div>

        {/* Submit */}
        <div className={styles.submitContainer}>
          <Button
            type="submit"
            isLoading={isSubmitting}
            disabled={
              !hasRecording ||
              !emotion ||
              latitude === null ||
              longitude === null
            }
            className={styles.submitButton}
          >
            {isPublic ? "Share Recording" : "Save to Journal"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
