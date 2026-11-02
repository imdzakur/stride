-- supabase/migrations/0006_more_tracks.sql
-- Adds two practice tracks: Development and Operations (devops) and Data Engineering (dataeng).
-- The app lists them already; this is only needed before adding topics to them.
-- Each value is added only if it is missing, so a rerun is harmless.
alter type public.track_key add value if not exists 'devops';
alter type public.track_key add value if not exists 'dataeng';
