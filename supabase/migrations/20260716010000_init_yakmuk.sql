-- 약먹었약 pre: 3역할 가족 모델 + 루프 trace + RLS
-- role: family_leader | guardian | care_recipient
-- run = (user_id, date_kst) 하루 / turn = 액션 단위

create extension if not exists "pgcrypto";

create table public.families (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

-- 보호자·피보호자 초대 슬롯 (가족장만 발급)
create table public.family_invites (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  invite_code text not null unique,
  invited_as text not null,
  target_role text not null check (target_role in ('guardian', 'care_recipient')),
  claimed_by uuid references auth.users(id),
  claimed_at timestamptz,
  created_at timestamptz not null default now(),
  constraint family_invites_code_len check (char_length(invite_code) = 6)
);

create index family_invites_family_role_idx
  on public.family_invites (family_id, target_role);

create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  nickname text not null,
  invited_as text,
  role text not null check (role in ('family_leader', 'guardian', 'care_recipient')),
  family_id uuid references public.families(id),
  expo_push_token text,
  created_at timestamptz not null default now()
);

create or replace function public.current_family_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select family_id from public.users where id = auth.uid();
$$;

-- 가족장·보호자가 피보호자 약을 관리할 수 있는지
create or replace function public.can_manage_member_meds(target_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    target_user_id = auth.uid()
    or exists (
      select 1
      from public.users me
      join public.users target on target.id = target_user_id
      where me.id = auth.uid()
        and me.role in ('family_leader', 'guardian')
        and target.role = 'care_recipient'
        and me.family_id is not null
        and me.family_id = target.family_id
    );
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

-- 가족장: 가족 생성 + 본인 users 행
create or replace function public.create_family_as_leader(
  p_family_name text,
  p_nickname text default '가족장'
)
returns public.families
language plpgsql
security definer
set search_path = public
as $$
declare
  fam public.families;
  existing_fid uuid;
  family_name text := nullif(trim(p_family_name), '');
  nickname text := coalesce(nullif(trim(p_nickname), ''), '가족장');
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;

  if family_name is null then
    raise exception 'family name required';
  end if;

  select family_id into existing_fid from public.users where id = auth.uid();
  if existing_fid is not null then
    select * into fam from public.families where id = existing_fid;
    return fam;
  end if;

  insert into public.families (name, created_by)
  values (family_name, auth.uid())
  returning * into fam;

  insert into public.users (id, nickname, invited_as, role, family_id)
  values (auth.uid(), nickname, null, 'family_leader', fam.id)
  on conflict (id) do update
    set nickname = excluded.nickname,
        invited_as = null,
        role = 'family_leader',
        family_id = excluded.family_id;

  return fam;
end;
$$;

-- 가족장: 보호자/피보호자 초대 슬롯
create or replace function public.create_family_invite(
  p_invited_as text,
  p_target_role text
)
returns public.family_invites
language plpgsql
security definer
set search_path = public
as $$
declare
  fid uuid;
  invite public.family_invites;
  code text;
  attempts int := 0;
  invite_count int;
  max_invites int;
  invited_as text := nullif(trim(p_invited_as), '');
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;

  if invited_as is null then
    raise exception 'invited_as required';
  end if;

  if p_target_role not in ('guardian', 'care_recipient') then
    raise exception 'invalid target_role';
  end if;

  select family_id into fid from public.users
  where id = auth.uid() and role = 'family_leader';

  if fid is null then
    raise exception 'family leader required';
  end if;

  max_invites := case when p_target_role = 'guardian' then 3 else 4 end;

  select count(*) into invite_count
  from public.family_invites
  where family_id = fid and target_role = p_target_role;

  if invite_count >= max_invites then
    raise exception 'invite limit reached (max %)', max_invites;
  end if;

  loop
    code := public.generate_invite_code();
    begin
      insert into public.family_invites (family_id, invite_code, invited_as, target_role)
      values (fid, code, invited_as, p_target_role)
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

-- 보호자/피보호자: 코드로 조인 (닉네임 선택, 비우면 invited_as)
create or replace function public.claim_family_invite(
  p_code text,
  p_nickname text default null
)
returns public.users
language plpgsql
security definer
set search_path = public
as $$
declare
  invite public.family_invites;
  u public.users;
  display_name text;
  existing_fid uuid;
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;

  select family_id into existing_fid from public.users where id = auth.uid();
  if existing_fid is not null then
    raise exception 'already in a family';
  end if;

  select * into invite
  from public.family_invites
  where upper(invite_code) = upper(trim(p_code))
  for update;

  if not found then
    raise exception 'invalid invite code';
  end if;

  if invite.claimed_by is not null then
    raise exception 'invite already claimed';
  end if;

  display_name := coalesce(nullif(trim(p_nickname), ''), invite.invited_as);

  insert into public.users (id, nickname, invited_as, role, family_id)
  values (auth.uid(), display_name, invite.invited_as, invite.target_role, invite.family_id)
  on conflict (id) do update
    set nickname = excluded.nickname,
        invited_as = excluded.invited_as,
        role = excluded.role,
        family_id = excluded.family_id
  returning * into u;

  update public.family_invites
  set claimed_by = auth.uid(), claimed_at = now()
  where id = invite.id;

  return u;
end;
$$;

-- 가족장: 미클레임 초대만 삭제
create or replace function public.delete_family_invite(p_invite_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  fid uuid;
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;

  select family_id into fid from public.users
  where id = auth.uid() and role = 'family_leader';

  if fid is null then
    raise exception 'family leader required';
  end if;

  delete from public.family_invites
  where id = p_invite_id
    and family_id = fid
    and claimed_by is null;

  if not found then
    raise exception 'invite not found or already claimed';
  end if;
end;
$$;

grant execute on function public.create_family_as_leader(text, text) to authenticated;
grant execute on function public.create_family_invite(text, text) to authenticated;
grant execute on function public.claim_family_invite(text, text) to authenticated;
grant execute on function public.delete_family_invite(uuid) to authenticated;
grant execute on function public.current_family_id() to authenticated;
grant execute on function public.can_manage_member_meds(uuid) to authenticated;

grant select, insert, update, delete on
  public.families,
  public.family_invites,
  public.users,
  public.medications,
  public.daily_logs,
  public.runs,
  public.turns
to authenticated;

grant usage, select on all sequences in schema public to authenticated;

alter table public.families enable row level security;
alter table public.family_invites enable row level security;
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

-- family_invites: 같은 가족 조회 (쓰기/삭제는 RPC)
create policy family_invites_select on public.family_invites
  for select using (family_id = public.current_family_id());

-- users
create policy users_select on public.users
  for select using (family_id = public.current_family_id() or id = auth.uid());

create policy users_update_self on public.users
  for update using (id = auth.uid());

-- medications: 같은 가족 조회 / 본인 또는 리더·보호자→피보호자 쓰기
create policy medications_select on public.medications
  for select using (
    exists (
      select 1 from public.users u
      where u.id = medications.user_id
        and u.family_id = public.current_family_id()
    )
  );

create policy medications_insert on public.medications
  for insert with check (public.can_manage_member_meds(user_id));

create policy medications_update on public.medications
  for update using (public.can_manage_member_meds(user_id));

create policy medications_delete on public.medications
  for delete using (public.can_manage_member_meds(user_id));

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
