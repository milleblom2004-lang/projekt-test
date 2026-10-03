-- HatSpotted initial schema
-- Tables: users, sightings, reports (+ storage bucket "sightings").
--
-- Security model:
--   * Everyone (anon) can read visible sightings and public display names.
--   * E-mail and role are never readable through the public API; a user reads
--     their own profile through the get_my_profile() function.
--   * All writes to sightings/reports and all storage uploads go through the
--     Next.js server (service role) so file type/size, rate limits and
--     ownership are validated there. Clients have no direct write grants.
--   * Users may update only their own display_name/language directly.

create extension if not exists citext;

-- ---------------------------------------------------------------------------
-- users
-- ---------------------------------------------------------------------------
create table public.users (
  id           uuid primary key references auth.users (id) on delete cascade,
  display_name citext unique
               check (display_name is null or char_length(display_name) between 2 and 30),
  email        text not null,
  created_at   timestamptz not null default now(),
  role         text not null default 'user' check (role in ('user', 'admin')),
  language     text not null default 'en' check (char_length(language) between 2 and 10),
  -- moderation state (set by an admin when banning a user)
  banned_at    timestamptz
);

-- ---------------------------------------------------------------------------
-- sightings
-- ---------------------------------------------------------------------------
create table public.sightings (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references public.users (id) on delete cascade,
  image_url        text not null,
  latitude         double precision not null check (latitude between -90 and 90),
  longitude        double precision not null check (longitude between -180 and 180),
  place_name       text check (place_name is null or char_length(place_name) <= 200),
  country          text check (country is null or country ~ '^[A-Z]{2}$'), -- ISO 3166-1 alpha-2
  sighted_at       timestamptz not null,
  description      text check (description is null or char_length(description) <= 280),
  created_at       timestamptz not null default now(),
  hidden           boolean not null default false,
  consent_given_at timestamptz not null
);

create index sightings_created_at_idx on public.sightings (created_at desc);
create index sightings_sighted_at_idx on public.sightings (sighted_at desc);
create index sightings_user_idx on public.sightings (user_id, created_at desc);
create index sightings_country_idx on public.sightings (country);

-- ---------------------------------------------------------------------------
-- reports
-- ---------------------------------------------------------------------------
create table public.reports (
  id          uuid primary key default gen_random_uuid(),
  sighting_id uuid not null references public.sightings (id) on delete cascade,
  user_id     uuid not null references public.users (id) on delete cascade,
  reason      text not null check (char_length(reason) between 1 and 500),
  created_at  timestamptz not null default now(),
  unique (sighting_id, user_id)
);

create index reports_created_at_idx on public.reports (created_at desc);

-- ---------------------------------------------------------------------------
-- helpers
-- ---------------------------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.users where id = auth.uid() and role = 'admin'
  );
$$;

-- Own profile, including private fields (email, role, language).
create or replace function public.get_my_profile()
returns table (
  id uuid, display_name text, email text, created_at timestamptz,
  role text, language text, banned_at timestamptz
)
language sql stable security definer set search_path = ''
as $$
  select u.id, u.display_name::text, u.email, u.created_at, u.role, u.language, u.banned_at
  from public.users u where u.id = auth.uid();
$$;

-- Distinct countries that have visible sightings (for the feed filter).
create or replace function public.sighting_countries()
returns table (country text, sightings bigint)
language sql stable
as $$
  select s.country, count(*) from public.sightings s
  where s.country is not null and s.hidden = false
  group by s.country order by count(*) desc;
$$;

-- Create a profile row when someone signs up.
create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  insert into public.users (id, email, language)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(left(new.raw_user_meta_data ->> 'language', 10), 'en')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_auth_user();

-- Keep the stored e-mail in sync if the user changes it in auth.
create or replace function public.handle_auth_user_email_change()
returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  update public.users set email = coalesce(new.email, '') where id = new.id;
  return new;
end;
$$;

create trigger on_auth_user_email_changed
  after update of email on auth.users
  for each row when (old.email is distinct from new.email)
  execute function public.handle_auth_user_email_change();

-- Rate limit backstop (the API checks first and returns a friendly error).
create or replace function public.enforce_sighting_rate_limit()
returns trigger
language plpgsql
as $$
begin
  if (select count(*) from public.sightings
      where user_id = new.user_id and created_at > now() - interval '1 hour') >= 10 then
    raise exception 'rate_limited' using errcode = 'P0001';
  end if;
  if (select count(*) from public.sightings
      where user_id = new.user_id and created_at > now() - interval '1 day') >= 30 then
    raise exception 'rate_limited' using errcode = 'P0001';
  end if;
  return new;
end;
$$;

create trigger sightings_rate_limit
  before insert on public.sightings
  for each row execute function public.enforce_sighting_rate_limit();

create or replace function public.enforce_report_rate_limit()
returns trigger
language plpgsql
as $$
begin
  if (select count(*) from public.reports
      where user_id = new.user_id and created_at > now() - interval '1 hour') >= 20 then
    raise exception 'rate_limited' using errcode = 'P0001';
  end if;
  return new;
end;
$$;

create trigger reports_rate_limit
  before insert on public.reports
  for each row execute function public.enforce_report_rate_limit();

-- ---------------------------------------------------------------------------
-- Row level security & grants
-- ---------------------------------------------------------------------------
alter table public.users enable row level security;
alter table public.sightings enable row level security;
alter table public.reports enable row level security;

-- users: only id + display_name are public; e-mail/role never leave the DB
revoke all on public.users from anon, authenticated;
grant select (id, display_name, created_at) on public.users to anon, authenticated;
grant update (display_name, language) on public.users to authenticated;

create policy "Public display names are readable"
  on public.users for select using (true);

create policy "Users update their own profile"
  on public.users for update
  using (id = auth.uid()) with check (id = auth.uid());

-- sightings: read-only for clients
revoke all on public.sightings from anon, authenticated;
grant select on public.sightings to anon, authenticated;

create policy "Visible sightings are public; owners and admins see hidden ones"
  on public.sightings for select
  using (hidden = false or user_id = auth.uid() or public.is_admin());

-- reports: only admins can read; written by the server
revoke all on public.reports from anon, authenticated;
grant select on public.reports to authenticated;

create policy "Admins read reports"
  on public.reports for select using (public.is_admin());

revoke all on function public.get_my_profile() from public, anon;
grant execute on function public.get_my_profile() to authenticated;
grant execute on function public.sighting_countries() to anon, authenticated;
grant execute on function public.is_admin() to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Storage: public-read bucket, writes only through the server (service role)
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('sightings', 'sightings', true, 10485760, array['image/jpeg'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- No insert/update/delete policies for anon/authenticated on this bucket:
-- the service role bypasses RLS and is only used server-side after validation.
