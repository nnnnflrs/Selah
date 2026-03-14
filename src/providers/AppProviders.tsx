"use client";

import { useAuth } from "@/hooks/useAuth";
import { Toaster } from "sileo";

export function AppProviders({ children }: { children: React.ReactNode }) {
  useAuth();

  return (
    <>
      {children}
      <Toaster position="top-center" />
    </>
  );
}
