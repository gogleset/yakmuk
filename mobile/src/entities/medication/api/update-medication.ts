import { supabase } from '@/shared/api/client';
import { throwIfError } from '@/shared/api/interceptor';
import { mapMedication } from '@/entities/medication/api/mappers';
import type { Medication } from '@/entities/medication/model/types';
import { ERRORS } from '@/shared/copy';

export async function updateMedication(input: {
  medicationId: number;
  name: string;
  scheduledTime: string;
  daysMask: string;
}): Promise<Medication> {
  const { data, error } = await supabase
    .from('medications')
    .update({
      name: input.name.trim(),
      scheduled_time: input.scheduledTime,
      days_mask: input.daysMask,
    })
    .eq('id', input.medicationId)
    .select('*')
    .single();
  throwIfError(error, ERRORS.med.updateFailed);
  if (!data) throw new Error(ERRORS.med.updateFailed);
  return mapMedication(data);
}
