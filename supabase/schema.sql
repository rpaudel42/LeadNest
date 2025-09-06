
-- Run this in Supabase SQL editor

create extension if not exists pgcrypto;

create table if not exists invites (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  token text not null unique,
  status text check (status in ('pending','accepted')) default 'pending',
  created_at timestamp with time zone default now()
);

create table if not exists business_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  business_name text not null default '',
  ein text,
  phone text,
  contact_person text,
  email text,
  industry text,
  created_at timestamp with time zone default now()
);

create table if not exists subscriptions (
  id uuid primary key default gen_random_uuid(),
  business_id uuid references business_profiles(id) on delete cascade,
  stripe_customer_id text,
  plan text check (plan in ('bronze','silver','gold','platinum')),
  status text check (status in ('active','canceled','trialing')) default 'active',
  created_at timestamp with time zone default now()
);

create table if not exists content_preferences (
  id uuid primary key default gen_random_uuid(),
  business_id uuid references business_profiles(id) on delete cascade,
  tone text,
  hashtags text,
  ideas text,
  frequency int,
  created_at timestamp with time zone default now()
);

-- Row Level Security (simplified; tighten for production)
alter table invites enable row level security;
alter table business_profiles enable row level security;
alter table subscriptions enable row level security;
alter table content_preferences enable row level security;

create policy "superadmin can manage invites" on invites
  for all using (true) with check (true);

create policy "users can manage their own profile" on business_profiles
  for all using (true) with check (true);

create policy "users can manage their content prefs" on content_preferences
  for all using (true) with check (true);

create table if not exists superadmins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  created_at timestamp with time zone default now()
);

alter table superadmins enable row level security;

-- Superadmins can read their own record (simple RLS for now)
create policy "superadmin self read"
on superadmins for select
using (true);

-- (Optional) In production, restrict writes to service role only

insert into superadmins (user_id)
values ('8280eb02-f09d-4d48-9002-40b074148bf7');


-- 1) Optional explicit roles table (simple)
create table if not exists user_roles (
  user_id uuid primary key,
  role text check (role in ('superadmin','merchant')) not null default 'merchant',
  created_at timestamptz default now()
);

insert into user_roles (user_id, role)
values ('8280eb02-f09d-4d48-9002-40b074148bf7', 'superadmin');


alter table user_roles enable row level security;
create policy "users read own role" on user_roles
  for select using (auth.uid() = user_id);
create policy "users upsert own role" on user_roles
  for insert with check (auth.uid() = user_id);

-- 2) Link business_profiles to the auth user (merchant)
alter table business_profiles
  add column if not exists user_id uuid;

-- Ensure a unique row per merchant (optional but handy)
create unique index if not exists business_profiles_user_unique on business_profiles(user_id);

-- 3) Social content + engagements
create table if not exists posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,                          -- merchant owner
  business_id uuid references business_profiles(id) on delete set null,
  caption text,
  image_url text,
  platform text check (platform in ('instagram','facebook','tiktok','linkedin')),
  status text check (status in ('draft','scheduled','published','failed')) default 'draft',
  scheduled_at timestamptz,
  published_at timestamptz,
  created_at timestamptz default now()
);

create table if not exists post_engagements (
  id uuid primary key default gen_random_uuid(),
  post_id uuid references posts(id) on delete cascade,
  likes int default 0,
  comments int default 0,
  shares int default 0,
  impressions int default 0,
  captured_at timestamptz default now()
);

-- RLS per-tenant (merchant can only see their stuff)
alter table posts enable row level security;
alter table post_engagements enable row level security;

create policy "merchant owns posts" on posts
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "merchant reads engagements of own posts" on post_engagements
  for select using (exists (
    select 1 from posts p where p.id = post_engagements.post_id and p.user_id = auth.uid()
  ));



alter table invites
  add column if not exists invite_type text default 'merchant',
  add column if not exists action_link text,
  add column if not exists meta jsonb default '{}',
  add column if not exists created_by uuid,
  add column if not exists expires_at timestamptz;


