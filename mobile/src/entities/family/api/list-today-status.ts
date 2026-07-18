import { supabase } from '@/shared/api/client';
import { throwIfError } from '@/shared/api/interceptor';
import type { ConditionValue } from '@/entities/medication/model/types';
import type { CareRecipientTodayStatus } from '@/entities/family/model/types';
import { weekdayMon0FromKstDate, todayKstDateString } from '@/shared/lib/kst';

/** 오늘 days_mask에 스케줄된 약인지 */
function isScheduledOnDate(daysMask: string, dateKst: string): boolean {
  if (!daysMask || daysMask === 'daily') return true;
  const weekday = weekdayMon0FromKstDate(dateKst);
  return daysMask
    .split(',')
    .map((s) => s.trim())
    .includes(String(weekday));
}

export async function listTodayStatus(
  familyId: string,
  dateKst = todayKstDateString(),
): Promise<CareRecipientTodayStatus[]> {
  const { data: members, error: membersError } = await supabase
    .from('users')
    .select('id, nickname, invited_as, role')
    .eq('family_id', familyId)
    .order('nickname');
  throwIfError(membersError);
  if (!members?.length) return [];

  const memberIds = members.map((m) => m.id as string);

  const [
    { data: meds, error: medsError },
    { data: logs, error: logsError },
    { data: alerts, error: alertsError },
  ] = await Promise.all([
    supabase
      .from('medications')
      .select('id, user_id, days_mask')
      .in('user_id', memberIds)
      .is('deleted_at', null),
    supabase
      .from('daily_logs')
      .select('user_id, medication_id, status, condition, message')
      .eq('family_id', familyId)
      .eq('log_date', dateKst)
      .in('user_id', memberIds),
    supabase
      .from('family_alerts')
      .select('user_id')
      .eq('family_id', familyId)
      .is('acked_at', null)
      .in('user_id', memberIds),
  ]);

  throwIfError(medsError);
  throwIfError(logsError);
  throwIfError(alertsError);

  const alertUserIds = new Set((alerts ?? []).map((a) => String(a.user_id)));

  return members.map((member) => {
    const userId = String(member.id);
    // 당일 스케줄만 카운트
    const userMeds = (meds ?? []).filter(
      (m) =>
        String(m.user_id) === userId &&
        isScheduledOnDate(String(m.days_mask ?? 'daily'), dateKst),
    );
    const userLogs = (logs ?? []).filter((l) => String(l.user_id) === userId);
    const takenIds = new Set(
      userLogs
        .filter((l) => l.status === 'TAKEN' && l.medication_id != null)
        .map((l) => Number(l.medication_id)),
    );
    const conditionLog = userLogs.find((l) => l.condition != null);
    const totalMeds = userMeds.length;
    const takenCount = userMeds.filter((m) => takenIds.has(Number(m.id))).length;

    return {
      userId,
      nickname: String(member.nickname),
      invitedAs: member.invited_as ? String(member.invited_as) : null,
      role: member.role as CareRecipientTodayStatus['role'],
      totalMeds,
      takenCount,
      pendingCount: Math.max(0, totalMeds - takenCount),
      condition: (conditionLog?.condition as ConditionValue) ?? null,
      conditionMessage: conditionLog?.message
        ? String(conditionLog.message)
        : null,
      hasUnackedAlert: alertUserIds.has(userId),
    };
  });
}
