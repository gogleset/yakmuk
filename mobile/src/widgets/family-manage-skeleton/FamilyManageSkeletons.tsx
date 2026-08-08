import { View } from 'react-native';
import { Skeleton } from '@/shared/ui';

/** 가족 관리 · 멤버 행 */
export function MemberListRowSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <View className="gap-2">
      {Array.from({ length: rows }, (_, i) => (
        <View
          key={i}
          className="flex-row items-center gap-3 rounded-xl bg-surface px-3 py-3"
        >
          <Skeleton className="h-10 w-10 rounded-full" />
          <View className="min-w-0 flex-1 gap-1.5">
            <Skeleton className="h-4 w-28 rounded-md" />
            <Skeleton className="h-3 w-16 rounded-md" />
          </View>
        </View>
      ))}
    </View>
  );
}
