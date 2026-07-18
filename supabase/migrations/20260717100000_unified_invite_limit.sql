-- 가족 초대: 역할별 한도 → 가족당 총 4명

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
  v_invited_as text := nullif(trim(p_invited_as), '');
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;

  if v_invited_as is null then
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

  select count(*) into invite_count
  from public.family_invites
  where family_id = fid;

  if invite_count >= 4 then
    raise exception 'invite limit reached (max 4)';
  end if;

  code := public.generate_unique_join_code();
  insert into public.family_invites (family_id, invite_code, invited_as, target_role)
  values (fid, code, v_invited_as, p_target_role)
  returning * into invite;

  return invite;
end;
$$;
