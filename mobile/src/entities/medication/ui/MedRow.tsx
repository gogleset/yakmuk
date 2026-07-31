import { Text, View } from 'react-native';
import { formatDaysMaskLabel } from '@/entities/medication/lib/daysMask';
import { formatMedDose } from '@/shared/constants/medDoseUnits';
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
  color?: string | null;
  doseAmount?: number | null;
  doseUnit?: string | null;
  onPress: () => void;
  onLongPress?: () => void;
};

/** 복약 체크 행 */
export function MedRow({
  name,
  scheduledTime,
  daysMask,
  taken,
  color: _color,
  doseAmount,
  doseUnit,
  onPress,
  onLongPress,
}: Props) {
  const scheduleLabel = daysMask ? formatDaysMaskLabel(daysMask) : null;
  const doseLabel = formatMedDose(doseAmount ?? null, doseUnit ?? null);

  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityState={{ checked: taken }}
      accessibilityHint={COPY.a11y.longPressDelete}
      className={cn(
        'flex-row items-center justify-between rounded-xl p-3.5',
        taken ? 'bg-brand-soft' : 'bg-surface-soft',
      )}
      onPress={onPress}
      onLongPress={onLongPress}
    >
      <View className="min-w-0 flex-1 flex-row items-center gap-2.5">
        {taken ? (
          <Icons.CheckCircle size={LAYOUT.icon.lg} color={COLORS.brand} />
        ) : (
          <Icons.Circle size={LAYOUT.icon.lg} color={COLORS.muted} />
        )}
        <View className="min-w-0 flex-1">
          <Text
            className="text-base font-semibold text-brand"
            numberOfLines={1}
          >
            {name}
          </Text>
          {scheduleLabel || doseLabel ? (
            <Text className="mt-0.5 text-xs text-brand-faint" numberOfLines={1}>
              {[doseLabel, scheduleLabel].filter(Boolean).join(' · ')}
            </Text>
          ) : null}
        </View>
      </View>
      <Text className="ml-2 text-brand-faint">{scheduledTime}</Text>
    </PressableScale>
  );
}
