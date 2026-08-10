import { View } from 'react-native';
import { Skeleton } from '@/shared/ui';

/** 복약 알람 히어로 + 리스트/푸터 자리 */
export function AlarmHeroSkeleton({ showList = true }: { showList?: boolean }) {
  const kokiSize = showList ? 'h-[168px] w-[168px]' : 'h-[220px] w-[220px]';

  return (
    <View className="flex-1 justify-between px-6 py-8">
      <View className="items-center gap-3 pt-4">
        <Skeleton className="h-6 w-40 rounded-md" />
        <Skeleton className="h-14 w-44 rounded-md" />
        <Skeleton className={`${kokiSize} rounded-full`} />
      </View>

      {showList ? (
        <View className="mt-2 flex-1 justify-end gap-3">
          <View className="gap-3 py-3">
            <Skeleton className="min-h-[72px] w-full rounded-2xl" />
            <Skeleton className="min-h-[72px] w-full rounded-2xl" />
          </View>
          <View className="gap-3 pb-4">
            <Skeleton className="h-12 w-full rounded-full" />
            <Skeleton className="h-12 w-full rounded-full" />
          </View>
        </View>
      ) : (
        <View className="gap-3 pb-4">
          <View className="items-center gap-2 py-6">
            <Skeleton className="h-9 w-48 rounded-md" />
            <Skeleton className="h-4 w-28 rounded-md" />
          </View>
          <Skeleton className="h-12 w-full rounded-full" />
          <Skeleton className="h-12 w-full rounded-full" />
        </View>
      )}
    </View>
  );
}
