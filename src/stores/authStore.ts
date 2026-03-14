"use client";

import { create } from "zustand";
import type { Session, User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { useJournalStore } from "@/stores/journalStore";

interface AuthState {
  session: Session | null;
  user: User | null;
  isAnonymous: boolean;
  isAuthenticated: boolean;
  isLoading: boolean;
  setSession: (session: Session | null) => void;
  setLoading: (loading: boolean) => void;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  user: null,
  isAnonymous: true,
  isAuthenticated: false,
  isLoading: true,

  setSession: (session) =>
    set({
      session,
      user: session?.user ?? null,
      isAnonymous: session?.user?.is_anonymous ?? true,
      isAuthenticated: !!session?.user && !session.user.is_anonymous,
      isLoading: false,
    }),

  setLoading: (isLoading) => set({ isLoading }),

  signIn: async () => {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback`,
      },
    });
  },

  signOut: async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    useJournalStore.getState().reset();
    set({
      session: null,
      user: null,
      isAnonymous: true,
      isAuthenticated: false,
    });
  },
}));
