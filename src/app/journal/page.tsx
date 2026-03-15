"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMapStore } from "@/stores/mapStore";
import { JournalList } from "@/components/journal/JournalList";

export default function JournalPage() {
  const router = useRouter();
  const setShowMyRecordings = useMapStore((s) => s.setShowMyRecordings);

  const handleViewOnGlobe = () => {
    setShowMyRecordings(true);
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-selah-950">
      {/* Header */}
      <header className="border-b border-selah-800">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-selah-400 hover:text-white transition-colors"
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
            <h1 className="text-lg font-medium text-white">My Journal</h1>
          </div>
          <button
            onClick={handleViewOnGlobe}
            className="text-sm px-3 py-1.5 bg-selah-700 hover:bg-selah-600 text-white rounded-full transition-colors flex items-center gap-1.5"
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
      <main className="max-w-2xl mx-auto px-4 py-6">
        <JournalList />
      </main>
    </div>
  );
}
