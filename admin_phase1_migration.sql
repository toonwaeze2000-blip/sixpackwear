-- 6PACKWEAR — Phase 1: Admin access
-- Run this once in Supabase → SQL Editor → New query → Run.
--
-- BEFORE you run this: make sure support.6packwear@gmail.com already has an
-- account on the site (open sixpackwear-site.vercel.app → account icon →
-- "Create account" tab → sign up with that exact email → verify the OTP code
-- emailed to it). If that account doesn't exist yet, the UPDATE below simply
-- grants admin to nobody (it won't error, but it also won't work) — sign up
-- first, then run this.

-- 1) Safety net: make sure the "role" column exists (it already does on your
--    live database, so this line does nothing if run again — it's just here
--    so this script also works on a fresh database).
alter table public.profiles add column if not exists role text not null default 'member';

-- 2) Grant admin rights to the support account.
update public.profiles
set role = 'admin'
where id = (select id from auth.users where email = 'support.6packwear@gmail.com');

-- 3) Let admins fully manage the product catalog (add/edit/delete products).
drop policy if exists products_admin_all on public.products;
create policy products_admin_all on public.products for all
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'))
  with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

-- 4) Same for Looks / Look items (not used by the storefront yet, but wired
--    up now so the admin panel is ready whenever Looks gets built).
drop policy if exists looks_admin_all on public.looks;
create policy looks_admin_all on public.looks for all
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'))
  with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

drop policy if exists look_items_admin_all on public.look_items;
create policy look_items_admin_all on public.look_items for all
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'))
  with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

-- 5) Let admins see every order (not just their own) and update its status
--    (pending → paid → processing → shipped → delivered, or cancelled).
drop policy if exists orders_admin_read on public.orders;
create policy orders_admin_read on public.orders for select
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

drop policy if exists orders_admin_update on public.orders;
create policy orders_admin_update on public.orders for update
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'))
  with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

drop policy if exists order_items_admin_read on public.order_items;
create policy order_items_admin_read on public.order_items for select
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

-- 6) Verify it worked — this should return exactly one row with role = admin.
select u.email, p.role
from public.profiles p
join auth.users u on u.id = p.id
where u.email = 'support.6packwear@gmail.com';
