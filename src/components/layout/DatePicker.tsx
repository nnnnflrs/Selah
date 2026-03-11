"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useMapStore } from "@/stores/mapStore";

const DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfWeek(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

function formatDate(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function DatePicker() {
  const selectedDate = useMapStore((s) => s.selectedDate);
  const setSelectedDate = useMapStore((s) => s.setSelectedDate);

  const [isOpen, setIsOpen] = useState(false);
  const [viewYear, setViewYear] = useState(() => new Date().getFullYear());
  const [viewMonth, setViewMonth] = useState(() => new Date().getMonth());
  const containerRef = useRef<HTMLDivElement>(null);

  const today = new Date();
  const todayStr = formatDate(today.getFullYear(), today.getMonth(), today.getDate());

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isOpen]);

  // Close on escape
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen]);

  const handlePrevMonth = useCallback(() => {
    setViewMonth((m) => {
      if (m === 0) {
        setViewYear((y) => y - 1);
        return 11;
      }
      return m - 1;
    });
  }, []);

  const handleNextMonth = useCallback(() => {
    setViewMonth((m) => {
      if (m === 11) {
        setViewYear((y) => y + 1);
        return 0;
      }
      return m + 1;
    });
  }, []);

  const handleSelectDay = useCallback(
    (day: number) => {
      const dateStr = formatDate(viewYear, viewMonth, day);
      setSelectedDate(dateStr);
      setIsOpen(false);
    },
    [viewYear, viewMonth, setSelectedDate]
  );

  const handleClear = useCallback(() => {
    setSelectedDate(null);
    setIsOpen(false);
  }, [setSelectedDate]);

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfWeek(viewYear, viewMonth);

  // Build calendar grid cells
  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  // Display label for trigger button
  const displayLabel = selectedDate
    ? new Date(selectedDate + "T00:00:00").toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : null;

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          flex items-center gap-2 px-3 py-1.5 rounded-full
          border transition-all duration-200
          ${
            selectedDate
              ? "bg-selah-700/80 border-cyan-500/40 text-cyan-300"
              : "bg-selah-800/60 border-selah-600 text-selah-300 hover:text-white hover:border-selah-500"
          }
        `}
        aria-label="Filter by date"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
        <span className="text-sm font-medium">
          {displayLabel || "All dates"}
        </span>
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-72 rounded-xl bg-selah-900/95 border border-selah-600 shadow-2xl shadow-black/40 backdrop-blur-md p-3 z-50">
          {/* Month navigation */}
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={handlePrevMonth}
              className="p-1 rounded hover:bg-selah-700 text-selah-300 hover:text-white transition-colors"
              aria-label="Previous month"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <span className="text-sm font-medium text-white">
              {MONTHS[viewMonth]} {viewYear}
            </span>
            <button
              onClick={handleNextMonth}
              className="p-1 rounded hover:bg-selah-700 text-selah-300 hover:text-white transition-colors"
              aria-label="Next month"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 gap-1 mb-1">
            {DAYS.map((d) => (
              <div key={d} className="text-center text-xs text-selah-400 font-medium py-1">
                {d}
              </div>
            ))}
          </div>

          {/* Day cells */}
          <div className="grid grid-cols-7 gap-1">
            {cells.map((day, i) => {
              if (day === null) {
                return <div key={`empty-${i}`} />;
              }
              const dateStr = formatDate(viewYear, viewMonth, day);
              const isSelected = dateStr === selectedDate;
              const isToday = dateStr === todayStr;
              const isFuture = dateStr > todayStr;

              return (
                <button
                  key={dateStr}
                  onClick={() => !isFuture && handleSelectDay(day)}
                  disabled={isFuture}
                  className={`
                    w-full aspect-square rounded-lg text-sm font-medium
                    flex items-center justify-center transition-all duration-150
                    ${isFuture ? "text-selah-600 cursor-not-allowed" : "cursor-pointer"}
                    ${
                      isSelected
                        ? "bg-cyan-500/30 text-cyan-200 shadow-[0_0_8px_2px_rgba(0,240,255,0.2)]"
                        : isToday
                        ? "bg-selah-700 text-white ring-1 ring-cyan-500/30"
                        : isFuture
                        ? ""
                        : "text-selah-200 hover:bg-selah-700 hover:text-white"
                    }
                  `}
                >
                  {day}
                </button>
              );
            })}
          </div>

          {/* Clear button */}
          {selectedDate && (
            <button
              onClick={handleClear}
              className="mt-3 w-full py-1.5 text-sm text-selah-300 hover:text-white bg-selah-800 hover:bg-selah-700 rounded-lg transition-colors"
            >
              Clear filter
            </button>
          )}
        </div>
      )}
    </div>
  );
}
