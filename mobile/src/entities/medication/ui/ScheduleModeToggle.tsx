import { Pressable, Text, View } from 'react-native';
import { cn } from '@/shared/lib/cn';

export type ScheduleMode = 'same' | 'perWeekday';

export type ControlTone = 'default' | 'soft';

type Props = {
  value: ScheduleMode;
  onChange: (mode: ScheduleMode) => void;
  /** soft = brandSoft — BottomSheet 위 더 강한 대비 */
  tone?: ControlTone;
};

/** 같은 일정(하루 N타임) / 요일마다 다르게 */
export function ScheduleModeToggle({
  value,
  onChange,
  tone = 'default',
}: Props) {
  // 미선택: surfaceSoft / 시트: brandSoft — border 없이 fill로만 구분
  const offBg = tone === 'soft' ? 'bg-brand-soft' : 'bg-surface-soft';

  return (
    <View className="gap-2">
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
                on ? 'bg-brand' : offBg,
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
