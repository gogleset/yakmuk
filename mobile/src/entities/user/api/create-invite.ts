import { supabase } from '@/shared/api/client';
import { throwIfError } from '@/shared/api/interceptor';
import { mapCareInvite } from '@/entities/user/api/mappers';
import type { CareInvite } from '@/entities/user/model/types';

export async function createInvite(nickname: string): Promise<CareInvite> {
  const { data, error } = await supabase.rpc('create_care_invite', {
    p_nickname: nickname,
  });
  throwIfError(error, 'invite failed');
  if (!data) throw new Error('invite failed');
  return mapCareInvite(data as Record<string, unknown>);
}
