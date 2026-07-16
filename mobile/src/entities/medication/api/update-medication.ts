import { supabase } from '@/shared/api/client';
import { throwIfError } from '@/shared/api/interceptor';
import { mapMedication } from '@/entities/medication/api/mappers';
import type { Medication } from '@/entities/medication/model/types';

export async function updateMedication(input: {
  medicationId: number;
  name: string;
  scheduledTime: string;
}): Promise<Medication> {
  const { data, error } = await supabase
    .from('medications')
    .update({
      name: input.name.trim(),
      scheduled_time: input.scheduledTime,
    })
    .eq('id', input.medicationId)
    .select('*')
    .single();
  throwIfError(error, 'update med failed');
  if (!data) throw new Error('update med failed');
  return mapMedication(data);
}
