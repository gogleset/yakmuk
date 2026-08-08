import { View } from 'react-native';
import { Skeleton } from '@/shared/ui';

/** 복약 알람 히어로 + 리스트 자리 */
export function AlarmHeroSkeleton({ showList = true }: { showList?: boolean }) {
  return (
    <View className="flex-1 justify-between px-6 py-8">
      <View className="items-center gap-3 pt-4">
        <Skeleton className="h-6 w-40 rounded-md" />
        <Skeleton className="h-14 w-36 rounded-md" />
        <Skeleton className="h-44 w-44 rounded-full" />
      </View>
      {showList ? (
        <View className="gap-3">
          <Skeleton className="h-16 w-full rounded-2xl" />
          <Skeleton className="h-16 w-full rounded-2xl" />
          <Skeleton className="h-14 w-full rounded-full" />
        </View>
      ) : (
        <Skeleton className="h-14 w-full rounded-full" />
      )}
    </View>
  );
}
