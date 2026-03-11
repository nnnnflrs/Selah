"use client";

import { useState, useRef, useEffect, useCallback } from "react";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

interface Suggestion {
  id: string;
  place_name: string;
  center: [number, number]; // [lng, lat]
}

interface LocationAutocompleteProps {
  value: string;
  onChange: (text: string) => void;
  onSelect: (place: string, lat: number, lng: number) => void;
}

export function LocationAutocomplete({
  value,
  onChange,
  onSelect,
}: LocationAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const fetchSuggestions = useCallback(async (query: string) => {
    if (!query || query.length < 2 || !MAPBOX_TOKEN) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    try {
      const res = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${MAPBOX_TOKEN}&limit=5&types=place,locality,neighborhood,district,region,country`
      );
      if (!res.ok) return;
      const data = await res.json();
      const results: Suggestion[] = (data.features || []).map(
        (f: { id: string; place_name: string; center: [number, number] }) => ({
          id: f.id,
          place_name: f.place_name,
          center: f.center,
        })
      );
      setSuggestions(results);
      setIsOpen(results.length > 0);
      setActiveIndex(-1);
    } catch {
      // silently ignore
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    onChange(text);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(text), 300);
  };

  const handleSelect = (suggestion: Suggestion) => {
    const [lng, lat] = suggestion.center;
    onSelect(suggestion.place_name, lat, lng);
    setSuggestions([]);
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && activeIndex >= 0) {
      e.preventDefault();
      handleSelect(suggestions[activeIndex]);
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Cleanup debounce
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <input
        type="text"
        value={value}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={() => suggestions.length > 0 && setIsOpen(true)}
        placeholder="Search for a place (e.g. Brooklyn, NY)"
        maxLength={100}
        className="
          w-full px-3 py-2 rounded-lg text-sm
          bg-selah-800 border border-selah-600
          text-white placeholder-selah-500
          focus:outline-none focus:border-selah-400 focus:ring-1 focus:ring-selah-400
          transition-colors duration-150
        "
      />

      {isOpen && suggestions.length > 0 && (
        <ul className="absolute z-50 mt-1 w-full rounded-lg border border-selah-600 bg-selah-800/95 backdrop-blur-sm shadow-lg overflow-hidden">
          {suggestions.map((s, i) => (
            <li
              key={s.id}
              className={`
                px-3 py-2 text-sm cursor-pointer transition-colors
                ${i === activeIndex ? "bg-selah-600 text-white" : "text-selah-300 hover:bg-selah-700 hover:text-white"}
              `}
              onMouseEnter={() => setActiveIndex(i)}
              onClick={() => handleSelect(s)}
            >
              {s.place_name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
