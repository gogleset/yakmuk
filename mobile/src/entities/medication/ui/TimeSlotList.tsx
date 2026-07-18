import { Pressable, Text, View } from 'react-native';
import { COLORS, LAYOUT, LIMITS } from '@/shared/config/theme';
import { TimePicker } from '@/entities/medication/ui/TimePicker';
import { Button } from '@/shared/ui/primitives/Button';
import { Icons } from '@/shared/ui/primitives/Icon';
import { Caption } from '@/shared/ui/primitives/Typography';

type Props = {
  value: string[]; // HH:MM[]
  onChange: (times: string[]) => void;
  label?: string;
  minSlots?: number;
  maxSlots?: number;
};

/** 하루 안 복용 시간 여러 개 */
export function TimeSlotList({
  value,
  onChange,
  label = '알림 시간',
  minSlots = 1,
  maxSlots = LIMITS.maxTimeSlots,
}: Props) {
  const times = value.length > 0 ? value : [LIMITS.defaultDoseTime];

  const setAt = (index: number, hhmm: string) => {
    const next = [...times];
    next[index] = hhmm;
    onChange(next);
  };

  const addSlot = () => {
    if (times.length >= maxSlots) return;
    onChange([...times, LIMITS.defaultDoseTime]);
  };

  const removeAt = (index: number) => {
    if (times.length <= minSlots) return;
    onChange(times.filter((_, i) => i !== index));
  };

  return (
    <View className="gap-3">
      {label ? <Caption>{label}</Caption> : null}
      {times.map((time, index) => (
        <View key={`slot-${index}`} className="gap-1.5">
          <View className="flex-row items-center justify-between">
            <Text className="text-sm font-semibold text-brand">
              {index + 1}회
            </Text>
            {times.length > minSlots ? (
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
          <TimePicker
            value={time}
            onChange={(hhmm) => setAt(index, hhmm)}
            label=""
          />
        </View>
      ))}
      {times.length < maxSlots ? (
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
