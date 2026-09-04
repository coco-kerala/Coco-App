-- FIX: Allow COCO app (anon key) to create & read WhatsApp OTPs
-- Run once in Supabase → SQL Editor → Run

-- Make sure OTP table exists (safe if already there)
do $$ begin
  create type user_role as enum ('customer', 'worker', 'admin');
exception when duplicate_object then null; end $$;

do $$ begin
  create type otp_status as enum ('pending', 'sent', 'verified', 'expired');
exception when duplicate_object then null; end $$;

create table if not exists public.otp_sessions (
  id uuid primary key default gen_random_uuid(),
  phone text not null,
  role user_role not null,
  user_id uuid,
  user_name text,
  otp_code text not null,
  status otp_status not null default 'pending',
  whatsapp_sent_at timestamptz,
  verified_at timestamptz,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null
);

alter table public.otp_sessions add column if not exists phone_display text;

create index if not exists idx_otp_phone_role on public.otp_sessions(phone, role);
create index if not exists idx_otp_status on public.otp_sessions(status);
create index if not exists idx_otp_created on public.otp_sessions(created_at desc);

-- CRITICAL: open RLS for custom WhatsApp OTP admin flow
alter table public.otp_sessions enable row level security;

drop policy if exists otp_sessions_all on public.otp_sessions;
drop policy if exists otp_admin_all on public.otp_sessions;
drop policy if exists otp_insert_public on public.otp_sessions;

create policy otp_sessions_all on public.otp_sessions
  for all
  using (true)
  with check (true);

-- Optional: app_users for profiles (not required for OTP itself)
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
