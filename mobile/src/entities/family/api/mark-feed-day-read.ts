import { supabase } from '@/shared/api/client';
import { throwIfError } from '@/shared/api/interceptor';

/** 해당 일자를 읽음으로 upsert (read_at = now) */
export async function markFeedDayRead(
  familyId: string,
  logDate: string,
): Promise<void> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  throwIfError(userError);
  if (!user?.id) {
    throw new Error('not authenticated');
  }

  const { error } = await supabase.from('family_feed_day_reads').upsert(
    {
      user_id: user.id,
      family_id: familyId,
      log_date: logDate,
      read_at: new Date().toISOString(),
    },
    { onConflict: 'user_id,family_id,log_date' },
  );
  throwIfError(error);
}
