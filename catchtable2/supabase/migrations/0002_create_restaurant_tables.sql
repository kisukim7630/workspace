-- Migration: create restaurant reservation platform tables
-- Ensures pgcrypto available for gen_random_uuid
create extension if not exists "pgcrypto";

-- Restaurants table
create table if not exists public.restaurants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  image_url text,
  location text not null,
  cuisine text not null,
  price_range text not null,
  rating numeric(3, 2) default 0.0,
  review_count integer default 0,
  phone text,
  hours text,
  address text,
  latitude numeric(10, 8),
  longitude numeric(11, 8),
  distance_km numeric(5, 2),
  owner_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.restaurants is '식당 정보 테이블';

-- Restaurant menus table
create table if not exists public.restaurant_menus (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  name text not null,
  price text not null,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.restaurant_menus is '식당 메뉴 테이블';

-- Reservations table
create table if not exists public.reservations (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  reservation_date date not null,
  reservation_time time not null,
  guests integer not null,
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'completed', 'cancelled')),
  special_requests text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.reservations is '예약 정보 테이블';

-- Waitlist table
create table if not exists public.waitlist (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  queue_number integer not null,
  guests integer not null,
  status text not null default 'waiting' check (status in ('waiting', 'next', 'called', 'cancelled')),
  estimated_wait_minutes integer,
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.waitlist is '대기열 정보 테이블';

-- Reviews table
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  rating integer not null check (rating >= 1 and rating <= 5),
  comment text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.reviews is '리뷰 정보 테이블';

-- Create indexes for better query performance
create index if not exists idx_restaurants_location on public.restaurants(location);
create index if not exists idx_restaurants_cuisine on public.restaurants(cuisine);
create index if not exists idx_restaurants_owner_id on public.restaurants(owner_id);
create index if not exists idx_restaurant_menus_restaurant_id on public.restaurant_menus(restaurant_id);
create index if not exists idx_reservations_restaurant_id on public.reservations(restaurant_id);
create index if not exists idx_reservations_user_id on public.reservations(user_id);
create index if not exists idx_reservations_date on public.reservations(reservation_date);
create index if not exists idx_waitlist_restaurant_id on public.waitlist(restaurant_id);
create index if not exists idx_waitlist_user_id on public.waitlist(user_id);
create index if not exists idx_waitlist_status on public.waitlist(status);
create index if not exists idx_reviews_restaurant_id on public.reviews(restaurant_id);
create index if not exists idx_reviews_user_id on public.reviews(user_id);

-- Function to update updated_at timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Triggers to automatically update updated_at
create trigger update_restaurants_updated_at
  before update on public.restaurants
  for each row
  execute function update_updated_at_column();

create trigger update_restaurant_menus_updated_at
  before update on public.restaurant_menus
  for each row
  execute function update_updated_at_column();

create trigger update_reservations_updated_at
  before update on public.reservations
  for each row
  execute function update_updated_at_column();

create trigger update_waitlist_updated_at
  before update on public.waitlist
  for each row
  execute function update_updated_at_column();

create trigger update_reviews_updated_at
  before update on public.reviews
  for each row
  execute function update_updated_at_column();

-- Function to update restaurant rating and review count
create or replace function update_restaurant_rating()
returns trigger as $$
begin
  update public.restaurants
  set
    rating = (
      select round(avg(rating)::numeric, 2)
      from public.reviews
      where restaurant_id = new.restaurant_id
    ),
    review_count = (
      select count(*)
      from public.reviews
      where restaurant_id = new.restaurant_id
    )
  where id = new.restaurant_id;
  return new;
end;
$$ language plpgsql;

-- Trigger to update restaurant rating when review is inserted or updated
create trigger update_restaurant_rating_on_review
  after insert or update on public.reviews
  for each row
  execute function update_restaurant_rating();

-- Disable RLS for all tables (as per guideline)
alter table if exists public.restaurants disable row level security;
alter table if exists public.restaurant_menus disable row level security;
alter table if exists public.reservations disable row level security;
alter table if exists public.waitlist disable row level security;
alter table if exists public.reviews disable row level security;

