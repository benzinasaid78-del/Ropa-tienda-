-- Multi-store clothing catalog (no payments, no orders): run in Supabase > SQL Editor

create table stores (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  slug text unique not null,            -- e.g. "lastdept" -> lastdept.yourdomain.com
  name text not null,
  logo_url text,
  hero_title text default 'New collection',
  hero_image_url text,
  accent_color text default '#ffffff',
  whatsapp text,                        -- contact button (wa.me link)
  phone text,
  instagram text,
  address text,
  maps_url text,                        -- Google Maps link
  opening_hours text,
  currency text default 'EUR',
  active boolean default true,
  created_at timestamptz default now()
);

create table categories (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references stores(id) on delete cascade,
  name text not null,
  position int default 0
);

create table products (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references stores(id) on delete cascade,
  category_id uuid references categories(id) on delete set null,
  name text not null,
  description text,
  price numeric(10,2) not null check (price >= 0),
  images text[] default '{}',          -- first image = card photo
  sizes text[] default '{}',           -- {S,M,L,XL}
  colors text[] default '{}',
  stock int default 0,
  active boolean default true,
  created_at timestamptz default now()
);

create index on products(store_id);

-- helper: does the current user own this store?
create function is_store_owner(sid uuid) returns boolean
language sql security definer stable as $$
  select exists (select 1 from stores where id = sid and owner_id = auth.uid());
$$;

alter table stores enable row level security;
alter table categories enable row level security;
alter table products enable row level security;

-- Public (customers) can read active stores, categories and products
create policy "public read stores" on stores for select using (active);
create policy "public read categories" on categories for select using (true);
create policy "public read products" on products for select using (active);

-- Owners manage only their own store
create policy "owner manage store" on stores for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "owner manage categories" on categories for all using (is_store_owner(store_id)) with check (is_store_owner(store_id));
create policy "owner manage products" on products for all using (is_store_owner(store_id)) with check (is_store_owner(store_id));

-- Product images bucket (public read, owners upload to their own folder)
insert into storage.buckets (id, name, public) values ('product-images', 'product-images', true)
on conflict do nothing;
create policy "public read images" on storage.objects for select using (bucket_id = 'product-images');
create policy "auth upload images" on storage.objects for insert to authenticated with check (bucket_id = 'product-images');
create policy "auth delete images" on storage.objects for delete to authenticated using (bucket_id = 'product-images');
