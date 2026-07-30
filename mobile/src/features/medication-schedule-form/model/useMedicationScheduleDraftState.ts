import { useMemo, useState } from 'react';
import { WEEKDAY_LABELS } from '@/entities/medication/lib/daysMask';
import {
  createDefaultScheduleDraft,
  type MedicationScheduleDraft,
} from '@/entities/medication/lib/scheduleDraft';
import type { ScheduleMode } from '@/entities/medication';
import { LIMITS } from '@/shared/config/theme';

const DEFAULT_TIMES = [LIMITS.defaultDoseTime];

export function useMedicationScheduleDraftState(
  initial?: MedicationScheduleDraft,
) {
  const [draft, setDraft] = useState<MedicationScheduleDraft>(
    initial ?? createDefaultScheduleDraft(),
  );

  const handleScheduleModeChange = (mode: ScheduleMode) => {
    if (mode === draft.scheduleMode) return;
    setDraft((prev) => {
      const next: MedicationScheduleDraft = { ...prev, scheduleMode: mode };
      if (mode === 'perWeekday') {
        const seed =
          prev.slotTimes.length > 0 ? prev.slotTimes : DEFAULT_TIMES;
        const timesByDay = { ...prev.timesByDay };
        for (const day of prev.weekdays) {
          if (!timesByDay[day]?.length) timesByDay[day] = [...seed];
        }
        next.timesByDay = timesByDay;
      }
      return next;
    });
  };

  const handleWeekdaysChange = (days: number[]) => {
    setDraft((prev) => {
      const next: MedicationScheduleDraft = { ...prev, weekdays: days };
      if (prev.scheduleMode !== 'perWeekday') return next;
      const seed = prev.slotTimes.length > 0 ? prev.slotTimes : DEFAULT_TIMES;
      const timesByDay: Record<number, string[]> = {};
      for (const day of days) {
        timesByDay[day] = prev.timesByDay[day]?.length
          ? prev.timesByDay[day]!
          : [...seed];
      }
      next.timesByDay = timesByDay;
      return next;
    });
  };

  const handleDaysModeChange = (daysMode: MedicationScheduleDraft['daysMode']) => {
    setDraft((prev) => ({
      ...prev,
      daysMode,
      // weekday↔daily 전환 시 요일 선택 리셋
      weekdays: daysMode === 'daily' ? [] : prev.weekdays,
    }));
  };

  const scheduleSummary = useMemo(() => {
    if (draft.scheduleMode === 'same') {
      const days =
        draft.daysMode === 'daily'
          ? '매일'
          : draft.weekdays.map((d) => WEEKDAY_LABELS[d]).join(', ');
      return `${draft.slotTimes.join(', ')} · ${days}`;
    }
    return draft.weekdays
      .map(
        (d) =>
          `${WEEKDAY_LABELS[d]} ${(draft.timesByDay[d] ?? []).join(', ')}`,
      )
      .join('\n');
  }, [draft]);

  return {
    draft,
    setDraft,
    scheduleSummary,
    handleScheduleModeChange,
    handleWeekdaysChange,
    handleDaysModeChange,
  };
}
