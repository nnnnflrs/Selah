import { z } from "zod/v4";
import { EMOTION_LIST, MAX_COMMENT_LENGTH, MAX_NAME_LENGTH } from "./constants";

export const boundsSchema = z.object({
  north: z.number().min(-90).max(90),
  south: z.number().min(-90).max(90),
  east: z.number().min(-180).max(180),
  west: z.number().min(-180).max(180),
});

export const recordingMetadataSchema = z.object({
  anonymous_name: z.string().min(1).max(MAX_NAME_LENGTH).trim(),
  emotion: z.enum(EMOTION_LIST as [string, ...string[]]),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  location_text: z.string().max(100).trim().optional().default(""),
  duration: z.number().int().min(1).max(120),
  device_fingerprint: z.string().min(1).max(128).regex(/^[a-zA-Z0-9_-]+$/),
});

export const recordingMetadataSchemaV2 = z.object({
  emotion: z.enum(EMOTION_LIST as [string, ...string[]]),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  location_text: z.string().max(100).trim().optional().default(""),
  duration: z.number().int().min(1).max(120),
  is_public: z.boolean().default(true),
  local_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export const togglePublicSchema = z.object({
  is_public: z.boolean(),
});

export const commentInsertSchema = z.object({
  content: z.string().min(1).max(MAX_COMMENT_LENGTH).trim(),
  anonymous_name: z.string().min(1).max(MAX_NAME_LENGTH).trim(),
});

export const uuidSchema = z.string().uuid();
