import { Text, View } from 'react-native';
import { formatDaysMaskLabel } from '@/entities/medication/lib/daysMask';
import { COLORS, LAYOUT } from '@/shared/config/theme';
import { COPY } from '@/shared/copy';
import { cn } from '@/shared/lib/cn';
import { PressableScale } from '@/shared/ui/composites/PressableScale';
import { Icons } from '@/shared/ui/primitives/Icon';

type Props = {
  name: string;
  scheduledTime: string;
  daysMask?: string;
  taken: boolean;
  onPress: () => void;
  onLongPress?: () => void;
};

/** 복약 체크 행 */
export function MedRow({
  name,
  scheduledTime,
  daysMask,
  taken,
  onPress,
  onLongPress,
}: Props) {
  const scheduleLabel = daysMask ? formatDaysMaskLabel(daysMask) : null;

  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityState={{ checked: taken }}
      accessibilityHint={COPY.a11y.longPressDelete}
      className={cn(
        'flex-row items-center justify-between rounded-xl p-3.5',
        taken ? 'bg-brand-soft' : 'bg-surface',
      )}
      onPress={onPress}
      onLongPress={onLongPress}
    >
      <View className="flex-row items-center gap-2.5">
        {taken ? (
          <Icons.CheckCircle size={LAYOUT.icon.lg} color={COLORS.brand} />
        ) : (
          <Icons.Circle size={LAYOUT.icon.lg} color={COLORS.muted} />
        )}
        <View>
          <Text className="text-base font-semibold text-brand">{name}</Text>
          {scheduleLabel ? (
            <Text className="mt-0.5 text-xs text-brand-faint">
              {scheduleLabel}
            </Text>
          ) : null}
        </View>
      </View>
      <Text className="text-brand-faint">{scheduledTime}</Text>
    </PressableScale>
  );
}
