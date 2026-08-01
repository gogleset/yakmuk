import { supabase } from '@/shared/api/client';
import { throwIfError } from '@/shared/api/interceptor';
import { ERRORS } from '@/shared/copy';

/** 공지용 Expo push token 저장/클리어 */
export async function updateExpoPushToken(
  userId: string,
  token: string | null,
): Promise<void> {
  const { error } = await supabase
    .from('users')
    .update({ expo_push_token: token })
    .eq('id', userId);
  throwIfError(error, ERRORS.auth.profileLoadFailed);
}
