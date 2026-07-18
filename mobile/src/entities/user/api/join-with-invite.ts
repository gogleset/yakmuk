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
  console.log('[join-debug] start', { code, nickname: nickname ?? null });
  if (code.length !== LIMITS.inviteCodeLength) {
    throw new Error(ERRORS.invite.codeLength);
  }
  const { data: sessionData } = await supabase.auth.getSession();
  if (!sessionData.session) {
    console.log('[join-debug] no session → signInAnonymously');
    const { error: anonError } = await supabase.auth.signInAnonymously();
    throwIfError(anonError);
  } else {
    console.log('[join-debug] existing session', {
      userId: sessionData.session.user.id,
      isAnonymous: !!sessionData.session.user.is_anonymous,
    });
  }

  console.log('[join-debug] claim_join_code…');
  const { data, error } = await supabase.rpc('claim_join_code', {
    p_code: code,
    p_nickname: nickname?.trim() ? nickname.trim() : null,
  });
  if (error) {
    console.warn('[join-debug] rpc error', error.message, error);
  }
  throwIfError(error, ERRORS.invite.joinFailed);
  if (!data) throw new Error(ERRORS.invite.joinFailed);
  const user = mapUser(data as Record<string, unknown>);
  console.log('[join-debug] ok', {
    id: user.id,
    familyId: user.familyId,
    role: user.role,
    nickname: user.nickname,
  });
  return user;
}
