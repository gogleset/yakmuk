import { supabase } from '@/shared/api/client';
import { throwIfError } from '@/shared/api/interceptor';
import { mapMedication } from '@/entities/medication/api/mappers';
import type { Medication } from '@/entities/medication/model/types';

export async function addMedication(input: {
  userId: string;
  name: string;
  scheduledTime: string;
}): Promise<Medication> {
  const { data, error } = await supabase
    .from('medications')
    .insert({
      user_id: input.userId,
      name: input.name,
      scheduled_time: input.scheduledTime,
      days_mask: 'daily',
    })
    .select('*')
    .single();
  throwIfError(error, 'add med failed');
  if (!data) throw new Error('add med failed');
  return mapMedication(data);
}
