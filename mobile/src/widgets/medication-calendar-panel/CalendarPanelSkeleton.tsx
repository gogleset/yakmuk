import { View } from 'react-native';
import { LAYOUT } from '@/shared/config/theme';
import { Skeleton } from '@/shared/ui';

/** MedicationCalendarPanel 자리 — 헤더 + 그리드 + 범례 (streak 없음) */
export function CalendarPanelSkeleton({
  weekRows = 5,
}: {
  weekRows?: number;
}) {
  return (
    <View className="gap-2.5">
      <View className="flex-row items-center justify-between px-1 py-1">
        <Skeleton className="h-7 w-7 rounded-md" />
        <Skeleton className="h-6 w-28 rounded-md" />
        <Skeleton className="h-7 w-7 rounded-md" />
      </View>

      <View className="rounded-xl bg-canvas" style={LAYOUT.shadow.sameFill}>
        <View className="overflow-hidden rounded-xl px-1.5 pb-2 pt-2">
          <View className="mb-1.5 flex-row justify-around">
            {Array.from({ length: 7 }, (_, i) => (
              <Skeleton key={`wd-${i}`} className="h-3 w-8 rounded-md" />
            ))}
          </View>
          {Array.from({ length: weekRows }, (_, r) => (
            <View
              key={`wk-${r}`}
              className="my-1 flex-row items-center justify-around"
            >
              {Array.from({ length: 7 }, (_, d) => (
                <Skeleton
                  key={`d-${r}-${d}`}
                  className="h-8 w-8 rounded-full"
                />
              ))}
            </View>
          ))}
        </View>
      </View>

      <View className="flex-row items-center justify-evenly">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={`lg-${i}`} className="h-3 w-14 rounded-md" />
        ))}
      </View>
    </View>
  );
}
