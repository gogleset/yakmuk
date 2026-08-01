import { LIMITS } from '@/shared/constants';
import {
  expandPerWeekdaySchedule,
  expandSameSchedule,
  formatDaysMask,
  parseDaysMask,
  type DaysMode,
  type MedScheduleSlot,
} from '@/entities/medication/lib/daysMask';
import { parseTimeToMinutes } from '@/entities/medication/lib/timeSlots';
import type { Medication } from '@/entities/medication/model/types';
import type { ScheduleMode } from '@/entities/medication/ui/ScheduleModeToggle';

export type MedicationScheduleDraft = {
  scheduleMode: ScheduleMode;
  slotTimes: string[];
  daysMode: DaysMode;
  weekdays: number[];
  timesByDay: Record<number, string[]>;
  /** same 모드: 시간 → 알림 on/off (없으면 on) */
  notificationEnabledByTime: Record<string, boolean>;
  /** perWeekday: 요일 → 시간 → 알림 on/off */
  notificationEnabledByDayTime: Record<number, Record<string, boolean>>;
};

const DEFAULT_TIMES = [LIMITS.defaultDoseTime];

export function createDefaultScheduleDraft(): MedicationScheduleDraft {
  return {
    scheduleMode: 'same',
    slotTimes: [...DEFAULT_TIMES],
    daysMode: 'daily',
    weekdays: [],
    timesByDay: {},
    notificationEnabledByTime: {},
    notificationEnabledByDayTime: {},
  };
}

/** DB 행 묶음 → 퍼널 draft (같은 이름 일정) */
export function medsToScheduleDraft(meds: Medication[]): MedicationScheduleDraft {
  if (meds.length === 0) return createDefaultScheduleDraft();

  const perWeekday = meds.every((med) => {
    const { mode, days } = parseDaysMask(med.daysMask);
    return mode === 'weekday' && days.length === 1;
  });

  if (perWeekday) {
    const weekdays = [
      ...new Set(
        meds.map((med) => parseDaysMask(med.daysMask).days[0]!).filter(
          (day) => day != null,
        ),
      ),
    ].sort((a, b) => a - b);

    const timesByDay: Record<number, string[]> = {};
    const notificationEnabledByDayTime: Record<
      number,
      Record<string, boolean>
    > = {};
    for (const med of meds) {
      const day = parseDaysMask(med.daysMask).days[0]!;
      const prev = timesByDay[day] ?? [];
      timesByDay[day] = [...new Set([...prev, med.scheduledTime])].sort(
        (a, b) => parseTimeToMinutes(a) - parseTimeToMinutes(b),
      );
      const dayMap = notificationEnabledByDayTime[day] ?? {};
      // 같은 시간 여러 행이면 하나라도 off면 off
      dayMap[med.scheduledTime] =
        dayMap[med.scheduledTime] === false
          ? false
          : med.notificationEnabled !== false;
      notificationEnabledByDayTime[day] = dayMap;
    }

    return {
      scheduleMode: 'perWeekday',
      slotTimes: [...DEFAULT_TIMES],
      daysMode: 'daily',
      weekdays,
      timesByDay,
      notificationEnabledByTime: {},
      notificationEnabledByDayTime,
    };
  }

  const firstParsed = parseDaysMask(meds[0]!.daysMask);
  const slotTimes = [...new Set(meds.map((med) => med.scheduledTime))].sort(
    (a, b) => parseTimeToMinutes(a) - parseTimeToMinutes(b),
  );

  const notificationEnabledByTime: Record<string, boolean> = {};
  for (const med of meds) {
    notificationEnabledByTime[med.scheduledTime] =
      notificationEnabledByTime[med.scheduledTime] === false
        ? false
        : med.notificationEnabled !== false;
  }

  return {
    scheduleMode: 'same',
    slotTimes: slotTimes.length > 0 ? slotTimes : [...DEFAULT_TIMES],
    daysMode: firstParsed.mode,
    weekdays: firstParsed.days,
    timesByDay: {},
    notificationEnabledByTime,
    notificationEnabledByDayTime: {},
  };
}

export function expandScheduleDraft(
  draft: MedicationScheduleDraft,
): MedScheduleSlot[] {
  if (draft.scheduleMode === 'same') {
    return expandSameSchedule(
      draft.slotTimes,
      formatDaysMask(draft.daysMode, draft.weekdays),
      draft.notificationEnabledByTime,
    );
  }
  return expandPerWeekdaySchedule(
    draft.timesByDay,
    draft.notificationEnabledByDayTime,
  );
}

export function isSameScheduleDraft(
  a: MedicationScheduleDraft,
  b: MedicationScheduleDraft,
): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}
