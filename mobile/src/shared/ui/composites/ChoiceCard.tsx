import type { ReactNode } from 'react';
import { Pressable, View } from 'react-native';
import { COLORS, LAYOUT } from '@/shared/config/theme';
import { cn } from '@/shared/lib/cn';
import type { IconComponent } from '@/shared/ui/primitives/Icon';
import { Body, SectionTitle } from '@/shared/ui/primitives/Typography';

type Props = {
  title: string;
  description?: string;
  icon?: IconComponent;
  onPress: () => void;
  className?: string;
  /** 두 번째 줄 등 커스텀 */
  children?: ReactNode;
};

/** 역할 선택 등 — 큰 탭 영역 ChoiceCard */
export function ChoiceCard({
  title,
  description,
  icon: Icon,
  onPress,
  className,
  children,
}: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      className={cn(
        'rounded-xl bg-surface-soft p-4 active:opacity-80',
        className,
      )}
    >
      <View className="flex-row items-center gap-3">
        {Icon ? (
          <View className="rounded-xl bg-brand-soft p-2.5">
            <Icon size={LAYOUT.icon.lg} color={COLORS.brand} />
          </View>
        ) : null}
        <View className="flex-1 gap-0.5">
          <SectionTitle>{title}</SectionTitle>
          {description ? (
            <Body className="text-sm">{description}</Body>
          ) : null}
          {children}
        </View>
      </View>
    </Pressable>
  );
}
