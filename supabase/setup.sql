-- Personal OS v2 — einmalig im Supabase-SQL-Editor ausführen.
--
-- Eine Zeile je Profil. Die Sicherheitsregeln (Row Level Security) sorgen
-- dafür, dass jede angemeldete Person ausschließlich ihre eigene Zeile
-- sieht und schreibt — auch dann, wenn jemand den öffentlichen Anon-Key
-- kennt, der in der App steckt.

create table if not exists public.personal_os_state (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  data       jsonb       not null,
  updated_at timestamptz not null default now()
);

alter table public.personal_os_state enable row level security;

-- Vorhandene Regeln entfernen, damit das Skript wiederholbar bleibt.
drop policy if exists "eigene Zeile lesen"    on public.personal_os_state;
drop policy if exists "eigene Zeile anlegen"  on public.personal_os_state;
drop policy if exists "eigene Zeile ändern"   on public.personal_os_state;
drop policy if exists "eigene Zeile löschen"  on public.personal_os_state;

create policy "eigene Zeile lesen"
  on public.personal_os_state for select
  using (auth.uid() = user_id);

create policy "eigene Zeile anlegen"
  on public.personal_os_state for insert
  with check (auth.uid() = user_id);

create policy "eigene Zeile ändern"
  on public.personal_os_state for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "eigene Zeile löschen"
  on public.personal_os_state for delete
  using (auth.uid() = user_id);
