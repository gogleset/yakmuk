import { View } from 'react-native';
import { LAYOUT, OVERLAY } from '@/shared/config/theme';
import { Skeleton } from '@/shared/ui';

/** 약 상세/수정 시트 윤곽 — BottomSheet 크롬에 맞춤 */
export function MedicationSheetSkeleton() {
  return (
    <View className="flex-1 justify-end" style={{ backgroundColor: OVERLAY.scrim }}>
      <View
        className="max-h-[90%] rounded-t-3xl bg-surface px-5 pb-10 pt-4"
        style={LAYOUT.shadow.sameFill}
      >
        <View className="mb-4 flex-row items-center justify-between">
          <Skeleton className="h-7 w-36 rounded-md" />
          <Skeleton className="h-10 w-10 rounded-full" />
        </View>
        <View className="gap-4">
          <Skeleton className="h-12 w-full rounded-xl" />
          <View className="gap-3">
            <Skeleton className="h-3 w-16 rounded-md" />
            <Skeleton className="h-12 w-full rounded-xl" />
          </View>
          <View className="gap-3">
            <Skeleton className="h-3 w-20 rounded-md" />
            <Skeleton className="h-12 w-full rounded-xl" />
            <Skeleton className="h-24 w-full rounded-xl" />
          </View>
          <View className="mt-2 flex-row gap-2">
            <Skeleton className="h-12 flex-1 rounded-full" />
            <Skeleton className="h-12 flex-[1.4] rounded-full" />
          </View>
        </View>
      </View>
    </View>
  );
}
