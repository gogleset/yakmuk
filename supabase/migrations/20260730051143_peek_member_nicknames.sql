-- peek_join_code: 가족 멤버 닉네임 목록 포함 (조인 프리뷰 카드용)
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
      'member_nicknames', to_jsonb(coalesce(member_nicks, '{}'::text[]))
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
