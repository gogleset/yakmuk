import { Pressable, Text, View } from 'react-native';
import { COLORS, LAYOUT, LIMITS } from '@/shared/config/theme';
import { TimePicker } from '@/entities/medication/ui/TimePicker';
import type { ControlTone } from '@/entities/medication/ui/ScheduleModeToggle';
import { COPY } from '@/shared/copy';
import { Button } from '@/shared/ui/primitives/Button';
import { Icons } from '@/shared/ui/primitives/Icon';

type Props = {
  value: string[]; // HH:MM[]
  /**
   * 시간(+알림맵)을 한 번에 갱신.
   * 알림맵을 같이 안 넘기면 시간만 바꿈.
   */
  onChange: (
    times: string[],
    notificationEnabledByTime?: Record<string, boolean>,
  ) => void;
  /** 시간 → 알림 on (없으면 true) */
  notificationEnabledByTime?: Record<string, boolean>;
  /** true면 슬롯별 알림 토글 UI 표시 */
  showNotificationToggle?: boolean;
  minSlots?: number;
  maxSlots?: number;
  tone?: ControlTone;
  readOnly?: boolean;
};

function isSlotNotifOn(
  time: string,
  map: Record<string, boolean> | undefined,
): boolean {
  return map?.[time] !== false;
}

/** 하루 안 복용 시간 여러 개 (+ 슬롯별 알림 토글) */
export function TimeSlotList({
  value,
  onChange,
  notificationEnabledByTime,
  showNotificationToggle = false,
  minSlots = 1,
  maxSlots = LIMITS.maxTimeSlots,
  tone = 'default',
  readOnly = false,
}: Props) {
  const times = value.length > 0 ? value : [LIMITS.defaultDoseTime];

  const setAt = (index: number, hhmm: string) => {
    if (readOnly) return;
    const prev = times[index];
    const next = [...times];
    next[index] = hhmm;
    if (!showNotificationToggle || prev == null || prev === hhmm) {
      onChange(next);
      return;
    }
    // 시간+알림맵을 한 번에 — 분리 호출 시 draft 덮어쓰기 방지
    const enabled = { ...(notificationEnabledByTime ?? {}) };
    const wasOn = isSlotNotifOn(prev, enabled);
    delete enabled[prev];
    enabled[hhmm] = wasOn;
    onChange(next, enabled);
  };

  const addSlot = () => {
    if (readOnly || times.length >= maxSlots) return;
    const added = LIMITS.defaultDoseTime;
    const nextTimes = [...times, added];
    if (!showNotificationToggle) {
      onChange(nextTimes);
      return;
    }
    onChange(nextTimes, {
      ...(notificationEnabledByTime ?? {}),
      [added]: notificationEnabledByTime?.[added] !== false,
    });
  };

  const removeAt = (index: number) => {
    if (readOnly || times.length <= minSlots) return;
    const removed = times[index];
    const nextTimes = times.filter((_, i) => i !== index);
    if (!showNotificationToggle || removed == null) {
      onChange(nextTimes);
      return;
    }
    const enabled = { ...(notificationEnabledByTime ?? {}) };
    const stillUsed = times.some((t, i) => i !== index && t === removed);
    if (!stillUsed) delete enabled[removed];
    onChange(nextTimes, enabled);
  };

  const toggleNotif = (time: string) => {
    if (readOnly || !showNotificationToggle) return;
    const enabled = { ...(notificationEnabledByTime ?? {}) };
    enabled[time] = !isSlotNotifOn(time, enabled);
    onChange(times, enabled);
  };

  return (
    <View className="gap-3">
      {times.map((time, index) => {
        const notifOn = isSlotNotifOn(time, notificationEnabledByTime);
        return (
          <View key={`slot-${index}`} className="gap-1.5">
            <View className="flex-row items-center justify-between">
              <Text className="text-sm font-semibold text-brand">
                {index + 1}회
              </Text>
              <View className="flex-row items-center gap-3">
                {showNotificationToggle ? (
                  <Pressable
                    accessibilityRole="switch"
                    accessibilityState={{ checked: notifOn }}
                    accessibilityLabel={
                      notifOn ? COPY.notif.slotOn : COPY.notif.slotOff
                    }
                    hitSlop={LAYOUT.hitSlop.sm}
                    disabled={readOnly}
                    onPress={() => toggleNotif(time)}
                    className="flex-row items-center gap-1"
                  >
                    <Icons.Bell
                      size={LAYOUT.icon.sm}
                      color={notifOn ? COLORS.brand : COLORS.muted}
                    />
                    <Text
                      className={
                        notifOn
                          ? 'text-xs font-semibold text-brand'
                          : 'text-xs font-medium text-muted'
                      }
                    >
                      {notifOn ? COPY.notif.slotOn : COPY.notif.slotOff}
                    </Text>
                  </Pressable>
                ) : null}
                {!readOnly && times.length > minSlots ? (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="시간 삭제"
                    hitSlop={LAYOUT.hitSlop.sm}
                    onPress={() => removeAt(index)}
                  >
                    <Icons.X size={LAYOUT.icon.md} color={COLORS.destructive} />
                  </Pressable>
                ) : null}
              </View>
            </View>
            {readOnly ? (
              <View className="rounded-xl bg-brand-soft px-3.5 py-3.5">
                <Text className="text-base font-semibold text-brand">{time}</Text>
              </View>
            ) : (
              <TimePicker
                value={time}
                onChange={(hhmm) => setAt(index, hhmm)}
                tone={tone}
              />
            )}
          </View>
        );
      })}
      {!readOnly && times.length < maxSlots ? (
        <Button
          label="시간 추가"
          variant="outline"
          icon={Icons.Plus}
          onPress={addSlot}
        />
      ) : null}
    </View>
  );
}
