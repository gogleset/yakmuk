import { supabase } from '@/shared/api/client';
import { throwIfError } from '@/shared/api/interceptor';
import { mapUser } from '@/entities/user/api/mappers';
import type { AppUser } from '@/entities/user/model/types';

export async function joinAsCareRecipient(inviteCode: string): Promise<AppUser> {
  const code = inviteCode.trim().toUpperCase();
  if (code.length !== 6) throw new Error('초대코드는 6자리입니다');

  const { data: sessionData } = await supabase.auth.getSession();
  if (!sessionData.session) {
    const { error: anonError } = await supabase.auth.signInAnonymously();
    throwIfError(anonError);
  }

  const { data, error } = await supabase.rpc('claim_care_invite', {
    p_code: code,
  });
  throwIfError(error, '조인 실패');
  if (!data) throw new Error('조인 실패');
  return mapUser(data as Record<string, unknown>);
}
