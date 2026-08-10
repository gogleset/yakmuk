import { View } from 'react-native';
import { LAYOUT } from '@/shared/config/theme';
import { Skeleton } from '@/shared/ui';

function MemberCardBone() {
  return (
    <View className="w-[48%] items-center gap-1.5 rounded-xl bg-surface px-2.5 py-3">
      <Skeleton className="h-9 w-9 rounded-full" />
      <Skeleton className="h-4 w-16 rounded-md" />
      <Skeleton className="h-3 w-12 rounded-md" />
    </View>
  );
}

/** 가족 2×2 그리드 자리 — soft tray + md avatar */
export function MemberGridSkeleton({ count = 4 }: { count?: number }) {
  const n = Math.min(4, Math.max(2, count));
  return (
    <View className="gap-2.5">
      <View className="flex-row items-center justify-between gap-2">
        <Skeleton className="h-4 w-28 rounded-md" />
        <Skeleton className="h-3 w-10 rounded-md" />
      </View>
      <View className="flex-row flex-wrap justify-between gap-y-2 rounded-2xl bg-surface-soft p-2.5">
        {Array.from({ length: n }, (_, i) => (
          <MemberCardBone key={i} />
        ))}
      </View>
    </View>
  );
}
