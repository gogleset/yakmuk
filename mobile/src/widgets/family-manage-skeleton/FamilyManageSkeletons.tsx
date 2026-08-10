import { View } from 'react-native';
import { Skeleton } from '@/shared/ui';

/** 가족 관리 · 멤버 행 (Card 안 텍스트 + 내보내기) */
export function MemberListRowSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <View className="gap-2">
      {Array.from({ length: rows }, (_, i) => (
        <View key={i} className="gap-1 py-2">
          <View className="flex-row items-center justify-between gap-2">
            <View className="min-w-0 flex-1 gap-1">
              <Skeleton className="h-5 w-24 rounded-md" />
              <Skeleton className="h-3 w-32 rounded-md" />
            </View>
            <Skeleton className="h-3 w-12 rounded-md" />
          </View>
        </View>
      ))}
    </View>
  );
}
