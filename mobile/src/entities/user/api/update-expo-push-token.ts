import { supabase } from '@/shared/api/client';
import { throwIfError } from '@/shared/api/interceptor';
import { ERRORS } from '@/shared/copy';

/** 디바이스 푸시 토큰 저장/클리어 (`users.push_token`) */
export async function updatePushToken(
  userId: string,
  token: string | null,
): Promise<void> {
  const { error } = await supabase
    .from('users')
    .update({ push_token: token })
    .eq('id', userId);
  throwIfError(error, ERRORS.auth.profileLoadFailed);
}

/** @deprecated 칼럼명 `push_token`. `updatePushToken` 사용. */
export const updateExpoPushToken = updatePushToken;
