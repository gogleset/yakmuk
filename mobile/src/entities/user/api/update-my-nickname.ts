import { supabase } from '@/shared/api/client';
import { throwIfError } from '@/shared/api/interceptor';
import { mapUser } from '@/entities/user/api/mappers';
import type { AppUser } from '@/entities/user/model/types';
import { ERRORS } from '@/shared/copy';

export async function updateMyNickname(nickname: string): Promise<AppUser> {
  const trimmed = nickname.trim();
  if (!trimmed) throw new Error(ERRORS.family.nicknameRequired);

  console.log('[nickname] update 요청', { nickname: trimmed });

  const { data, error } = await supabase.rpc('update_my_nickname', {
    p_nickname: trimmed,
  });

  console.log('[nickname] update 응답', {
    nickname: trimmed,
    data,
    error: error
      ? { message: error.message, code: error.code, details: error.details }
      : null,
  });

  throwIfError(error, ERRORS.family.nicknameChangeFailed);
  if (!data) throw new Error(ERRORS.family.nicknameChangeFailed);
  return mapUser(data as Record<string, unknown>);
}
