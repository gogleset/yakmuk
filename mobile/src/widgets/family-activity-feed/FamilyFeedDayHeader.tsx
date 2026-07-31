import { Text } from 'react-native';

type Props = {
  title: string;
};

/** 피드 날짜 그룹 헤더 — 오늘 / 어제 / 날짜 */
export function FamilyFeedDayHeader({ title }: Props) {
  return (
    <Text className="pb-1 pt-1.5 text-xs font-bold text-brand-muted">
      {title}
    </Text>
  );
}
