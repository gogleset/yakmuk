-- 멤버 본인 복구코드 발급 (로그아웃·기기변경용)
-- 미사용 코드가 있으면 그대로 반환 · 없으면 신규
-- 리더 self-issue 금지 (cannot recover family leader)

create or replace function public.create_my_recovery_code()
returns public.member_recovery_codes
language plpgsql
security definer
set search_path = public
as $$
declare
  me public.users;
  rec public.member_recovery_codes;
  code text;
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;

  select * into me
  from public.users
  where id = auth.uid();

  if not found then
    raise exception 'profile not found';
  end if;

  if me.role = 'family_leader' then
    raise exception 'cannot recover family leader';
  end if;

  if me.role not in ('guardian', 'care_recipient') then
    raise exception 'profile not found';
  end if;

  if me.family_id is null then
    raise exception 'profile not found';
  end if;

  -- 미사용 코드 있으면 재사용 (로그아웃 연타 시 코드 폭증 방지)
  select * into rec
  from public.member_recovery_codes
  where user_id = me.id
    and used_at is null
  order by created_at desc
  limit 1;

  if found then
    return rec;
  end if;

  code := public.generate_unique_join_code();
  if code is null then
    raise exception 'recovery code generation failed';
  end if;

  insert into public.member_recovery_codes (family_id, user_id, invite_code)
  values (me.family_id, me.id, code)
  returning * into rec;

  return rec;
end;
$$;

grant execute on function public.create_my_recovery_code() to authenticated;

comment on function public.create_my_recovery_code() is
  '멤버(guardian/care_recipient) 본인 복구코드 — 미사용 있으면 반환, 없으면 신규';
