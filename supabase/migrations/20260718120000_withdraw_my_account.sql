-- 회원 탈퇴
-- 가족장: 가족 전체 삭제 (delete_family와 동일)
-- 보호자/피보호자: 본인만 가족에서 제거

create or replace function public.withdraw_my_account()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  me public.users;
  fid uuid;
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;

  select * into me
  from public.users
  where id = auth.uid()
  for update;

  if not found then
    raise exception 'profile not found';
  end if;

  fid := me.family_id;

  if me.role = 'family_leader' then
    -- 가족장 탈퇴 = 가족 삭제 (멤버·초대·기록 cascade)
    delete from public.users where family_id = fid;
    delete from public.families where id = fid;
  else
    -- 초대 슬롯 비워서 한도 확보
    delete from public.family_invites
    where family_id = fid and claimed_by = me.id;

    delete from public.users where id = me.id;
  end if;
end;
$$;

grant execute on function public.withdraw_my_account() to authenticated;
