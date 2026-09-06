-- KeraGo live data — FIXED for existing app_users (uuid ids)
-- Run this whole file in Supabase → SQL Editor → Run
-- Safe to re-run.

do $$ begin
  create type user_role as enum ('customer', 'worker', 'admin');
exception when duplicate_object then null; end $$;

-- Profiles (matches fix_otp_rls.sql: uuid primary key)
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

alter table public.app_users add column if not exists bank jsonb default '{}'::jsonb;
alter table public.app_users add column if not exists upi text;
alter table public.app_users add column if not exists gpay_image text;
alter table public.app_users add column if not exists phone_display text;
alter table public.app_users add column if not exists updated_at timestamptz default now();

-- Drop half-created tables from the failed text-id migration (if any)
drop table if exists public.notifications cascade;
drop table if exists public.chat_messages cascade;
drop table if exists public.reviews cascade;
drop table if exists public.job_photos cascade;
drop table if exists public.payments cascade;
drop table if exists public.jobs cascade;
drop table if exists public.service_requests cascade;
drop table if exists public.properties cascade;

create table public.properties (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.app_users(id) on delete cascade,
  name text not null,
  address text not null,
  city text,
  state text,
  pincode text,
  latitude double precision not null default 0,
  longitude double precision not null default 0,
  tree_count integer not null default 0,
  last_service_date date,
  created_at timestamptz not null default now()
);

create table public.service_requests (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.app_users(id) on delete cascade,
  property_id uuid not null references public.properties(id) on delete restrict,
  service_type text not null default 'coconut_plucking',
  tree_count integer not null default 1,
  preferred_date date,
  preferred_time text,
  status text not null default 'unassigned',
  assigned_worker_id uuid references public.app_users(id),
  estimated_price numeric(10,2) not null default 0,
  final_price numeric(10,2),
  notes text,
  trees_completed integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.jobs (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null unique references public.service_requests(id) on delete cascade,
  worker_id uuid not null references public.app_users(id),
  status text not null default 'assigned',
  started_at timestamptz,
  completed_at timestamptz,
  completion_notes text,
  trees_completed integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.job_photos (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.jobs(id) on delete cascade,
  photo_url text not null,
  created_at timestamptz not null default now()
);

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.service_requests(id) on delete cascade,
  amount numeric(10,2) not null,
  status text not null default 'pending',
  payment_method text,
  paid_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null unique references public.service_requests(id) on delete cascade,
  customer_id uuid not null references public.app_users(id),
  worker_id uuid not null references public.app_users(id),
  rating integer not null check (rating between 1 and 5),
  comment text,
  created_at timestamptz not null default now()
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.app_users(id) on delete cascade,
  title text not null,
  body text,
  href text,
  type text,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  thread_id text not null,
  from_user_id uuid not null references public.app_users(id) on delete cascade,
  from_role user_role not null,
  body text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_props_customer on public.properties(customer_id);
create index if not exists idx_req_customer on public.service_requests(customer_id);
create index if not exists idx_req_status on public.service_requests(status);
create index if not exists idx_jobs_worker on public.jobs(worker_id);
create index if not exists idx_notif_user on public.notifications(user_id, created_at desc);
create index if not exists idx_chat_thread on public.chat_messages(thread_id, created_at);

alter table public.app_users enable row level security;
alter table public.properties enable row level security;
alter table public.service_requests enable row level security;
alter table public.jobs enable row level security;
alter table public.job_photos enable row level security;
alter table public.payments enable row level security;
alter table public.reviews enable row level security;
alter table public.notifications enable row level security;
alter table public.chat_messages enable row level security;

drop policy if exists app_users_all on public.app_users;
drop policy if exists properties_all on public.properties;
drop policy if exists service_requests_all on public.service_requests;
drop policy if exists jobs_all on public.jobs;
drop policy if exists job_photos_all on public.job_photos;
drop policy if exists payments_all on public.payments;
drop policy if exists reviews_all on public.reviews;
drop policy if exists notifications_all on public.notifications;
drop policy if exists chat_messages_all on public.chat_messages;

create policy app_users_all on public.app_users for all using (true) with check (true);
create policy properties_all on public.properties for all using (true) with check (true);
create policy service_requests_all on public.service_requests for all using (true) with check (true);
create policy jobs_all on public.jobs for all using (true) with check (true);
create policy job_photos_all on public.job_photos for all using (true) with check (true);
create policy payments_all on public.payments for all using (true) with check (true);
create policy reviews_all on public.reviews for all using (true) with check (true);
create policy notifications_all on public.notifications for all using (true) with check (true);
create policy chat_messages_all on public.chat_messages for all using (true) with check (true);

do $$ begin
  alter publication supabase_realtime add table public.service_requests;
exception when duplicate_object then null; when undefined_object then null; end $$;
do $$ begin
  alter publication supabase_realtime add table public.jobs;
exception when duplicate_object then null; when undefined_object then null; end $$;
do $$ begin
  alter publication supabase_realtime add table public.notifications;
exception when duplicate_object then null; when undefined_object then null; end $$;
do $$ begin
  alter publication supabase_realtime add table public.chat_messages;
exception when duplicate_object then null; when undefined_object then null; end $$;
