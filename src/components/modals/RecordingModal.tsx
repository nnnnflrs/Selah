"use client";

import { useState, useEffect, useCallback } from "react";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import { Spinner } from "@/components/ui/Spinner";
import { AudioPlayer } from "@/components/recording/AudioPlayer";
import { CommentsList } from "@/components/comments/CommentsList";
import { ConfirmDialog } from "./ConfirmDialog";
import { useMapStore } from "@/stores/mapStore";
import { useAuthStore } from "@/stores/authStore";
import { useRecordings } from "@/hooks/useRecordings";
import { sileo } from "sileo";
import { Recording } from "@/types/recording";
import { relativeTime } from "@/lib/utils/time";
import styles from "./RecordingModal.module.css";

export function RecordingModal() {
  const { selectedRecordingId, isRecordingModalOpen, clearSelection } =
    useMapStore();
  const isRandomMode = useMapStore((s) => s.isRandomMode);
  const navigateRandom = useMapStore((s) => s.navigateRandom);
  const canNavigateRandom = useMapStore((s) => s.canNavigateRandom);
  const pushRandomRecording = useMapStore((s) => s.pushRandomRecording);
  const { user, isAuthenticated } = useAuthStore();
  const { recordings, refetch } = useRecordings();

  const [recording, setRecording] = useState<Recording | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [isReporting, setIsReporting] = useState(false);
  const [hasReported, setHasReported] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const isOwner = recording?.user_id === user?.id && !!user;

  useEffect(() => {
    if (!selectedRecordingId || !isRecordingModalOpen) {
      setRecording(null);
      return;
    }

    const controller = new AbortController();
    setIsLoading(true);
    setHasReported(false);

    fetch(`/api/recordings/${selectedRecordingId}`, { signal: controller.signal })
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (json?.data) setRecording(json.data);
      })
      .catch((err) => {
        if (err.name !== "AbortError") console.error("Failed to load recording:", err);
      })
      .finally(() => setIsLoading(false));

    return () => controller.abort();
  }, [selectedRecordingId, isRecordingModalOpen]);

  const handlePrev = useCallback(() => {
    navigateRandom("prev");
  }, [navigateRandom]);

  const handleNext = useCallback(() => {
    if (canNavigateRandom("next")) {
      navigateRandom("next");
    } else {
      // Pick a new random recording
      if (recordings.length === 0) return;
      const current = selectedRecordingId;
      let random;
      // Avoid repeating the same recording if possible
      if (recordings.length > 1) {
        do {
          random = recordings[Math.floor(Math.random() * recordings.length)];
        } while (random.id === current);
      } else {
        random = recordings[0];
      }
      pushRandomRecording(random.id);
    }
  }, [canNavigateRandom, navigateRandom, recordings, selectedRecordingId, pushRandomRecording]);

  const handleReport = async () => {
    if (!selectedRecordingId || !isAuthenticated) return;

    setIsReporting(true);
    try {
      const res = await fetch(
        `/api/recordings/${selectedRecordingId}/report`,
        { method: "POST" }
      );

      if (res.status === 409) {
        setHasReported(true);
        setShowReport(false);
        return;
      }

      if (!res.ok) throw new Error("Failed to report");

      setHasReported(true);
      setShowReport(false);
      sileo.info({ title: "Recording reported. Thank you." });
    } catch {
      sileo.error({ title: "Failed to report recording" });
    } finally {
      setIsReporting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedRecordingId) return;

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/recordings/${selectedRecordingId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const { error } = await res.json();
        throw new Error(error || "Delete failed");
      }

      sileo.success({ title: "Recording deleted" });
      setShowDelete(false);
      clearSelection();
      refetch();
    } catch (err) {
      sileo.error({
        title: err instanceof Error ? err.message : "Delete failed",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const displayName = recording?.anonymous_id || recording?.anonymous_name;

  const canGoPrev = isRandomMode && canNavigateRandom("prev");

  return (
    <>
      <Modal isOpen={isRecordingModalOpen} onClose={clearSelection}>
        <div className={styles.wrapper}>
          <div className={styles.header}>
            <div className={styles.headerContent}>
              {isLoading ? (
                <div className={styles.loadingContainer}>
                  <Spinner />
                </div>
              ) : recording ? (
                <div className={styles.content}>
                  {/* Header */}
                  <div className={styles.metaSection}>
                    <div className={styles.metaRow}>
                      <Badge emotion={recording.emotion} />
                      <span className={styles.timestamp}>
                        {relativeTime(recording.created_at)}
                      </span>
                    </div>
                    <h3 className={styles.displayName}>
                      {displayName}
                    </h3>
                    {recording.location_text && (
                      <p className={styles.locationText}>
                        {recording.location_text}
                      </p>
                    )}
                  </div>

                  {/* Player */}
                  <AudioPlayer src={recording.audio_url} fallbackDuration={recording.duration} />

                  {/* Random Navigation */}
                  {isRandomMode && (
                    <div className={styles.randomNav}>
                      <button
                        onClick={handlePrev}
                        disabled={!canGoPrev}
                        className={`${styles.navButton} ${canGoPrev ? styles.navButtonEnabled : styles.navButtonDisabled}`}
                        aria-label="Previous recording"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="15 18 9 12 15 6" />
                        </svg>
                        <span className={styles.navButtonLabel}>Prev</span>
                      </button>

                      <span className={styles.randomLabel}>Random</span>

                      <button
                        onClick={handleNext}
                        className={`${styles.navButton} ${styles.navButtonEnabled}`}
                        aria-label="Next recording"
                      >
                        <span className={styles.navButtonLabel}>Next</span>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="9 18 15 12 9 6" />
                        </svg>
                      </button>
                    </div>
                  )}

                  {/* Actions */}
                  <div className={styles.actions}>
                    {isOwner ? (
                      <button
                        onClick={() => setShowDelete(true)}
                        className={styles.deleteButton}
                      >
                        Delete
                      </button>
                    ) : (
                      <div />
                    )}
                    {isAuthenticated ? (
                      <button
                        onClick={() => setShowReport(true)}
                        disabled={hasReported}
                        className={`${styles.reportButton} ${hasReported ? styles.reportButtonDisabled : ''}`}
                      >
                        {hasReported ? "Reported" : "Report"}
                      </button>
                    ) : null}
                  </div>

                  {/* Divider */}
                  <div className={styles.divider} />

                  {/* Comments */}
                  <CommentsList recordingId={recording.id} />
                </div>
              ) : (
                <p className={styles.notFound}>
                  Recording not found
                </p>
              )}
            </div>

            <button
              onClick={clearSelection}
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
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={showReport}
        onClose={() => setShowReport(false)}
        onConfirm={handleReport}
        title="Report Recording"
        message="Are you sure you want to report this recording? It will be reviewed and may be removed if it violates community guidelines."
        confirmLabel="Report"
        isLoading={isReporting}
      />

      <ConfirmDialog
        isOpen={showDelete}
        onClose={() => setShowDelete(false)}
        onConfirm={handleDelete}
        title="Delete Recording"
        message="Are you sure you want to delete this recording? This action cannot be undone."
        confirmLabel="Delete"
        isLoading={isDeleting}
      />
    </>
  );
}
