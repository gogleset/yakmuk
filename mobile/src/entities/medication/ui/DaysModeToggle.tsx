import { Pressable, Text, View } from 'react-native';
import type { DaysMode } from '@/entities/medication/lib/daysMask';
import type { ControlTone } from '@/entities/medication/ui/ScheduleModeToggle';
import { cn } from '@/shared/lib/cn';

type Props = {
  value: DaysMode;
  onChange: (mode: DaysMode) => void;
  tone?: ControlTone;
};

/** 매일 / 요일 지정 토글 */
export function DaysModeToggle({
  value,
  onChange,
  tone = 'default',
}: Props) {
  const offBg = tone === 'soft' ? 'bg-brand-soft' : 'bg-surface-soft';

  return (
    <View className="gap-2">
      <View className="flex-row gap-2">
        {(
          [
            { mode: 'daily' as const, label: '매일' },
            { mode: 'weekday' as const, label: '요일 지정' },
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
                on ? 'bg-brand' : offBg,
              )}
            >
              <Text
                className={cn(
                  'text-base font-semibold',
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
