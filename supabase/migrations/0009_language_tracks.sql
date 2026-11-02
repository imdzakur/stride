-- supabase/migrations/0009_language_tracks.sql
-- The Languages group now holds four tracks: English, Mandarin, Malay, and Japanese.
-- They replace the single lang track from 0008. Postgres cannot drop an enum value, so lang
-- stays in track_key unused; the app reads only the tracks it knows.
-- Each value is added only if it is missing, so a rerun is harmless.
alter type public.track_key add value if not exists 'english';
alter type public.track_key add value if not exists 'mandarin';
alter type public.track_key add value if not exists 'malay';
alter type public.track_key add value if not exists 'japanese';
