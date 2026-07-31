import { Pressable, Text, View } from 'react-native';
import { WEEKDAY_LABELS } from '@/entities/medication/lib/daysMask';
import type { ControlTone } from '@/entities/medication/ui/ScheduleModeToggle';
import { cn } from '@/shared/lib/cn';

type Props = {
  /** 월=0 … 일=6 선택된 요일 */
  value: number[];
  onChange: (days: number[]) => void;
  tone?: ControlTone;
  readOnly?: boolean;
};

/** 요일 다중 선택 (월~일) */
export function WeekdayPicker({
  value,
  onChange,
  tone = 'default',
  readOnly = false,
}: Props) {
  const selected = new Set(value);
  const offBg = tone === 'soft' ? 'bg-brand-soft' : 'bg-surface-soft';

  const toggle = (day: number) => {
    if (readOnly) return;
    const next = new Set(selected);
    if (next.has(day)) next.delete(day);
    else next.add(day);
    onChange([...next].sort((a, b) => a - b));
  };

  return (
    <View className="gap-2">
      <View className="flex-row justify-between gap-1.5">
        {WEEKDAY_LABELS.map((name, day) => {
          const on = selected.has(day);
          return (
            <Pressable
              key={name}
              accessibilityRole="button"
              accessibilityState={{ selected: on, disabled: readOnly }}
              disabled={readOnly}
              onPress={() => toggle(day)}
              className={cn(
                'h-11 flex-1 items-center justify-center rounded-xl',
                on ? 'bg-brand' : offBg,
              )}
            >
              <Text
                className={cn(
                  'text-sm font-bold',
                  on ? 'text-ink' : 'text-brand',
                )}
              >
                {name}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
