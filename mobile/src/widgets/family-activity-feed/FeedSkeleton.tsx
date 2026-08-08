import { View } from 'react-native';
import { Skeleton } from '@/shared/ui';

function FeedRowBone() {
  return (
    <View className="flex-row items-center gap-3 rounded-xl bg-surface px-3 py-3">
      <Skeleton className="h-10 w-10 rounded-full" />
      <View className="min-w-0 flex-1 gap-1.5">
        <Skeleton className="h-4 w-40 rounded-md" />
        <Skeleton className="h-3 w-20 rounded-md" />
      </View>
    </View>
  );
}

/** 가족 탭 피드 프리뷰 */
export function FeedPreviewSkeleton({ rows = 2 }: { rows?: number }) {
  return (
    <View className="gap-2.5">
      <View className="flex-row items-center justify-between">
        <Skeleton className="h-4 w-20 rounded-md" />
        <Skeleton className="h-4 w-12 rounded-md" />
      </View>
      <Skeleton className="h-3 w-16 rounded-md" />
      {Array.from({ length: rows }, (_, i) => (
        <FeedRowBone key={i} />
      ))}
    </View>
  );
}

/** 최근 소식 전체 리스트 */
export function FeedListSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <View className="gap-2.5">
      <Skeleton className="h-3 w-20 rounded-md" />
      {Array.from({ length: rows }, (_, i) => (
        <FeedRowBone key={i} />
      ))}
    </View>
  );
}
