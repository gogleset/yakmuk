import { supabase } from '@/shared/api/client';
import { throwIfError } from '@/shared/api/interceptor';
import { todayKstDateString } from '@/shared/lib/kst';

/** 오늘 복약 체크/해제 (CRUD만 — day loop는 feature에서) */
export async function toggleTaken(params: {
  userId: string;
  familyId: string;
  medicationId: number;
  currentlyTaken: boolean;
}): Promise<void> {
  const dateKst = todayKstDateString();

  if (params.currentlyTaken) {
    const { error } = await supabase
      .from('daily_logs')
      .delete()
      .eq('user_id', params.userId)
      .eq('log_date', dateKst)
      .eq('medication_id', params.medicationId)
      .eq('status', 'TAKEN');
    throwIfError(error);
    return;
  }

  const { error } = await supabase.from('daily_logs').insert({
    medication_id: params.medicationId,
    user_id: params.userId,
    log_date: dateKst,
    status: 'TAKEN',
    family_id: params.familyId,
  });
  throwIfError(error);
}
