import { supabase } from '@/shared/api/client';
import { throwIfError } from '@/shared/api/interceptor';
import { mapUser } from '@/entities/user/api/mappers';
import type { AppUser } from '@/entities/user/model/types';
import { LIMITS } from '@/shared/constants';
import { ERRORS } from '@/shared/copy';

/** 보호자/피보호자: 초대·복구 코드로 가족 참여 */
export async function joinWithInviteCode(
  inviteCode: string,
  nickname?: string | null,
): Promise<AppUser> {
  const code = inviteCode.trim().toUpperCase();
  if (code.length !== LIMITS.inviteCodeLength) {
    throw new Error(ERRORS.invite.codeLength);
  }
  const { data: sessionData } = await supabase.auth.getSession();
  if (!sessionData.session) {
    const { error: anonError } = await supabase.auth.signInAnonymously();
    throwIfError(anonError);
  }

  const { data, error } = await supabase.rpc('claim_join_code', {
    p_code: code,
    p_nickname: nickname?.trim() ? nickname.trim() : null,
  });
  throwIfError(error, ERRORS.invite.joinFailed);
  if (!data) throw new Error(ERRORS.invite.joinFailed);
  return mapUser(data as Record<string, unknown>);
}
