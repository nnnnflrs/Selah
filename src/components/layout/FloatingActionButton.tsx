"use client";

import { useMapStore } from "@/stores/mapStore";
import { useAuthStore } from "@/stores/authStore";
import { sileo } from "sileo";

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
      className="
        fixed bottom-[calc(theme(spacing.24)+theme(spacing.44)+env(safe-area-inset-bottom))] right-4
        sm:bottom-[calc(theme(spacing.24)+theme(spacing.44))] sm:right-4 z-[1000]
        w-10 h-10 sm:w-12 sm:h-12 rounded-full
        bg-gradient-to-br from-glow-grateful to-glow-hopeful
        shadow-lg shadow-glow-grateful/20
        flex items-center justify-center
        hover:scale-110 active:scale-95
        transition-transform duration-200
      "
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
