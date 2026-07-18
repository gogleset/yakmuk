import { Pressable, Text, View } from 'react-native';
import { cn } from '@/shared/lib/cn';
import { Caption } from '@/shared/ui/primitives/Typography';

export type ScheduleMode = 'same' | 'perWeekday';

type Props = {
  value: ScheduleMode;
  onChange: (mode: ScheduleMode) => void;
};

/** 같은 일정(하루 N타임) / 요일마다 다르게 */
export function ScheduleModeToggle({ value, onChange }: Props) {
  return (
    <View className="gap-2">
      <Caption>일정 방식</Caption>
      <View className="flex-row gap-2">
        {(
          [
            { mode: 'same' as const, label: '같은 일정으로' },
            { mode: 'perWeekday' as const, label: '요일마다 다르게' },
          ] as const
        ).map((opt) => {
          const on = value === opt.mode;
          return (
            <Pressable
              key={opt.mode}
              accessibilityRole="button"
              accessibilityState={{ selected: on }}
              onPress={() => onChange(opt.mode)}
              className={cn(
                'flex-1 items-center rounded-xl py-3.5',
                on ? 'bg-brand' : 'bg-surface',
              )}
            >
              <Text
                className={cn(
                  'text-sm font-semibold',
                  on ? 'text-ink' : 'text-brand',
                )}
              >
                {opt.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
