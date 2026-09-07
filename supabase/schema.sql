-- 6PACKWEAR production database foundation
-- Run this in Supabase SQL Editor.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  brand text not null,
  category text not null,
  style text,
  price numeric(12,2) not null check (price >= 0),
  currency text not null default 'USD',
  stock integer not null default 0 check (stock >= 0),
  sizes text[] not null default '{}',
  color text,
  image_url text,
  supplier_url text,
  supplier_sku text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.looks (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  cover_image_url text,
  style text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.look_items (
  look_id uuid not null references public.looks(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete restrict,
  position integer not null default 0,
  primary key (look_id, product_id)
);

create table if not exists public.cart_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete restrict,
  size text,
  quantity integer not null check (quantity > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, product_id, size)
);

create table if not exists public.favorites (
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, product_id)
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  status text not null default 'pending' check (status in ('pending','paid','processing','shipped','delivered','cancelled')),
  currency text not null default 'USD',
  subtotal numeric(12,2) not null default 0 check (subtotal >= 0),
  shipping numeric(12,2) not null default 0 check (shipping >= 0),
  total numeric(12,2) not null default 0 check (total >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  product_name text not null,
  brand text,
  size text,
  quantity integer not null check (quantity > 0),
  unit_price numeric(12,2) not null check (unit_price >= 0),
  line_total numeric(12,2) not null check (line_total >= 0)
);

-- Profile creation for every new Auth user.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', ''))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

-- RLS
alter table public.profiles enable row level security;
alter table public.products enable row level security;
alter table public.looks enable row level security;
alter table public.look_items enable row level security;
alter table public.cart_items enable row level security;
alter table public.favorites enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

-- Public catalog reads.
drop policy if exists products_public_read on public.products;
create policy products_public_read on public.products for select using (active = true);

drop policy if exists looks_public_read on public.looks;
create policy looks_public_read on public.looks for select using (active = true);

drop policy if exists look_items_public_read on public.look_items;
create policy look_items_public_read on public.look_items for select using (exists (select 1 from public.looks l where l.id = look_items.look_id and l.active = true));

-- User-owned data.
drop policy if exists profiles_self_read on public.profiles;
create policy profiles_self_read on public.profiles for select using (auth.uid() = id);

drop policy if exists profiles_self_update on public.profiles;
create policy profiles_self_update on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists cart_self_all on public.cart_items;
create policy cart_self_all on public.cart_items for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists favorites_self_all on public.favorites;
create policy favorites_self_all on public.favorites for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists orders_self_read on public.orders;
create policy orders_self_read on public.orders for select using (auth.uid() = user_id);

drop policy if exists order_items_self_read on public.order_items;
create policy order_items_self_read on public.order_items for select using (exists (select 1 from public.orders o where o.id = order_items.order_id and o.user_id = auth.uid()));
