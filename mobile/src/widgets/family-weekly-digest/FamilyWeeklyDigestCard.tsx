import { Pressable, Text, View } from 'react-native';
import type { WeeklyDigestView } from '@/entities/family';
import { COLORS, LAYOUT } from '@/shared/config/theme';
import { COPY } from '@/shared/copy';
import { formatFriendlyDate } from '@/shared/lib/format';
import { KokiIllustration } from '@/shared/ui';

type Props = {
  digest: WeeklyDigestView;
  onAck: () => void;
};

/** 주간 안부 카드 — 통계판 아님 · soft (border 남발 금지) */
export function FamilyWeeklyDigestCard({ digest, onAck }: Props) {
  const hasAnomaly = digest.anomalyDays.length > 0;

  return (
    <View
      className="min-h-[120px] flex-row items-center gap-3 rounded-2xl bg-surface px-4 py-5"
      style={LAYOUT.shadow.sameFill}
    >
      <KokiIllustration variant="cheer" size={96} />
      <View className="min-w-0 flex-1 gap-2">
        <Text className="text-xs font-semibold text-brand-muted">
          {COPY.family.weeklyTitle}
        </Text>
        <Text
          className="text-base font-bold leading-6 text-text"
          numberOfLines={2}
        >
          {digest.approxLine}
        </Text>
        {hasAnomaly ? (
          <View className="gap-0.5">
            {digest.anomalyDays.slice(0, 3).map((a) => {
              const when = formatFriendlyDate(a.dateYmd);
              const line =
                a.kind === 'bad'
                  ? COPY.family.weeklyBadDay(when)
                  : COPY.family.weeklyMissedDay(when);
              return (
                <Text
                  key={`${a.dateYmd}-${a.kind}`}
                  className="text-sm leading-5 text-brand-muted"
                  numberOfLines={1}
                >
                  {line}
                </Text>
              );
            })}
          </View>
        ) : (
          <Text className="text-sm leading-5 text-brand-muted">
            {COPY.family.weeklyEmptyAnomaly}
          </Text>
        )}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={COPY.family.weeklyAck}
          hitSlop={LAYOUT.hitSlop.sm}
          onPress={onAck}
          className="mt-1 self-end rounded-full bg-surface-soft px-3.5 py-2"
        >
          <Text
            className="text-sm font-semibold"
            style={{ color: COLORS.brand }}
          >
            {COPY.family.weeklyAck}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
