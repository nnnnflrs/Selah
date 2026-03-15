"use client";

import styles from "./PublicPrivateToggle.module.css";

interface PublicPrivateToggleProps {
  isPublic: boolean;
  onChange: (isPublic: boolean) => void;
  disabled?: boolean;
}

export function PublicPrivateToggle({
  isPublic,
  onChange,
  disabled = false,
}: PublicPrivateToggleProps) {
  return (
    <div className={styles.container}>
      <label className={styles.label}>Visibility</label>
      <div className={styles.buttonGroup}>
        <button
          type="button"
          disabled={disabled || isPublic}
          onClick={() => onChange(true)}
          className={`${styles.toggleButton} ${
            isPublic
              ? `${styles.toggleButtonActive} ${styles.public}`
              : styles.toggleButtonInactive
          } ${disabled || isPublic ? styles.toggleButtonDisabled : ''}`}
        >
          <div className={styles.buttonContent}>
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
            Public
          </div>
          <p className={styles.buttonHint}>Visible on globe</p>
        </button>
        <button
          type="button"
          disabled={disabled || !isPublic}
          onClick={() => onChange(false)}
          className={`${styles.toggleButton} ${
            !isPublic
              ? `${styles.toggleButtonActive} ${styles.private}`
              : styles.toggleButtonInactive
          } ${disabled || !isPublic ? styles.toggleButtonDisabled : ''}`}
        >
          <div className={styles.buttonContent}>
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
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            Private
          </div>
          <p className={styles.buttonHint}>Only in your journal</p>
        </button>
      </div>
    </div>
  );
}
