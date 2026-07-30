import type { ReactNode } from 'react';
import { Text, View } from 'react-native';
import { COLORS, LAYOUT } from '@/shared/config/theme';
import { cn } from '@/shared/lib/cn';
import { Button } from '@/shared/ui/primitives/Button';
import type { IconComponent } from '@/shared/ui/primitives/Icon';
import { Body } from '@/shared/ui/primitives/Typography';

type Props = {
  title: string;
  message?: string;
  /** Lucide — illustration 없을 때만 */
  icon?: IconComponent;
  /** 콕이 등 커스텀 일러스트 (우선) */
  illustration?: ReactNode;
  ctaLabel?: string;
  onCtaPress?: () => void;
  className?: string;
  /** stack=세로 중앙(홈 A empty) · card=가로 카드(홈 C 등) */
  layout?: 'stack' | 'card';
};

/** 빈 상태 — 일러스트/아이콘 + 제목 + CTA 하나 (Low friction) */
export function RichEmptyState({
  title,
  message,
  icon: Icon,
  illustration,
  ctaLabel,
  onCtaPress,
  className,
  layout = 'stack',
}: Props) {
  const media = illustration ? (
    illustration
  ) : Icon ? (
    <Icon size={LAYOUT.icon.hero} color={COLORS.brand} />
  ) : null;

  if (layout === 'card') {
    return (
      <View
        className={cn(
          'gap-4 rounded-2xl bg-surface-soft px-4 py-5',
          className,
        )}
      >
        <View className="flex-row items-center gap-3">
          {media ? <View className="shrink-0">{media}</View> : null}
          <View className="min-w-0 flex-1 gap-1">
            <Text className="text-base font-bold text-text">{title}</Text>
            {message ? (
              <Body className="text-sm text-brand-muted">{message}</Body>
            ) : null}
          </View>
        </View>
        {ctaLabel && onCtaPress ? (
          <Button
            label={ctaLabel}
            onPress={onCtaPress}
            className="rounded-2xl"
          />
        ) : null}
      </View>
    );
  }

  // 홈 A empty — 세로 스택, 타이틀은 차콜(text), soft surface 카드
  return (
    <View
      className={cn(
        'items-center gap-4 rounded-3xl bg-surface-soft px-5 py-6',
        className,
      )}
    >
      {media}
      <Text className="text-center text-lg font-bold text-text">{title}</Text>
      {message ? (
        <Body className="text-center text-sm text-brand-muted">{message}</Body>
      ) : null}
      {ctaLabel && onCtaPress ? (
        <Button
          label={ctaLabel}
          onPress={onCtaPress}
          className="mt-1 self-stretch rounded-full"
        />
      ) : null}
    </View>
  );
}