create policy "admins can read invites"
on invites for select
using (true);

-- 1) Industry enum
do $$
begin
  if not exists (select 1 from pg_type where typname = 'industry_type') then
    create type industry_type as enum (
      'Real Estate','Technology','Healthcare','Finance','Restaurant','Education','Retail','Automotive','Fitness','Other'
    );
  end if;
end$$;

-- 2) business_profiles columns
alter table business_profiles
  add column if not exists website text,
  add column if not exists address1 text,
  add column if not exists address2 text,
  add column if not exists city text,
  add column if not exists state text,
  add column if not exists zip text;

-- 3) convert `industry` to enum (keep data if present)
alter table business_profiles
  add column if not exists industry_new industry_type;

update business_profiles
set industry_new = case industry
  when 'Real Estate' then 'Real Estate'::industry_type
  when 'Technology'  then 'Technology'::industry_type
  when 'Healthcare'  then 'Healthcare'::industry_type
  when 'Finance'     then 'Finance'::industry_type
  when 'Restaurant'  then 'Restaurant'::industry_type
  when 'Education'   then 'Education'::industry_type
  when 'Retail'      then 'Retail'::industry_type
  when 'Automotive'  then 'Automotive'::industry_type
  when 'Fitness'     then 'Fitness'::industry_type
  else 'Other'::industry_type
end
where industry is not null and industry_new is null;

alter table business_profiles
  drop column if exists industry;

alter table business_profiles
  rename column industry_new to industry;

-- 4) server-side phone number sanity CHECK (digits only length 10–15 after stripping)
-- (keeps formatting flexible in UI, enforces reasonable length)
drop function if exists digits_only(text);
create function digits_only(t text) returns text language sql immutable as $$
  select regexp_replace(coalesce(t,''),'[^0-9]','','g')
$$;

alter table business_profiles
  drop constraint if exists business_profiles_phone_chk;

alter table business_profiles
  add constraint business_profiles_phone_chk
  check ( phone is null or length(digits_only(phone)) between 10 and 15 );

-- Attach any orphaned business profiles (user_id is null) to the matching auth user by email
update business_profiles bp
set user_id = u.id
from auth.users u
where bp.user_id is null
  and bp.email = u.email;
-- Base table (safe if it already exists)
create table if not exists content_preferences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  name text,
  content_type text check (content_type in ('text','image','video')) not null default 'text',
  categories text[] not null default '{}',
  idea text,
  tone text,
  audience text,
  geo_focus text,
  preferred_hashtags text[] default '{}',
  banned_hashtags text[] default '{}',
  platforms text[] default '{}',            -- ['instagram','facebook','linkedin','tiktok','x']
  emoji_style text check (emoji_style in ('none','minimal','heavy')) default 'minimal',
  frequency int,
  preferred_times text[] default '{}',      -- e.g. ['09:00','18:30']
  timezone text,
  approval_required boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz
);

-- Trigger to keep updated_at fresh
create or replace function set_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

drop trigger if exists trg_cp_updated_at on content_preferences;
create trigger trg_cp_updated_at
before update on content_preferences
for each row execute procedure set_updated_at();

-- RLS (one policy that covers select/insert/update)
alter table content_preferences enable row level security;

-- 1) Add the column (nullable first so it won't fail if rows exist)
alter table content_preferences
  add column if not exists user_id uuid;

-- 2) (Optional but recommended) add a foreign key to auth.users
do $$
begin
  if not exists (
    select 1 from information_schema.table_constraints
    where table_name='content_preferences' and constraint_name='content_prefs_user_fk'
  ) then
    alter table content_preferences
      add constraint content_prefs_user_fk
      foreign key (user_id) references auth.users(id) on delete cascade;
  end if;
end$$;


drop policy if exists "merchant owns preferences" on content_preferences;
create policy "merchant owns preferences"
on content_preferences
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

