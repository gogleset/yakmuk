import type { ReactNode } from 'react';
import { Text, View } from 'react-native';
import { COLORS, LAYOUT } from '@/shared/config/theme';
import { Button } from '@/shared/ui/primitives/Button';
import { Card } from '@/shared/ui/primitives/Card';
import { Icons } from '@/shared/ui/primitives/Icon';

type Props = {
  title: string;
  message: string;
  onAck?: () => void;
  ackLabel?: string;
  children?: ReactNode;
};

/** 주의/알림 배너 카드 */
export function AlertBanner({
  title,
  message,
  onAck,
  ackLabel = '확인했어요',
}: Props) {
  return (
    <Card
      className="gap-2"
      style={{
        backgroundColor: COLORS.warningBg,
      }}
    >
      <View className="flex-row items-center gap-2">
        <Icons.Activity size={LAYOUT.icon.md} color={COLORS.warning} />
        <Text className="flex-1 font-bold" style={{ color: COLORS.warning }}>
          {title}
        </Text>
      </View>
      <Text className="text-brand-muted">{message}</Text>
      {onAck ? (
        <Button
          label={ackLabel}
          size="sm"
          variant="outline"
          onPress={onAck}
        />
      ) : null}
    </Card>
  );
}
