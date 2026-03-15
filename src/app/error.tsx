"use client";

import styles from "./error.module.css";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className={styles.page}>
      <div className={styles.content}>
        <h2 className={styles.heading}>Something went wrong</h2>
        <p className={styles.message}>
          An unexpected error occurred. Please try again.
        </p>
        <button
          onClick={reset}
          className={styles.retryButton}
        >
          Try again
        </button>
      </div>
    </div>
  );
}