alter table content_preferences enable row level security;

drop policy if exists "merchant owns preferences" on content_preferences;

create policy "merchant owns preferences"
on content_preferences
for select
using (auth.uid() = user_id);

create policy "merchant insert own preferences"
on content_preferences
for insert
with check (auth.uid() = user_id);

create policy "merchant update own preferences"
on content_preferences
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);


-- enums
do $$ begin
  create type content_type      as enum ('text','image','video','carousel','story','reel','short');
exception when duplicate_object then null; end $$;

do $$ begin
  create type content_status    as enum ('draft','generating','ready','scheduled','publishing','published','failed','canceled');
exception when duplicate_object then null; end $$;

do $$ begin
  create type aspect_ratio_type as enum ('1:1','4:5','16:9','9:16','3:2','21:9','unknown');
exception when duplicate_object then null; end $$;

create table if not exists contents (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references auth.users(id) on delete cascade,
  preference_id     uuid,                                 -- optional link to your content_preferences row
  campaign_id       uuid,                                 -- optional future campaign grouping

  -- creative intent / prompt lineage
  idea              text,                                 -- human-facing idea summary
  prompt            jsonb,                                -- full AI prompt context (prefs, vars, sys msg)
  source_model      text,                                 -- e.g. 'gpt-4o-mini'
  categories        text[] not null default '{}',
  tags              text[] not null default '{}',

  -- content shape
  content_type      content_type not null default 'text',
  aspect_ratio      aspect_ratio_type not null default 'unknown',
  duration_sec      int,                                  -- for videos/reels
  requires_audio    boolean default false,                -- for Reels/Shorts with VO/music

  -- shared copy
  caption           text,                                 -- platform-neutral caption
  first_comment     text,                                 -- optional (IG/X)
  link_url          text,                                 -- CTA link (for platforms that allow)
  alt_text          text,                                 -- accessibility default
  emoji_style       text,                                 -- mirror from prefs if helpful

  -- lifecycle
  status            content_status not null default 'draft',
  scheduled_at      timestamptz,
  published_at      timestamptz,
  timezone          text,                                 -- store creator tz to compute local times
  visibility        text,                                 -- e.g. 'public','unlisted','draft' (YT)

  -- moderation / QC
  moderation_status text,                                 -- 'clean','needs_review','rejected'
  moderation_notes  text,

  -- housekeeping
  created_at        timestamptz default now(),
  updated_at        timestamptz
);

create index if not exists idx_contents_user_status     on contents(user_id, status);
create index if not exists idx_contents_sched           on contents(status, scheduled_at);
create index if not exists idx_contents_pref            on contents(preference_id);

create or replace function set_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

drop trigger if exists trg_contents_updated_at on contents;
create trigger trg_contents_updated_at
before update on contents for each row execute procedure set_updated_at();

alter table contents enable row level security;

drop policy if exists "contents_select" on contents;
drop policy if exists "contents_insert" on contents;
drop policy if exists "contents_update" on contents;

create policy "contents_select" on contents for select using (auth.uid() = user_id);
create policy "contents_insert" on contents for insert with check (auth.uid() = user_id);
create policy "contents_update" on contents for update using (auth.uid() = user_id) with check (auth.uid() = user_id);


do $$ begin
  create type asset_type as enum ('image','video','thumbnail','audio','subtitle','project');
exception when duplicate_object then null; end $$;

create table if not exists content_assets (
  id            uuid primary key default gen_random_uuid(),
  content_id    uuid not null references contents(id) on delete cascade,
  asset_type    asset_type not null,
  storage_path  text not null,       -- Supabase Storage path or external URL
  format        text,                -- 'jpg','png','mp4','mov','mp3','wav','srt'
  size_bytes    bigint,
  width         int,
  height        int,
  duration_sec  int,                 -- for video/audio
  checksum      text,                -- optional duplicate detection
  order_index   int default 0,       -- for carousels
  metadata      jsonb,               -- color palette, fps, bitrate, etc.
  created_at    timestamptz default now()
);

