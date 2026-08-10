import { supabase } from '@/shared/api/client';
import { throwIfError } from '@/shared/api/interceptor';
import { mapFamilyFeedDayRead } from '@/entities/family/api/mappers';
import type { FamilyFeedDayRead } from '@/entities/family/model/types';

/** 본인 일자 읽음 (RLS: 자기 row만) */
export async function listFeedDayReads(
  familyId: string,
): Promise<FamilyFeedDayRead[]> {
  const { data, error } = await supabase
    .from('family_feed_day_reads')
    .select('user_id, family_id, log_date, read_at')
    .eq('family_id', familyId)
    .order('log_date', { ascending: false });
  throwIfError(error);
  return (data ?? []).map((row) =>
    mapFamilyFeedDayRead(row as Record<string, unknown>),
  );
}
