import { supabase } from '@/shared/api/client';
import { throwIfError } from '@/shared/api/interceptor';
import { todayKstDateString } from '@/shared/lib/kst';

export async function listTodayTaken(
  userId: string,
  dateKst = todayKstDateString(),
): Promise<Set<number>> {
  const { data, error } = await supabase
    .from('daily_logs')
    .select('medication_id')
    .eq('user_id', userId)
    .eq('log_date', dateKst)
    .eq('status', 'TAKEN');
  throwIfError(error);
  return new Set(
    (data ?? [])
      .map((row) => row.medication_id)
      .filter((id): id is number => id != null),
  );
}
