-- 초대 재발급으로 재진입 통일 · 클레임 슬롯 재발급 시 강제 로그아웃
-- family_invites.reentry_user_id · users.force_sign_out_at
-- reissue_invite_code: claimed 허용 · auth 세션 revoke
-- claim_join_code: reentry면 transfer_member_identity

alter table public.family_invites
  add column if not exists reentry_user_id uuid references auth.users(id);

alter table public.users
  add column if not exists force_sign_out_at timestamptz;

comment on column public.family_invites.reentry_user_id is
  '재입장 대기 — 클레임 재발급 시 이전 claimed_by. claim 시 transfer 대상';
comment on column public.users.force_sign_out_at is
  '리더 초대 재발급 등으로 강제 로그아웃 시각. 클라가 Alert 후 signOut';

-- Realtime: 강제 로그아웃 플래그 즉시 전달
do $$
begin
  alter publication supabase_realtime add table public.users;
exception
  when duplicate_object then null;
end $$;

-- auth 세션·리프레시 토큰 폐기 (security definer 전용)
create or replace function public.revoke_user_auth_sessions(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_user_id is null then
    return;
  end if;

  delete from auth.refresh_tokens
  where user_id = p_user_id::text;

  delete from auth.sessions
  where user_id = p_user_id;
end;
$$;

revoke all on function public.revoke_user_auth_sessions(uuid) from public, anon, authenticated;

create or replace function public.reissue_invite_code(p_invite_id uuid)
returns public.family_invites
language plpgsql
security definer
set search_path = public
as $$
declare
  fid uuid;
  invite public.family_invites;
  code text;
  kick_uid uuid;
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;

  select family_id into fid from public.users
  where id = auth.uid() and role = 'family_leader';

  if fid is null then
    raise exception 'family leader required';
  end if;

  select * into invite
  from public.family_invites
  where id = p_invite_id and family_id = fid
  for update;

  if not found then
    raise exception 'invite not found';
  end if;

  -- 클레임됨 → 재입장 대기로 전환 · 미클레임+재입장대기는 대상 유지
  if invite.claimed_by is not null then
    kick_uid := invite.claimed_by;
    invite.reentry_user_id := invite.claimed_by;
    invite.claimed_by := null;
    invite.claimed_at := null;
  elsif invite.reentry_user_id is not null then
    kick_uid := invite.reentry_user_id;
  end if;

  code := public.generate_unique_join_code();
  if code is null then
    raise exception 'invite code generation failed';
  end if;

  update public.family_invites
  set
    invite_code = code,
    claimed_by = invite.claimed_by,
    claimed_at = invite.claimed_at,
    reentry_user_id = invite.reentry_user_id
  where id = invite.id
  returning * into invite;

  if kick_uid is not null then
    update public.users
    set force_sign_out_at = now()
    where id = kick_uid;

    perform public.revoke_user_auth_sessions(kick_uid);
  end if;

  return invite;
end;
$$;

grant execute on function public.reissue_invite_code(uuid) to authenticated;

-- peek: claimed만 거부 · reentry(claimed null)는 일반 초대로 통과
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
  member_nicks text[];
  code text := upper(trim(p_code));
begin
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

    select coalesce(array_agg(u.nickname order by
      case u.role
        when 'family_leader' then 0
        when 'guardian' then 1
        else 2
      end,
      u.nickname
    ), '{}')
    into member_nicks
    from public.users u
    where u.family_id = invite.family_id;

    return jsonb_build_object(
      'kind', 'invite',
      'family_name', fam.name,
      'invited_as', invite.invited_as,
      'target_role', invite.target_role,
      'leader_nickname', coalesce(leader_nick, '가족장'),
      'member_nicknames', to_jsonb(coalesce(member_nicks, '{}'::text[])),
      'reentry', invite.reentry_user_id is not null
    );
  end if;

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

  select coalesce(array_agg(u.nickname order by
    case u.role
      when 'family_leader' then 0
      when 'guardian' then 1
      else 2
    end,
    u.nickname
  ), '{}')
  into member_nicks
  from public.users u
  where u.family_id = rec.family_id;

  return jsonb_build_object(
    'kind', 'recovery',
    'family_name', fam.name,
    'invited_as', coalesce(target.invited_as, target.nickname),
    'target_role', target.role,
    'leader_nickname', coalesce(leader_nick, '가족장'),
    'nickname', target.nickname,
    'member_nicknames', to_jsonb(coalesce(member_nicks, '{}'::text[]))
  );
end;
$$;

grant execute on function public.peek_join_code(text) to anon, authenticated;

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

  select * into invite
  from public.family_invites
  where upper(invite_code) = code
  for update;

  if found then
    if invite.claimed_by is not null then
      raise exception 'invite already claimed';
    end if;

    -- 재입장: 약·기록 identity 이전
    if invite.reentry_user_id is not null then
      u := public.transfer_member_identity(
        invite.reentry_user_id,
        auth.uid(),
        p_nickname
      );

      update public.family_invites
      set
        claimed_by = auth.uid(),
        claimed_at = now(),
        reentry_user_id = null
      where id = invite.id;

      update public.users
      set force_sign_out_at = null
      where id = auth.uid();

      return u;
    end if;

    display_name := coalesce(nullif(trim(p_nickname), ''), invite.invited_as);

    insert into public.users (id, nickname, invited_as, role, family_id)
    values (auth.uid(), display_name, invite.invited_as, invite.target_role, invite.family_id)
    on conflict (id) do update
      set nickname = excluded.nickname,
          invited_as = excluded.invited_as,
          role = excluded.role,
          family_id = excluded.family_id,
          force_sign_out_at = null
    returning * into u;

    update public.family_invites
    set claimed_by = auth.uid(), claimed_at = now(), reentry_user_id = null
    where id = invite.id;

    return u;
  end if;

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

grant execute on function public.claim_join_code(text, text) to authenticated;

-- transfer: reentry_user_id FK도 새 uid로 (중간 상태 대비)
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

  if exists (
    select 1 from public.users
    where id = p_new_user_id and family_id is not null
  ) then
    raise exception 'already in a family';
  end if;

  delete from public.users
  where id = p_new_user_id and family_id is null;

  display_name := coalesce(nullif(trim(p_nickname), ''), old_u.nickname);

  insert into public.users (id, nickname, invited_as, role, family_id, expo_push_token, force_sign_out_at)
  values (
    p_new_user_id,
    display_name,
    old_u.invited_as,
    old_u.role,
    old_u.family_id,
    null,
    null
  );

  update public.medications set user_id = p_new_user_id where user_id = p_old_user_id;
  update public.daily_logs set user_id = p_new_user_id where user_id = p_old_user_id;
  update public.family_alerts set user_id = p_new_user_id where user_id = p_old_user_id;
  update public.runs set owner_user_id = p_new_user_id where owner_user_id = p_old_user_id;
  update public.family_invites set claimed_by = p_new_user_id where claimed_by = p_old_user_id;
  update public.family_invites set reentry_user_id = p_new_user_id where reentry_user_id = p_old_user_id;
  update public.member_recovery_codes set user_id = p_new_user_id where user_id = p_old_user_id;

  delete from public.users where id = p_old_user_id;

  select * into new_u from public.users where id = p_new_user_id;
  return new_u;
end;
$$;
