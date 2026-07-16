import { supabase } from '@/shared/api/client';
import { throwIfError } from '@/shared/api/interceptor';
import { mapDailyLog } from '@/entities/medication/api/mappers';
import type { DailyLog } from '@/entities/medication/model/types';

export async function listLogsInRange(
  userId: string,
  fromDate: string,
  toDate: string,
): Promise<DailyLog[]> {
  const { data, error } = await supabase
    .from('daily_logs')
    .select('*, medications(name)')
    .eq('user_id', userId)
    .gte('log_date', fromDate)
    .lte('log_date', toDate)
    .order('log_date', { ascending: true });
  throwIfError(error);
  return (data ?? []).map(mapDailyLog);
}
