import { useEffect, useState } from 'react';
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

type CollapseMode = 'expand-all' | 'incomplete-open' | 'all-collapsed';

type Props = {
  groups: Group[];
  /** check=복용 토글 · manage=수정/삭제 */
  variant?: 'check' | 'manage';
  /** incomplete-open: 첫 미완료만 펼침 · all-collapsed: 전부 접힘 */
  collapseMode?: CollapseMode;
  onToggleKey?: (key: string) => void;
  onPressKey?: (key: string) => void;
  onLongPressKey?: (key: string, name: string) => void;
};

/** 초기 접힘 맵 — collapseMode 변경 시에만 재적용 */
function initialCollapsed(
  groups: Group[],
  mode: CollapseMode,
): Record<string, boolean> {
  if (mode === 'expand-all') return {};
  if (mode === 'all-collapsed') {
    return Object.fromEntries(groups.map((g) => [g.scheduledTime, true]));
  }
  // incomplete-open: 첫 미완료 그룹만 펼침
  const firstIncomplete = groups.find((g) =>
    g.entries.some((e) => !e.taken),
  );
  const openTime = firstIncomplete?.scheduledTime;
  return Object.fromEntries(
    groups.map((g) => [g.scheduledTime, g.scheduledTime !== openTime]),
  );
}

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

/** 시간대 아코디언 리스트 — 홈 오늘 체크 목업 */
export function TimeSlotMedAccordion({
  groups,
  variant = 'check',
  collapseMode = 'expand-all',
  onToggleKey,
  onPressKey,
  onLongPressKey,
}: Props) {
  const [collapsedTimes, setCollapsedTimes] = useState<Record<string, boolean>>(
    () => initialCollapsed(groups, collapseMode),
  );

  // collapseMode 전환 · 시간대 구성 변경 시에만 접힘 재적용 (개별 체크마다 리셋 금지)
  const scheduleKey = groups.map((g) => g.scheduledTime).join('|');
  useEffect(() => {
    if (groups.length === 0) return;
    setCollapsedTimes(initialCollapsed(groups, collapseMode));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- groups 스냅샷은 scheduleKey로 추적
  }, [collapseMode, scheduleKey]);

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
                            className={`text-base font-semibold leading-5 ${
                              entry.taken ? 'text-brand' : 'text-text'
                            }`}
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
