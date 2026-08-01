import { Pressable, Text, View } from 'react-native';
import type {
  ConditionValue,
  DailyLog,
} from '@/entities/medication/model/types';
import { isDayCompleteFeedLog } from '@/entities/medication';
import {
  formatFriendlyTime,
  formatRelativeTime,
} from '@/shared/lib/format';
import { LAYOUT, TONE_OUTLINE } from '@/shared/config/theme';
import { COPY } from '@/shared/copy';
import { Card, InitialAvatar, Muted } from '@/shared/ui';

/** 컨디션 피드용 — "~이에요" 자연스럽게 */
const CONDITION_FEED_LABEL: Record<ConditionValue, string> = {
  GOOD: '좋아요',
  NORMAL: '보통이에요',
  BAD: '안 좋아요',
};

function feedTitle(item: DailyLog): string {
  const who = item.nickname?.trim() || '가족';
  if (isDayCompleteFeedLog(item)) {
    return COPY.family.feedAllTaken(who);
  }
  if (item.status === 'TAKEN') {
    return COPY.family.feedTaken(who);
  }
  if (item.condition) {
    return COPY.family.feedCondition(who, CONDITION_FEED_LABEL[item.condition]);
  }
  return COPY.family.feedFallback(who);
}

function feedSubtitle(item: DailyLog): string | null {
  if (isDayCompleteFeedLog(item)) return null;
  if (item.status === 'TAKEN') {
    return item.medicationName ?? null;
  }
  if (item.message) return item.message;
  return null;
}

type Props = {
  item: DailyLog;
  onPress?: (userId: string, nickname: string | null) => void;
};

/** 가족 피드 카드 — 이니셜 · 제목 · 서브 · 절대/상대 시각 (중립 톤) */
export function FamilyActivityFeedItem({ item, onPress }: Props) {
  const isBad = item.condition === 'BAD';
  const subtitle = feedSubtitle(item);
  const absolute = formatFriendlyTime(item.createdAt);
  const relative = formatRelativeTime(item.createdAt);

  const content = (
    <Card
      className="flex-row items-start gap-3 bg-surface py-3.5"
      style={[
        LAYOUT.shadow.sameFill,
        isBad ? TONE_OUTLINE.warning : undefined,
      ]}
    >
      <InitialAvatar nickname={item.nickname} size="md" />
      <View className="min-w-0 flex-1 gap-1">
        <Text
          className="text-[15px] font-bold text-text"
          numberOfLines={2}
        >
          {feedTitle(item)}
        </Text>
        {subtitle ? (
          <Text className="text-sm text-brand-muted" numberOfLines={2}>
            {subtitle}
          </Text>
        ) : null}
        <View className="mt-0.5 flex-row items-center justify-between gap-2">
          {absolute ? <Muted className="text-xs">{absolute}</Muted> : <View />}
          {relative ? <Muted className="text-xs">{relative}</Muted> : null}
        </View>
      </View>
    </Card>
  );

  if (!onPress) return content;

  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => onPress(item.userId, item.nickname ?? null)}
    >
      {content}
    </Pressable>
  );
}
