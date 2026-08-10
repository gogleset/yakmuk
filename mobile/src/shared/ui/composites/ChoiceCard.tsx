import type { ReactNode } from 'react';
import { View } from 'react-native';
import { COLORS, LAYOUT } from '@/shared/config/theme';
import { cn } from '@/shared/lib/cn';
import type { MotionsOfKind } from '@/shared/lib/motion/styles';
import { PressableScale } from '@/shared/ui/composites/PressableScale';
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
  motion?: false | MotionsOfKind<'press'>;
};

/** 역할 선택 등 — 큰 탭 영역 ChoiceCard */
export function ChoiceCard({
  title,
  description,
  icon: Icon,
  onPress,
  className,
  children,
  motion,
}: Props) {
  return (
    <PressableScale
      accessibilityRole="button"
      onPress={onPress}
      motion={motion}
      className={cn('rounded-xl bg-surface-soft p-4', className)}
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
    </PressableScale>
  );
}
