import { supabase } from '@/shared/api/client';
import { throwIfError } from '@/shared/api/interceptor';
import type { FamilyMember } from '@/entities/family/model/types';

/** 같은 가족 멤버 목록 (역할·초대호칭 포함) */
export async function listFamilyMembers(
  familyId: string,
): Promise<FamilyMember[]> {
  const { data, error } = await supabase
    .from('users')
    .select('id, nickname, invited_as, role')
    .eq('family_id', familyId)
    .order('role', { ascending: true })
    .order('nickname');
  throwIfError(error);

  return (data ?? []).map((row) => ({
    userId: String(row.id),
    nickname: String(row.nickname),
    invitedAs: row.invited_as ? String(row.invited_as) : null,
    role: row.role as FamilyMember['role'],
  }));
}
