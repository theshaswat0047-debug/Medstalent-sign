-- ============================================================
-- VaultSign — Platform Settings Table
-- Run this in Supabase SQL Editor (after schema-authjs.sql)
-- Stores Brevo API key + sender config that SuperAdmin enters in the UI.
-- ============================================================

-- Single-row config table (enforced by constraint)
create table if not exists public.platform_settings (
  id int primary key default 1 check (id = 1),
  brevo_api_key text,
  brevo_sender_email text,
  brevo_sender_name text default 'VaultSign',
  brevo_webhook_secret text,
  brevo_smtp_host text,
  brevo_smtp_port int,
  brevo_smtp_username text,
  brevo_smtp_password text,
  -- Platform toggles
  maintenance_mode boolean default false,
  signups_enabled boolean default true,
  enforce_2fa_admins boolean default true,
  updated_at timestamptz not null default now(),
  updated_by uuid
);

-- Insert default row (empty Brevo config — SuperAdmin will fill it)
insert into public.platform_settings (id)
values (1)
on conflict (id) do nothing;

-- RLS: only authenticated users can read; only SUPERADMIN can write
-- (We handle the write check in the API route via auth())
alter table public.platform_settings enable row level security;

drop policy if exists "PlatformSettings: read" on public.platform_settings;
create policy "PlatformSettings: read" on public.platform_settings
  for select using (true);  -- Read is permissive; sensitive fields filtered server-side

drop policy if exists "PlatformSettings: write" on public.platform_settings;
create policy "PlatformSettings: write" on public.platform_settings
  for update using (true);  -- Write check done server-side via auth() role check

drop policy if exists "PlatformSettings: insert" on public.platform_settings;
create policy "PlatformSettings: insert" on public.platform_settings
  for insert with check (true);

-- Updated_at trigger
drop trigger if exists platform_settings_updated_at on public.platform_settings;
create trigger platform_settings_updated_at
  before update on public.platform_settings
  for each row execute function public.handle_updated_at();

-- Done. SuperAdmin can now configure Brevo from /platform-settings in the app.
