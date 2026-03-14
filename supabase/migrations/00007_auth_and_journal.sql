-- Add public/private and anonymous_id support for journal feature
ALTER TABLE recordings ADD COLUMN is_public BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE recordings ADD COLUMN anonymous_id TEXT;

-- Index for journal page (user's recordings, newest first)
CREATE INDEX idx_recordings_user_created ON recordings(user_id, created_at DESC);
