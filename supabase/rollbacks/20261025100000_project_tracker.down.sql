-- Undoes 20261025100000_project_tracker.sql. Deletes every tracker link and note.
drop function if exists public.project_tracker_open(text, text);
drop function if exists public.set_project_tracker(uuid, date, text);
drop function if exists public.ensure_project_tracker(uuid);
drop table if exists public.project_trackers;
