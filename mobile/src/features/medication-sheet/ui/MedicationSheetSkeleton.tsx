import { View } from 'react-native';
import { LAYOUT } from '@/shared/config/theme';
import { Skeleton } from '@/shared/ui';

/** 약 상세/수정 시트 윤곽 — 풀스크린 ActivityIndicator 교체 */
export function MedicationSheetSkeleton() {
  return (
    <View className="flex-1 justify-end bg-black/20">
      <View
        className="min-h-[72%] rounded-t-3xl bg-canvas px-5 pb-10 pt-4"
        style={LAYOUT.shadow.sameFill}
      >
        <View className="mb-4 items-center">
          <Skeleton className="h-1 w-10 rounded-full" />
        </View>
        <View className="gap-3">
          <Skeleton className="h-7 w-40 rounded-md" />
          <Skeleton className="h-4 w-28 rounded-md" />
          <View className="mt-2 gap-3 rounded-2xl bg-surface p-4">
            <Skeleton className="h-12 w-full rounded-xl" />
            <Skeleton className="h-12 w-full rounded-xl" />
            <Skeleton className="h-24 w-full rounded-xl" />
          </View>
          <Skeleton className="mt-4 h-12 w-full rounded-full" />
        </View>
      </View>
    </View>
  );
}
