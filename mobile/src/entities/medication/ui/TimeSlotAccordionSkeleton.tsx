import { View } from 'react-native';
import { LAYOUT } from '@/shared/config/theme';
import { Skeleton } from '@/shared/ui';

type Variant = 'check' | 'manage';

type GroupBoneProps = {
  variant?: Variant;
  /** 펼친 행 수 */
  rows?: number;
};

function AccordionGroupBone({
  variant = 'check',
  rows = 2,
}: GroupBoneProps) {
  return (
    <View className="rounded-2xl bg-canvas" style={LAYOUT.shadow.sameFill}>
      <View className="overflow-hidden rounded-2xl">
        <View className="flex-row items-center justify-between px-4 py-3.5">
          <View className="flex-row items-center gap-2">
            <Skeleton className="h-5 w-5 rounded-md" />
            <Skeleton className="h-4 w-28 rounded-md" />
          </View>
          <View className="flex-row items-center gap-2">
            <Skeleton className="h-4 w-10 rounded-md" />
            <Skeleton className="h-4 w-4 rounded-md" />
          </View>
        </View>
        {Array.from({ length: rows }, (_, i) => (
          <View key={i}>
            <View className="mx-4 h-px bg-surface-soft" />
            <View className="flex-row items-center gap-3 px-4 py-3.5">
              <Skeleton className="h-10 w-10 rounded-full" />
              <View className="min-w-0 flex-1 gap-1">
                <Skeleton className="h-4 w-32 rounded-md" />
                <Skeleton className="h-3 w-20 rounded-md" />
              </View>
              {variant === 'check' ? (
                <Skeleton className="h-10 w-10 rounded-full" />
              ) : (
                <Skeleton className="h-4 w-4 rounded-md" />
              )}
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

type Props = {
  variant?: Variant;
  /** 시간대 그룹 수 */
  groups?: number;
  rowsPerGroup?: number;
};

/** TimeSlotMedAccordion 자리 — check / manage */
export function TimeSlotAccordionSkeleton({
  variant = 'check',
  groups = 2,
  rowsPerGroup = 2,
}: Props) {
  return (
    <View className="gap-3">
      {Array.from({ length: groups }, (_, i) => (
        <AccordionGroupBone
          key={i}
          variant={variant}
          rows={i === 0 ? rowsPerGroup : Math.max(1, rowsPerGroup - 1)}
        />
      ))}
    </View>
  );
}
