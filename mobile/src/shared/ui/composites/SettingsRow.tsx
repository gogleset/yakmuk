import type { ReactNode } from 'react';
import { Text, View } from 'react-native';
import { COLORS, LAYOUT } from '@/shared/config/theme';
import { cn } from '@/shared/lib/cn';
import { Card } from '@/shared/ui/primitives/Card';
import { Icons, type IconComponent } from '@/shared/ui/primitives/Icon';
import { PressableScale } from '@/shared/ui/composites/PressableScale';

type SettingsGroupProps = {
  children: ReactNode;
  className?: string;
};

/** 설정 섹션 카드 — 흰 surface. shadow는 바깥(overflow에 안 잘리게) */
export function SettingsGroup({ children, className }: SettingsGroupProps) {
  return (
    <View style={LAYOUT.shadow.sameFill} className="rounded-xl">
      <Card
        className={cn('gap-0 overflow-hidden rounded-xl bg-surface p-0', className)}
      >
        {children}
      </Card>
    </View>
  );
}

type SettingsRowProps = {
  label: string;
  /** 오른쪽 보조 텍스트 (버전 등) */
  value?: string;
  icon?: IconComponent;
  /** destructive 스타일 (로그아웃·삭제) */
  destructive?: boolean;
  /** chevron 숨김 (탭 불가/표시만) */
  showChevron?: boolean;
  disabled?: boolean;
  onPress?: () => void;
};

/** 설정 리스트 row */
export function SettingsRow({
  label,
  value,
  icon: Icon,
  destructive = false,
  showChevron = true,
  disabled = false,
  onPress,
}: SettingsRowProps) {
  const labelColor = destructive ? COLORS.destructive : COLORS.text;
  const interactive = !!onPress && !disabled;

  const content = (
    <View
      className={cn(
        'min-h-12 flex-row items-center gap-3 px-4 py-3',
        disabled && 'opacity-50',
      )}
    >
      {Icon ? (
        <Icon
          size={LAYOUT.icon.md}
          color={destructive ? COLORS.destructive : COLORS.brand}
        />
      ) : null}
      <Text
        className="flex-1 text-base font-medium"
        style={{ color: labelColor }}
        numberOfLines={1}
      >
        {label}
      </Text>
      {value ? (
        <Text className="text-sm text-brand-muted" numberOfLines={1}>
          {value}
        </Text>
      ) : null}
      {showChevron && interactive ? (
        <Icons.ChevronRight size={LAYOUT.icon.sm} color={COLORS.muted} />
      ) : null}
    </View>
  );

  if (!interactive) return content;

  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={disabled}
      onPress={onPress}
    >
      {content}
    </PressableScale>
  );
}
