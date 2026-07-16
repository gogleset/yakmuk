-- 약먹었약 pre: 도메인 + 루프 trace + RLS
-- run = (user_id, date_kst) 하루 / turn = 액션 단위

create extension if not exists "pgcrypto";

create table public.families (
  id uuid primary key default gen_random_uuid(),
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

-- 피보호자 슬롯: guardian이 nickname·invite_code 사전 설정
create table public.care_invites (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  invite_code text not null unique,
  nickname text not null,
  claimed_by uuid references auth.users(id),
  claimed_at timestamptz,
  created_at timestamptz not null default now(),
  constraint care_invites_code_len check (char_length(invite_code) = 6)
);

create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  nickname text not null,
  role text not null check (role in ('guardian', 'care_recipient')),
  family_id uuid references public.families(id),
  expo_push_token text,
  created_at timestamptz not null default now()
);

-- 헬퍼: users 테이블 이후에 정의 (SQL 함수는 create 시점에 relation 검증)
create or replace function public.current_family_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select family_id from public.users where id = auth.uid();
$$;

create table public.medications (
  id bigserial primary key,
  user_id uuid not null references public.users(id) on delete cascade,
  name text not null,
  scheduled_time time not null,
  days_mask text not null default 'daily',
  created_at timestamptz not null default now()
);

create table public.daily_logs (
  id bigserial primary key,
  medication_id bigint references public.medications(id) on delete set null,
  user_id uuid not null references public.users(id) on delete cascade,
  log_date date not null,
  status text check (status is null or status in ('TAKEN', 'SKIPPED')),
  condition text check (condition is null or condition in ('GOOD', 'NORMAL', 'BAD')),
  message text,
  family_id uuid not null references public.families(id) on delete cascade,
  created_at timestamptz not null default now()
);

create index daily_logs_family_date_idx on public.daily_logs (family_id, log_date desc);
create index daily_logs_user_date_idx on public.daily_logs (user_id, log_date);

create table public.runs (
  id uuid primary key default gen_random_uuid(),
  goal text not null,
  status text not null,
  max_iterations int,
  max_wall_clock_ms int,
  ended_reason text,
  trigger text not null,
  owner_user_id uuid references public.users(id) on delete set null,
  goal_date date,
  created_at timestamptz not null default now(),
  ended_at timestamptz
);

create table public.turns (
  id uuid primary key default gen_random_uuid(),
  run_id uuid not null references public.runs(id) on delete cascade,
  turn int not null,
  plan_json jsonb,
  result_json jsonb,
  observe_json jsonb,
  verify_status text,
  created_at timestamptz not null default now(),
  unique (run_id, turn)
);

create index turns_run_idx on public.turns (run_id);

-- 6자리 초대코드 생성
create or replace function public.generate_invite_code()
returns text
language plpgsql
as $$
declare
  chars text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  result text := '';
  i int;
begin
  for i in 1..6 loop
    result := result || substr(chars, 1 + floor(random() * length(chars))::int, 1);
  end loop;
  return result;
end;
$$;

-- 보호자: 가족 생성 + 본인 users 행
create or replace function public.create_family_as_guardian(p_nickname text default '보호자')
returns public.families
language plpgsql
security definer
set search_path = public
as $$
declare
  fam public.families;
  existing_fid uuid;
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;

  select family_id into existing_fid from public.users where id = auth.uid();
  if existing_fid is not null then
    select * into fam from public.families where id = existing_fid;
    return fam;
  end if;

  insert into public.families (created_by)
  values (auth.uid())
  returning * into fam;

  insert into public.users (id, nickname, role, family_id)
  values (auth.uid(), p_nickname, 'guardian', fam.id)
  on conflict (id) do update
    set nickname = excluded.nickname,
        role = 'guardian',
        family_id = excluded.family_id;

  return fam;
end;
$$;

-- 보호자: 피보호자 슬롯 + 초대코드
create or replace function public.create_care_invite(p_nickname text)
returns public.care_invites
language plpgsql
security definer
set search_path = public
as $$
declare
  fid uuid;
  invite public.care_invites;
  code text;
  attempts int := 0;
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;

  select family_id into fid from public.users
  where id = auth.uid() and role = 'guardian';

  if fid is null then
    raise exception 'guardian family required';
  end if;

  loop
    code := public.generate_invite_code();
    begin
      insert into public.care_invites (family_id, invite_code, nickname)
      values (fid, code, p_nickname)
      returning * into invite;
      exit;
    exception when unique_violation then
      attempts := attempts + 1;
      if attempts > 10 then
        raise exception 'invite code generation failed';
      end if;
    end;
  end loop;

  return invite;
