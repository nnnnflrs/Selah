-- Selah Database Schema

-- Emotion enum
CREATE TYPE public.emotion AS ENUM (
  'happy', 'sad', 'anxious', 'grateful', 'frustrated', 'sleepless', 'hopeful', 'nostalgic'
);

-- Recordings table
CREATE TABLE public.recordings (
  id             UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id        UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  anonymous_name TEXT NOT NULL DEFAULT '',
  emotion        public.emotion NOT NULL,
  audio_url      TEXT NOT NULL,
  latitude       DOUBLE PRECISION NOT NULL,
  longitude      DOUBLE PRECISION NOT NULL,
  location_text  TEXT DEFAULT '',
  duration       INTEGER NOT NULL CHECK (duration > 0 AND duration <= 120),
  is_approved    BOOLEAN NOT NULL DEFAULT TRUE,
  reports_count  INTEGER NOT NULL DEFAULT 0 CHECK (reports_count >= 0),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Comments table
CREATE TABLE public.comments (
  id             UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  recording_id   UUID NOT NULL REFERENCES public.recordings(id) ON DELETE CASCADE,
  user_id        UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  anonymous_name TEXT NOT NULL DEFAULT '',
  content        TEXT NOT NULL CHECK (char_length(content) > 0 AND char_length(content) <= 500),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Reports table
CREATE TABLE public.reports (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  recording_id  UUID NOT NULL REFERENCES public.recordings(id) ON DELETE CASCADE,
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_user_recording_report UNIQUE (user_id, recording_id)
);

-- Rate limits table
CREATE TABLE public.rate_limits (
  id                 UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  device_fingerprint TEXT NOT NULL,
  user_id            UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  last_recording_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_device_user UNIQUE (device_fingerprint, user_id)
);

-- Indexes
CREATE INDEX idx_recordings_location ON public.recordings (latitude, longitude);
CREATE INDEX idx_recordings_approved ON public.recordings (is_approved, reports_count);
CREATE INDEX idx_recordings_created_at ON public.recordings (created_at DESC);
CREATE INDEX idx_comments_recording ON public.comments (recording_id, created_at DESC);
CREATE INDEX idx_reports_recording ON public.reports (recording_id);
CREATE INDEX idx_rate_limits_device ON public.rate_limits (device_fingerprint);

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.comments;

-- RLS: Recordings
ALTER TABLE public.recordings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select_approved" ON public.recordings
  FOR SELECT USING (is_approved = TRUE AND reports_count <= 5);

CREATE POLICY "insert_own" ON public.recordings
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- RLS: Comments
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select_comments" ON public.comments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.recordings r
      WHERE r.id = recording_id AND r.is_approved = TRUE AND r.reports_count <= 5
    )
  );

CREATE POLICY "insert_comments" ON public.comments
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- RLS: Reports
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "insert_report" ON public.reports
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "select_own_reports" ON public.reports
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- RLS: Rate limits (no direct access)
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- Database functions
CREATE OR REPLACE FUNCTION public.increment_reports_count(target_recording_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE recordings
  SET reports_count = reports_count + 1
  WHERE id = target_recording_id;

  UPDATE recordings
  SET is_approved = FALSE
  WHERE id = target_recording_id
    AND reports_count > 5;
END;
$$;

CREATE OR REPLACE FUNCTION public.check_rate_limit(p_fingerprint TEXT, p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  last_time TIMESTAMPTZ;
BEGIN
  SELECT last_recording_at INTO last_time
  FROM rate_limits
  WHERE device_fingerprint = p_fingerprint OR user_id = p_user_id
  ORDER BY last_recording_at DESC
  LIMIT 1;

  IF last_time IS NULL THEN
    RETURN TRUE;
  END IF;

  RETURN (NOW() - last_time) > INTERVAL '6 hours';
END;
$$;

CREATE OR REPLACE FUNCTION public.upsert_rate_limit(p_fingerprint TEXT, p_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO rate_limits (device_fingerprint, user_id, last_recording_at)
  VALUES (p_fingerprint, p_user_id, NOW())
  ON CONFLICT (device_fingerprint, user_id)
  DO UPDATE SET last_recording_at = NOW();
END;
$$;

-- Storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'recordings',
  'recordings',
  TRUE,
  10485760,
  ARRAY['audio/webm', 'audio/ogg', 'audio/mp4', 'audio/mpeg', 'audio/wav']
);

-- Storage RLS
CREATE POLICY "storage_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'recordings');

CREATE POLICY "storage_upload" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'recordings'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
