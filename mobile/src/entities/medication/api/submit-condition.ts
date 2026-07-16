import { supabase } from '@/shared/api/client';
import { throwIfError } from '@/shared/api/interceptor';
import { upsertAlert } from '@/entities/family/api/upsert-alert';
import { createSupabaseLoopStore } from '@/shared/lib/loop/supabaseLoopStore';
import { stepDayLoop } from '@/shared/lib/loop/dayLoop';
import type { ConditionValue } from '@/entities/medication/model/types';
import { todayKstDateString } from '@/shared/lib/kst';

const loopStore = createSupabaseLoopStore();

export async function submitCondition(params: {
  userId: string;
  familyId: string;
  condition: ConditionValue;
  message?: string;
  pendingIds: number[];
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

  if (params.condition === 'BAD') {
    await upsertAlert({
      familyId: params.familyId,
      userId: params.userId,
      kind: 'bad_condition',
      message: params.message?.trim() || '오늘 컨디션이 좋지 않아요',
      payload: { dateKst, condition: 'BAD' },
    });
  }

  await stepDayLoop({
    store: loopStore,
    userId: params.userId,
    familyId: params.familyId,
    trigger: 'in_app',
    plan: { action: 'submit_condition', condition: params.condition },
    actResult: {
      kind: 'submit_condition',
      payload: { condition: params.condition },
    },
    pendingMedicationIds: params.pendingIds,
    dateKst,
  });
}
