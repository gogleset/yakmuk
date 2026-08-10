import { View } from 'react-native';
import { Skeleton } from '@/shared/ui';

function InviteSlotBone() {
  return (
    <View className="min-h-[168px] flex-1 items-center gap-1.5 rounded-xl bg-brand-soft p-2.5">
      <View className="w-full flex-row items-start justify-between gap-1">
        <View className="min-w-0 flex-1 gap-1">
          <Skeleton className="h-4 w-16 rounded-md" />
          <Skeleton className="h-3 w-12 rounded-md" />
        </View>
        <Skeleton className="h-4 w-4 rounded-md" />
      </View>
      <Skeleton className="h-[88px] w-[88px] rounded-lg" />
      <Skeleton className="h-3 w-14 rounded-md" />
    </View>
  );
}

/** 가족 관리 · 초대 슬롯 그리드 */
export function InviteListSkeleton() {
  return (
    <View className="gap-2.5 py-1">
      <View className="flex-row gap-2.5">
        <InviteSlotBone />
        <InviteSlotBone />
      </View>
      <View className="flex-row gap-2.5">
        <InviteSlotBone />
        <InviteSlotBone />
      </View>
    </View>
  );
}
