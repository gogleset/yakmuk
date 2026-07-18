import { Pressable, Text, View } from 'react-native';
import { formatDaysMaskLabel } from '@/entities/medication/lib/daysMask';
import type { Medication } from '@/entities/medication/model/types';
import { COLORS, LAYOUT } from '@/shared/config/theme';
import { COPY } from '@/shared/copy';
import { EmptyHint, Icons } from '@/shared/ui';

type Props = {
  meds: Medication[];
  onEdit: (med: Medication) => void;
  onDelete: (med: Medication) => void;
  isError?: boolean;
};

/** 보호자: 피보호자 등록 약 관리 목록 */
export function GuardianMedManagePanel({
  meds,
  onEdit,
  onDelete,
  isError = false,
}: Props) {
  if (isError) {
    return <EmptyHint message={COPY.med.loadFailed} />;
  }

  if (meds.length === 0) {
    return <EmptyHint message={COPY.med.emptyRegistered} />;
  }

  return (
    <View className="gap-2">
      {meds.map((med) => (
        <Pressable
          key={med.id}
          accessibilityRole="button"
          accessibilityLabel={`${med.name} 수정`}
          accessibilityHint={COPY.a11y.longPressDelete}
          onPress={() => onEdit(med)}
          onLongPress={() => onDelete(med)}
          className="flex-row items-center justify-between rounded-xl bg-surface p-3.5 active:opacity-80"
        >
          <View className="flex-row items-center gap-2.5">
            <Icons.Pill size={LAYOUT.icon.lg} color={COLORS.brand} />
            <View>
              <Text className="text-base font-semibold text-brand">
                {med.name}
              </Text>
              <Text className="mt-0.5 text-xs text-brand-faint">
                {formatDaysMaskLabel(med.daysMask)}
              </Text>
            </View>
          </View>
          <Text className="text-brand-faint">{med.scheduledTime}</Text>
        </Pressable>
      ))}
    </View>
  );
}
