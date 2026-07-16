import { supabase } from '@/shared/api/client';
import { throwIfError } from '@/shared/api/interceptor';
import { createSupabaseLoopStore } from '@/shared/lib/loop/supabaseLoopStore';
import { stepDayLoop } from '@/shared/lib/loop/dayLoop';
import { todayKstDateString } from '@/shared/lib/kst';

const loopStore = createSupabaseLoopStore();

export async function toggleTaken(params: {
  userId: string;
  familyId: string;
  medicationId: number;
  currentlyTaken: boolean;
  pendingIdsAfter: number[];
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
  } else {
    const { error } = await supabase.from('daily_logs').insert({
      medication_id: params.medicationId,
      user_id: params.userId,
      log_date: dateKst,
      status: 'TAKEN',
      family_id: params.familyId,
    });
    throwIfError(error);
  }

  await stepDayLoop({
    store: loopStore,
    userId: params.userId,
    familyId: params.familyId,
    trigger: 'in_app',
    plan: { action: 'toggle_medication', medicationId: params.medicationId },
    actResult: {
      kind: 'toggle_medication',
      payload: {
        medicationId: params.medicationId,
        taken: !params.currentlyTaken,
      },
    },
    pendingMedicationIds: params.pendingIdsAfter,
    dateKst,
  });
}
