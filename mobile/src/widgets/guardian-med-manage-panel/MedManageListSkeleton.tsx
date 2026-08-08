import { View } from 'react-native';
import { Skeleton } from '@/shared/ui';

/** 멤버 상세 · 등록 약 아코디언 자리 */
export function MedManageListSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <View className="gap-2.5">
      <Skeleton className="h-4 w-24 rounded-md" />
      {Array.from({ length: rows }, (_, i) => (
        <View
          key={i}
          className="flex-row items-center gap-3 rounded-xl bg-surface px-3 py-3.5"
        >
          <Skeleton className="h-9 w-9 rounded-lg" />
          <View className="min-w-0 flex-1 gap-1.5">
            <Skeleton className="h-4 w-32 rounded-md" />
            <Skeleton className="h-3 w-20 rounded-md" />
          </View>
        </View>
      ))}
    </View>
  );
}
