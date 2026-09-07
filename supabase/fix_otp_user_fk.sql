-- Fix OTP foreign key: otp_sessions.user_id must not point at old public.users
-- (KeraGo uses app_users). Run once in Supabase → SQL Editor → Run.

-- Drop any FK on otp_sessions.user_id (name may vary)
do $$
declare
  r record;
begin
  for r in
    select con.conname
    from pg_constraint con
    join pg_class rel on rel.oid = con.conrelid
    join pg_namespace nsp on nsp.oid = rel.relnamespace
    where nsp.nspname = 'public'
      and rel.relname = 'otp_sessions'
      and con.contype = 'f'
      and pg_get_constraintdef(con.oid) ilike '%user_id%'
  loop
    execute format('alter table public.otp_sessions drop constraint if exists %I', r.conname);
  end loop;
end $$;

-- Ensure app_users exists (KeraGo live users)
do $$ begin
  create type user_role as enum ('customer', 'worker', 'admin');
exception when duplicate_object then null; end $$;

create table if not exists public.app_users (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,
  phone_display text,
  email text,
  role user_role not null default 'customer',
  profile_image text,
  rating numeric(3,2),
  created_at timestamptz not null default now(),
  unique (phone, role)
);

alter table public.app_users enable row level security;
drop policy if exists app_users_all on public.app_users;
create policy app_users_all on public.app_users for all using (true) with check (true);

-- Optional soft link to app_users (null allowed). OTP works even if user row is missing.
alter table public.otp_sessions
  add constraint otp_sessions_user_id_fkey
  foreign key (user_id) references public.app_users(id) on delete set null;

-- Keep OTP open for anon key
alter table public.otp_sessions enable row level security;
drop policy if exists otp_sessions_all on public.otp_sessions;
create policy otp_sessions_all on public.otp_sessions
  for all using (true) with check (true);
