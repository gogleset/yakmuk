import { Text, View } from 'react-native';
import { WEEKDAY_LABELS } from '@/entities/medication/lib/daysMask';
import type { MedicationScheduleDraft } from '@/entities/medication/lib/scheduleDraft';
import {
  DaysModeToggle,
  ScheduleModeToggle,
  TimeSlotList,
  WeekdayPicker,
} from '@/entities/medication';
import {
  resolveFormVisibility,
  type FormSurfaceMode,
} from '@/features/medication-schedule-form/lib/formVisibility';
import { LIMITS } from '@/shared/config/theme';
import { FadeInView } from '@/shared/ui';

const DEFAULT_TIMES = [LIMITS.defaultDoseTime];

type Props = {
  mode: FormSurfaceMode;
  nameConfirmed: boolean;
  draft: MedicationScheduleDraft;
  onDraftChange: (next: MedicationScheduleDraft) => void;
  onScheduleModeChange: (mode: MedicationScheduleDraft['scheduleMode']) => void;
  onWeekdaysChange: (days: number[]) => void;
  onDaysModeChange: (daysMode: MedicationScheduleDraft['daysMode']) => void;
};

/** 스케줄 블록 — create progressive / edit full. soft tone (시트용) */
export function MedicationScheduleFields({
  mode,
  nameConfirmed,
  draft,
  onDraftChange,
  onScheduleModeChange,
  onWeekdaysChange,
  onDaysModeChange,
}: Props) {
  const vis = resolveFormVisibility({ mode, nameConfirmed, draft });

  if (!vis.showScheduleMode) return null;

  return (
    <FadeInView className="gap-4">
      <ScheduleModeToggle
        value={draft.scheduleMode}
        onChange={onScheduleModeChange}
        tone="soft"
      />

      {vis.showSameTimes ? (
        <FadeInView className="gap-3">
          <TimeSlotList
            value={draft.slotTimes}
            onChange={(slotTimes) => onDraftChange({ ...draft, slotTimes })}
            tone="soft"
          />
        </FadeInView>
      ) : null}

      {vis.showDaysMode ? (
        <FadeInView className="gap-3">
          <DaysModeToggle
            value={draft.daysMode}
            onChange={onDaysModeChange}
            tone="soft"
          />
          {vis.showWeekdayPicker ? (
            <WeekdayPicker
              value={draft.weekdays}
              onChange={onWeekdaysChange}
              tone="soft"
            />
          ) : null}
        </FadeInView>
      ) : null}

      {vis.showWeekdayPicker && draft.scheduleMode === 'perWeekday' ? (
        <FadeInView className="gap-3">
          <WeekdayPicker
            value={draft.weekdays}
            onChange={onWeekdaysChange}
            tone="soft"
          />
          {vis.showPerWeekdayTimes
            ? draft.weekdays.map((day) => (
                <View key={day} className="gap-2">
                  <Text className="text-base font-bold text-brand">
                    {WEEKDAY_LABELS[day]}
                  </Text>
                  <TimeSlotList
                    value={draft.timesByDay[day] ?? DEFAULT_TIMES}
                    onChange={(times) =>
                      onDraftChange({
                        ...draft,
                        timesByDay: { ...draft.timesByDay, [day]: times },
                      })
                    }
                    tone="soft"
                  />
                </View>
              ))
            : null}
        </FadeInView>
      ) : null}
    </FadeInView>
  );
}
