"use client";

import { EMOTIONS, EMOTION_LIST } from "@/lib/constants";
import { Emotion } from "@/types/emotion";

interface EmotionSelectorProps {
  value: Emotion | null;
  onChange: (emotion: Emotion) => void;
}

export function EmotionSelector({ value, onChange }: EmotionSelectorProps) {
  return (
    <div className="space-y-2">
      <label className="block text-sm text-selah-300">
        How are you feeling?
      </label>
      <div className="grid grid-cols-4 gap-2">
        {EMOTION_LIST.map((emotion) => {
          const config = EMOTIONS[emotion];
          const isSelected = value === emotion;

          return (
            <button
              key={emotion}
              type="button"
              onClick={() => onChange(emotion)}
              className={`
                flex flex-col items-center gap-1.5 p-3 rounded-xl
                border transition-all duration-150 text-xs
                ${
                  isSelected
                    ? "border-opacity-60 scale-105"
                    : "border-selah-600 hover:border-selah-500 bg-selah-800/50"
                }
              `}
              style={
                isSelected
                  ? {
                      borderColor: config.color,
                      backgroundColor: `${config.color}15`,
                      boxShadow: `0 0 12px ${config.color}30`,
                    }
                  : undefined
              }
            >
              <span
                className="w-5 h-5 rounded-full"
                style={{ backgroundColor: config.color }}
              />
              <span
                className={isSelected ? "text-white" : "text-selah-400"}
              >
                {config.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
