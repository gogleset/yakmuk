import { View } from 'react-native';
import { LAYOUT } from '@/shared/config/theme';
import { Skeleton } from '@/shared/ui';

/** 주간 안부 카드 자리 — FamilyWeeklyDigestCard min-h-[120] */
export function WeeklyDigestSkeleton() {
  return (
    <View
      className="min-h-[120px] flex-row items-center gap-3 rounded-2xl bg-surface px-4 py-5"
      style={LAYOUT.shadow.sameFill}
    >
      <Skeleton className="h-24 w-24 rounded-2xl" />
      <View className="min-w-0 flex-1 gap-2">
        <Skeleton className="h-3 w-16 rounded-md" />
        <Skeleton className="h-5 w-40 rounded-md" />
        <Skeleton className="h-4 w-28 rounded-md" />
        <Skeleton className="mt-1 h-8 w-24 self-end rounded-full" />
      </View>
    </View>
  );
}
