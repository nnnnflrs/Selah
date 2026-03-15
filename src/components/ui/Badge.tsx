import { EMOTIONS } from "@/lib/constants";
import { Emotion } from "@/types/emotion";
import styles from "./Badge.module.css";

interface BadgeProps {
  emotion: Emotion;
}

export function Badge({ emotion }: BadgeProps) {
  const config = EMOTIONS[emotion];

  return (
    <span
      className={styles.badge}
      style={{
        backgroundColor: `${config.color}15`,
        color: config.color,
        border: `1px solid ${config.color}30`,
      }}
    >
      <span
        className={styles.dot}
        style={{ backgroundColor: config.color }}
      />
      {config.label}
    </span>
  );
}
