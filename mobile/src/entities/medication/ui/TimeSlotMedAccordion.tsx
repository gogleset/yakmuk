import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import {
  timeOfDaySlot,
  type TimeOfDaySlot,
  type TimedEntry,
} from '@/entities/medication/lib/timeSlots';
import { COLORS, LAYOUT } from '@/shared/config/theme';
import { COPY } from '@/shared/copy';
import { Icons } from '@/shared/ui';

type Group = {
  scheduledTime: string;
  slot: TimeOfDaySlot;
  entries: TimedEntry[];
};

type Props = {
  groups: Group[];
  /** check=복용 토글 · manage=수정/삭제 */
  variant?: 'check' | 'manage';
  onToggleKey?: (key: string) => void;
  onPressKey?: (key: string) => void;
  onLongPressKey?: (key: string, name: string) => void;
};

function slotIcon(slot: TimeOfDaySlot) {
  if (slot === 'morning' || slot === 'lunch') return Icons.Sun;
  return Icons.Moon;
}

function CheckToggle({ taken }: { taken: boolean }) {
  if (taken) {
    return (
      <View className="h-7 w-7 items-center justify-center rounded-full bg-brand">
        <Icons.Check size={16} color={COLORS.ink} strokeWidth={2.5} />
      </View>
    );
  }
  return <Icons.Circle size={28} color={COLORS.disabled} strokeWidth={1.5} />;
}

/** 흰 카드 입체감 — iOS shadow / Android elevation */
const CARD_SHADOW = {
  shadowColor: COLORS.text,
  shadowOpacity: 0.06,
  shadowRadius: 4,
  shadowOffset: { width: 0, height: 1 },
  elevation: 1,
} as const;

/** 시간대 아코디언 리스트 — home-today-check 목업 */
export function TimeSlotMedAccordion({
  groups,
  variant = 'check',
  onToggleKey,
  onPressKey,
  onLongPressKey,
}: Props) {
  const [collapsedTimes, setCollapsedTimes] = useState<Record<string, boolean>>(
    {},
  );

  const toggleGroup = (time: string) => {
    setCollapsedTimes((prev) => ({ ...prev, [time]: !prev[time] }));
  };

  return (
    <View className="gap-3">
      {groups.map((group) => {
        const slot = group.slot || timeOfDaySlot(group.scheduledTime);
        const SlotIcon = slotIcon(slot);
        const slotName = COPY.med.timeSlot[slot];
        const takenCount = group.entries.filter((e) => e.taken).length;
        const collapsed = collapsedTimes[group.scheduledTime] === true;
        const Chevron = collapsed ? Icons.ChevronDown : Icons.ChevronUp;
        const isDaySlot = slot === 'morning' || slot === 'lunch';

        return (
          <View
            key={group.scheduledTime}
            className="rounded-2xl bg-canvas"
            style={CARD_SHADOW}
          >
            <View className="overflow-hidden rounded-2xl">
              <Pressable
                accessibilityRole="button"
                onPress={() => toggleGroup(group.scheduledTime)}
                className="flex-row items-center justify-between px-4 py-3.5"
              >
                <View className="flex-row items-center gap-2">
                  <SlotIcon
                    size={LAYOUT.icon.md}
                    color={isDaySlot ? COLORS.warning : COLORS.muted}
                  />
                  <Text className="text-[15px] font-semibold text-brand">
                    {slotName} {group.scheduledTime}
                  </Text>
                </View>
                <View className="flex-row items-center gap-2">
                  <Text className="text-sm text-brand-muted">
                    {variant === 'check'
                      ? COPY.med.progressFraction(
                          takenCount,
                          group.entries.length,
                        )
                      : `${group.entries.length}`}
                  </Text>
                  <Chevron size={LAYOUT.icon.sm} color={COLORS.muted} />
                </View>
              </Pressable>

              {!collapsed
                ? group.entries.map((entry) => {
                    const body = (
                      <View className="flex-row items-center gap-3 px-4 py-3.5">
                        <View className="h-10 w-10 items-center justify-center rounded-full bg-surface-soft">
                          <Icons.Pill
                            size={LAYOUT.icon.md}
                            color={COLORS.brand}
                          />
                        </View>
                        <View className="min-w-0 flex-1 gap-0.5">
                          <Text
                            className="text-base font-semibold leading-5 text-text"
                            numberOfLines={2}
                          >
                            {entry.name}
                          </Text>
                          {entry.caption ? (
                            <Text className="text-xs text-brand-muted">
                              {entry.caption}
                            </Text>
                          ) : null}
                        </View>
                        {variant === 'check' ? (
                          <CheckToggle taken={entry.taken} />
                        ) : (
                          <Icons.ChevronRight
                            size={LAYOUT.icon.md}
                            color={COLORS.muted}
                          />
                        )}
                      </View>
                    );

                    const canPress =
                      variant === 'check'
                        ? Boolean(onToggleKey)
                        : Boolean(onPressKey);

                    return (
                      <View key={entry.key}>
                        <View className="mx-4 h-px bg-surface-soft" />
                        {canPress ? (
                          <Pressable
                            accessibilityRole="button"
                            accessibilityState={
                              variant === 'check'
                                ? { checked: entry.taken }
                                : undefined
                            }
                            accessibilityHint={COPY.a11y.longPressDelete}
                            onPress={() =>
                              variant === 'check'
                                ? onToggleKey?.(entry.key)
                                : onPressKey?.(entry.key)
                            }
                            onLongPress={() =>
                              onLongPressKey?.(entry.key, entry.name)
                            }
                          >
                            {body}
                          </Pressable>
                        ) : (
                          body
                        )}
                      </View>
                    );
                  })
                : null}
            </View>
          </View>
        );
      })}
    </View>
  );
}
