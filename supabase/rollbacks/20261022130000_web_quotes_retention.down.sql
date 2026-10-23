-- Undo 20261022130000_web_quotes_retention.sql. Loses the purge log (counts only).
drop function if exists public.web_quotes_purge(integer, integer, boolean);
drop function if exists public.web_quote_financial_year_end(date, integer, integer);
drop table if exists public.web_quote_retention_log;
