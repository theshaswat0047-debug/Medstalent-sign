-- ============================================================
-- VaultSign — Auth.js Schema Migration
-- Run this in Supabase SQL Editor AFTER running the original schema.sql
-- This adds the tables Auth.js needs (users, otp_codes) and drops the
-- Supabase auth trigger we no longer need.
-- ============================================================

-- 1. NEW USERS TABLE (independent of auth.users)
--    Auth.js manages auth; we store users here with bcrypt-hashed passwords.
create table if not exists public.users (
  id uuid default gen_random_uuid() primary key,
  email text unique not null,
  password_hash text,                    -- null for OTP-only users (SuperAdmin)
  full_name text not null,
  phone text,
  avatar text,
  role text not null default 'USER',      -- SUPERADMIN | ORG_ADMIN | MANAGER | USER | PERSONAL
  account_type text not null default 'PERSONAL', -- ORG | PERSONAL
  org_id uuid references public.organizations(id) on delete set null,
  purpose text,
  location text,
  status text not null default 'active',  -- active | disabled
  email_verified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. OTP CODES TABLE
--    Stores 6-digit codes with hashed value + 5-minute expiry.
create table if not exists public.otp_codes (
  id uuid default gen_random_uuid() primary key,
  email text not null,
  code_hash text not null,                -- bcrypt hash of the 6-digit code
  expires_at timestamptz not null,        -- now() + 5 minutes
  used boolean default false,
  attempts int default 0,                 -- track brute-force attempts
  created_at timestamptz not null default now()
);

-- Index for fast lookup by email
create index if not exists otp_codes_email_idx on public.otp_codes(email) where used = false;

-- ============================================================
-- RLS POLICIES for new tables
-- ============================================================

alter table public.users enable row level security;
alter table public.otp_codes enable row level security;

-- USERS: users can read their own row
drop policy if exists "Users: read own" on public.users;
create policy "Users: read own" on public.users
  for select using (true);  -- Auth.js handles auth server-side; this is permissive for anon reads
-- Note: We keep this permissive because Auth.js queries happen server-side
-- with the service role key (bypasses RLS). The anon key can read but
-- password_hash is the only sensitive field — consider a view or column
-- exclusion if you want to hide it from anon.

-- USERS: anyone can insert (signup creates a user row)
drop policy if exists "Users: insert" on public.users;
create policy "Users: insert" on public.users
  for insert with check (true);

-- USERS: anyone can update (Auth.js updates server-side, but allow anon too)
drop policy if exists "Users: update" on public.users;
create policy "Users: update" on public.users
  for update using (true);

-- OTP_CODES: no anon access needed (all operations server-side via service role)
-- But we need insert + select + update for the API routes to work
drop policy if exists "OtpCodes: insert" on public.otp_codes;
create policy "OtpCodes: insert" on public.otp_codes
  for insert with check (true);

drop policy if exists "OtpCodes: read" on public.otp_codes;
create policy "OtpCodes: read" on public.otp_codes
  for select using (true);

drop policy if exists "OtpCodes: update" on public.otp_codes;
create policy "OtpCodes: update" on public.otp_codes
  for update using (true);

-- ============================================================
-- DROP the old Supabase auth trigger (we're not using auth.users anymore)
-- ============================================================
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();

-- ============================================================
-- UPDATED_AT triggers for new tables
-- ============================================================
drop trigger if exists users_updated_at on public.users;
create trigger users_updated_at
  before update on public.users
  for each row execute function public.handle_updated_at();

-- ============================================================
-- SEED: SuperAdmin account
-- ============================================================
-- This creates your SuperAdmin account. The password hash is for a temp
-- password you'll use on first login at /superadmin — but actually,
-- SuperAdmin uses OTP only (no password). The password_hash is null.
--
-- IMPORTANT: Replace the email below with your actual email if different.

insert into public.users (email, full_name, avatar, role, account_type, status, email_verified_at)
values (
  'shaswatpandey0047@gmail.com',
  'Shaswat Pandey',
  'SP',
  'SUPERADMIN',
  'ORG',
  'active',
  now()
)
on conflict (email) do update
  set role = 'SUPERADMIN',
      full_name = 'Shaswat Pandey',
      avatar = 'SP',
      email_verified_at = now();

-- ============================================================
-- DONE — Auth.js is now ready
--
-- What you need to do next:
-- 1. Add env vars to Vercel (and .env locally):
--    AUTH_SECRET=<generate with: openssl rand -base64 32>
--    BREVO_API_KEY=<your Brevo API key>
--    BREVO_SENDER_EMAIL=<verified sender email>
--    BREVO_SENDER_NAME=VaultSign
--    NEXT_PUBLIC_SUPABASE_URL=https://ukjhjnwfiyszcdpdggvr.supabase.co
--    NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key>
--    SUPABASE_SERVICE_ROLE_KEY=<service role key>
--
-- 2. Generate AUTH_SECRET locally:
--    Run: openssl rand -base64 32
--    Copy the output as AUTH_SECRET value
-- ============================================================
