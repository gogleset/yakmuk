import { Text, View } from 'react-native';
import { COLORS, LAYOUT } from '@/shared/config/theme';
import { cn } from '@/shared/lib/cn';
import { Button } from '@/shared/ui/primitives/Button';
import type { IconComponent } from '@/shared/ui/primitives/Icon';
import { Body } from '@/shared/ui/primitives/Typography';

type Props = {
  title: string;
  message?: string;
  icon?: IconComponent;
  ctaLabel?: string;
  onCtaPress?: () => void;
  className?: string;
};

/** 빈 상태 — 아이콘 + 제목 + CTA 하나 (Low friction) */
export function RichEmptyState({
  title,
  message,
  icon: Icon,
  ctaLabel,
  onCtaPress,
  className,
}: Props) {
  return (
    <View className={cn('items-center gap-3 px-4 py-8', className)}>
      {Icon ? <Icon size={LAYOUT.icon.hero} color={COLORS.brand} /> : null}
      <Text className="text-center text-base font-bold text-brand">{title}</Text>
      {message ? (
        <Body className="text-center text-sm text-brand-muted">{message}</Body>
      ) : null}
      {ctaLabel && onCtaPress ? (
        <Button label={ctaLabel} onPress={onCtaPress} className="mt-1" />
      ) : null}
    </View>
  );
}
