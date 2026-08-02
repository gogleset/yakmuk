import { Pressable, Text, View } from "react-native";
import type {
  ConditionValue,
  DailyLog,
} from "@/entities/medication/model/types";
import { isDayCompleteFeedLog } from "@/entities/medication";
import { formatRelativeTime } from "@/shared/lib/format";
import { LAYOUT, TONE_OUTLINE } from "@/shared/config/theme";
import { COPY } from "@/shared/copy";
import { Card, InitialAvatar, Muted } from "@/shared/ui";

/** 컨디션 피드용 — "~이에요" 자연스럽게 */
const CONDITION_FEED_LABEL: Record<ConditionValue, string> = {
  GOOD: "좋아요",
  NORMAL: "보통이에요",
  BAD: "안 좋아요",
};

function feedTitle(item: DailyLog): string {
  const who = item.nickname?.trim() || "가족";
  if (isDayCompleteFeedLog(item)) {
    return COPY.family.feedAllTaken(who);
  }
  if (item.status === "TAKEN") {
    return COPY.family.feedTaken(who);
  }
  if (item.condition) {
    return COPY.family.feedCondition(who, CONDITION_FEED_LABEL[item.condition]);
  }
  return COPY.family.feedFallback(who);
}

function feedSubtitle(item: DailyLog): string | null {
  if (isDayCompleteFeedLog(item)) return null;
  if (item.status === "TAKEN") {
    return item.medicationName ?? null;
  }
  if (item.message) return item.message;
  return null;
}

type Props = {
  item: DailyLog;
  onPress?: (userId: string, nickname: string | null) => void;
};

/** 가족 피드 카드 — 이니셜 · 제목 · 서브 · 상대 시각만 (날짜는 DayHeader) */
export function FamilyActivityFeedItem({ item, onPress }: Props) {
  const isBad = item.condition === "BAD";
  const subtitle = feedSubtitle(item);
  const relative = formatRelativeTime(item.createdAt);

  const content = (
    <Card
      className="flex-row items-center gap-3 bg-surface py-2.5"
      style={[LAYOUT.shadow.sameFill, isBad ? TONE_OUTLINE.warning : undefined]}
    >
      <InitialAvatar nickname={item.nickname} size="md" />
      <View className="min-w-0 flex-1 gap-0.5">
        {/* 약 없으면 제목+시간 한 줄 → 아바타와 세로 가운데 */}
        {subtitle ? (
          <>
            <Text className="text-[15px] font-bold text-text" numberOfLines={2}>
              {feedTitle(item)}
            </Text>
            <View className="flex-row items-center gap-2">
              <Text
                className="min-w-0 flex-1 text-sm text-brand-muted"
                numberOfLines={1}
              >
                {subtitle}
              </Text>
              {relative ? (
                <Muted className="shrink-0 text-xs">{relative}</Muted>
              ) : null}
            </View>
          </>
        ) : (
          <View className="flex-row items-center gap-2">
            <Text
              className="min-w-0 flex-1 text-[15px] font-bold text-text"
              numberOfLines={2}
            >
              {feedTitle(item)}
            </Text>
            {relative ? (
              <Muted className="shrink-0 text-xs">{relative}</Muted>
            ) : null}
          </View>
        )}
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
