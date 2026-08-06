import { supabase } from '@/shared/api/client';
import { throwIfError } from '@/shared/api/interceptor';
import type { ConditionValue } from '@/entities/medication/model/types';
import {
  buildWeeklyDigest,
  weekStartMondayKst,
  type DayDigestInput,
  type WeeklyDigestView,
} from '@/entities/family/lib/buildWeeklyDigest';
import { WEEKLY_DIGEST } from '@/shared/constants';
import {
  addDaysKst,
  todayKstDateString,
  weekdayMon0FromKstDate,
} from '@/shared/lib/kst';

function isScheduledOnDate(daysMask: string, dateKst: string): boolean {
  if (!daysMask || daysMask === 'daily') return true;
  const weekday = weekdayMon0FromKstDate(dateKst);
  return daysMask
    .split(',')
    .map((s) => s.trim())
    .includes(String(weekday));
}

/**
 * 피보호자 기준 최근 N일 집계 → 주간 안부 뷰.
 * 통계 대시보드 아님.
 */
export async function listWeeklyDigest(
  familyId: string,
  todayKst = todayKstDateString(),
): Promise<WeeklyDigestView> {
  const weekStart = weekStartMondayKst(todayKst);
  const dayCount = WEEKLY_DIGEST.dayCount;
  const fromDate = addDaysKst(todayKst, -(dayCount - 1));

  const { data: members, error: membersError } = await supabase
    .from('users')
    .select('id, role')
    .eq('family_id', familyId)
    .eq('role', 'care_recipient');
  throwIfError(membersError);

  const memberIds = (members ?? []).map((m) => String(m.id));
  if (memberIds.length === 0) {
    return buildWeeklyDigest([], weekStart);
  }

  const [
    { data: meds, error: medsError },
    { data: logs, error: logsError },
  ] = await Promise.all([
    supabase
      .from('medications')
      .select('id, user_id, days_mask')
      .in('user_id', memberIds)
      .is('deleted_at', null),
    supabase
      .from('daily_logs')
      .select('user_id, medication_id, status, condition, log_date')
      .eq('family_id', familyId)
      .gte('log_date', fromDate)
      .lte('log_date', todayKst)
      .in('user_id', memberIds),
  ]);
  throwIfError(medsError);
  throwIfError(logsError);

  const days: DayDigestInput[] = [];
  for (let i = 0; i < dayCount; i++) {
    const dateYmd = addDaysKst(fromDate, i);
    let totalMeds = 0;
    let takenCount = 0;
    let condition: ConditionValue | null = null;

    for (const userId of memberIds) {
      const userMeds = (meds ?? []).filter(
        (m) =>
          String(m.user_id) === userId &&
          isScheduledOnDate(String(m.days_mask ?? 'daily'), dateYmd),
      );
      const userLogs = (logs ?? []).filter(
        (l) => String(l.user_id) === userId && String(l.log_date) === dateYmd,
      );
      const takenIds = new Set(
        userLogs
          .filter((l) => l.status === 'TAKEN' && l.medication_id != null)
          .map((l) => Number(l.medication_id)),
      );
      totalMeds += userMeds.length;
      takenCount += userMeds.filter((m) => takenIds.has(Number(m.id))).length;
      const bad = userLogs.find((l) => l.condition === 'BAD');
      if (bad) condition = 'BAD';
      else if (!condition) {
        const c = userLogs.find((l) => l.condition != null);
        if (c?.condition) condition = c.condition as ConditionValue;
      }
    }

    days.push({ dateYmd, totalMeds, takenCount, condition });
  }

  return buildWeeklyDigest(days, weekStart);
}
