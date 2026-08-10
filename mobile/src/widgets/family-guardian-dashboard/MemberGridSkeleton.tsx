import { ScrollView, View } from 'react-native';
import { COLORS } from '@/shared/config/theme';
import { Skeleton } from '@/shared/ui';

/** FamilySeatGrid carousel과 동일 수치 */
const SEAT_H = 148;
const SEAT_W = 148;
const SEAT_GAP = 10;
const EDGE_PAD = 20;

function SeatBone() {
  return (
    <View
      style={{
        width: SEAT_W,
        height: SEAT_H,
        backgroundColor: COLORS.surface,
        borderWidth: 1,
        borderColor: COLORS.line,
      }}
      className="items-center justify-center gap-1.5 rounded-2xl px-2 py-3"
    >
      <Skeleton className="h-14 w-14 rounded-full" />
      <Skeleton className="h-4 w-14 rounded-md" />
      <Skeleton className="h-3 w-10 rounded-md" />
    </View>
  );
}

/** 자리표 가로 슬라이드 스켈레톤 */
export function MemberGridSkeleton() {
  return (
    <View className="gap-2.5">
      <Skeleton className="h-4 w-28 rounded-md" />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          gap: SEAT_GAP,
          paddingLeft: EDGE_PAD,
          paddingRight: EDGE_PAD,
        }}
        className="-mx-5"
      >
        <SeatBone />
        <SeatBone />
        <SeatBone />
      </ScrollView>
    </View>
  );
}
