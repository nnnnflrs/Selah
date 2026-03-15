"use client";

import { useMapStore } from "@/stores/mapStore";
import { useAuthStore } from "@/stores/authStore";
import { sileo } from "sileo";
import styles from "./FloatingActionButton.module.css";

export function FloatingActionButton() {
  const openUploadModal = useMapStore((s) => s.openUploadModal);
  const { isAuthenticated, signIn } = useAuthStore();

  const handleClick = () => {
    if (!isAuthenticated) {
      sileo.info({ title: "Sign in with Google to share a recording" });
      signIn();
      return;
    }
    openUploadModal();
  };

  return (
    <button
      onClick={handleClick}
      className={styles.fab}
      aria-label="Record audio"
    >
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
    </button>
  );
}
