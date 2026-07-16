import { supabase } from '@/shared/api/client';
import { throwIfError } from '@/shared/api/interceptor';
import { mapMedication } from '@/entities/medication/api/mappers';
import type { Medication } from '@/entities/medication/model/types';

/** 캘린더·과거 기록용 — 삭제된 약 포함 */
export async function listMedicationsForCalendar(
  userId: string,
): Promise<Medication[]> {
  const { data, error } = await supabase
    .from('medications')
    .select('*')
    .eq('user_id', userId)
    .order('scheduled_time');
  throwIfError(error);
  return (data ?? []).map(mapMedication);
}
