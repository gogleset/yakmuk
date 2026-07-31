import type { Medication } from '@/entities/medication/model/types';

/** 하루 시간대 — scheduledTime으로 클라 버킷팅 */
export type TimeOfDaySlot = 'morning' | 'lunch' | 'evening' | 'bedtime';

export const TIME_SLOT_ORDER: TimeOfDaySlot[] = [
  'morning',
  'lunch',
  'evening',
  'bedtime',
];

/** HH:MM → 분. 파싱 실패 시 0 */
export function parseTimeToMinutes(scheduledTime: string): number {
  const [hoursRaw, minutesRaw] = scheduledTime.split(':');
  const hours = Number(hoursRaw);
  const minutes = Number(minutesRaw);
  if (
    !Number.isFinite(hours) ||
    !Number.isFinite(minutes) ||
    hours < 0 ||
    hours > 23 ||
    minutes < 0 ||
    minutes > 59
  ) {
    return 0;
  }
  return hours * 60 + minutes;
}

/** 아침 <11 / 점심 11–15 / 저녁 15–21 / 취침 ≥21 */
export function timeOfDaySlot(scheduledTime: string): TimeOfDaySlot {
  const minutes = parseTimeToMinutes(scheduledTime);
  if (minutes < 11 * 60) return 'morning';
  if (minutes < 15 * 60) return 'lunch';
  if (minutes < 21 * 60) return 'evening';
  return 'bedtime';
}

export type MedTimeGroup = {
  scheduledTime: string;
  slot: TimeOfDaySlot;
  meds: Medication[];
};

/** 동일 scheduledTime끼리 묶고 시간순 정렬 */
export function groupMedsByScheduledTime(
  meds: Medication[],
): MedTimeGroup[] {
  const byTime = new Map<string, Medication[]>();
  for (const med of meds) {
    const key = med.scheduledTime;
    const list = byTime.get(key);
    if (list) {
      list.push(med);
    } else {
      byTime.set(key, [med]);
    }
  }

  return [...byTime.entries()]
    .sort(
      ([timeA], [timeB]) =>
        parseTimeToMinutes(timeA) - parseTimeToMinutes(timeB),
    )
    .map(([scheduledTime, groupMeds]) => ({
      scheduledTime,
      slot: timeOfDaySlot(scheduledTime),
      meds: groupMeds,
    }));
}

export type TimedEntry = {
  key: string;
  name: string;
  scheduledTime: string | null;
  taken: boolean;
  /** manage 등 — 요일 라벨 */
  caption?: string;
  color?: string | null;
  doseAmount?: number | null;
  doseUnit?: string | null;
};

export type TimedEntryGroup = {
  scheduledTime: string;
  slot: TimeOfDaySlot;
  entries: TimedEntry[];
};

/** 과거일 엔트리도 동일 시간대 버킷 (시간 없으면 끝으로) */
export function groupTimedEntriesByScheduledTime(
  entries: TimedEntry[],
): TimedEntryGroup[] {
  const byTime = new Map<string, TimedEntry[]>();
  for (const entry of entries) {
    const key = entry.scheduledTime?.trim() || '';
    const list = byTime.get(key);
    if (list) {
      list.push(entry);
    } else {
      byTime.set(key, [entry]);
    }
  }

  return [...byTime.entries()]
    .sort(([timeA], [timeB]) => {
      if (!timeA) return 1;
      if (!timeB) return -1;
      return parseTimeToMinutes(timeA) - parseTimeToMinutes(timeB);
    })
    .map(([scheduledTime, groupEntries]) => ({
      scheduledTime: scheduledTime || '--:--',
      slot: scheduledTime ? timeOfDaySlot(scheduledTime) : 'morning',
      entries: groupEntries,
    }));
}
