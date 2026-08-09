import { Pressable, View } from 'react-native';
import type { DaysMode } from '@/entities/medication/lib/daysMask';
import type { ControlTone } from '@/entities/medication/ui/ScheduleModeToggle';
import { cn } from '@/shared/lib/cn';
import { LabelMd } from '@/shared/ui';

type Props = {
  value: DaysMode;
  onChange: (mode: DaysMode) => void;
  tone?: ControlTone;
  readOnly?: boolean;
};

/** 매일 / 요일 지정 토글 */
export function DaysModeToggle({
  value,
  onChange,
  tone = 'default',
  readOnly = false,
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
              accessibilityState={{ selected: on, disabled: readOnly }}
              disabled={readOnly}
              onPress={() => {
                if (readOnly) return;
                onChange(opt.mode);
              }}
              className={cn(
                'flex-1 items-center rounded-xl py-3.5',
                on ? 'bg-brand' : offBg,
              )}
            >
              <LabelMd tone={on ? 'ink' : 'brand'}>{opt.label}</LabelMd>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
