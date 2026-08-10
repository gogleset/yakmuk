import { View } from 'react-native';
import { LAYOUT } from '@/shared/config/theme';
import { Skeleton } from '@/shared/ui';

/** 케어 알림 카드 자리 — FamilyCareAlertCard min-h-[148] */
export function CareAlertSkeleton() {
  return (
    <View
      className="min-h-[148px] flex-row items-center gap-3 rounded-2xl bg-surface px-4 py-5"
      style={LAYOUT.shadow.sameFill}
    >
      <Skeleton className="h-28 w-28 rounded-full" />
      <View className="min-w-0 flex-1 gap-3">
        <View className="gap-1.5">
          <Skeleton className="h-5 w-40 rounded-md" />
          <Skeleton className="h-4 w-28 rounded-md" />
        </View>
        <Skeleton className="mt-1 h-8 w-24 self-end rounded-full" />
      </View>
    </View>
  );
}
