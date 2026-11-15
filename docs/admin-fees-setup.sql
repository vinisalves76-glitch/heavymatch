-- Proposta de configuração persistente. NÃO APLICADA ao banco compartilhado.
-- Aplicar somente após aprovação específica para habilitar o salvamento.
begin;
create table public.marketplace_fees (
  scope text primary key check (scope in ('preview', 'production')),
  private_listing_fee_cents bigint check (private_listing_fee_cents > 0 and private_listing_fee_cents <= 9007199254740991),
  revision integer not null default 0 check (revision >= 0),
  updated_at timestamptz,
  updated_by uuid references auth.users(id) on delete set null
);
alter table public.marketplace_fees enable row level security;
revoke all on table public.marketplace_fees from public, anon, authenticated;
grant select, update on table public.marketplace_fees to service_role;
insert into public.marketplace_fees (scope) values ('preview'), ('production');
commit;
