import type { ReactNode } from 'react';
import { View } from 'react-native';
import { COLORS, LAYOUT } from '@/shared/config/theme';
import type { IconComponent } from '@/shared/ui/primitives/Icon';
import { SectionTitle } from '@/shared/ui/primitives/Typography';

type Props = {
  title: string;
  icon?: IconComponent;
  className?: string;
  right?: ReactNode;
};

export function SectionHeader({ title, icon: Icon, right }: Props) {
  return (
    <View className="mt-3 flex-row items-center justify-between gap-2">
      <View className="flex-row items-center gap-2">
        {Icon ? <Icon size={LAYOUT.icon.md + 2} color={COLORS.brand} /> : null}
        <SectionTitle>{title}</SectionTitle>
      </View>
      {right}
    </View>
  );
}
