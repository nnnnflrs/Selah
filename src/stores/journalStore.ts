"use client";

import { create } from "zustand";
import { Recording } from "@/types/recording";

interface JournalState {
  recordings: Recording[];
  isLoading: boolean;
  hasFetched: boolean;
  nextCursor: string | null;
  fetchJournal: () => Promise<void>;
  togglePublic: (id: string, isPublic: boolean) => Promise<void>;
  deleteRecording: (id: string) => Promise<void>;
  reset: () => void;
}

export const useJournalStore = create<JournalState>((set) => ({
  recordings: [],
  isLoading: false,
  hasFetched: false,
  nextCursor: null,

  fetchJournal: async () => {
    set({ isLoading: true });

    try {
      const res = await fetch("/api/recordings/me");
      if (!res.ok) throw new Error("Failed to fetch journal");

      const { data, nextCursor } = await res.json();
      set({ recordings: data, nextCursor, hasFetched: true });
    } catch (err) {
      console.error("Failed to fetch journal:", err);
    } finally {
      set({ isLoading: false });
    }
  },

  togglePublic: async (id: string, isPublic: boolean) => {
    // Optimistic update
    set((state) => ({
      recordings: state.recordings.map((r) =>
        r.id === id ? { ...r, is_public: isPublic } : r
      ),
    }));

    try {
      const res = await fetch(`/api/recordings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_public: isPublic }),
      });

      if (!res.ok) throw new Error("Failed to update");
    } catch {
      // Revert on error
      set((state) => ({
        recordings: state.recordings.map((r) =>
          r.id === id ? { ...r, is_public: !isPublic } : r
        ),
      }));
      throw new Error("Failed to update visibility");
    }
  },

  deleteRecording: async (id: string) => {
    const res = await fetch(`/api/recordings/${id}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      const { error } = await res.json();
      throw new Error(error || "Failed to delete recording");
    }

    set((state) => ({
      recordings: state.recordings.filter((r) => r.id !== id),
    }));
  },

  reset: () => set({ recordings: [], hasFetched: false, nextCursor: null }),
}));