end;
$$;

-- 피보호자: 코드로 조인 (닉네임 UI 없음 — 슬롯 nickname 사용)
create or replace function public.claim_care_invite(p_code text)
returns public.users
language plpgsql
security definer
set search_path = public
as $$
declare
  invite public.care_invites;
  u public.users;
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;

  select * into invite
  from public.care_invites
  where upper(invite_code) = upper(trim(p_code))
  for update;

  if invite.id is null then
    raise exception 'invalid invite code';
  end if;

  if invite.claimed_by is not null then
    raise exception 'invite already claimed';
  end if;

  insert into public.users (id, nickname, role, family_id)
  values (auth.uid(), invite.nickname, 'care_recipient', invite.family_id)
  on conflict (id) do update
    set nickname = excluded.nickname,
        role = 'care_recipient',
        family_id = excluded.family_id
  returning * into u;

  update public.care_invites
  set claimed_by = auth.uid(), claimed_at = now()
  where id = invite.id;

  return u;
end;
$$;

grant execute on function public.create_family_as_guardian(text) to authenticated;
grant execute on function public.create_care_invite(text) to authenticated;
grant execute on function public.claim_care_invite(text) to authenticated;
grant execute on function public.current_family_id() to authenticated;

-- RLS와 별개로 table privilege 필요 (없으면 permission denied for table ...)
grant select, insert, update, delete on
  public.families,
  public.care_invites,
  public.users,
  public.medications,
  public.daily_logs,
  public.runs,
  public.turns
to authenticated;

grant usage, select on all sequences in schema public to authenticated;

alter table public.families enable row level security;
alter table public.care_invites enable row level security;
alter table public.users enable row level security;
alter table public.medications enable row level security;
alter table public.daily_logs enable row level security;
alter table public.runs enable row level security;
alter table public.turns enable row level security;

-- families
create policy families_select on public.families
  for select using (id = public.current_family_id() or created_by = auth.uid());

create policy families_insert on public.families
  for insert with check (created_by = auth.uid());

-- care_invites: 같은 가족 조회, guardian만 insert (RPC가 주로 사용)
create policy care_invites_select on public.care_invites
  for select using (family_id = public.current_family_id());

-- users
create policy users_select on public.users
  for select using (family_id = public.current_family_id() or id = auth.uid());

create policy users_update_self on public.users
  for update using (id = auth.uid());

-- medications: 같은 가족
create policy medications_select on public.medications
  for select using (
    exists (
      select 1 from public.users u
      where u.id = medications.user_id
        and u.family_id = public.current_family_id()
    )
  );

create policy medications_insert on public.medications
  for insert with check (
    user_id = auth.uid()
    or exists (
      select 1 from public.users me
      where me.id = auth.uid() and me.role = 'guardian'
        and me.family_id = (
          select family_id from public.users where id = medications.user_id
        )
    )
  );

create policy medications_update on public.medications
  for update using (
    user_id = auth.uid()
    or exists (
      select 1 from public.users me
      where me.id = auth.uid() and me.role = 'guardian'
        and me.family_id = (
          select family_id from public.users where id = medications.user_id
        )
    )
  );

create policy medications_delete on public.medications
  for delete using (user_id = auth.uid() or exists (
    select 1 from public.users me
    where me.id = auth.uid() and me.role = 'guardian'
      and me.family_id = (select family_id from public.users where id = medications.user_id)
  ));

-- daily_logs
create policy daily_logs_select on public.daily_logs
  for select using (family_id = public.current_family_id());

create policy daily_logs_insert on public.daily_logs
  for insert with check (
    family_id = public.current_family_id()
    and user_id = auth.uid()
  );

create policy daily_logs_update on public.daily_logs
  for update using (
    family_id = public.current_family_id()
    and user_id = auth.uid()
  );

create policy daily_logs_delete on public.daily_logs
  for delete using (
    family_id = public.current_family_id()
    and user_id = auth.uid()
  );

-- runs / turns: owner
create policy runs_select on public.runs
  for select using (owner_user_id = auth.uid());

create policy runs_insert on public.runs
  for insert with check (owner_user_id = auth.uid());

create policy runs_update on public.runs
  for update using (owner_user_id = auth.uid());

create policy turns_select on public.turns
  for select using (
    exists (select 1 from public.runs r where r.id = turns.run_id and r.owner_user_id = auth.uid())
  );

create policy turns_insert on public.turns
  for insert with check (
    exists (select 1 from public.runs r where r.id = turns.run_id and r.owner_user_id = auth.uid())
  );

-- Realtime
alter publication supabase_realtime add table public.daily_logs;
