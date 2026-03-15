"use client";

import { EMOTIONS, EMOTION_LIST } from "@/lib/constants";
import { Emotion } from "@/types/emotion";
import styles from "./EmotionSelector.module.css";

interface EmotionSelectorProps {
  value: Emotion | null;
  onChange: (emotion: Emotion) => void;
}

export function EmotionSelector({ value, onChange }: EmotionSelectorProps) {
  return (
    <div className={styles.container}>
      <label className={styles.label}>
        How are you feeling?
      </label>
      <div className={styles.grid}>
        {EMOTION_LIST.map((emotion) => {
          const config = EMOTIONS[emotion];
          const isSelected = value === emotion;

          return (
            <button
              key={emotion}
              type="button"
              onClick={() => onChange(emotion)}
              className={isSelected ? styles.buttonSelected : styles.button}
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
                className={styles.dot}
                style={{ backgroundColor: config.color }}
              />
              <span
                className={isSelected ? styles.labelTextSelected : styles.labelText}
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
