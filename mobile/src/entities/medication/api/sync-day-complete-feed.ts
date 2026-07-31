import { supabase } from '@/shared/api/client';
import { throwIfError } from '@/shared/api/interceptor';
import { DAY_COMPLETE_FEED_MARKER } from '@/entities/medication/lib/dayCompleteFeed';
import { todayKstDateString } from '@/shared/lib/kst';

/** 하루 약 전부 복용 피드 로그 upsert/삭제 */
export async function syncDayCompleteFeedLog(params: {
  userId: string;
  familyId: string;
  allDone: boolean;
  dateKst?: string;
}): Promise<void> {
  const dateKst = params.dateKst ?? todayKstDateString();

  const { error: deleteError } = await supabase
    .from('daily_logs')
    .delete()
    .eq('user_id', params.userId)
    .eq('log_date', dateKst)
    .eq('family_id', params.familyId)
    .is('medication_id', null)
    .eq('status', 'TAKEN')
    .eq('message', DAY_COMPLETE_FEED_MARKER);
  throwIfError(deleteError);

  if (!params.allDone) return;

  const { error: insertError } = await supabase.from('daily_logs').insert({
    medication_id: null,
    user_id: params.userId,
    log_date: dateKst,
    status: 'TAKEN',
    message: DAY_COMPLETE_FEED_MARKER,
    family_id: params.familyId,
  });
  throwIfError(insertError);
}
