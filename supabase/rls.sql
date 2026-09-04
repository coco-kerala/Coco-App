-- COCO Row Level Security Policies
-- Run after schema.sql

alter table public.users enable row level security;
alter table public.properties enable row level security;
alter table public.service_requests enable row level security;
alter table public.jobs enable row level security;
alter table public.job_photos enable row level security;
alter table public.payments enable row level security;
alter table public.reviews enable row level security;
alter table public.worker_availability enable row level security;
alter table public.pricing_config enable row level security;

-- Helper: current user role
create or replace function public.current_user_role()
returns user_role as $$
  select role from public.users where id = auth.uid();
$$ language sql stable security definer;

create or replace function public.is_admin()
returns boolean as $$
  select coalesce(public.current_user_role() = 'admin', false);
$$ language sql stable security definer;

-- USERS
drop policy if exists users_select on public.users;
create policy users_select on public.users for select using (
  id = auth.uid()
  or public.is_admin()
  or (
    role = 'worker'
    and exists (
      select 1 from public.service_requests sr
      where sr.customer_id = auth.uid()
        and sr.assigned_worker_id = users.id
    )
  )
);

drop policy if exists users_update_own on public.users;
create policy users_update_own on public.users for update using (
  id = auth.uid() or public.is_admin()
);

drop policy if exists users_admin_all on public.users;
create policy users_admin_all on public.users for all using (public.is_admin());

-- PROPERTIES
drop policy if exists properties_customer_crud on public.properties;
create policy properties_customer_crud on public.properties for all using (
  customer_id = auth.uid() or public.is_admin()
);

drop policy if exists properties_worker_read on public.properties;
create policy properties_worker_read on public.properties for select using (
  exists (
    select 1 from public.service_requests sr
    where sr.property_id = properties.id
      and sr.assigned_worker_id = auth.uid()
  )
);

-- SERVICE REQUESTS
drop policy if exists requests_customer_insert on public.service_requests;
create policy requests_customer_insert on public.service_requests for insert
with check (customer_id = auth.uid());

drop policy if exists requests_customer_select on public.service_requests;
create policy requests_customer_select on public.service_requests for select using (
  customer_id = auth.uid()
  or assigned_worker_id = auth.uid()
  or public.is_admin()
);

drop policy if exists requests_customer_update on public.service_requests;
create policy requests_customer_update on public.service_requests for update using (
  customer_id = auth.uid() or public.is_admin()
);

drop policy if exists requests_worker_update on public.service_requests;
create policy requests_worker_update on public.service_requests for update using (
  assigned_worker_id = auth.uid()
);

drop policy if exists requests_admin_all on public.service_requests;
create policy requests_admin_all on public.service_requests for all using (public.is_admin());

-- JOBS
drop policy if exists jobs_select on public.jobs;
create policy jobs_select on public.jobs for select using (
  worker_id = auth.uid()
  or public.is_admin()
  or exists (
    select 1 from public.service_requests sr
    where sr.id = jobs.request_id and sr.customer_id = auth.uid()
  )
);

drop policy if exists jobs_worker_update on public.jobs;
create policy jobs_worker_update on public.jobs for update using (
  worker_id = auth.uid() or public.is_admin()
);

drop policy if exists jobs_admin_all on public.jobs;
create policy jobs_admin_all on public.jobs for all using (public.is_admin());

-- JOB PHOTOS
drop policy if exists photos_select on public.job_photos;
create policy photos_select on public.job_photos for select using (
  exists (
    select 1 from public.jobs j
    join public.service_requests sr on sr.id = j.request_id
    where j.id = job_photos.job_id
      and (j.worker_id = auth.uid() or sr.customer_id = auth.uid() or public.is_admin())
  )
);

drop policy if exists photos_worker_insert on public.job_photos;
create policy photos_worker_insert on public.job_photos for insert with check (
  exists (
    select 1 from public.jobs j
    where j.id = job_photos.job_id and j.worker_id = auth.uid()
  )
  or public.is_admin()
);

-- PAYMENTS
drop policy if exists payments_select on public.payments;
create policy payments_select on public.payments for select using (
  exists (
    select 1 from public.service_requests sr
    where sr.id = payments.request_id
      and (sr.customer_id = auth.uid() or sr.assigned_worker_id = auth.uid() or public.is_admin())
  )
);

drop policy if exists payments_admin_all on public.payments;
create policy payments_admin_all on public.payments for all using (public.is_admin());

-- REVIEWS
drop policy if exists reviews_select on public.reviews;
create policy reviews_select on public.reviews for select using (true);

drop policy if exists reviews_customer_insert on public.reviews;
create policy reviews_customer_insert on public.reviews for insert with check (
  customer_id = auth.uid()
  and exists (
    select 1 from public.service_requests sr
    where sr.id = request_id
      and sr.customer_id = auth.uid()
      and sr.status in ('completed', 'confirmed')
  )
);

-- WORKER AVAILABILITY
drop policy if exists availability_select on public.worker_availability;
create policy availability_select on public.worker_availability for select using (
  worker_id = auth.uid() or public.is_admin()
);

drop policy if exists availability_worker_manage on public.worker_availability;
create policy availability_worker_manage on public.worker_availability for all using (
  worker_id = auth.uid() or public.is_admin()
);

-- PRICING
drop policy if exists pricing_read on public.pricing_config;
create policy pricing_read on public.pricing_config for select using (true);

drop policy if exists pricing_admin on public.pricing_config;
create policy pricing_admin on public.pricing_config for all using (public.is_admin());

-- OTP SESSIONS (admin-managed WhatsApp codes)
alter table public.otp_sessions enable row level security;

drop policy if exists otp_admin_all on public.otp_sessions;
create policy otp_admin_all on public.otp_sessions for all using (public.is_admin());

-- Allow anonymous insert of OTP requests from login screens (service role preferred in production)
drop policy if exists otp_insert_public on public.otp_sessions;
create policy otp_insert_public on public.otp_sessions for insert with check (true);

-- Storage bucket for job photos (run in dashboard or via API)
-- insert into storage.buckets (id, name, public) values ('job-photos', 'job-photos', true);
