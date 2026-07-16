import { supabase } from '@/shared/api/client';
import { throwIfError } from '@/shared/api/interceptor';

export async function createFamily(nickname = '보호자'): Promise<void> {
  const { error } = await supabase.rpc('create_family_as_guardian', {
    p_nickname: nickname,
  });
  throwIfError(error);
}
