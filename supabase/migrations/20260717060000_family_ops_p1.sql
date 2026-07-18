-- P1: 닉네임/가족이름 · 미클레임 재발급 · 강퇴 · 가족삭제 · 초대 peek

-- 본인 닉네임 수정
create or replace function public.update_my_nickname(p_nickname text)
returns public.users
language plpgsql
security definer
set search_path = public
as $$
declare
  u public.users;
  nickname text := nullif(trim(p_nickname), '');
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;

  if nickname is null then
    raise exception 'nickname required';
  end if;

  update public.users
  set nickname = nickname
  where id = auth.uid()
  returning * into u;

  if not found then
    raise exception 'profile not found';
  end if;

  return u;
end;
$$;

-- 가족장: 가족 이름 수정
create or replace function public.update_family_name(p_name text)
returns public.families
language plpgsql
security definer
set search_path = public
as $$
declare
  fid uuid;
  fam public.families;
  family_name text := nullif(trim(p_name), '');
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;

  if family_name is null then
    raise exception 'family name required';
  end if;

  select family_id into fid from public.users
  where id = auth.uid() and role = 'family_leader';

  if fid is null then
    raise exception 'family leader required';
  end if;

  update public.families
  set name = family_name
  where id = fid
  returning * into fam;

  return fam;
end;
$$;

-- 가족장: 미클레임 초대코드 재발급
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
  attempts int := 0;
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

  if invite.claimed_by is not null then
    raise exception 'invite already claimed';
  end if;

  loop
    code := public.generate_invite_code();
    begin
      update public.family_invites
      set invite_code = code
      where id = invite.id
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

-- 가족장: 멤버 강퇴 (리더 본인 제외) · 슬롯 초대도 정리
create or replace function public.remove_family_member(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  fid uuid;
  target public.users;
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;

  if p_user_id = auth.uid() then
    raise exception 'cannot remove yourself';
  end if;

  select family_id into fid from public.users
  where id = auth.uid() and role = 'family_leader';

  if fid is null then
    raise exception 'family leader required';
  end if;

  select * into target
  from public.users
  where id = p_user_id and family_id = fid
  for update;

  if not found then
    raise exception 'member not found';
  end if;

  if target.role = 'family_leader' then
    raise exception 'cannot remove family leader';
  end if;

  -- 초대 슬롯 비워서 한도 확보
  delete from public.family_invites
  where family_id = fid and claimed_by = p_user_id;

  delete from public.users where id = p_user_id;
end;
$$;

-- 가족장: 가족 삭제 (멤버·초대·로그 cascade)
create or replace function public.delete_family()
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

  -- users.family_id FK가 RESTRICT라 멤버부터 제거
  delete from public.users where family_id = fid;
  delete from public.families where id = fid;
end;
$$;

-- 조인 전 프리뷰 (최소 정보 · anon 허용)
create or replace function public.peek_family_invite(p_code text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  invite public.family_invites;
  fam public.families;
  leader_nick text;
begin
  select * into invite
  from public.family_invites
  where upper(invite_code) = upper(trim(p_code));

  if not found then
    raise exception 'invalid invite code';
  end if;

  if invite.claimed_by is not null then
    raise exception 'invite already claimed';
  end if;

  select * into fam from public.families where id = invite.family_id;

  select nickname into leader_nick
  from public.users
  where family_id = invite.family_id and role = 'family_leader'
  limit 1;

  return jsonb_build_object(
    'family_name', fam.name,
    'invited_as', invite.invited_as,
    'target_role', invite.target_role,
    'leader_nickname', coalesce(leader_nick, '가족장')
  );
end;
$$;

grant execute on function public.update_my_nickname(text) to authenticated;
grant execute on function public.update_family_name(text) to authenticated;
grant execute on function public.reissue_invite_code(uuid) to authenticated;
grant execute on function public.remove_family_member(uuid) to authenticated;
grant execute on function public.delete_family() to authenticated;
grant execute on function public.peek_family_invite(text) to anon, authenticated;
