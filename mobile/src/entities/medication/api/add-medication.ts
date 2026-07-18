import { supabase } from '@/shared/api/client';
import { throwIfError } from '@/shared/api/interceptor';
import { mapMedication } from '@/entities/medication/api/mappers';
import type { MedScheduleSlot } from '@/entities/medication/lib/daysMask';
import type { Medication } from '@/entities/medication/model/types';
import { ERRORS } from '@/shared/copy';

export async function addMedication(input: {
  userId: string;
  name: string;
  scheduledTime: string;
  daysMask?: string;
}): Promise<Medication> {
  const rows = await addMedications({
    userId: input.userId,
    name: input.name,
    slots: [
      {
        scheduledTime: input.scheduledTime,
        daysMask: input.daysMask ?? 'daily',
      },
    ],
  });
  const first = rows[0];
  if (!first) throw new Error(ERRORS.med.addFailed);
  return first;
}

/** 슬롯 N개를 한 번에 insert (부분 성공 방지) */
export async function addMedications(input: {
  userId: string;
  name: string;
  slots: MedScheduleSlot[];
}): Promise<Medication[]> {
  if (input.slots.length === 0) {
    throw new Error(ERRORS.med.scheduleEmpty);
  }

  const payload = input.slots.map((slot) => ({
    user_id: input.userId,
    name: input.name,
    scheduled_time: slot.scheduledTime,
    days_mask: slot.daysMask || 'daily',
  }));

  const { data, error } = await supabase
    .from('medications')
    .insert(payload)
    .select('*');
  throwIfError(error, ERRORS.med.addFailed);
  if (!data?.length) throw new Error(ERRORS.med.addFailed);
  return data.map(mapMedication);
}
