import { supabase } from '@/shared/api/client';
import { weekdayMon0FromKstDate } from '@/shared/lib/kst';
import type { VerifyStatus } from '@/shared/lib/loop/types';

export type VerifyDayResult = {
  status: VerifyStatus;
  pendingMeds: number;
  conditionCount: number;
};

/**
 * 당일 복약+컨디션 검증 (루프 밖 단독 실행 가능)
 * pending_meds=0 && condition_count>=1 → success
 */
export async function verifyDay(
  userId: string,
  dateKst: string,
): Promise<VerifyDayResult> {
  if (!userId || !dateKst) {
    return { status: 'failed_verify', pendingMeds: -1, conditionCount: -1 };
  }

  const weekday = weekdayMon0FromKstDate(dateKst);

  const { data: meds, error: medsError } = await supabase
    .from('medications')
    .select('id, days_mask')
    .eq('user_id', userId);

  if (medsError) {
    console.error('[verifyDay] medications', medsError.message);
    return { status: 'failed_verify', pendingMeds: -1, conditionCount: -1 };
  }

  const scheduled = (meds ?? []).filter((m) => {
    if (m.days_mask === 'daily') return true;
    const parts = String(m.days_mask)
      .split(',')
      .map((s: string) => s.trim());
    return parts.includes(String(weekday));
  });

  // 스케줄이 0이면 데이터 모순으로 볼 수도 있으나, 빈 날은 continue로 둠
  const { data: takenLogs, error: takenError } = await supabase
    .from('daily_logs')
    .select('medication_id')
    .eq('user_id', userId)
    .eq('log_date', dateKst)
    .eq('status', 'TAKEN');

  if (takenError) {
    console.error('[verifyDay] taken', takenError.message);
    return { status: 'failed_verify', pendingMeds: -1, conditionCount: -1 };
  }

  const takenIds = new Set(
    (takenLogs ?? [])
      .map((l) => l.medication_id)
      .filter((id): id is number => id != null),
  );

  const pendingMeds = scheduled.filter((m) => !takenIds.has(m.id)).length;

  const { count: conditionCount, error: condError } = await supabase
    .from('daily_logs')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('log_date', dateKst)
    .in('condition', ['GOOD', 'NORMAL', 'BAD']);

  if (condError) {
    console.error('[verifyDay] condition', condError.message);
    return { status: 'failed_verify', pendingMeds, conditionCount: -1 };
  }

  const conditions = conditionCount ?? 0;

  if (pendingMeds === 0 && conditions >= 1) {
    return { status: 'success', pendingMeds, conditionCount: conditions };
  }

  return { status: 'continue', pendingMeds, conditionCount: conditions };
}
