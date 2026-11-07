create table if not exists public.merchants (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  store_name text not null,
  owner_name text not null,
  phone text not null,
  gmaps_url text not null,
  category text,
  is_active boolean not null default true,
  lat double precision,
  lng double precision
);

alter table public.merchants
  add column if not exists user_id uuid references auth.users(id) on delete cascade;

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  vendor_id uuid not null references public.merchants(id) on delete cascade,
  name text not null,
  category text,
  price numeric not null,
  image_url text,
  maps_url text,
  is_late_night boolean not null default false,
  promo_tag text,
  is_active boolean not null default true
);

alter table public.products
  add column if not exists is_active boolean not null default true;

alter table public.merchants enable row level security;
alter table public.products enable row level security;

drop policy if exists "Allow public read access" on public.merchants;
drop policy if exists "Allow public insert access" on public.merchants;
drop policy if exists "Allow public update access" on public.merchants;
drop policy if exists "Allow public delete access" on public.merchants;
drop policy if exists "Allow public read access" on public.products;
drop policy if exists "Allow public insert access" on public.products;
drop policy if exists "Allow public update access" on public.products;
drop policy if exists "Allow public delete access" on public.products;

create policy "Allow public read access"
  on public.merchants for select to anon, authenticated using (true);
create policy "Allow public insert access"
  on public.merchants for insert to anon, authenticated with check (true);
create policy "Allow public update access"
  on public.merchants for update to anon, authenticated using (true) with check (true);
create policy "Allow public delete access"
  on public.merchants for delete to anon, authenticated using (true);

create policy "Allow public read access"
  on public.products for select to anon, authenticated using (true);
create policy "Allow public insert access"
  on public.products for insert to anon, authenticated with check (true);
create policy "Allow public update access"
  on public.products for update to anon, authenticated using (true) with check (true);
create policy "Allow public delete access"
  on public.products for delete to anon, authenticated using (true);

grant select, insert, update, delete on public.merchants to anon, authenticated;
grant select, insert, update, delete on public.products to anon, authenticated;

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'merchants'
  ) then
    alter publication supabase_realtime add table public.merchants;
  end if;

  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'products'
  ) then
    alter publication supabase_realtime add table public.products;
  end if;
end
$$;
