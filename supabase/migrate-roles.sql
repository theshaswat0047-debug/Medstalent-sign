-- ============================================================
-- VaultSign — Role Migration Script
-- Run this in Supabase SQL Editor to rename existing roles
-- to the new naming convention.
--
-- OLD → NEW:
--   ORG_ADMIN  → ORG_OWNER     (customer who created org — was wrongly named)
--   USER       → ORG_MEMBER     (invited team member)
--   PERSONAL   → PERSONAL_USER  (personal account)
--   SUPERADMIN → SUPERADMIN     (unchanged)
--   ORG_ADMIN  stays ORG_ADMIN only for HQ staff (manually set, not via signup)
-- ============================================================

-- IMPORTANT: If you already created the SuperAdmin account via schema-authjs.sql,
-- that account has role = 'SUPERADMIN' — it will NOT be changed by this migration.

-- Rename customer-side ORG_ADMIN → ORG_OWNER
-- (Only affects accounts created via /signup before this migration.
--  HQ staff with ORG_ADMIN role are manually created and won't be affected
--  because they have account_type = 'ORG' AND org_id IS NULL.)
update public.users
set role = 'ORG_OWNER'
where role = 'ORG_ADMIN'
  and org_id is not null;

-- Rename USER → ORG_MEMBER
update public.users
set role = 'ORG_MEMBER'
where role = 'USER';

-- Rename PERSONAL → PERSONAL_USER
update public.users
set role = 'PERSONAL_USER'
where role = 'PERSONAL';

-- Verify the migration
select role, count(*) from public.users group by role order by role;

-- Expected output:
--   SUPERADMIN     1  (you)
--   ORG_OWNER      N  (customers who created orgs)
--   ORG_MEMBER     N  (invited team members — 0 for now)
--   PERSONAL_USER  N  (personal accounts)
