-- supabase/migrations/0008_languages_track.sql
-- Adds the Languages practice track (lang), for topics such as English or Japanese.
-- The app lists it already; this is only needed before adding topics to it.
-- The value is added only if it is missing, so a rerun is harmless.
alter type public.track_key add value if not exists 'lang';
