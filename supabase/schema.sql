-- Éveil — schéma Supabase
-- À exécuter dans Supabase Dashboard > SQL Editor > New query, puis "Run".
-- Peut être exécuté une seule fois sur une base neuve.

create extension if not exists "pgcrypto";

-- PROFILES --------------------------------------------------------------
-- Un profil par utilisateur (id = auth.users.id).
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  prenom text not null,
  nom text not null default '',
  naissance date not null,
  heure_naissance text, -- "HH:MM", nullable
  lieu_naissance text,
  signe text not null,
  chemin_vie int not null,
  nombre_expression int not null,
  nombre_ame int not null,
  nombre_personnalite int not null,
  ascendant text,
  signe_lunaire text,
  notif_enabled boolean not null default false,
  notif_hour int not null default 9,
  invite_code text unique,
  push_token text,
  timezone text, -- fuseau IANA de l'appareil (ex. "Europe/Paris"), pour envoyer la notification à l'heure locale
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table profiles enable row level security;

-- (select auth.uid()) : évalué une seule fois par requête et non à chaque ligne.
create policy "profiles_select_own" on profiles
  for select using ((select auth.uid()) = id);
create policy "profiles_insert_own" on profiles
  for insert with check ((select auth.uid()) = id);
create policy "profiles_update_own" on profiles
  for update using ((select auth.uid()) = id);

-- JOURNAL ENTRIES ---------------------------------------------------------
create table journal_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null,
  input text not null,
  result text not null,
  date timestamptz not null default now(),
  fav boolean not null default false,
  feedback text check (feedback in ('up', 'down')),
  realized boolean not null default false
);

create index journal_entries_user_date_idx on journal_entries (user_id, date desc);

alter table journal_entries enable row level security;
create policy "journal_own" on journal_entries
  for all using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

-- STREAKS -------------------------------------------------------------
create table streaks (
  user_id uuid primary key references auth.users(id) on delete cascade,
  count int not null default 0,
  last_date date
);

alter table streaks enable row level security;
create policy "streaks_own" on streaks
  for all using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

-- GRATITUDE ---------------------------------------------------------------
create table gratitude_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  item1 text not null default '',
  item2 text not null default '',
  item3 text not null default '',
  unique (user_id, date)
);

alter table gratitude_entries enable row level security;
create policy "gratitude_own" on gratitude_entries
  for all using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

-- DAILY CACHE (carte du jour, affirmations) --------------------------------
create table daily_cache (
  user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null check (kind in ('carte', 'affirmations', 'tarot')),
  date date not null,
  content jsonb not null,
  primary key (user_id, kind, date)
);

alter table daily_cache enable row level security;
create policy "daily_cache_own" on daily_cache
  for all using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

-- La table "friendships" (fonctionnalité amis, jamais utilisée) et la règle "profiles_select_friends" ont été
-- supprimées en production le 2026-10-13 (migration "remove_friendships_and_optimize_rls") : la règle d'insertion
-- ne contrôlait pas le statut, donc un compte pouvait s'auto-déclarer ami "accepted" et lire le profil d'un autre.
-- Les règles ci-dessus utilisent (select auth.uid()) pour la même raison de performance.
