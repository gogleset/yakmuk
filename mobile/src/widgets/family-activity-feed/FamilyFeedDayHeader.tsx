import { View } from 'react-native';
import { Caption } from '@/shared/ui';

type Props = {
  title: string;
  /** 미읽 일자면 점 표시 */
  unread?: boolean;
};

/** 피드 날짜 그룹 헤더 — 오늘 / 어제 / 날짜 */
export function FamilyFeedDayHeader({ title, unread = false }: Props) {
  return (
    <View className="flex-row items-center gap-1.5 pb-1 pt-1.5">
      <Caption className="font-bold">{title}</Caption>
      {unread ? (
        <View
          accessibilityElementsHidden
          importantForAccessibility="no"
          className="h-1.5 w-1.5 rounded-full bg-brand"
        />
      ) : null}
    </View>
  );
}
