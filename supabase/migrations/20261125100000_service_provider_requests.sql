create table if not exists public.service_provider_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  business_name text,
  services text[] not null,
  status text not null default 'pending',
  admin_note text,
  reviewed_by uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint service_provider_requests_services_check check (
    cardinality(services) between 1 and 8
    and services <@ array[
      'freight_broker','dispatcher','parts_store','tow_service',
      'electrician','mechanic','insurance_benefits','other'
    ]::text[]
  ),
  constraint service_provider_requests_status_check check (
    status in ('pending','approved','rejected')
  )
);

create index if not exists service_provider_requests_status_created_idx
  on public.service_provider_requests (status, created_at desc);
create index if not exists service_provider_requests_reviewed_by_idx
  on public.service_provider_requests (reviewed_by);

alter table public.service_provider_requests enable row level security;

drop policy if exists service_provider_requests_no_direct_select on public.service_provider_requests;
create policy service_provider_requests_no_direct_select
  on public.service_provider_requests for select
  to anon, authenticated
  using (false);

drop policy if exists service_provider_requests_no_direct_insert on public.service_provider_requests;
create policy service_provider_requests_no_direct_insert
  on public.service_provider_requests for insert
  to anon, authenticated
  with check (false);

drop policy if exists service_provider_requests_no_direct_update on public.service_provider_requests;
create policy service_provider_requests_no_direct_update
  on public.service_provider_requests for update
  to anon, authenticated
  using (false)
  with check (false);

drop policy if exists service_provider_requests_no_direct_delete on public.service_provider_requests;
create policy service_provider_requests_no_direct_delete
  on public.service_provider_requests for delete
  to anon, authenticated
  using (false);

revoke all on table public.service_provider_requests from anon, authenticated;
grant all on table public.service_provider_requests to service_role;
