"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMapStore } from "@/stores/mapStore";
import { JournalList } from "@/components/journal/JournalList";
import styles from "./page.module.css";

export default function JournalPage() {
  const router = useRouter();
  const setShowMyRecordings = useMapStore((s) => s.setShowMyRecordings);

  const handleViewOnGlobe = () => {
    setShowMyRecordings(true);
    router.push("/");
  };

  return (
    <div className={styles.page}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <div className={styles.headerLeft}>
            <Link
              href="/"
              className={styles.backLink}
              aria-label="Back to globe"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
            </Link>
            <h1 className={styles.title}>My Journal</h1>
          </div>
          <button
            onClick={handleViewOnGlobe}
            className={styles.globeButton}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="2" y1="12" x2="22" y2="12" />
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            </svg>
            View on Globe
          </button>
        </div>
      </header>

      {/* Content */}
      <main className={styles.content}>
        <JournalList />
      </main>
    </div>
  );
}
