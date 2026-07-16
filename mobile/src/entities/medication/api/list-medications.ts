import { supabase } from '@/shared/api/client';
import { throwIfError } from '@/shared/api/interceptor';
import { mapMedication } from '@/entities/medication/api/mappers';
import type { Medication } from '@/entities/medication/model/types';

export async function listMedications(userId: string): Promise<Medication[]> {
  const { data, error } = await supabase
    .from('medications')
    .select('*')
    .eq('user_id', userId)
    .is('deleted_at', null)
    .order('scheduled_time');
  throwIfError(error);
  return (data ?? []).map(mapMedication);
}
