-- COCO Supabase Schema
-- Run this in the Supabase SQL editor

-- Extensions
create extension if not exists "pgcrypto";

-- Custom types
do $$ begin
  create type user_role as enum ('customer', 'worker', 'admin');
exception when duplicate_object then null; end $$;

do $$ begin
  create type request_status as enum (
    'new', 'unassigned', 'assigned', 'on_the_way', 'arrived',
    'in_progress', 'completed', 'cancelled', 'confirmed'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type job_status as enum (
    'assigned', 'on_the_way', 'arrived', 'in_progress', 'completed'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type payment_status as enum ('pending', 'paid', 'failed', 'refunded');
exception when duplicate_object then null; end $$;

do $$ begin
  create type availability_status as enum ('available', 'busy', 'off');
exception when duplicate_object then null; end $$;

-- Users (extends auth.users)
create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  phone text,
  email text,
  role user_role not null default 'customer',
  profile_image text,
  rating numeric(3,2),
  created_at timestamptz not null default now()
);

create table if not exists public.properties (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.users(id) on delete cascade,
  name text not null,
  address text not null,
  city text,
  state text,
  latitude double precision not null,
  longitude double precision not null,
  tree_count integer not null default 0,
  last_service_date date,
  created_at timestamptz not null default now()
);

create table if not exists public.service_requests (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.users(id) on delete cascade,
  property_id uuid not null references public.properties(id) on delete restrict,
  service_type text not null default 'coconut_plucking',
  tree_count integer not null,
  preferred_date date not null,
  preferred_time time not null,
  status request_status not null default 'unassigned',
  assigned_worker_id uuid references public.users(id),
  estimated_price numeric(10,2) not null,
  final_price numeric(10,2),
  notes text,
  trees_completed integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.jobs (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null unique references public.service_requests(id) on delete cascade,
  worker_id uuid not null references public.users(id),
  status job_status not null default 'assigned',
  started_at timestamptz,
  completed_at timestamptz,
  completion_notes text,
  trees_completed integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.job_photos (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.jobs(id) on delete cascade,
  photo_url text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.service_requests(id) on delete cascade,
  amount numeric(10,2) not null,
  status payment_status not null default 'pending',
  payment_method text,
  paid_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null unique references public.service_requests(id) on delete cascade,
  customer_id uuid not null references public.users(id),
  worker_id uuid not null references public.users(id),
  rating integer not null check (rating between 1 and 5),
  comment text,
  created_at timestamptz not null default now()
);

create table if not exists public.worker_availability (
  id uuid primary key default gen_random_uuid(),
  worker_id uuid not null references public.users(id) on delete cascade,
  date date not null,
  start_time time not null,
  end_time time not null,
  status availability_status not null default 'available'
);

create table if not exists public.pricing_config (
  id uuid primary key default gen_random_uuid(),
  service_type text not null unique,
  base_price numeric(10,2) not null,
  per_tree_price numeric(10,2) not null,
  currency text not null default 'INR',
  updated_at timestamptz not null default now()
);

insert into public.pricing_config (service_type, base_price, per_tree_price)
values ('coconut_plucking', 200, 150)
on conflict (service_type) do nothing;

-- Indexes
create index if not exists idx_properties_customer on public.properties(customer_id);
create index if not exists idx_requests_customer on public.service_requests(customer_id);
create index if not exists idx_requests_worker on public.service_requests(assigned_worker_id);
create index if not exists idx_requests_status on public.service_requests(status);
create index if not exists idx_jobs_worker on public.jobs(worker_id);
create index if not exists idx_jobs_request on public.jobs(request_id);

-- Updated_at trigger
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_requests_updated on public.service_requests;
create trigger trg_requests_updated
  before update on public.service_requests
  for each row execute function public.set_updated_at();

drop trigger if exists trg_jobs_updated on public.jobs;
create trigger trg_jobs_updated
  before update on public.jobs
  for each row execute function public.set_updated_at();

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, name, email, phone, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.email,
    new.raw_user_meta_data->>'phone',
    coalesce((new.raw_user_meta_data->>'role')::user_role, 'customer')
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Enable realtime
alter publication supabase_realtime add table public.service_requests;
alter publication supabase_realtime add table public.jobs;
