-- Smartwear Supabase Schema
-- Run this in Supabase SQL Editor

-- 1. Products table
create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  description text,
  price integer not null,
  compare_price integer,
  images text[] default '{}',
  category_slug text,
  brand text,
  stock integer default 0,
  rating numeric(3,1) default 4.5,
  reviews_count integer default 0,
  specifications jsonb default '{}',
  is_featured boolean default false,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- 2. Orders table (simple for now)
create table if not exists orders (
  id text primary key,                    -- e.g. ORD-12345678
  user_email text,
  customer_name text,
  phone text,
  items jsonb not null,
  subtotal integer,
  shipping_cost integer default 0,
  discount integer default 0,
  total integer not null,
  status text default 'pending',          -- pending, confirmed, shipped, delivered, cancelled
  shipping_address jsonb,
  payment_method text default 'COD',
  tracking_number text,
  created_at timestamptz default now()
);

-- Enable Row Level Security (RLS) - important for security
alter table products enable row level security;
alter table orders enable row level security;

-- Allow public read for products (anyone can browse)
create policy "Public can view active products"
  on products for select
  using (is_active = true);

-- For orders, we will use service role or simple insert from client for now (later we can secure with auth)
-- For simplicity in this phase, allow inserts from anon (we can tighten later)
create policy "Anyone can create orders"
  on orders for insert
  with check (true);

create policy "Anyone can read own orders (by email for now)"
  on orders for select
  using (true);  -- For demo; later add proper auth

-- Optional: Create index for faster slug lookup
create index if not exists idx_products_slug on products(slug);
create index if not exists idx_products_category on products(category_slug);
create index if not exists idx_orders_status on orders(status);

-- Done. Now insert initial data (see seed below)