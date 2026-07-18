import { supabase } from '@/shared/api/client';
import { throwIfError } from '@/shared/api/interceptor';
import { mapFamilyInvite } from '@/entities/user/api/mappers';
import type { FamilyInvite } from '@/entities/user/model/types';

export async function listInvites(): Promise<FamilyInvite[]> {
  const { data, error } = await supabase
    .from('family_invites')
    .select('*')
    .order('created_at', { ascending: false });
  throwIfError(error);
  return (data ?? []).map(mapFamilyInvite);
}
