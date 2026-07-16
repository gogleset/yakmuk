import { Text, View } from 'react-native';
import type { DailyLog } from '@/entities/medication/model/types';
import { CONDITION_LABEL, formatFeedTime } from '@/shared/lib/format';
import { COLORS, LAYOUT } from '@/shared/config/theme';
import { Card, CardDescription, CardTitle, Icons } from '@/shared/ui';

function feedTitle(item: DailyLog): string {
  const who = item.nickname ?? '가족';
  if (item.status === 'TAKEN') {
    return `${who}님이 ${item.medicationName ?? '약'}을 먹었어요`;
  }
  if (item.condition) {
    return `${who}님 컨디션 · ${CONDITION_LABEL[item.condition]}`;
  }
  return `${who}님 소식`;
}

type Props = {
  item: DailyLog;
};

/** 가족 피드 카드 1건 */
export function FamilyActivityFeedItem({ item }: Props) {
  return (
    <Card
      style={
        item.condition === 'BAD'
          ? { backgroundColor: COLORS.warningBg }
          : undefined
      }
    >
      <View className="flex-row items-center gap-2">
        {item.status === 'TAKEN' ? (
          <Icons.CheckCircle size={LAYOUT.icon.md} color={COLORS.brand} />
        ) : (
          <Icons.Heart
            size={LAYOUT.icon.md}
            color={item.condition === 'BAD' ? COLORS.warning : COLORS.brand}
          />
        )}
        <CardTitle>{feedTitle(item)}</CardTitle>
      </View>
      {item.message ? <CardDescription>{item.message}</CardDescription> : null}
      <Text className="mt-1.5 text-xs" style={{ color: COLORS.muted }}>
        {formatFeedTime(item.logDate, item.createdAt)}
      </Text>
    </Card>
  );
}