create index if not exists idx_content_assets_content on content_assets(content_id);

do $$ begin
  create type platform_type as enum ('instagram','facebook','linkedin','tiktok','x','youtube','youtube_shorts','pinterest');
exception when duplicate_object then null; end $$;

do $$ begin
  create type publish_status as enum ('pending','ready','scheduled','publishing','published','failed','canceled');
exception when duplicate_object then null; end $$;

create table if not exists content_platform_targets (
  id                 uuid primary key default gen_random_uuid(),
  content_id         uuid not null references contents(id) on delete cascade,
  platform           platform_type not null,
  destination_id     text not null,               -- your connected account/page/channel id
  destination_label  text,                        -- human-friendly name
  caption_override   text,                        -- per-platform copy if differs
  first_comment      text,                        -- IG/X
  hashtags           text[],                      -- store if you split them
  mentions           text[],                      -- @handles to tag
  location_tag       text,                        -- IG/Facebook location
  cover_asset_id     uuid references content_assets(id),  -- custom thumbnail
  allow_crosspost    boolean default true,

  status             publish_status not null default 'pending',
  scheduled_at       timestamptz,
  published_at       timestamptz,
  external_post_id   text,                        -- returned post id
  external_url       text,                        -- permalink
  last_error         text,
  retries            int default 0,

  created_at         timestamptz default now(),
  updated_at         timestamptz
);

create index if not exists idx_targets_content      on content_platform_targets(content_id);
create index if not exists idx_targets_sched        on content_platform_targets(status, scheduled_at);

drop trigger if exists trg_targets_updated_at on content_platform_targets;
create trigger trg_targets_updated_at
before update on content_platform_targets for each row execute procedure set_updated_at();

create table if not exists content_metrics (
  id                 bigserial primary key,
  platform_target_id uuid not null references content_platform_targets(id) on delete cascade,
  collected_at       timestamptz not null default now(),

  impressions        bigint,
  reach              bigint,
  likes              bigint,
  comments           bigint,
  shares             bigint,
  saves              bigint,
  clicks             bigint,
  video_views        bigint,
  avg_watch_time_sec numeric(10,2),

  raw                jsonb                          -- store untouched API payload
);

create index if not exists idx_metrics_target_time on content_metrics(platform_target_id, collected_at desc);


create table if not exists content_candidates (
  id            uuid primary key default gen_random_uuid(),
  content_id    uuid not null references contents(id) on delete cascade,
  rank          int not null,            -- 1..5
  text_variant  text,                    -- generated caption for text flow
  metadata      jsonb,                   -- model settings, prompt slice, scores
  created_at    timestamptz default now()
);

create index if not exists idx_candidates_content on content_candidates(content_id);

create table if not exists content_moderation_flags (
  id            uuid primary key default gen_random_uuid(),
  content_id    uuid not null references contents(id) on delete cascade,
  source        text,         -- 'openai','platform','human'
  label         text,         -- 'violence','trademark','privacy', etc.
  confidence    numeric(5,4),
  notes         text,
  created_at    timestamptz default now()
);


-- Instagram caption hard limit: 2,200 chars
alter table content_platform_targets
  add constraint cpt_caption_len check (caption_override is null or length(caption_override) <= 2200);

-- X hard guideline: 280 chars (not enforced strictly here)
-- You can add platform-specific checks once you implement those flows.

-- Ensure scheduled_at is in the future when moving to 'scheduled'
-- (optional; you can enforce this in app logic instead)


-- content_assets
alter table content_assets enable row level security;
drop policy if exists ca_select on content_assets;
drop policy if exists ca_insert on content_assets;
drop policy if exists ca_update on content_assets;
create policy ca_select on content_assets
  for select using (exists (select 1 from contents c where c.id = content_id and c.user_id = auth.uid()));
create policy ca_insert on content_assets
  for insert with check (exists (select 1 from contents c where c.id = content_id and c.user_id = auth.uid()));
