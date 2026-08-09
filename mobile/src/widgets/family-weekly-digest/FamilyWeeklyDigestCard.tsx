import { Pressable, Text, View } from 'react-native';
import {
  formatWeeklyAnomalyLines,
  type WeeklyDigestView,
} from '@/entities/family';
import { COLORS, LAYOUT } from '@/shared/config/theme';
import { COPY } from '@/shared/copy';
import { Body, KokiIllustration, LabelSm, LabelXs } from '@/shared/ui';

type Props = {
  digest: WeeklyDigestView;
  onAck: () => void;
};

/** 주간 안부 카드 — 통계판 아님 · soft (border 남발 금지) */
export function FamilyWeeklyDigestCard({ digest, onAck }: Props) {
  const anomalyLines = formatWeeklyAnomalyLines(digest.anomalyDays);
  const hasAnomaly = anomalyLines.length > 0;

  return (
    <View
      className="min-h-[120px] flex-row items-center gap-3 rounded-2xl bg-surface px-4 py-5"
      style={LAYOUT.shadow.sameFill}
    >
      <KokiIllustration variant="cheer" size={96} />
      <View className="min-w-0 flex-1 gap-2">
        <LabelXs tone="muted">{COPY.family.weeklyTitle}</LabelXs>
        <Text
          className="text-base font-bold leading-6 text-text"
          numberOfLines={2}
        >
          {digest.approxLine}
        </Text>
        {hasAnomaly ? (
          <View className="gap-0.5">
            {anomalyLines.map((line) => (
              <Body key={line} className="text-sm" numberOfLines={2}>
                {line}
              </Body>
            ))}
          </View>
        ) : (
          <Body className="text-sm">{COPY.family.weeklyEmptyAnomaly}</Body>
        )}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={COPY.family.weeklyAck}
          hitSlop={LAYOUT.hitSlop.sm}
          onPress={onAck}
          className="mt-1 self-end rounded-full bg-surface-soft px-3.5 py-2"
        >
          <LabelSm style={{ color: COLORS.brand }}>
            {COPY.family.weeklyAck}
          </LabelSm>
        </Pressable>
      </View>
    </View>
  );
}
