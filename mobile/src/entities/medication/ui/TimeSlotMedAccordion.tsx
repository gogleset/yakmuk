import { useEffect, useState } from 'react';
import { Pressable, View } from 'react-native';
import {
  timeOfDaySlot,
  type TimeOfDaySlot,
  type TimedEntry,
} from '@/entities/medication/lib/timeSlots';
import { formatMedDose } from '@/shared/constants/medDoseUnits';
import { COLORS, LAYOUT } from '@/shared/config/theme';
import { COPY } from '@/shared/copy';
import {
  Body,
  Caption,
  Icons,
  LabelMd,
  LabelTight,
  MedFormIcon,
} from '@/shared/ui';

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
  if (slot === 'dawn' || slot === 'bedtime') return Icons.Moon;
  return Icons.Sun;
}

function CheckToggle({ taken }: { taken: boolean }) {
  if (taken) {
    return (
      <View className="h-10 w-10 items-center justify-center rounded-full bg-brand">
        <Icons.Check size={22} color={COLORS.ink} strokeWidth={2.5} />
      </View>
    );
  }
  return <Icons.Circle size={40} color={COLORS.disabled} strokeWidth={1.5} />;
}

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
        // 낮 슬롯(아침·점심·오후)은 경고색 태양, 새벽·취침 전은 뮤트 달
        const isDaySlot =
          slot === 'morning' || slot === 'lunch' || slot === 'afternoon';

        return (
          <View
            key={group.scheduledTime}
            className="rounded-2xl bg-canvas"
            style={LAYOUT.shadow.sameFill}
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
                  <LabelTight>
                    {slotName} {group.scheduledTime}
                  </LabelTight>
                </View>
                <View className="flex-row items-center gap-2">
                  <Body className="text-sm">
                    {variant === 'check'
                      ? COPY.med.progressFraction(
                          takenCount,
                          group.entries.length,
                        )
                      : `${group.entries.length}`}
                  </Body>
                  <Chevron size={LAYOUT.icon.sm} color={COLORS.muted} />
                </View>
              </Pressable>

              {!collapsed
                ? group.entries.map((entry) => {
                    const body = (
                      <>
                        <MedFormIcon
                          doseUnit={entry.doseUnit}
                          color={entry.color}
                        />
                        <View className="min-w-0 flex-1 gap-0.5">
                          <LabelMd
                            tone={entry.taken ? 'brand' : 'text'}
                            className="leading-5"
                            numberOfLines={2}
                          >
                            {entry.name}
                          </LabelMd>
                          {(() => {
                            const dose = formatMedDose(
                              entry.doseAmount ?? null,
                              entry.doseUnit ?? null,
                            );
                            const caption = [dose, entry.caption]
                              .filter(Boolean)
                              .join(' · ');
                            return caption ? (
                              <Caption>{caption}</Caption>
                            ) : null;
                          })()}
                        </View>
                      </>
                    );

                    if (variant === 'check') {
                      return (
                        <View key={entry.key}>
                          <View className="mx-4 h-px bg-surface-soft" />
                          <View className="flex-row items-center gap-3 px-4 py-3.5">
                            <Pressable
                              accessibilityRole="button"
                              accessibilityHint={COPY.a11y.longPressDelete}
                              className="min-w-0 flex-1 flex-row items-center gap-3"
                              onPress={() => onPressKey?.(entry.key)}
                              onLongPress={() =>
                                onLongPressKey?.(entry.key, entry.name)
                              }
                            >
                              {body}
                            </Pressable>
                            {onToggleKey && !entry.taken ? (
                              <Pressable
                                accessibilityRole="checkbox"
                                accessibilityState={{ checked: false }}
                                hitSlop={LAYOUT.hitSlop.sm}
                                onPress={() => onToggleKey(entry.key)}
                              >
                                <CheckToggle taken={false} />
                              </Pressable>
                            ) : (
                              // 체크 완료 — 번복 불가
                              <View
                                accessibilityRole="checkbox"
                                accessibilityState={{
                                  checked: entry.taken,
                                  disabled: entry.taken,
                                }}
                              >
                                <CheckToggle taken={entry.taken} />
                              </View>
                            )}
                          </View>
                        </View>
                      );
                    }

                    const canPress = Boolean(onPressKey);
                    const row = (
                      <View className="flex-row items-center gap-3 px-4 py-3.5">
                        {body}
                        <Icons.ChevronRight
                          size={LAYOUT.icon.md}
                          color={COLORS.muted}
                        />
                      </View>
                    );

                    return (
                      <View key={entry.key}>
                        <View className="mx-4 h-px bg-surface-soft" />
                        {canPress ? (
                          <Pressable
                            accessibilityRole="button"
                            accessibilityHint={COPY.a11y.longPressDelete}
                            onPress={() => onPressKey?.(entry.key)}
                            onLongPress={() =>
                              onLongPressKey?.(entry.key, entry.name)
                            }
                          >
                            {row}
                          </Pressable>
                        ) : (
                          row
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