create policy ca_update on content_assets
  for update using (exists (select 1 from contents c where c.id = content_id and c.user_id = auth.uid()))
            with check (exists (select 1 from contents c where c.id = content_id and c.user_id = auth.uid()));

-- content_platform_targets
alter table content_platform_targets enable row level security;
drop policy if exists cpt_select on content_platform_targets;
drop policy if exists cpt_insert on content_platform_targets;
drop policy if exists cpt_update on content_platform_targets;
create policy cpt_select on content_platform_targets
  for select using (exists (select 1 from contents c where c.id = content_id and c.user_id = auth.uid()));
create policy cpt_insert on content_platform_targets
  for insert with check (exists (select 1 from contents c where c.id = content_id and c.user_id = auth.uid()));
create policy cpt_update on content_platform_targets
  for update using (exists (select 1 from contents c where c.id = content_id and c.user_id = auth.uid()))
            with check (exists (select 1 from contents c where c.id = content_id and c.user_id = auth.uid()));

-- content_metrics (read-only for user; writes by your worker via service role)
alter table content_metrics enable row level security;
drop policy if exists cm_select on content_metrics;
create policy cm_select on content_metrics
  for select using (exists (
    select 1 from content_platform_targets t
    join contents c on c.id = t.content_id
    where t.id = platform_target_id and c.user_id = auth.uid()
  ));


alter table contents
  add column if not exists platforms text[] not null default '{}';

  -- enums
do $$ begin
  create type social_provider as enum ('instagram','facebook','linkedin','tiktok','x','youtube','pinterest','mock');
exception when duplicate_object then null; end $$;

do $$ begin
  create type account_status as enum ('connected','expired','revoked','error');
exception when duplicate_object then null; end $$;

-- linked accounts (one row per connected page/profile/channel)
create table if not exists social_accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,

  provider social_provider not null,
  account_id text not null,              -- provider’s page/channel/user id
  handle text,                           -- @handle or vanity URL part
  display_name text,                     -- human readable name
  picture_url text,

  access_token text,                     -- store encrypted in prod (KMS)
  refresh_token text,
  expires_at timestamptz,                -- null for non-expiring tokens
  scopes text[] default '{}',

  status account_status not null default 'connected',
  last_error text,

  created_at timestamptz default now(),
  updated_at timestamptz
);

create unique index if not exists uq_social_user_provider_account
  on social_accounts(user_id, provider, account_id);

create or replace function set_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

drop trigger if exists trg_social_accounts_updated_at on social_accounts;
create trigger trg_social_accounts_updated_at
before update on social_accounts for each row execute procedure set_updated_at();

alter table social_accounts enable row level security;

drop policy if exists sa_select on social_accounts;
drop policy if exists sa_insert on social_accounts;
drop policy if exists sa_update on social_accounts;
drop policy if exists sa_delete on social_accounts;

create policy sa_select on social_accounts
for select using (auth.uid() = user_id);

create policy sa_insert on social_accounts
for insert with check (auth.uid() = user_id);

create policy sa_update on social_accounts
for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy sa_delete on social_accounts
for delete using (auth.uid() = user_id);

-- Optional: small helper view to fetch due targets with account attached (used by publisher)
create or replace view v_due_targets as
select
  t.id as target_id,
  t.content_id,
  t.platform,
  t.destination_id,
  t.caption_override,
  t.status,
  t.scheduled_at,
  c.user_id,
  c.caption as base_caption,
  c.content_type,
  sa.id as social_account_id,
  sa.access_token,
  sa.refresh_token,
  sa.expires_at,
  sa.provider
from content_platform_targets t
join contents c on c.id = t.content_id
join social_accounts sa
  on sa.user_id = c.user_id
 and sa.provider::text = t.platform::text
 and (sa.status = 'connected')
where t.status in ('ready','scheduled')
  and (t.scheduled_at is null or t.scheduled_at <= now());
