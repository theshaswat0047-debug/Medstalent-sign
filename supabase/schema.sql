-- ============================================================
-- VaultSign — Supabase Schema Setup
-- Run this entire script in: Supabase Dashboard → SQL Editor → New query
-- ============================================================

-- 1. ORGANIZATIONS TABLE
create table if not exists public.organizations (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  website text,
  location text,
  company_size text,
  domain text not null,
  status text not null default 'active',
  approval_status text not null default 'pending',
  created_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. PROFILES TABLE (1:1 with auth.users)
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text not null,
  full_name text not null,
  phone text,
  avatar text,
  role text not null default 'USER',
  account_type text not null default 'PERSONAL',
  org_id uuid references public.organizations(id) on delete set null,
  purpose text,
  location text,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 3. AUDIT LOG
create table if not exists public.audit_logs (
  id uuid default gen_random_uuid() primary key,
  actor_id uuid references public.profiles(id),
  action text not null,
  resource_type text,
  resource_id text,
  details jsonb,
  ip_address text,
  created_at timestamptz not null default now()
);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

alter table public.profiles enable row level security;
alter table public.organizations enable row level security;
alter table public.audit_logs enable row level security;

-- PROFILES policies
drop policy if exists "Profiles: read own" on public.profiles;
create policy "Profiles: read own" on public.profiles
  for select using (auth.uid() = id);

drop policy if exists "Profiles: read org members" on public.profiles;
create policy "Profiles: read org members" on public.profiles
  for select using (
    org_id is not null
    and org_id in (select p.org_id from public.profiles p where p.id = auth.uid())
  );

drop policy if exists "Profiles: update own" on public.profiles;
create policy "Profiles: update own" on public.profiles
  for update using (auth.uid() = id);

drop policy if exists "Profiles: insert own" on public.profiles;
create policy "Profiles: insert own" on public.profiles
  for insert with check (auth.uid() = id);

-- ORGANIZATIONS policies
drop policy if exists "Organizations: read own" on public.organizations;
create policy "Organizations: read own" on public.organizations
  for select using (
    id in (select org_id from public.profiles where id = auth.uid())
  );

drop policy if exists "Organizations: update own" on public.organizations;
create policy "Organizations: update own" on public.organizations
  for update using (
    id in (
      select org_id from public.profiles
      where id = auth.uid() and role in ('ORG_ADMIN', 'MANAGER')
    )
  );

drop policy if exists "Organizations: insert" on public.organizations;
create policy "Organizations: insert" on public.organizations
  for insert with check (true);

-- AUDIT LOGS
drop policy if exists "Audit: read own" on public.audit_logs;
create policy "Audit: read own" on public.audit_logs
  for select using (actor_id = auth.uid());

-- ============================================================
-- TRIGGER: auto-create profile on auth.users insert
-- ============================================================

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, avatar)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    upper(left(coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)), 2))
  );
  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- HELPER: updated_at trigger
-- ============================================================
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.handle_updated_at();

drop trigger if exists organizations_updated_at on public.organizations;
create trigger organizations_updated_at
  before update on public.organizations
  for each row execute function public.handle_updated_at();

-- ============================================================
-- DONE — Now do these steps in the Supabase Dashboard:
--
-- 1. Authentication → Providers → Email → ensure "Enable Email provider" is ON
-- 2. Authentication → Sign In / Providers → ensure "Enable Email OTP" is ON
-- 3. Authentication → URL Configuration → set Site URL to
--    https://vaultsign-khaki.vercel.app
-- 4. Create the SuperAdmin user:
--    Authentication → Users → Add user →
--    Email: maya@vaultsign.io → check "Auto Confirm User" → Create
-- 5. Run this to set their role:
--    UPDATE public.profiles SET role = 'SUPERADMIN', full_name = 'Maya Krishnan', avatar = 'MK'
--    WHERE email = 'maya@vaultsign.io';
-- ============================================================
