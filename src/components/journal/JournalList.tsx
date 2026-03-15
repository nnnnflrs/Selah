"use client";

import { useEffect } from "react";
import { useJournalStore } from "@/stores/journalStore";
import { JournalEntry } from "./JournalEntry";
import { Spinner } from "@/components/ui/Spinner";
import styles from "./JournalList.module.css";

export function JournalList() {
  const { recordings, isLoading, hasFetched, fetchJournal } =
    useJournalStore();

  useEffect(() => {
    if (!hasFetched) {
      fetchJournal();
    }
  }, [hasFetched, fetchJournal]);

  if (isLoading && !hasFetched) {
    return (
      <div className={styles.loadingWrapper}>
        <Spinner />
      </div>
    );
  }

  if (hasFetched && recordings.length === 0) {
    return (
      <div className={styles.emptyState}>
        <div className={styles.emptyIcon}>
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className={styles.emptyIconSvg}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
            <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
            <line x1="12" y1="19" x2="12" y2="23" />
            <line x1="8" y1="23" x2="16" y2="23" />
          </svg>
        </div>
        <p className={styles.emptyTitle}>No recordings yet.</p>
        <p className={styles.emptySubtitle}>
          Head to the globe to share your first voice.
        </p>
      </div>
    );
  }

  return (
    <div className={styles.list}>
      {recordings.map((recording) => (
        <JournalEntry key={recording.id} recording={recording} />
      ))}
    </div>
  );
}
