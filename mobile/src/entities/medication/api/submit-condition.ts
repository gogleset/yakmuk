import { supabase } from '@/shared/api/client';
import { throwIfError } from '@/shared/api/interceptor';
import type { ConditionValue } from '@/entities/medication/model/types';
import { todayKstDateString } from '@/shared/lib/kst';

/** 오늘 컨디션 기록 (CRUD만 — alert/loop는 feature에서) */
export async function submitCondition(params: {
  userId: string;
  familyId: string;
  condition: ConditionValue;
  message?: string;
}): Promise<void> {
  const dateKst = todayKstDateString();

  await supabase
    .from('daily_logs')
    .delete()
    .eq('user_id', params.userId)
    .eq('log_date', dateKst)
    .is('medication_id', null)
    .not('condition', 'is', null);

  const { error } = await supabase.from('daily_logs').insert({
    medication_id: null,
    user_id: params.userId,
    log_date: dateKst,
    condition: params.condition,
    message: params.message?.trim() || null,
    family_id: params.familyId,
  });
  throwIfError(error);
}
