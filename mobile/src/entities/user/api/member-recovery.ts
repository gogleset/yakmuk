import { supabase } from '@/shared/api/client';
import { throwIfError } from '@/shared/api/interceptor';
import { ERRORS } from '@/shared/copy';

export type MemberRecoveryCode = {
  id: string;
  familyId: string;
  userId: string;
  inviteCode: string;
  createdAt: string;
  usedAt: string | null;
};

function mapRecovery(row: Record<string, unknown>): MemberRecoveryCode {
  return {
    id: String(row.id),
    familyId: String(row.family_id),
    userId: String(row.user_id),
    inviteCode: String(row.invite_code),
    createdAt: String(row.created_at),
    usedAt: row.used_at ? String(row.used_at) : null,
  };
}

/** 가족장: 멤버 복구코드 발급/교체 */
export async function reissueMemberRecoveryCode(
  userId: string,
): Promise<MemberRecoveryCode> {
  const { data, error } = await supabase.rpc('reissue_member_recovery_code', {
    p_user_id: userId,
  });
  throwIfError(error, ERRORS.recovery.createFailed);
  if (!data) throw new Error(ERRORS.recovery.createFailed);
  return mapRecovery(data as Record<string, unknown>);
}

/** 미사용 복구코드 목록 (가족장 설정용) */
export async function listActiveRecoveryCodes(): Promise<MemberRecoveryCode[]> {
  const { data, error } = await supabase
    .from('member_recovery_codes')
    .select('*')
    .is('used_at', null)
    .order('created_at', { ascending: false });
  throwIfError(error);
  return (data ?? []).map(mapRecovery);
}
