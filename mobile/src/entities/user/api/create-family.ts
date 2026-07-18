import { supabase } from '@/shared/api/client';
import { throwIfError } from '@/shared/api/interceptor';
import { ERRORS } from '@/shared/copy';

/** 가족장: 가족 생성 + 본인 프로필 */
export async function createFamily(
  familyName: string,
  nickname = '가족장',
): Promise<void> {
  const name = familyName.trim();
  if (!name) throw new Error(ERRORS.family.nameRequired);

  const { data: sessionData } = await supabase.auth.getSession();
  if (!sessionData.session) {
    throw new Error(ERRORS.auth.required);
  }

  const { error } = await supabase.rpc('create_family_as_leader', {
    p_family_name: name,
    p_nickname: nickname.trim() || '가족장',
  });
  throwIfError(error, ERRORS.family.createFailed);
}
