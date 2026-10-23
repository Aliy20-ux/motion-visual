-- Undo 20261022120000_add_web_quotes.sql.
-- WARNING: this DELETES every website quote and brief. Export them first:
--   copy (select * from public.web_quotes) to stdout with csv header;
-- Run 20261022130000_web_quotes_retention.down.sql first if the retention migration was applied.
drop function if exists public.web_quote_brief_submit(text, text, jsonb);
drop function if exists public.web_quote_brief_open(text, text);
drop function if exists public.web_quote_mark_email(text, text, boolean);
drop function if exists public.web_quote_create(text, text, text, text, text, text, text, text, integer, text[], jsonb, integer, integer, integer, date, date);
drop table if exists public.web_quotes cascade;
drop function if exists public.web_quotes_touch();
drop sequence if exists public.web_quote_seq;
-- agreement_server_key_ok() belongs to the agreements migration and is left in place.
