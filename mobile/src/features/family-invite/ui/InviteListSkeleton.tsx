import { View } from 'react-native';
import { Skeleton } from '@/shared/ui';

/** 가족 관리 · 초대 슬롯 그리드 (spinner 교체) */
export function InviteListSkeleton() {
  return (
    <View className="gap-2.5 py-1">
      <View className="flex-row gap-2.5">
        <Skeleton className="h-24 flex-1 rounded-xl" />
        <Skeleton className="h-24 flex-1 rounded-xl" />
      </View>
      <View className="flex-row gap-2.5">
        <Skeleton className="h-24 flex-1 rounded-xl" />
        <Skeleton className="h-24 flex-1 rounded-xl" />
      </View>
    </View>
  );
}
