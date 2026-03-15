"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { AudioPlayer } from "@/components/recording/AudioPlayer";
import { ConfirmDialog } from "@/components/modals/ConfirmDialog";
import { PublicPrivateToggle } from "./PublicPrivateToggle";
import { useJournalStore } from "@/stores/journalStore";
import { sileo } from "sileo";
import { Recording } from "@/types/recording";
import styles from "./JournalEntry.module.css";

interface JournalEntryProps {
  recording: Recording;
}

export function JournalEntry({ recording }: JournalEntryProps) {
  const { togglePublic, deleteRecording } = useJournalStore();
  const [showDelete, setShowDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isToggling, setIsToggling] = useState(false);

  const date = new Date(recording.created_at);
  const formattedDate = date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const handleToggle = async (isPublic: boolean) => {
    setIsToggling(true);
    try {
      await togglePublic(recording.id, isPublic);
      sileo.success({
        title: isPublic ? "Recording is now public" : "Recording is now private",
      });
    } catch {
      sileo.error({ title: "Failed to update visibility" });
    } finally {
      setIsToggling(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteRecording(recording.id);
      sileo.success({ title: "Recording deleted" });
      setShowDelete(false);
    } catch (err) {
      sileo.error({
        title: err instanceof Error ? err.message : "Failed to delete",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div className={styles.card}>
        {/* Header row */}
        <div className={styles.headerRow}>
          <div className={styles.headerInfo}>
            <div className={styles.metaRow}>
              <span className={styles.date}>{formattedDate}</span>
              <Badge emotion={recording.emotion} />
              <span
                className={`${styles.statusBadge} ${
                  recording.is_public
                    ? styles.statusPublic
                    : styles.statusPrivate
                }`}
              >
                {recording.is_public ? "Public" : "Private"}
              </span>
            </div>
            <p className={styles.locationText}>
              {recording.anonymous_id || recording.anonymous_name}
              {recording.location_text && ` — ${recording.location_text}`}
            </p>
          </div>
          <button
            onClick={() => setShowDelete(true)}
            className={styles.deleteButton}
            aria-label="Delete recording"
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
            >
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
          </button>
        </div>

        {/* Audio player */}
        <AudioPlayer
          src={recording.audio_url}
          fallbackDuration={recording.duration}
        />

        {/* Visibility toggle */}
        <PublicPrivateToggle
          isPublic={recording.is_public}
          onChange={handleToggle}
          disabled={isToggling}
        />
      </div>

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
