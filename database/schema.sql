-- ================================================
-- TimeCapsule Memories — Supabase Database Schema
-- Run this in your Supabase SQL Editor
-- ================================================

-- Enable UUID extension
create extension if not exists "pgcrypto";

-- ================================================
-- BATCHES
-- ================================================
create table if not exists batches (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  year int not null,
  created_at timestamptz default now()
);

-- ================================================
-- PROFILES (extends Supabase auth OR standalone)
-- ================================================
create table if not exists profiles (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  email text not null unique,
  password_hash text not null,
  role text not null check (role in ('student', 'teacher', 'admin')),
  batch_id uuid references batches(id) on delete set null,
  avatar_url text,
  created_at timestamptz default now()
);

create index if not exists profiles_email_idx on profiles(email);
create index if not exists profiles_batch_idx on profiles(batch_id);

-- ================================================
-- CAPSULES
-- ================================================
create table if not exists capsules (
  id uuid default gen_random_uuid() primary key,
  sender_id uuid not null references profiles(id) on delete cascade,
  recipient_type text not null check (recipient_type in ('teacher', 'student')),
  recipient_id uuid references profiles(id) on delete set null,
  content_text text default '',
  media_urls text[] default '{}',
  unlock_date timestamptz not null,
  is_unlocked boolean default false,
  batch_id uuid references batches(id) on delete set null,
  created_at timestamptz default now()
);

create index if not exists capsules_sender_idx on capsules(sender_id);
create index if not exists capsules_unlock_idx on capsules(unlock_date, is_unlocked);
create index if not exists capsules_type_idx on capsules(recipient_type);

-- ================================================
-- NOTIFICATIONS
-- ================================================
create table if not exists notifications (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references profiles(id) on delete cascade,
  message text not null,
  is_read boolean default false,
  created_at timestamptz default now()
);

create index if not exists notifications_user_idx on notifications(user_id, is_read);

-- ================================================
-- SUPABASE STORAGE BUCKET
-- Create manually in Supabase Dashboard > Storage > New Bucket
-- Name: capsule-media
-- Public: Yes (or use signed URLs for private)
-- ================================================

-- ================================================
-- SAMPLE DATA (optional, for testing)
-- ================================================
-- Insert a sample batch
insert into batches (name, year) values ('TYCS', 2026) on conflict do nothing;

-- ================================================
-- ROW LEVEL SECURITY (RLS)
-- ================================================
-- IMPORTANT SECURITY NOTE:
-- This application uses a Node.js backend with custom JWT authentication.
-- It DOES NOT use Supabase Auth.
-- 
-- 1. If your backend uses the SUPABASE_SERVICE_KEY in .env, it will bypass RLS.
--    This is the RECOMMENDED approach. Keep RLS enabled and empty to block public access.
-- 2. If your backend uses the SUPABASE_ANON_KEY in .env, it will be blocked by RLS.
--    In that case, you must disable RLS or allow anon access (NOT recommended for production).

-- Enable RLS to block direct public API access (Backend must use Service Role Key)
alter table batches enable row level security;
alter table profiles enable row level security;
alter table capsules enable row level security;
alter table notifications enable row level security;

-- If you MUST use the anon key for testing, you can disable RLS by running:
-- alter table batches disable row level security;
-- alter table profiles disable row level security;
-- alter table capsules disable row level security;
-- alter table notifications disable row level security;

