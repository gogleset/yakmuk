import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
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
import { COLORS, LAYOUT, LIMITS } from '@/shared/config/theme';
import { FadeInView, Icons } from '@/shared/ui';
import { cn } from '@/shared/lib/cn';

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
  // 접힘 상태. 미기록 요일은 첫 요일만 펼침
  const [collapsedDays, setCollapsedDays] = useState<Record<number, boolean>>(
    {},
  );

  if (!vis.showScheduleMode) return null;

  const toggleDay = (day: number) => {
    setCollapsedDays((prev) => {
      const currentlyCollapsed =
        prev[day] === true ||
        (prev[day] === undefined && day !== draft.weekdays[0]);
      return { ...prev, [day]: !currentlyCollapsed };
    });
  };

  const isDayCollapsed = (day: number) => {
    if (collapsedDays[day] !== undefined) return collapsedDays[day] === true;
    return day !== draft.weekdays[0];
  };

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
            ? draft.weekdays.map((day) => {
                const times = draft.timesByDay[day] ?? DEFAULT_TIMES;
                const collapsed = isDayCollapsed(day);
                const Chevron = collapsed ? Icons.ChevronDown : Icons.ChevronUp;
                const label = WEEKDAY_LABELS[day];

                return (
                  <View
                    key={day}
                    className="overflow-hidden rounded-xl bg-surface-soft"
                  >
                    {/* 화이트 톤: surfaceSoft 셸 · 펼침 헤더만 brandSoft (taken row 축) */}
                    <Pressable
                      accessibilityRole="button"
                      accessibilityState={{ expanded: !collapsed }}
                      accessibilityLabel={`${label} 시간`}
                      onPress={() => toggleDay(day)}
                      className={cn(
                        'flex-row items-center justify-between px-3.5 py-3.5',
                        !collapsed && 'bg-brand-soft',
                      )}
                    >
                      <View className="min-w-0 flex-1 flex-row items-center gap-2">
                        <Text className="text-base font-bold text-brand">
                          {label}
                        </Text>
                        {collapsed ? (
                          <View className="min-w-0 flex-1 flex-row flex-wrap gap-1.5">
                            {times.map((time, timeIndex) => (
                              <View
                                key={`${day}-${timeIndex}-${time}`}
                                className="rounded-md bg-canvas px-2 py-0.5"
                              >
                                <Text className="text-xs font-semibold text-brand">
                                  {time}
                                </Text>
                              </View>
                            ))}
                          </View>
                        ) : null}
                      </View>
                      <Chevron size={LAYOUT.icon.md} color={COLORS.brand} />
                    </Pressable>
                    {!collapsed ? (
                      <View className="gap-3 bg-canvas px-3.5 py-3.5">
                        <TimeSlotList
                          value={times}
                          onChange={(nextTimes) =>
                            onDraftChange({
                              ...draft,
                              timesByDay: {
                                ...draft.timesByDay,
                                [day]: nextTimes,
                              },
                            })
                          }
                          tone="soft"
                        />
                      </View>
                    ) : null}
                  </View>
                );
              })
            : null}
        </FadeInView>
      ) : null}
    </FadeInView>
  );
}
