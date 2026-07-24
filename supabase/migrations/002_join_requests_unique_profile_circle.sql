-- Ensure join requests are unique per member + Circle.
-- Safe / idempotent: does not drop data; no-op when the constraint already exists.
-- Aligns app behavior with the schema from 001_circle_match_schema.sql.

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'join_requests_profile_id_circle_id_key'
      and conrelid = 'public.join_requests'::regclass
  ) and not exists (
    select 1
    from pg_indexes
    where schemaname = 'public'
      and indexname = 'join_requests_profile_circle_uidx'
  ) then
    create unique index join_requests_profile_circle_uidx
      on public.join_requests (profile_id, circle_id);
  end if;
end $$;

comment on table public.join_requests is
  'Member join requests. Unique on (profile_id, circle_id). Demo seed uses a fixed profile; no auth provider in this assignment.';
