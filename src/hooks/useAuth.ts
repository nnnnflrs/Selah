"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/authStore";

export function useAuth() {
  const { setSession, setLoading, isLoading, session } = useAuthStore();

  useEffect(() => {
    let subscription: { unsubscribe: () => void } | null = null;

    const init = async () => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setSession(session);
      } else {
        // No existing session — sign in anonymously for guest browsing
        const { data, error } = await supabase.auth.signInAnonymously();
        if (error) {
          console.error("Anonymous auth failed:", error.message);
          setLoading(false);
        } else {
          setSession(data.session);
        }
      }
      const { data } = supabase.auth.onAuthStateChange((_event, session) => {
        setSession(session);
      });
      subscription = data.subscription;
    };

    init();

    return () => {
      subscription?.unsubscribe();
    };
  }, [setSession, setLoading]);

  return { isLoading, session };
}
