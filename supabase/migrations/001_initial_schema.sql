-- ================================================================
-- PlanFlow - Initial Schema
-- Run this entire file in your Supabase SQL Editor
-- ================================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ── ENUMS ──────────────────────────────────────────────────────

create type task_status as enum ('backlog', 'in_progress', 'completed');
create type task_priority as enum ('low', 'medium', 'high');
create type event_type as enum ('task', 'meeting', 'personal', 'admin', 'other');
create type frequency_type as enum ('daily', 'weekly', 'biweekly', 'monthly');

-- ── CLIENTS ────────────────────────────────────────────────────

create table public.clients (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  company text,
  email text,
  color text default '#DCE4DD',
  is_retainer boolean not null default false,
  retainer_hours numeric default 0,
  notes text,
  status text default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.clients enable row level security;
create policy "Users manage own clients" on public.clients for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index on public.clients(user_id, status);

-- ── PROJECTS ───────────────────────────────────────────────────

create table public.projects (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  client_id uuid references public.clients(id) on delete set null,
  client text,
  color text default '#D6DEEA',
  status text default 'active',
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.projects enable row level security;
create policy "Users manage own projects" on public.projects for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index on public.projects(user_id, status);
create index on public.projects(client_id);

-- ── TASKS ──────────────────────────────────────────────────────

create table public.tasks (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  project_id uuid references public.projects(id) on delete set null,
  client_id uuid references public.clients(id) on delete set null,
  estimated_hours numeric default 1,
  scheduled_hours numeric default 0,
  status task_status not null default 'backlog',
  assigned_to text,
  priority task_priority default 'medium',
  due_date date,
  is_retainer_deliverable boolean default false,
  retainer_month text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.tasks enable row level security;
create policy "Users manage own tasks" on public.tasks for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index on public.tasks(user_id, status);
create index on public.tasks(project_id);
create index on public.tasks(client_id);

-- ── TIME BLOCKS ────────────────────────────────────────────────

create table public.time_blocks (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  task_id uuid references public.tasks(id) on delete set null,
  project_id uuid references public.projects(id) on delete set null,
  client_id uuid references public.clients(id) on delete set null,
  title text not null,
  event_type event_type not null default 'task',
  date date not null,
  start_hour numeric not null,
  duration_hours numeric not null,
  assigned_to text,
  color text,
  notes text,
  created_at timestamptz not null default now()
);

alter table public.time_blocks enable row level security;
create policy "Users manage own time blocks" on public.time_blocks for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index on public.time_blocks(user_id, date);
create index on public.time_blocks(task_id);

-- ── RECURRING TASKS ────────────────────────────────────────────

create table public.recurring_tasks (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  project_id uuid references public.projects(id) on delete set null,
  estimated_hours numeric not null default 1,
  frequency frequency_type not null default 'weekly',
  assigned_to text,
  priority task_priority default 'medium',
  active boolean default true,
  last_generated_date date,
  created_at timestamptz not null default now()
);

alter table public.recurring_tasks enable row level security;
create policy "Users manage own recurring tasks" on public.recurring_tasks for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index on public.recurring_tasks(user_id);

-- ── AUTO-UPDATE updated_at ─────────────────────────────────────

create or replace function handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger clients_updated_at before update on public.clients for each row execute function handle_updated_at();
create trigger projects_updated_at before update on public.projects for each row execute function handle_updated_at();
create trigger tasks_updated_at before update on public.tasks for each row execute function handle_updated_at();
