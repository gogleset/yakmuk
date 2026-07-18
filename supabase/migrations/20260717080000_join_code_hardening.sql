-- 초대/복구 코드 충돌 방지 + 복구코드는 가족장만 조회

-- 양쪽 테이블에서 유니크한 6자리 코드
create or replace function public.generate_unique_join_code()
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  code text;
  attempts int := 0;
begin
  loop
    code := public.generate_invite_code();
    exit when not exists (
      select 1 from public.family_invites where upper(invite_code) = code
    ) and not exists (
      select 1 from public.member_recovery_codes where upper(invite_code) = code
    );
    attempts := attempts + 1;
    if attempts > 20 then
      raise exception 'invite code generation failed';
    end if;
  end loop;
  return code;
end;
$$;

-- create_family_invite: 유니크 조인코드 사용
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

  code := public.generate_unique_join_code();
  insert into public.family_invites (family_id, invite_code, invited_as, target_role)
  values (fid, code, invited_as, p_target_role)
  returning * into invite;

  return invite;
end;
$$;

-- reissue_invite_code: 유니크 조인코드 사용
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

  code := public.generate_unique_join_code();
  update public.family_invites
  set invite_code = code
  where id = invite.id
  returning * into invite;

  return invite;
end;
$$;

-- reissue_member_recovery_code: 유니크 조인코드 사용
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

  delete from public.member_recovery_codes
  where user_id = p_user_id and used_at is null;

  code := public.generate_unique_join_code();
  insert into public.member_recovery_codes (family_id, user_id, invite_code)
  values (fid, p_user_id, code)
  returning * into rec;

  return rec;
end;
$$;

-- 복구코드: 가족장만 조회
drop policy if exists member_recovery_select on public.member_recovery_codes;
create policy member_recovery_select on public.member_recovery_codes
  for select using (
    family_id = public.current_family_id()
    and exists (
      select 1 from public.users me
      where me.id = auth.uid()
        and me.role = 'family_leader'
        and me.family_id = member_recovery_codes.family_id
    )
  );
