create extension if not exists "pgcrypto";

create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  full_name text not null,
  password_hash text not null default 'supabase-auth-managed',
  preferred_categories text[] not null default '{}'::text[],
  created_at timestamptz not null default now()
);

create table if not exists public.courses (
  id text primary key,
  title text not null,
  description text not null,
  thumbnail text not null,
  category text not null,
  provider text not null default 'YouTube',
  source_url text not null default 'https://www.youtube.com',
  created_at timestamptz not null default now()
);

create table if not exists public.lectures (
  id text primary key,
  course_id text not null references public.courses(id) on delete cascade,
  title text not null,
  youtube_video_id char(11) not null check (char_length(youtube_video_id) = 11),
  order_index integer not null,
  unique (course_id, order_index)
);

create table if not exists public.enrollments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  course_id text not null references public.courses(id) on delete cascade,
  enrolled_at timestamptz not null default now(),
  unique (user_id, course_id)
);

create table if not exists public.progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  lecture_id text not null references public.lectures(id) on delete cascade,
  completed_at timestamptz not null default now(),
  unique (user_id, lecture_id)
);

create table if not exists public.community_posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  course_id text not null references public.courses(id) on delete cascade,
  author_name text not null,
  body text not null check (char_length(body) > 0 and char_length(body) <= 800),
  created_at timestamptz not null default now()
);

create index if not exists idx_users_preferred_categories on public.users using gin (preferred_categories);
create index if not exists idx_courses_category on public.courses (category);
create index if not exists idx_lectures_course_order on public.lectures (course_id, order_index);
create index if not exists idx_enrollments_user_course on public.enrollments (user_id, course_id);
create index if not exists idx_progress_user_lecture on public.progress (user_id, lecture_id);
create index if not exists idx_community_posts_course_created on public.community_posts (course_id, created_at desc);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  preferred_categories text[] := '{}'::text[];
begin
  if new.raw_user_meta_data ? 'preferred_categories' then
    preferred_categories := coalesce(
      array(
        select jsonb_array_elements_text(new.raw_user_meta_data->'preferred_categories')
      ),
      '{}'::text[]
    );
  end if;

  insert into public.users (id, email, full_name, password_hash, preferred_categories)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data->>'full_name', split_part(coalesce(new.email, ''), '@', 1)),
    'supabase-auth-managed',
    preferred_categories
  )
  on conflict (id) do update set
    email = excluded.email,
    full_name = excluded.full_name,
    preferred_categories = excluded.preferred_categories;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

alter table public.users enable row level security;
alter table public.courses enable row level security;
alter table public.lectures enable row level security;
alter table public.enrollments enable row level security;
alter table public.progress enable row level security;
alter table public.community_posts enable row level security;

create policy "read public courses" on public.courses
  for select using (true);

create policy "read lectures" on public.lectures
  for select using (true);

create policy "read own user row" on public.users
  for select using (auth.uid() = id);

create policy "insert own user row" on public.users
  for insert with check (auth.uid() = id);

create policy "update own user row" on public.users
  for update using (auth.uid() = id);

create policy "read own enrollments" on public.enrollments
  for select using (auth.uid() = user_id);

create policy "insert own enrollments" on public.enrollments
  for insert with check (auth.uid() = user_id);

create policy "read own progress" on public.progress
  for select using (auth.uid() = user_id);

create policy "insert own progress" on public.progress
  for insert with check (auth.uid() = user_id);

create policy "update own progress" on public.progress
  for update using (auth.uid() = user_id);

create policy "read community posts" on public.community_posts
  for select using (true);

create policy "insert own community posts" on public.community_posts
  for insert with check (auth.uid() = user_id);

create policy "update own community posts" on public.community_posts
  for update using (auth.uid() = user_id);