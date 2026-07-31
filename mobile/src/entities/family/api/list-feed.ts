import { supabase } from '@/shared/api/client';
import { throwIfError } from '@/shared/api/interceptor';
import { mapDailyLog } from '@/entities/medication/api/mappers';
import type { DailyLog } from '@/entities/medication/model/types';

type ListFeedOptions = {
  limit?: number;
  /** YYYY-MM-DD inclusive (KST log_date) */
  sinceLogDate?: string;
};

export async function listFeed(
  familyId: string,
  options: ListFeedOptions = {},
): Promise<DailyLog[]> {
  const limit = options.limit ?? 80;
  const sinceLogDate = options.sinceLogDate;

  let query = supabase
    .from('daily_logs')
    .select(
      `
      *,
      users!daily_logs_user_id_fkey(nickname),
      medications(name)
    `,
    )
    .eq('family_id', familyId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (sinceLogDate) {
    query = query.gte('log_date', sinceLogDate);
  }

  const { data, error } = await query;

  if (error) {
    console.warn('[feed] join failed, fallback', error.message);
    let plainQuery = supabase
      .from('daily_logs')
      .select('*')
      .eq('family_id', familyId)
      .order('created_at', { ascending: false })
      .limit(limit);
    if (sinceLogDate) {
      plainQuery = plainQuery.gte('log_date', sinceLogDate);
    }
    const { data: plain, error: plainError } = await plainQuery;
    throwIfError(plainError);

    const logs = (plain ?? []).map(mapDailyLog);
    const userIds = [...new Set(logs.map((l) => l.userId))];
    const medIds = [
      ...new Set(
        logs
          .map((l) => l.medicationId)
          .filter((id): id is number => id != null),
      ),
    ];

    const [{ data: users }, { data: meds }] = await Promise.all([
      userIds.length
        ? supabase.from('users').select('id, nickname').in('id', userIds)
        : Promise.resolve({ data: [] as { id: string; nickname: string }[] }),
      medIds.length
        ? supabase.from('medications').select('id, name').in('id', medIds)
        : Promise.resolve({ data: [] as { id: number; name: string }[] }),
    ]);

    const nickById = new Map(
      (users ?? []).map((u) => [String(u.id), String(u.nickname)]),
    );
    const nameById = new Map(
      (meds ?? []).map((m) => [Number(m.id), String(m.name)]),
    );

    return logs.map((log) => ({
      ...log,
      nickname: nickById.get(log.userId) ?? null,
      medicationName:
        log.medicationId != null ? (nameById.get(log.medicationId) ?? null) : null,
    }));
  }

  return (data ?? []).map(mapDailyLog);
}
