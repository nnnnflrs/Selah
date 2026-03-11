"use client";

import { DatePicker } from "./DatePicker";

export function Header() {
  return (
    <header className="absolute top-0 left-0 right-0 z-[1000] pointer-events-none">
      <div className="flex items-center justify-between p-4 pointer-events-auto max-w-screen-2xl mx-auto">
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full animate-pulse-glow"
            style={
              {
                "--glow-color": "#00f0ff",
                backgroundColor: "#00f0ff",
                boxShadow: "0 0 8px 2px #00f0ff",
              } as React.CSSProperties
            }
          />
          <h1 className="text-lg font-medium text-white tracking-wide">
            Selah
          </h1>
        </div>
        <DatePicker />
      </div>
    </header>
  );
}
