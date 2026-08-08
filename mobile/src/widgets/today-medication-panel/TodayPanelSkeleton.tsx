import { View } from 'react-native';
import { Skeleton } from '@/shared/ui';

function MedRowBone() {
  return (
    <View className="flex-row items-center gap-3 rounded-xl bg-surface px-3 py-3.5">
      <Skeleton className="h-9 w-9 rounded-lg" />
      <View className="min-w-0 flex-1 gap-1.5">
        <Skeleton className="h-4 w-32 rounded-md" />
        <Skeleton className="h-3 w-20 rounded-md" />
      </View>
      <Skeleton className="h-7 w-7 rounded-full" />
    </View>
  );
}

/** 홈 · 캘린더 아래 오늘 패널 자리 */
export function TodayPanelSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <View className="gap-2.5">
      <View className="flex-row items-center gap-3 rounded-2xl bg-surface px-4 py-4">
        <Skeleton className="h-16 w-16 rounded-2xl" />
        <View className="min-w-0 flex-1 gap-2">
          <Skeleton className="h-5 w-40 rounded-md" />
          <Skeleton className="h-3 w-24 rounded-md" />
        </View>
      </View>
      {Array.from({ length: rows }, (_, i) => (
        <MedRowBone key={i} />
      ))}
      <Skeleton className="h-12 w-full rounded-2xl" />
    </View>
  );
}

/** 홈 · 과거일 패널 */
export function PastDayPanelSkeleton({ rows = 2 }: { rows?: number }) {
  return (
    <View className="gap-2.5">
      <Skeleton className="h-4 w-28 rounded-md" />
      {Array.from({ length: rows }, (_, i) => (
        <MedRowBone key={i} />
      ))}
    </View>
  );
}
