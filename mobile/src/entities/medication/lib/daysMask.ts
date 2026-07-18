import { LIMITS } from '@/shared/constants';

/** days_mask: `daily` | `0,2,4` (월=0 … 일=6) */

export type DaysMode = 'daily' | 'weekday';

export type MedScheduleSlot = {
  scheduledTime: string;
  daysMask: string;
};

export const WEEKDAY_LABELS = ['월', '화', '수', '목', '금', '토', '일'] as const;

/** defaultDoseTime → hour (파싱 실패 시 8) */
const DEFAULT_DOSE_HOUR = (() => {
  const hour = Number(LIMITS.defaultDoseTime.split(':')[0]);
  return Number.isFinite(hour) ? hour : 8;
})();

export function parseDaysMask(mask: string): {
  mode: DaysMode;
  days: number[];
} {
  if (!mask || mask === 'daily') {
    return { mode: 'daily', days: [] };
  }
  const days = mask
    .split(',')
    .map((s) => Number(s.trim()))
    .filter((n) => Number.isInteger(n) && n >= 0 && n <= 6)
    .sort((a, b) => a - b);
  return { mode: 'weekday', days: [...new Set(days)] };
}

export function formatDaysMask(mode: DaysMode, days: number[]): string {
  if (mode === 'daily') return 'daily';
  const unique = [...new Set(days.filter((d) => d >= 0 && d <= 6))].sort(
    (a, b) => a - b,
  );
  return unique.join(',');
}

export function isValidDaysMask(mode: DaysMode, days: number[]): boolean {
  if (mode === 'daily') return true;
  return days.some((d) => d >= 0 && d <= 6);
}

/** UI용 주기 라벨 */
export function formatDaysMaskLabel(mask: string): string {
  const { mode, days } = parseDaysMask(mask);
  if (mode === 'daily' || days.length === 0) return '매일';
  if (days.length === 7) return '매일';
  return days.map((d) => WEEKDAY_LABELS[d]).join('·');
}

/** 같은 일정: 공통 days_mask × 시간 N개 */
export function expandSameSchedule(
  times: string[],
  daysMask: string,
): MedScheduleSlot[] {
  const uniqueTimes = [...new Set(times.map((t) => t.trim()).filter(Boolean))];
  return uniqueTimes.map((scheduledTime) => ({ scheduledTime, daysMask }));
}

/** 요일마다 다르게: 요일 → 시간들 */
export function expandPerWeekdaySchedule(
  timesByDay: Record<number, string[]>,
): MedScheduleSlot[] {
  const slots: MedScheduleSlot[] = [];
  for (let day = 0; day <= 6; day++) {
    const times = timesByDay[day] ?? [];
    const unique = [...new Set(times.map((t) => t.trim()).filter(Boolean))];
    for (const scheduledTime of unique) {
      slots.push({ scheduledTime, daysMask: String(day) });
    }
  }
  return slots;
}

export type ScheduleValidationError =
  | 'no_times'
  | 'duplicate_times'
  | 'no_weekdays'
  | 'empty_day_times';

/** 같은 일정 입력 검증 */
export function validateSameSchedule(
  times: string[],
  mode: DaysMode,
  weekdays: number[],
): ScheduleValidationError | null {
  const trimmed = times.map((t) => t.trim()).filter(Boolean);
  if (trimmed.length === 0) return 'no_times';
  if (new Set(trimmed).size !== trimmed.length) return 'duplicate_times';
  if (!isValidDaysMask(mode, weekdays)) return 'no_weekdays';
  return null;
}

/** 요일별 입력 검증 */
export function validatePerWeekdaySchedule(
  selectedDays: number[],
  timesByDay: Record<number, string[]>,
): ScheduleValidationError | null {
  if (selectedDays.length === 0) return 'no_weekdays';
  for (const day of selectedDays) {
    const times = (timesByDay[day] ?? [])
      .map((t) => t.trim())
      .filter(Boolean);
    if (times.length === 0) return 'empty_day_times';
    if (new Set(times).size !== times.length) return 'duplicate_times';
  }
  return null;
}

export function scheduleValidationMessage(
  error: ScheduleValidationError,
): string {
  switch (error) {
    case 'no_times':
      return '알림 시간을 하나 이상 넣어 주세요';
    case 'duplicate_times':
      return '같은 시간이 중복됐어요';
    case 'no_weekdays':
      return '요일을 하나 이상 골라 주세요';
    case 'empty_day_times':
      return '고른 요일마다 시간을 넣어 주세요';
  }
}

/** HH:MM → Date (오늘 기준, 피커용) */
export function hhmmToDate(hhmm: string, base = new Date()): Date {
  const match = /^(\d{1,2}):(\d{2})$/.exec(hhmm.trim());
  const hour = match ? Number(match[1]) : DEFAULT_DOSE_HOUR;
  const minute = match ? Number(match[2]) : 0;
  const d = new Date(base);
  d.setHours(
    Number.isFinite(hour) ? Math.min(23, Math.max(0, hour)) : DEFAULT_DOSE_HOUR,
    Number.isFinite(minute) ? Math.min(59, Math.max(0, minute)) : 0,
    0,
    0,
  );
  return d;
}

/** Date → HH:MM */
export function dateToHhmm(date: Date): string {
  const h = String(date.getHours()).padStart(2, '0');
  const m = String(date.getMinutes()).padStart(2, '0');
  return `${h}:${m}`;
}
