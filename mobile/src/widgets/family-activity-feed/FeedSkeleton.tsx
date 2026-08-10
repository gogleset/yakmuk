import { View } from 'react-native';
import { LAYOUT } from '@/shared/config/theme';
import { Skeleton } from '@/shared/ui';

function FeedRowBone() {
  return (
    <View
      className="flex-row items-center gap-3 rounded-xl bg-surface px-3 py-2.5"
      style={LAYOUT.shadow.sameFill}
    >
      <Skeleton className="h-9 w-9 rounded-full" />
      <View className="min-w-0 flex-1 gap-0.5">
        <Skeleton className="h-4 w-40 rounded-md" />
        <View className="flex-row items-center justify-between gap-2">
          <Skeleton className="h-3 w-20 rounded-md" />
          <Skeleton className="h-3 w-10 rounded-md" />
        </View>
      </View>
    </View>
  );
}

/** 접힌 스택 — 앞카드 + peek 레이어 */
function FeedStackBone({ peekCount = 2 }: { peekCount?: number }) {
  const { peekOffset, peekInset } = LAYOUT.feedStack;
  const peeks = Math.min(peekCount, LAYOUT.feedStack.peekCount);

  return (
    <View
      className="relative"
      style={{ marginBottom: peeks > 0 ? peeks * peekOffset : 0 }}
    >
      {Array.from({ length: peeks }, (_, index) => {
        const depth = peeks - index;
        return (
          <View
            key={depth}
            pointerEvents="none"
            className="absolute rounded-xl bg-surface"
            style={[
              LAYOUT.shadow.sameFill,
              {
                left: depth * peekInset,
                right: depth * peekInset,
                top: depth * peekOffset,
                bottom: -depth * peekOffset,
                zIndex: peeks - depth,
              },
            ]}
          />
        );
      })}
      <View style={{ zIndex: peeks + 1 }}>
        <FeedRowBone />
      </View>
    </View>
  );
}

function DayStackGroupBone() {
  return (
    <View className="gap-2">
      <View className="mt-1 flex-row items-center justify-between">
        <Skeleton className="h-3 w-16 rounded-md" />
        <Skeleton className="h-4 w-4 rounded-md" />
      </View>
      <FeedStackBone />
    </View>
  );
}

/** 가족 탭 피드 프리뷰 */
export function FeedPreviewSkeleton() {
  return (
    <View className="gap-2.5">
      <View className="flex-row items-center justify-between">
        <Skeleton className="h-4 w-20 rounded-md" />
        <Skeleton className="h-4 w-12 rounded-md" />
      </View>
      <DayStackGroupBone />
    </View>
  );
}

/** 최근 소식 전체 리스트 */
export function FeedListSkeleton({ dayGroups = 3 }: { dayGroups?: number }) {
  return (
    <View className="gap-2.5">
      {Array.from({ length: dayGroups }, (_, i) => (
        <DayStackGroupBone key={i} />
      ))}
    </View>
  );
}
