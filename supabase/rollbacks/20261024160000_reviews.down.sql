-- Undoes 20261024160000_reviews.sql. This deletes every review request and review: export them first if you want to keep them.
drop function if exists public.reviews_public(text);
drop function if exists public.review_google_clicked(text, text);
drop function if exists public.review_submit(text, text, integer, text, text, text, boolean);
drop function if exists public.review_open(text, text);
drop function if exists public.set_review_setting(text, text);
drop function if exists public.review_decide(uuid, text, boolean);
drop function if exists public.ensure_review_request(uuid);
drop table if exists public.reviews;
drop table if exists public.review_requests;
drop table if exists public.review_settings;
