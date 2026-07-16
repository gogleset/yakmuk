import { supabase } from '@/shared/api/client';
import { throwIfError } from '@/shared/api/interceptor';
import { mapCareInvite } from '@/entities/user/api/mappers';
import type { CareInvite } from '@/entities/user/model/types';

export async function listInvites(): Promise<CareInvite[]> {
  const { data, error } = await supabase
    .from('care_invites')
    .select('*')
    .order('created_at', { ascending: false });
  throwIfError(error);
  return (data ?? []).map(mapCareInvite);
}
