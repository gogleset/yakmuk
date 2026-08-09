import type { ReactNode } from 'react';
import { Switch, View } from 'react-native';
import { COLORS, LAYOUT } from '@/shared/config/theme';
import { cn } from '@/shared/lib/cn';
import { Card } from '@/shared/ui/primitives/Card';
import { Icons, type IconComponent } from '@/shared/ui/primitives/Icon';
import { PressableScale } from '@/shared/ui/composites/PressableScale';
import { Body, LabelMdMedium } from '@/shared/ui/primitives/Typography';

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
      <LabelMdMedium
        tone={destructive ? 'destructive' : 'text'}
        className="flex-1"
        numberOfLines={1}
      >
        {label}
      </LabelMdMedium>
      {value ? (
        <Body className="text-sm" numberOfLines={1}>
          {value}
        </Body>
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

type SettingsSwitchRowProps = {
  label: string;
  value: boolean;
  onValueChange: (next: boolean) => void;
  disabled?: boolean;
  /** 부모 「약 알림」 아래 들여쓰기 */
  indented?: boolean;
  icon?: IconComponent;
};

/** 설정 스위치 row — chevron 없음, OS 권한 등과 동기화용 */
export function SettingsSwitchRow({
  label,
  value,
  onValueChange,
  disabled = false,
  indented = false,
  icon: Icon,
}: SettingsSwitchRowProps) {
  return (
    <View
      accessibilityRole="switch"
      accessibilityLabel={label}
      accessibilityState={{ checked: value, disabled }}
      className={cn(
        'min-h-12 flex-row items-center gap-3 py-3',
        indented ? 'pl-12 pr-4' : 'px-4',
        disabled && 'opacity-50',
      )}
    >
      {Icon ? (
        <Icon size={LAYOUT.icon.md} color={COLORS.brand} />
      ) : null}
      <LabelMdMedium tone="text" className="flex-1" numberOfLines={1}>
        {label}
      </LabelMdMedium>
      <Switch
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        trackColor={{ false: COLORS.line, true: COLORS.brandSoft }}
        thumbColor={value ? COLORS.brand : COLORS.surface}
        ios_backgroundColor={COLORS.line}
      />
    </View>
  );
}
