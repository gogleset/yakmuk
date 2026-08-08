import { View } from 'react-native';
import { Skeleton } from '@/shared/ui';

function MemberCardBone() {
  return (
    <View className="w-[48%] items-center gap-1.5 rounded-xl bg-surface px-2.5 py-3">
      <Skeleton className="h-12 w-12 rounded-full" />
      <Skeleton className="h-4 w-16 rounded-md" />
      <Skeleton className="h-3 w-12 rounded-md" />
    </View>
  );
}

/** 가족 2×2 그리드 자리 */
export function MemberGridSkeleton({ count = 4 }: { count?: number }) {
  const n = Math.min(4, Math.max(2, count));
  return (
    <View className="gap-2.5">
      <Skeleton className="h-4 w-28 rounded-md" />
      <View className="flex-row flex-wrap justify-between gap-y-2.5">
        {Array.from({ length: n }, (_, i) => (
          <MemberCardBone key={i} />
        ))}
      </View>
    </View>
  );
}
