-- 《圣经戏剧》公开回答与互动
-- 在 Supabase Dashboard > SQL Editor 中完整运行一次。

create extension if not exists pgcrypto;

create table if not exists public.responses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  question_id text not null check (char_length(question_id) between 3 and 120),
  act_id text not null check (char_length(act_id) between 1 and 80),
  prompt text not null check (char_length(prompt) between 3 and 500),
  display_name text not null check (char_length(btrim(display_name)) between 2 and 30),
  gender text not null check (gender in ('弟兄', '姊妹', '不愿说明')),
  content text not null check (char_length(btrim(content)) between 8 and 1200),
  status text not null default 'published' check (status in ('published', 'hidden')),
  created_at timestamptz not null default now()
);

create index if not exists responses_question_created_idx
  on public.responses (question_id, created_at desc)
  where status = 'published';

create table if not exists public.reactions (
  id uuid primary key default gen_random_uuid(),
  response_id uuid not null references public.responses(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  reaction_type text not null check (reaction_type in ('like', 'heart', 'encourage')),
  created_at timestamptz not null default now(),
  unique (response_id, user_id, reaction_type)
);

create index if not exists reactions_response_idx
  on public.reactions (response_id);

alter table public.responses enable row level security;
alter table public.reactions enable row level security;

drop policy if exists "read published responses" on public.responses;
create policy "read published responses"
  on public.responses for select
  to authenticated
  using (status = 'published');

drop policy if exists "publish own response" on public.responses;
create policy "publish own response"
  on public.responses for insert
  to authenticated
  with check (
    (select auth.uid()) = user_id
    and status = 'published'
  );

drop policy if exists "read reactions" on public.reactions;
create policy "read reactions"
  on public.reactions for select
  to authenticated
  using (true);

drop policy if exists "add own reaction" on public.reactions;
create policy "add own reaction"
  on public.reactions for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "remove own reaction" on public.reactions;
create policy "remove own reaction"
  on public.reactions for delete
  to authenticated
  using ((select auth.uid()) = user_id);

grant select, insert on public.responses to authenticated;
grant select, insert, delete on public.reactions to authenticated;

-- 回答不可由网页端任意修改或删除，隐藏内容请由项目管理员在 Table Editor 中
-- 将 responses.status 改为 hidden。
