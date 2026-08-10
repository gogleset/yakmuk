import { View } from 'react-native';
import { TimeSlotAccordionSkeleton } from '@/entities/medication';
import { Skeleton } from '@/shared/ui';

/** 홈 · 캘린더 아래 오늘 패널 자리 */
export function TodayPanelSkeleton() {
  return (
    <View className="gap-3">
      <View className="overflow-hidden rounded-2xl bg-surface-soft">
        <View className="flex-row items-center gap-2.5 px-3.5 py-2.5">
          <View className="min-w-0 flex-1 gap-1">
            <Skeleton className="h-5 w-40 rounded-md" />
          </View>
          <Skeleton className="h-16 w-16 rounded-full" />
        </View>
      </View>

      <TimeSlotAccordionSkeleton variant="check" groups={2} rowsPerGroup={2} />

      <View className="mt-4 gap-5">
        <Skeleton className="mx-auto h-4 w-28 rounded-md" />
        <View className="flex-row justify-around gap-2 px-1 pt-1">
          {Array.from({ length: 3 }, (_, i) => (
            <View key={i} className="items-center gap-1.5">
              <Skeleton className="h-[72px] w-[72px] rounded-full" />
              <Skeleton className="h-3 w-10 rounded-md" />
            </View>
          ))}
        </View>
        <Skeleton className="h-12 w-full rounded-xl" />
        <Skeleton className="h-12 w-full rounded-full" />
      </View>
    </View>
  );
}

/** 홈 · 과거일 패널 */
export function PastDayPanelSkeleton({
  groups = 2,
}: {
  groups?: number;
}) {
  return (
    <View className="gap-3">
      <TimeSlotAccordionSkeleton
        variant="check"
        groups={groups}
        rowsPerGroup={2}
      />
      <View className="rounded-xl bg-surface-soft p-3.5 gap-1.5">
        <Skeleton className="h-4 w-28 rounded-md" />
        <Skeleton className="h-3 w-40 rounded-md" />
      </View>
    </View>
  );
}
