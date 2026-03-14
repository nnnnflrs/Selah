"use client";

import { create } from "zustand";

interface MapState {
  isAutoRotating: boolean;

  selectedRecordingId: string | null;
  isRecordingModalOpen: boolean;
  isUploadModalOpen: boolean;
  selectedDate: string | null;

  // Random listen navigation
  randomHistory: string[];
  randomIndex: number;
  isRandomMode: boolean;

  setAutoRotating: (rotating: boolean) => void;

  selectRecording: (id: string) => void;
  clearSelection: () => void;
  openUploadModal: () => void;
  closeUploadModal: () => void;
  setSelectedDate: (date: string | null) => void;

  // Random navigation
  pushRandomRecording: (id: string) => void;
  navigateRandom: (direction: "prev" | "next") => string | null;
  canNavigateRandom: (direction: "prev" | "next") => boolean;
}

export const useMapStore = create<MapState>((set, get) => ({
  isAutoRotating: true,

  selectedRecordingId: null,
  isRecordingModalOpen: false,
  isUploadModalOpen: false,
  selectedDate: null,

  randomHistory: [],
  randomIndex: -1,
  isRandomMode: false,

  setAutoRotating: (isAutoRotating) => set({ isAutoRotating }),

  selectRecording: (id) =>
    set({
      selectedRecordingId: id,
      isRecordingModalOpen: true,
      isAutoRotating: false,
    }),

  clearSelection: () =>
    set({
      selectedRecordingId: null,
      isRecordingModalOpen: false,
      isRandomMode: false,
    }),

  openUploadModal: () => set({ isUploadModalOpen: true }),
  closeUploadModal: () => set({ isUploadModalOpen: false }),
  setSelectedDate: (selectedDate) => set({ selectedDate }),

  pushRandomRecording: (id) => {
    const { randomHistory, randomIndex } = get();
    // Trim any forward history and append
    const trimmed = randomHistory.slice(0, randomIndex + 1);
    set({
      randomHistory: [...trimmed, id],
      randomIndex: trimmed.length,
      isRandomMode: true,
      selectedRecordingId: id,
      isRecordingModalOpen: true,
      isAutoRotating: false,
    });
  },

  navigateRandom: (direction) => {
    const { randomHistory, randomIndex } = get();
    const newIndex = direction === "prev" ? randomIndex - 1 : randomIndex + 1;
    if (newIndex < 0 || newIndex >= randomHistory.length) return null;
    const id = randomHistory[newIndex];
    set({
      randomIndex: newIndex,
      selectedRecordingId: id,
      isRecordingModalOpen: true,
    });
    return id;
  },

  canNavigateRandom: (direction) => {
    const { randomHistory, randomIndex } = get();
    if (direction === "prev") return randomIndex > 0;
    return randomIndex < randomHistory.length - 1;
  },
}));
