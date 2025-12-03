-- Migration: create products table for 고구마 마켓
-- 상품 등록 기능을 위한 테이블 생성

create extension if not exists "pgcrypto";

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text,
  price integer not null check (price >= 0),
  category text not null,
  location text not null,
  image_urls text[] default '{}',
  status text not null default 'active' check (status in ('active', 'sold', 'reserved', 'deleted')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.products is '고구마 마켓 상품 테이블';

-- 인덱스 생성
create index if not exists idx_products_user_id on public.products(user_id);
create index if not exists idx_products_category on public.products(category);
create index if not exists idx_products_location on public.products(location);
create index if not exists idx_products_status on public.products(status);
create index if not exists idx_products_created_at on public.products(created_at desc);

-- RLS 정책 (임시로 비활성화, 추후 활성화 예정)
ALTER TABLE IF EXISTS public.products DISABLE ROW LEVEL SECURITY;

