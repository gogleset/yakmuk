import type { DailyLog, DayMedStatus, Medication } from '@/entities/medication/model/types';
import { COLORS } from '@/shared/config/theme';
import { toKstDateStringFromIso, weekdayMon0FromKstDate } from '@/shared/lib/kst';

/** 해당 KST 날짜에 약이 존재했는지 (등록일·삭제일 기준) */
export function isMedActiveOnDate(med: Medication, dateKst: string): boolean {
  const createdDate = toKstDateStringFromIso(med.createdAt);
  if (dateKst < createdDate) return false;

  if (med.deletedAt) {
    const deletedDate = toKstDateStringFromIso(med.deletedAt);
    if (dateKst >= deletedDate) return false;
  }

  return true;
}

/** days_mask + 등록/삭제일 기준으로 그날 먹을 약인지 */
export function isMedScheduledOnDate(med: Medication, dateKst: string): boolean {
  if (!isMedActiveOnDate(med, dateKst)) return false;
  if (med.daysMask === 'daily') return true;
  const weekday = weekdayMon0FromKstDate(dateKst);
  return med.daysMask
    .split(',')
    .map((s) => s.trim())
    .includes(String(weekday));
}

function countOrphanTakenLogs(dayLogs: DailyLog[]): number {
  return dayLogs.filter(
    (log) => log.status === 'TAKEN' && log.medicationId == null,
  ).length;
}

/** 한 날짜의 복약 상태 집계 */
export function aggregateDayStatus(
  dateKst: string,
  medications: Medication[],
  logs: DailyLog[],
  todayKst?: string,
): DayMedStatus {
  const scheduled = medications.filter((med) => isMedScheduledOnDate(med, dateKst));
  const dayLogs = logs.filter((log) => log.logDate === dateKst);
  const orphanTakenCount = countOrphanTakenLogs(dayLogs);
  const totalObligations = scheduled.length + orphanTakenCount;

  if (totalObligations === 0) return 'empty';

  const today = todayKst ?? dateKst;

  // 미래 · 오늘 미체크 → 스케줄 점 (createdAt 이후 days_mask만 isMedScheduledOnDate에 포함)
  if (dateKst > today) return 'scheduled';

  const takenIds = new Set(
    dayLogs
      .filter((log) => log.status === 'TAKEN' && log.medicationId != null)
      .map((log) => log.medicationId as number),
  );

  const takenCount =
    scheduled.filter((med) => takenIds.has(med.id)).length + orphanTakenCount;

  if (dateKst === today) {
    if (takenCount === 0) return 'scheduled';
    if (takenCount >= totalObligations) return 'done';
    return 'partial';
  }

  if (takenCount === 0) return 'missed';
  if (takenCount >= totalObligations) return 'done';
  return 'partial';
}

export type DayMedicationEntry = {
  key: string;
  name: string;
  scheduledTime: string | null;
  taken: boolean;
};

/** 과거 날짜 상세 — 삭제된 약 체크 기록 포함 */
export function buildDayMedicationEntries(
  dateKst: string,
  medications: Medication[],
  logs: DailyLog[],
): DayMedicationEntry[] {
  const scheduled = medications.filter((med) => isMedScheduledOnDate(med, dateKst));
  const dayLogs = logs.filter((log) => log.logDate === dateKst);
  const takenIds = new Set(
    dayLogs
      .filter((log) => log.status === 'TAKEN' && log.medicationId != null)
      .map((log) => log.medicationId as number),
  );

  const entries: DayMedicationEntry[] = scheduled.map((med) => ({
    key: `med-${med.id}`,
    name: med.name,
    scheduledTime: med.scheduledTime,
    taken: takenIds.has(med.id),
  }));

  // hard delete 등으로 medication_id가 null인 과거 체크 기록
  for (const log of dayLogs) {
    if (log.status !== 'TAKEN' || log.medicationId != null) continue;
    entries.push({
      key: `orphan-${log.id}`,
      name: log.medicationName?.trim() || '삭제된 약',
      scheduledTime: null,
      taken: true,
    });
  }

  return entries;
}

export type CalendarMark = {
  marked?: boolean;
  dotColor?: string;
  selected?: boolean;
  selectedColor?: string;
};

const STATUS_DOT: Record<Exclude<DayMedStatus, 'empty'>, string> = {
  done: COLORS.success,
  partial: COLORS.warning,
  missed: COLORS.destructive,
  scheduled: COLORS.muted,
};

/** react-native-calendars markedDates 생성 */
export function buildMarkedDates(
  yearMonth: string, // YYYY-MM
  medications: Medication[],
  logs: DailyLog[],
  selectedDate?: string,
  todayKst?: string,
): Record<string, CalendarMark> {
  const [y, m] = yearMonth.split('-').map(Number);
  if (!y || !m) return {};

  const daysInMonth = new Date(Date.UTC(y, m, 0)).getUTCDate();
  const marked: Record<string, CalendarMark> = {};

  for (let day = 1; day <= daysInMonth; day++) {
    const dateKst = `${yearMonth}-${String(day).padStart(2, '0')}`;
    const status = aggregateDayStatus(dateKst, medications, logs, todayKst);
    const mark: CalendarMark = {};
    if (status !== 'empty') {
      mark.marked = true;
      mark.dotColor = STATUS_DOT[status];
    }
    if (selectedDate === dateKst) {
      mark.selected = true;
      mark.selectedColor = COLORS.brand;
    }
    if (mark.marked || mark.selected) {
      marked[dateKst] = mark;
    }
  }

  return marked;
}

/** 월 범위 YYYY-MM-DD */
export function monthRange(yearMonth: string): { from: string; to: string } {
  const [y, m] = yearMonth.split('-').map(Number);
  const last = new Date(Date.UTC(y, m, 0)).getUTCDate();
  return {
    from: `${yearMonth}-01`,
    to: `${yearMonth}-${String(last).padStart(2, '0')}`,
  };
}

export function addDaysKst(dateKst: string, delta: number): string {
  const [y, m, d] = dateKst.split('-').map(Number);
  if (!y || !m || !d) throw new Error(`invalid date_kst: ${dateKst}`);
  const utc = Date.UTC(y, m - 1, d, 12, 0, 0);
  const next = new Date(utc + delta * 24 * 60 * 60 * 1000);
  const yy = next.getUTCFullYear();
  const mm = String(next.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(next.getUTCDate()).padStart(2, '0');
  return `${yy}-${mm}-${dd}`;
}

/**
 * KST 기준 연속 all-done 일수.
 * done=+1, empty/scheduled=스킵 유지, partial/missed=끊김.
 */
export function computeStreakDays(
  medications: Medication[],
  logs: DailyLog[],
  todayKst: string,
  maxLookback = 60,
): number {
  let streak = 0;
  for (let i = 0; i < maxLookback; i++) {
    const dateKst = addDaysKst(todayKst, -i);
    const status = aggregateDayStatus(dateKst, medications, logs, todayKst);
    if (status === 'empty' || status === 'scheduled') continue;
    if (status === 'done') {
      streak += 1;
      continue;
    }
    break;
  }
  return streak;
}

export function currentYearMonthKst(dateKst: string): string {
  return dateKst.slice(0, 7);
}
