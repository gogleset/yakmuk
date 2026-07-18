-- P2: 멤버 기기 복구 (약·로그 identity 유지, auth.uid만 교체)

create table public.member_recovery_codes (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  invite_code text not null unique,
  created_at timestamptz not null default now(),
  used_at timestamptz,
  constraint member_recovery_code_len check (char_length(invite_code) = 6)
);

-- 멤버당 미사용 복구코드 1개
create unique index member_recovery_active_user_idx
  on public.member_recovery_codes (user_id)
  where used_at is null;

create index member_recovery_family_idx
  on public.member_recovery_codes (family_id);

alter table public.member_recovery_codes enable row level security;

create policy member_recovery_select on public.member_recovery_codes
  for select using (family_id = public.current_family_id());

grant select on public.member_recovery_codes to authenticated;

-- 구 users 행 → 새 auth.uid 로 identity 이전 (med/logs/alerts/runs 유지)
create or replace function public.transfer_member_identity(
  p_old_user_id uuid,
  p_new_user_id uuid,
  p_nickname text default null
)
returns public.users
language plpgsql
security definer
set search_path = public
as $$
declare
  old_u public.users;
  new_u public.users;
  display_name text;
begin
  if p_old_user_id = p_new_user_id then
    select * into new_u from public.users where id = p_old_user_id;
    return new_u;
  end if;

  select * into old_u from public.users where id = p_old_user_id for update;
  if not found then
    raise exception 'member not found';
  end if;

  -- 새 uid에 이미 다른 가족이 있으면 불가
  if exists (
    select 1 from public.users
    where id = p_new_user_id and family_id is not null
  ) then
    raise exception 'already in a family';
  end if;

  -- 새 uid에 빈 프로필만 있으면 제거
  delete from public.users
  where id = p_new_user_id and family_id is null;

  display_name := coalesce(nullif(trim(p_nickname), ''), old_u.nickname);

  insert into public.users (id, nickname, invited_as, role, family_id, expo_push_token)
  values (
    p_new_user_id,
    display_name,
    old_u.invited_as,
    old_u.role,
    old_u.family_id,
    null  -- 새 기기: 푸시 토큰 초기화
  );

  update public.medications set user_id = p_new_user_id where user_id = p_old_user_id;
  update public.daily_logs set user_id = p_new_user_id where user_id = p_old_user_id;
  update public.family_alerts set user_id = p_new_user_id where user_id = p_old_user_id;
  update public.runs set owner_user_id = p_new_user_id where owner_user_id = p_old_user_id;
  update public.family_invites set claimed_by = p_new_user_id where claimed_by = p_old_user_id;
  update public.member_recovery_codes set user_id = p_new_user_id where user_id = p_old_user_id;

  delete from public.users where id = p_old_user_id;

  select * into new_u from public.users where id = p_new_user_id;
  return new_u;
end;
$$;

-- 가족장: 보호자/피보호자 복구코드 발급 (기존 미사용 코드 교체)
create or replace function public.reissue_member_recovery_code(p_user_id uuid)
returns public.member_recovery_codes
language plpgsql
security definer
set search_path = public
as $$
declare
  fid uuid;
  target public.users;
  rec public.member_recovery_codes;
  code text;
  attempts int := 0;
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;

  if p_user_id = auth.uid() then
    raise exception 'cannot recover yourself';
  end if;

  select family_id into fid from public.users
  where id = auth.uid() and role = 'family_leader';

  if fid is null then
    raise exception 'family leader required';
  end if;

  select * into target
  from public.users
  where id = p_user_id and family_id = fid;

  if not found then
    raise exception 'member not found';
  end if;

  if target.role = 'family_leader' then
    raise exception 'cannot recover family leader';
  end if;

  -- 기존 미사용 복구코드 제거
  delete from public.member_recovery_codes
  where user_id = p_user_id and used_at is null;

  loop
    code := public.generate_invite_code();
    begin
      insert into public.member_recovery_codes (family_id, user_id, invite_code)
      values (fid, p_user_id, code)
      returning * into rec;
      exit;
    exception when unique_violation then
      attempts := attempts + 1;
      if attempts > 10 then
        raise exception 'recovery code generation failed';
      end if;
    end;
  end loop;

  return rec;
end;
$$;

-- 조인 코드 프리뷰: 일반 초대 or 복구
create or replace function public.peek_join_code(p_code text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  invite public.family_invites;
  rec public.member_recovery_codes;
  target public.users;
  fam public.families;
  leader_nick text;
  code text := upper(trim(p_code));
begin
  -- 1) 일반 초대
  select * into invite
  from public.family_invites
  where upper(invite_code) = code;

  if found then
    if invite.claimed_by is not null then
      raise exception 'invite already claimed';
    end if;

    select * into fam from public.families where id = invite.family_id;
    select nickname into leader_nick
    from public.users
    where family_id = invite.family_id and role = 'family_leader'
    limit 1;

    return jsonb_build_object(
      'kind', 'invite',
      'family_name', fam.name,
      'invited_as', invite.invited_as,
      'target_role', invite.target_role,
      'leader_nickname', coalesce(leader_nick, '가족장')
    );
  end if;

  -- 2) 복구 코드
  select * into rec
  from public.member_recovery_codes
  where upper(invite_code) = code and used_at is null;

  if not found then
    raise exception 'invalid invite code';
  end if;

  select * into target from public.users where id = rec.user_id;
  if not found then
    raise exception 'invalid invite code';
  end if;

  select * into fam from public.families where id = rec.family_id;
  select nickname into leader_nick
  from public.users
  where family_id = rec.family_id and role = 'family_leader'
  limit 1;

  return jsonb_build_object(
    'kind', 'recovery',
    'family_name', fam.name,
    'invited_as', coalesce(target.invited_as, target.nickname),
    'target_role', target.role,
    'leader_nickname', coalesce(leader_nick, '가족장'),
    'nickname', target.nickname
  );
end;
$$;

-- 조인: 일반 초대 claim 또는 복구 transfer
create or replace function public.claim_join_code(
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
  rec public.member_recovery_codes;
  u public.users;
  display_name text;
  existing_fid uuid;
  code text := upper(trim(p_code));
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;

  select family_id into existing_fid from public.users where id = auth.uid();
  if existing_fid is not null then
    raise exception 'already in a family';
  end if;

  -- 1) 일반 초대
  select * into invite
  from public.family_invites
  where upper(invite_code) = code
  for update;

  if found then
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
  end if;

  -- 2) 복구
  select * into rec
  from public.member_recovery_codes
  where upper(invite_code) = code and used_at is null
  for update;

  if not found then
    raise exception 'invalid invite code';
  end if;

  u := public.transfer_member_identity(rec.user_id, auth.uid(), p_nickname);

  update public.member_recovery_codes
  set used_at = now(), user_id = auth.uid()
  where id = rec.id;

  return u;
end;
$$;

-- 구 peek/claim 호환: 새 RPC로 위임
create or replace function public.peek_family_invite(p_code text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
begin
  return public.peek_join_code(p_code);
end;
$$;

create or replace function public.claim_family_invite(
  p_code text,
  p_nickname text default null
)
returns public.users
language plpgsql
security definer
set search_path = public
as $$
begin
  return public.claim_join_code(p_code, p_nickname);
end;
$$;

grant execute on function public.reissue_member_recovery_code(uuid) to authenticated;
grant execute on function public.peek_join_code(text) to anon, authenticated;
grant execute on function public.claim_join_code(text, text) to authenticated;
