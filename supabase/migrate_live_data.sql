-- KeraGo live data (run in Supabase → SQL Editor → Run)
-- Collects users, bookings, jobs, payments, chat, notifications.
-- Uses text IDs so the app can keep working without Supabase Auth.

do $$ begin
  create type user_role as enum ('customer', 'worker', 'admin');
exception when duplicate_object then null; end $$;

-- Profiles (WhatsApp OTP users)
create table if not exists public.app_users (
  id text primary key,
  name text not null,
  phone text not null,
  phone_display text,
  email text,
  role user_role not null default 'customer',
  profile_image text,
  rating numeric(3,2),
  bank jsonb default '{}'::jsonb,
  upi text,
  gpay_image text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (phone, role)
);

alter table public.app_users add column if not exists bank jsonb default '{}'::jsonb;
alter table public.app_users add column if not exists upi text;
alter table public.app_users add column if not exists gpay_image text;
alter table public.app_users add column if not exists phone_display text;
alter table public.app_users add column if not exists updated_at timestamptz not null default now();

create table if not exists public.properties (
  id text primary key,
  customer_id text not null references public.app_users(id) on delete cascade,
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

create table if not exists public.service_requests (
  id text primary key,
  customer_id text not null references public.app_users(id) on delete cascade,
  property_id text not null references public.properties(id) on delete restrict,
  service_type text not null default 'coconut_plucking',
  tree_count integer not null default 1,
  preferred_date date,
  preferred_time text,
  status text not null default 'unassigned',
  assigned_worker_id text references public.app_users(id),
  estimated_price numeric(10,2) not null default 0,
  final_price numeric(10,2),
  notes text,
  trees_completed integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.jobs (
  id text primary key,
  request_id text not null unique references public.service_requests(id) on delete cascade,
  worker_id text not null references public.app_users(id),
  status text not null default 'assigned',
  started_at timestamptz,
  completed_at timestamptz,
  completion_notes text,
  trees_completed integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.job_photos (
  id text primary key,
  job_id text not null references public.jobs(id) on delete cascade,
  photo_url text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.payments (
  id text primary key,
  request_id text not null references public.service_requests(id) on delete cascade,
  amount numeric(10,2) not null,
  status text not null default 'pending',
  payment_method text,
  paid_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.reviews (
  id text primary key,
  request_id text not null unique references public.service_requests(id) on delete cascade,
  customer_id text not null references public.app_users(id),
  worker_id text not null references public.app_users(id),
  rating integer not null check (rating between 1 and 5),
  comment text,
  created_at timestamptz not null default now()
);

create table if not exists public.notifications (
  id text primary key,
  user_id text not null references public.app_users(id) on delete cascade,
  title text not null,
  body text,
  href text,
  type text,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.chat_messages (
  id text primary key,
  thread_id text not null,
  from_user_id text not null references public.app_users(id) on delete cascade,
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

-- Open RLS for WhatsApp-OTP app (anon key, no Supabase Auth session)
alter table public.app_users enable row level security;
alter table public.properties enable row level security;
alter table public.service_requests enable row level security;
alter table public.jobs enable row level security;
alter table public.job_photos enable row level security;
alter table public.payments enable row level security;
alter table public.reviews enable row level security;
alter table public.notifications enable row level security;
alter table public.chat_messages enable row level security;

do $$ begin
  create policy app_users_all on public.app_users for all using (true) with check (true);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy properties_all on public.properties for all using (true) with check (true);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy service_requests_all on public.service_requests for all using (true) with check (true);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy jobs_all on public.jobs for all using (true) with check (true);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy job_photos_all on public.job_photos for all using (true) with check (true);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy payments_all on public.payments for all using (true) with check (true);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy reviews_all on public.reviews for all using (true) with check (true);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy notifications_all on public.notifications for all using (true) with check (true);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy chat_messages_all on public.chat_messages for all using (true) with check (true);
exception when duplicate_object then null; end $$;

-- Realtime
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
