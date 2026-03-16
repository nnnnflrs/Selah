import { Emotion, EmotionConfig } from "@/types/emotion";

export const MAX_DURATION = 120;
export const MAX_AUDIO_SIZE = 10 * 1024 * 1024; // 10MB
export const MAX_COMMENT_LENGTH = 500;
export const MAX_NAME_LENGTH = 50;
export const REPORTS_THRESHOLD = 5;
export const RATE_LIMIT_HOURS = 1;
export const DAILY_RECORDING_LIMIT = 1;
export const COMMENTS_PAGE_SIZE = 20;
export const RECORDINGS_PAGE_SIZE = 100;

export const EMOTIONS: Record<Emotion, EmotionConfig> = {
  happy: { label: "Happy", color: "#FFD700" },
  sad: { label: "Sad", color: "#4169E1" },
  anxious: { label: "Anxious", color: "#9932CC" },
  grateful: { label: "Grateful", color: "#00CED1" },
  frustrated: { label: "Frustrated", color: "#DC143C" },
  sleepless: { label: "Sleepless", color: "#6A5ACD" },
  hopeful: { label: "Hopeful", color: "#98FB98" },
  nostalgic: { label: "Nostalgic", color: "#DEB887" },
};

export const EMOTION_LIST = Object.keys(EMOTIONS) as Emotion[];

export const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"];
export const MAX_IMAGE_DIMENSION = 1200; // px — longest side after resize
export const IMAGE_QUALITY = 85; // JPEG quality (0-100)

export const ALLOWED_AUDIO_TYPES = [
  "audio/webm",
  "audio/ogg",
  "audio/mp4",
  "audio/mpeg",
  "audio/wav",
];

// Map / Globe
export const MAPBOX_STYLE = process.env.NEXT_PUBLIC_MAPBOX_STYLE || "mapbox://styles/mapbox/dark-v11";
export const DEFAULT_MAP_CENTER: [number, number] = [0, 20]; // [lng, lat]
export const DEFAULT_MAP_ZOOM = 1.5;
export const MAP_MIN_ZOOM = 1;
export const MAP_MAX_ZOOM = 18;
export const MAP_AUTO_ROTATE_SPEED = 0.03; // degrees per frame
