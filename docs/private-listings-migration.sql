-- Solicitações de acesso de agência e anúncios particulares com cobrança única.
-- Dados pessoais e transações são acessíveis apenas pelas APIs com service_role.
begin;

create table if not exists public.agency_signup_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  business_name text,
  equipment_count integer not null default 2 check (equipment_count >= 2 and equipment_count <= 10000),
  status text not null default 'pending' check (status in ('pending', 'contacted', 'needs_information', 'approved')),
  admin_note text,
  reviewed_by uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.private_listings (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  assigned_seller_id uuid references public.profiles(id) on delete set null,
  linked_vehicle_id uuid references public.vehicles(id) on delete set null,
  status text not null default 'draft' check (status in ('draft', 'awaiting_payment', 'under_review', 'changes_requested', 'published')),
  intent text not null default 'sale' check (intent in ('sale', 'trade')),
  title text not null,
  category text not null,
  brand text not null,
  model text not null,
  manufacture_year integer not null check (manufacture_year between 1900 and 2100),
  condition text not null,
  city text,
  state text,
  description text,
  price numeric,
  price_on_request boolean not null default true,
  desired_category text,
  desired_description text,
  photo_paths text[] not null default '{}',
  fee_cents_snapshot bigint,
  fee_revision integer,
  review_note text,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (cardinality(photo_paths) <= 10),
  check (intent <> 'trade' or coalesce(nullif(trim(desired_category), ''), nullif(trim(desired_description), '')) is not null),
  check (price_on_request or price is not null and price >= 0)
);

create table if not exists public.private_listing_payments (
  id uuid primary key default gen_random_uuid(),
  private_listing_id uuid not null references public.private_listings(id) on delete cascade,
  fee_cents bigint not null check (fee_cents > 0),
  fee_revision integer not null check (fee_revision >= 0),
  mercadopago_preference_id text unique,
  mercadopago_payment_id text unique,
  checkout_url text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected', 'cancelled', 'refunded')),
  approved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists agency_signup_requests_status_created_idx
  on public.agency_signup_requests(status, created_at desc);
create index if not exists private_listings_owner_created_idx
  on public.private_listings(owner_id, created_at desc);
create index if not exists private_listings_review_idx
  on public.private_listings(status, created_at asc);
create index if not exists private_listing_payments_listing_idx
  on public.private_listing_payments(private_listing_id, created_at desc);

alter table public.agency_signup_requests enable row level security;
alter table public.private_listings enable row level security;
alter table public.private_listing_payments enable row level security;

revoke all on public.agency_signup_requests, public.private_listings, public.private_listing_payments from public, anon, authenticated;
grant select, insert, update, delete on public.agency_signup_requests, public.private_listings, public.private_listing_payments to service_role;

create or replace function public.publish_private_listing(p_listing_id uuid, p_seller_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_listing public.private_listings%rowtype;
  v_seller public.profiles%rowtype;
  v_vehicle_id uuid;
begin
  select * into v_listing from public.private_listings where id = p_listing_id for update;
  if not found then raise exception 'listing_not_found'; end if;
  if v_listing.status not in ('under_review', 'published') then raise exception 'listing_not_ready'; end if;
  if not exists (select 1 from public.private_listing_payments p where p.private_listing_id = p_listing_id and p.status = 'approved') then
    raise exception 'payment_not_approved';
  end if;
  if cardinality(v_listing.photo_paths) < 1 then raise exception 'listing_photos_required'; end if;
  select * into v_seller from public.profiles where id = p_seller_id;
  if not found or v_seller.role not in ('seller', 'admin') or length(regexp_replace(coalesce(v_seller.phone, ''), '[^0-9]', '', 'g')) not between 10 and 13 then
    raise exception 'seller_contact_invalid';
  end if;

  if v_listing.linked_vehicle_id is not null then
    update public.vehicles set status = 'published', seller_id = p_seller_id, updated_at = now()
      where id = v_listing.linked_vehicle_id returning id into v_vehicle_id;
    if v_vehicle_id is null then raise exception 'linked_vehicle_missing'; end if;
  else
    insert into public.vehicles (
      seller_id, title, category, brand, model, manufacture_year, price, price_on_request,
      description, state, city, status
    ) values (
      p_seller_id, v_listing.title, v_listing.category, v_listing.brand, v_listing.model,
      v_listing.manufacture_year, v_listing.price, v_listing.price_on_request,
      concat_ws(E'\n\n', v_listing.description,
        case when v_listing.intent = 'trade' then 'Aceita troca por: ' || coalesce(v_listing.desired_category, '') || case when coalesce(v_listing.desired_description, '') <> '' then ' — ' || v_listing.desired_description else '' end else null end,
        'Conservação: ' || v_listing.condition),
      v_listing.state, v_listing.city, 'draft'
    ) returning id into v_vehicle_id;
    insert into public.vehicle_photos (vehicle_id, storage_path, position)
      select v_vehicle_id, path, ordinality::integer - 1
      from unnest(v_listing.photo_paths) with ordinality as photo(path, ordinality);
    update public.vehicles set status = 'published', updated_at = now() where id = v_vehicle_id;
  end if;

  update public.private_listings set
    status = 'published', assigned_seller_id = p_seller_id, linked_vehicle_id = v_vehicle_id,
    published_at = coalesce(published_at, now()), updated_at = now(), review_note = null
  where id = p_listing_id;
  return v_vehicle_id;
end;
$$;
revoke all on function public.publish_private_listing(uuid, uuid) from public, anon, authenticated;
grant execute on function public.publish_private_listing(uuid, uuid) to service_role;

commit;
